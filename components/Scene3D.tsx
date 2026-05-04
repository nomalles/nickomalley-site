'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

type Stats = { fps: number; tris: number };
type Coords = { x: string; y: string; z: string };

export type Scene3DProps = {
  /** Path to the .glb file under /public (e.g. '/scans/trash_001.glb') */
  scanPath: string;
  /** Called periodically with FPS and triangle count for HUD readouts */
  onStats?: (s: Stats) => void;
  /** Called continuously with normalized cursor coords inside the canvas */
  onCoords?: (c: Coords) => void;
  /** Called when the scan-line effect starts/stops */
  onScanActive?: (active: boolean) => void;
};

/**
 * Full-viewport 3D scene:
 *   - Photogrammetry scan (the trash) loaded from /public via GLTFLoader
 *   - Animated wireframe scan-line sweep with a custom shader
 *   - 5 chrome ribbon trails wandering & curving around the object
 *   - Real-time scene reflections via WebGLCubeRenderTarget
 *   - HDRI environment lighting (forest.exr) via PMREMGenerator, with a
 *     low-intensity directional light retained purely to cast PCF shadows
 *     from the trails onto the scan
 *   - ACES filmic tone mapping
 *
 * The whole "object world" (mesh + wireframe + trails) lives in a single
 * THREE.Group so user drag-rotation moves them all together. Lights and
 * the cube camera stay in world space.
 */
export default function Scene3D({
  scanPath,
  onStats,
  onCoords,
  onScanActive,
}: Scene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ------------------------------------------------------------------
    // Renderer
    // ------------------------------------------------------------------
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.62;
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 0.7, 4.6);
    camera.lookAt(0, 0, 0);

    // ------------------------------------------------------------------
    // Lighting — HDRI handles all diffuse/specular IBL. The directional
    // light is retained solely so the chrome trails cast PCF shadows onto
    // the scan; its intensity is kept low so it doesn't fight the HDRI.
    // ------------------------------------------------------------------
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    let envRT: THREE.WebGLRenderTarget | null = null;
    new EXRLoader().load(
      '/hdri/forest.exr',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        envRT = pmrem.fromEquirectangular(texture);
        scene.environment = envRT.texture;
        texture.dispose();
        pmrem.dispose();
      },
      undefined,
      (err) => console.error('HDRI load failed:', err)
    );

    const key = new THREE.DirectionalLight(0xfff4e6, 0.25);
    key.position.set(2, 3.5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -2.4;
    key.shadow.camera.right = 2.4;
    key.shadow.camera.top = 2.4;
    key.shadow.camera.bottom = -2.4;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    scene.add(key);

    // ------------------------------------------------------------------
    // Cube camera for chrome reflections (captures live scene every 3 frames)
    // ------------------------------------------------------------------
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    if ('colorSpace' in cubeRenderTarget.texture && THREE.SRGBColorSpace !== undefined) {
      (cubeRenderTarget.texture as any).colorSpace = THREE.SRGBColorSpace;
    }
    const cubeCamera = new THREE.CubeCamera(0.1, 50, cubeRenderTarget);
    scene.add(cubeCamera);

    // ------------------------------------------------------------------
    // Object group — everything that rotates with user drag goes in here
    // ------------------------------------------------------------------
    const objectGroup = new THREE.Group();
    scene.add(objectGroup);

    // Scan-line shader for the wireframe sweep
    const scanMat = new THREE.ShaderMaterial({
      uniforms: {
        uScanY: { value: 100.0 },
        uScanWidth: { value: 0.18 },
        uColor: { value: new THREE.Color(0x00ff80) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uScanY;
        uniform float uScanWidth;
        uniform vec3 uColor;
        varying vec3 vWorld;
        void main() {
          float d = abs(vWorld.y - uScanY);
          float v = 1.0 - smoothstep(0.0, uScanWidth, d);
          if (v < 0.01) discard;
          gl_FragColor = vec4(uColor, v);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    let scanMin = -1;
    let scanMax = 1;
    let triCount = 0;

    // ------------------------------------------------------------------
    // Load the photogrammetry scan
    // ------------------------------------------------------------------
    const loader = new GLTFLoader();
    loader.load(
      scanPath,
      (gltf) => {
        // Find the first mesh with geometry in the loaded scene
        let sourceMesh: THREE.Mesh | null = null;
        gltf.scene.traverse((obj) => {
          if (!sourceMesh && (obj as THREE.Mesh).isMesh) {
            sourceMesh = obj as THREE.Mesh;
          }
        });
        if (!sourceMesh) {
          console.error('No mesh found in', scanPath);
          return;
        }

        const baseGeo = (sourceMesh as THREE.Mesh).geometry as THREE.BufferGeometry;

        // Normalize: center on bounding box, scale largest extent to ~2.4 units
        baseGeo.computeBoundingBox();
        const bbox = baseGeo.boundingBox!;
        const cx = (bbox.min.x + bbox.max.x) / 2;
        const cy = (bbox.min.y + bbox.max.y) / 2;
        const cz = (bbox.min.z + bbox.max.z) / 2;
        baseGeo.translate(-cx, -cy, -cz);
        const ext = new THREE.Vector3();
        baseGeo.boundingBox!.getSize(ext);
        const maxExt = Math.max(ext.x, ext.y, ext.z);
        const targetSize = 2.4;
        baseGeo.scale(targetSize / maxExt, targetSize / maxExt, targetSize / maxExt);
        baseGeo.computeBoundingBox();
        baseGeo.computeBoundingSphere();
        if (!baseGeo.attributes.normal) baseGeo.computeVertexNormals();

        scanMin = baseGeo.boundingBox!.min.y - 0.1;
        scanMax = baseGeo.boundingBox!.max.y + 0.1;
        triCount = baseGeo.index ? baseGeo.index.count / 3 : baseGeo.attributes.position.count / 3;
        onStats?.({ fps: 60, tris: Math.round(triCount) });

        // Material: keep the source mesh's material so the GLB texture is preserved
        const sourceMat = (sourceMesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (sourceMat.map) {
          if ('colorSpace' in sourceMat.map && THREE.SRGBColorSpace !== undefined) {
            sourceMat.map.colorSpace = THREE.SRGBColorSpace;
          }
        }
        // Tone the source material to behave like a scan asset
        sourceMat.roughness = 0.85;
        sourceMat.metalness = 0.02;

        const mesh = new THREE.Mesh(baseGeo, sourceMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        objectGroup.add(mesh);

        // Wireframe overlay for the scan-line effect
        const wireGeo = new THREE.WireframeGeometry(baseGeo);
        const wireMesh = new THREE.LineSegments(wireGeo, scanMat);
        objectGroup.add(wireMesh);
      },
      undefined,
      (err) => console.error('GLB load failed:', err)
    );

    // ------------------------------------------------------------------
    // Chrome ribbon trails — thin, mirror-finish, wandering through scene
    // ------------------------------------------------------------------
    const TRAIL_COUNT = 5;
    const TRAIL_HISTORY = 80;
    const TRAIL_TUBE_SEGMENTS = 79;
    const TRAIL_RADIAL_SEGMENTS = 5;
    const TRAIL_RADIUS = 0.013;

    type Trail = {
      mesh: THREE.Mesh;
      material: THREE.MeshPhysicalMaterial;
      points: THREE.Vector3[];
      velocity: THREE.Vector3;
      target: THREE.Vector3;
      targetTimer: number;
      upAxis: THREE.Vector3;
      seed: number;
      speedScale: number;
    };
    const trails: Trail[] = [];

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const upAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      const startPos = new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 1.6
      );

      const points: THREE.Vector3[] = [];
      for (let j = 0; j < TRAIL_HISTORY; j++) points.push(startPos.clone());

      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.04,
        envMap: cubeRenderTarget.texture,
        envMapIntensity: 1.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide,
      });

      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
      const geo = new THREE.TubeGeometry(curve, TRAIL_TUBE_SEGMENTS, TRAIL_RADIUS, TRAIL_RADIAL_SEGMENTS, false);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 2;
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      objectGroup.add(mesh);

      trails.push({
        mesh,
        material: mat,
        points,
        velocity: new THREE.Vector3(),
        target: startPos.clone(),
        targetTimer: 0,
        upAxis,
        seed: i * 17.3 + Math.random() * 50,
        speedScale: 0.85 + Math.random() * 0.5,
      });
    }

    // ------------------------------------------------------------------
    // Drag-to-orbit
    // ------------------------------------------------------------------
    let isDragging = false;
    const prev = { x: 0, y: 0 };
    let targetRotY = 0, currentRotY = 0;
    let targetRotX = 0, currentRotX = 0;

    const onDown = (e: PointerEvent) => {
      isDragging = true;
      prev.x = e.clientX;
      prev.y = e.clientY;
      mount.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
      onCoords?.({
        x: nx.toFixed(3),
        y: ny.toFixed(3),
        z: (Math.sin(performance.now() * 0.001) * 0.5).toFixed(3),
      });
      if (!isDragging) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      targetRotY += dx * 0.008;
      targetRotX = Math.max(-0.7, Math.min(0.7, targetRotX + dy * 0.008));
      prev.x = e.clientX;
      prev.y = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      isDragging = false;
      try { mount.releasePointerCapture(e.pointerId); } catch {}
    };

    mount.addEventListener('pointerdown', onDown);
    mount.addEventListener('pointermove', onMove);
    mount.addEventListener('pointerup', onUp);
    mount.addEventListener('pointercancel', onUp);

    const onResize = () => {
      const w2 = mount.clientWidth;
      const h2 = mount.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);

    // ------------------------------------------------------------------
    // Render loop
    // ------------------------------------------------------------------
    let frameId = 0;
    let frameCount = 0;
    let fpsLast = performance.now();
    let scanTime = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let scanWasActive = false;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;
      scanTime += dt;

      frameCount++;
      if (now - fpsLast >= 1000) {
        onStats?.({ fps: frameCount, tris: Math.round(triCount) });
        frameCount = 0;
        fpsLast = now;
      }

      if (!isDragging) {
        targetRotY += dt * 0.18;
        targetRotX += (0 - targetRotX) * dt * 0.6;
      }
      currentRotY += (targetRotY - currentRotY) * 0.1;
      currentRotX += (targetRotX - currentRotX) * 0.1;
      objectGroup.rotation.y = currentRotY;
      objectGroup.rotation.x = currentRotX;

      // Scan cycle
      const PERIOD = 7.5;
      const DUR = 2.2;
      const phase = scanTime % PERIOD;
      const isActive = phase < DUR;
      if (isActive !== scanWasActive) {
        onScanActive?.(isActive);
        scanWasActive = isActive;
      }
      if (isActive) {
        const t = phase / DUR;
        const eased = 1 - Math.pow(1 - t, 2.4);
        scanMat.uniforms.uScanY.value = scanMin + eased * (scanMax - scanMin);
      } else {
        scanMat.uniforms.uScanY.value = 100;
      }

      // Cube camera reflection capture (every 3 frames; hide trails to avoid feedback)
      if (frameCount % 3 === 0) {
        trails.forEach((tr) => (tr.mesh.visible = false));
        cubeCamera.update(renderer, scene);
        trails.forEach((tr) => (tr.mesh.visible = true));
      }

      // Trail flow
      trails.forEach((tr) => {
        const head = tr.points[tr.points.length - 1];

        tr.targetTimer -= dt;
        if (tr.targetTimer <= 0 || head.distanceTo(tr.target) < 0.25) {
          const r = 0.6 + Math.random() * 1.0;
          const phi = Math.random() * Math.PI * 2;
          const cosTheta = (Math.random() - 0.5) * 1.4;
          const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
          tr.target.set(
            r * sinTheta * Math.cos(phi),
            r * cosTheta * 0.55,
            r * sinTheta * Math.sin(phi)
          );
          tr.targetTimer = 0.18 + Math.random() * 0.45;
        }

        const toTarget = tr.target.clone().sub(head);
        const tDist = toTarget.length();
        toTarget.normalize();

        const outward = head.clone().normalize();
        const tangent = new THREE.Vector3().crossVectors(outward, tr.upAxis).normalize();

        const accel = new THREE.Vector3();
        accel.addScaledVector(toTarget, 4.0 * Math.min(tDist, 1.5));
        accel.addScaledVector(tangent, 3.2);
        const tt = elapsed * 1.2 + tr.seed;
        accel.x += Math.sin(tt * 2.7 + head.y * 5) * 1.2;
        accel.y += Math.cos(tt * 3.1 + head.z * 4) * 0.8;
        accel.z += Math.sin(tt * 2.4 + head.x * 5) * 1.2;

        tr.velocity.addScaledVector(accel, dt);
        tr.velocity.multiplyScalar(0.91);
        const maxSpeed = 3.2 * tr.speedScale;
        if (tr.velocity.length() > maxSpeed) tr.velocity.setLength(maxSpeed);

        const newHead = head.clone().addScaledVector(tr.velocity, dt);
        if (newHead.length() > 1.85) newHead.setLength(1.85);

        tr.points.shift();
        tr.points.push(newHead);

        tr.mesh.geometry.dispose();
        const curve = new THREE.CatmullRomCurve3(tr.points, false, 'catmullrom', 0.5);
        tr.mesh.geometry = new THREE.TubeGeometry(
          curve, TRAIL_TUBE_SEGMENTS, TRAIL_RADIUS, TRAIL_RADIAL_SEGMENTS, false
        );
      });

      renderer.render(scene, camera);
    };
    animate();

    // ------------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('pointerdown', onDown);
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerup', onUp);
      mount.removeEventListener('pointercancel', onUp);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      trails.forEach((tr) => {
        tr.mesh.geometry.dispose();
        tr.material.dispose();
      });
      cubeRenderTarget.dispose();
      scanMat.dispose();
      if (envRT) envRT.dispose();
      scene.environment = null;
      renderer.dispose();
    };
  }, [scanPath, onStats, onCoords, onScanActive]);

  return <div ref={mountRef} className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'auto' }} />;
}
