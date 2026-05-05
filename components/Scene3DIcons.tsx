'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export type Scene3DIconsProps = {
  /** Path under /public to the .glb to load. */
  scanPath: string;
};

/**
 * Smaller cousin of Scene3D used as a case study hero.
 *
 *   - Loads any .glb, auto-centers and scales it to a fixed size
 *   - Auto-rotates the model continuously (drag-to-orbit also supported,
 *     including two-finger touch — same input model as Scene3D)
 *   - HDRI environment (forest.exr) lighting, ACES tone mapping
 *   - Scan-line shader sweep on a wireframe overlay (cyan #00F8FF)
 *   - On each scan completion, toggles the mesh material between the
 *     source texture and a neutral grey reveal so the scan reads as a
 *     "tool inspecting the asset" moment
 *
 * No chrome trails, no cube camera, no shadow injection — those are
 * scene-specific to the homepage trash hero. Keep this lighter so it
 * runs comfortably alongside the rest of the case study page content.
 */
export default function Scene3DIcons({ scanPath }: Scene3DIconsProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.62;
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 0.4, 4.6);
    camera.lookAt(0, 0, 0);

    // ---------- HDRI lighting ----------
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    let envRT: THREE.WebGLRenderTarget | null = null;
    new EXRLoader().load(
      '/hdri/forest.exr',
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        envRT = pmrem.fromEquirectangular(tex);
        scene.environment = envRT.texture;
        tex.dispose();
        pmrem.dispose();
      },
      undefined,
      (err) => console.error('HDRI load failed:', err)
    );

    // ---------- Object group ----------
    const objectGroup = new THREE.Group();
    scene.add(objectGroup);

    // Shared scan uniforms — both the cyan wireframe shader AND the per-mesh
    // texture-mix shader read from these objects, so updating .value once
    // updates everything in lockstep. uOldIsGrey / uNewIsGrey express the
    // pre- and post-scan state (0 = source texture, 1 = neutral grey); on
    // scan start we set new = !old, during the sweep the shader interpolates
    // per pixel based on whether the scan band has passed that pixel, and
    // on scan end we sync old = new for the next cycle.
    const uScanY = { value: 100.0 };
    const uScanWidth = { value: 0.18 };
    const uOldIsGrey = { value: 0.0 };
    const uNewIsGrey = { value: 0.0 };

    // Cyan wireframe band that physically draws the scan position.
    const scanMat = new THREE.ShaderMaterial({
      uniforms: {
        uScanY,
        uScanWidth,
        uColor: { value: new THREE.Color(0x00f8ff) },
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

    // Inject world-Y aware texture-mix into a MeshStandardMaterial-compatible
    // material. The shader recomputes "has the scan band passed this pixel?"
    // each fragment, and uses that as the t in mix(uOldIsGrey, uNewIsGrey, t)
    // so the transition follows the wireframe sweep instead of snapping at
    // the end. Falls back to no-op if the material doesn't have a typical
    // PBR shader (e.g., if someone hands it a custom ShaderMaterial later).
    function injectScanShader(mat: THREE.Material) {
      const m = mat as THREE.MeshStandardMaterial;
      // Boost env-map response slightly so the HDRI shows up clearly in the
      // glossy reveal state. Source material gets the same boost for tonal
      // continuity with the rest of the site.
      if ('envMapIntensity' in m) m.envMapIntensity = 1.1;

      m.onBeforeCompile = (shader) => {
        shader.uniforms.uScanY = uScanY;
        shader.uniforms.uScanWidth = uScanWidth;
        shader.uniforms.uOldIsGrey = uOldIsGrey;
        shader.uniforms.uNewIsGrey = uNewIsGrey;

        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            '#include <common>\nvarying vec3 vScanWorldPos;'
          )
          .replace(
            '#include <project_vertex>',
            `#include <project_vertex>
            vScanWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
          );

        // Compute the per-fragment "shows grey" amount once early in main()
        // (right after clipping planes), then reuse it in <color_fragment>
        // (mix to a darker base) and <roughnessmap_fragment> (drop roughness
        // so the reveal state reads as a glossy reflective material that
        // picks up the HDRI). Single computation, used in two places.
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
            varying vec3 vScanWorldPos;
            uniform float uScanY;
            uniform float uScanWidth;
            uniform float uOldIsGrey;
            uniform float uNewIsGrey;`
          )
          .replace(
            '#include <clipping_planes_fragment>',
            `#include <clipping_planes_fragment>
            float _scanShowsGrey;
            {
              float halfBand = uScanWidth * 0.5;
              // pastScan: 1 if the scan band has already passed this pixel
              // (pixel is below the band), 0 if not yet, smooth in between.
              float pastScan = 1.0 - smoothstep(uScanY - halfBand, uScanY + halfBand, vScanWorldPos.y);
              _scanShowsGrey = mix(uOldIsGrey, uNewIsGrey, pastScan);
            }`
          )
          .replace(
            '#include <color_fragment>',
            `#include <color_fragment>
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12), _scanShowsGrey);`
          )
          .replace(
            '#include <roughnessmap_fragment>',
            `#include <roughnessmap_fragment>
            roughnessFactor = mix(roughnessFactor, 0.08, _scanShowsGrey);`
          );
      };
      m.needsUpdate = true;
    }

    // ---------- Load the GLB ----------
    // DRACO support so this scene can also serve compressed GLBs (works
    // unchanged for non-Draco files like the current apple-3d-icons.glb).
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      scanPath,
      (gltf) => {
        const root = gltf.scene;
        // Compute combined bounding box so the entire scene (potentially
        // many meshes) gets centered and scaled together.
        root.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        bbox.getSize(size);
        bbox.getCenter(center);
        root.position.sub(center);
        const maxExt = Math.max(size.x, size.y, size.z) || 1;
        const targetSize = 2.4;
        root.scale.setScalar(targetSize / maxExt);
        // Slight sideways roll on the model so it doesn't read as
        // perfectly upright. Applied to the GLB root so the auto-rotate
        // (which spins objectGroup around Y) layers on top cleanly.
        root.rotation.z = 0.18;

        objectGroup.add(root);

        // Per mesh: parent a wireframe (sharing scanMat) directly to it so
        // the wireframe inherits the mesh's transform via the scene graph.
        // Also inject the texture-mix shader into the mesh's material so
        // its diffuse color tracks the scan sweep.
        root.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh || !mesh.geometry) return;

          const wireGeo = new THREE.WireframeGeometry(mesh.geometry);
          const wireLines = new THREE.LineSegments(wireGeo, scanMat);
          mesh.add(wireLines);

          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach(injectScanShader);
          else if (mat) injectScanShader(mat);
        });

        // After scaling, recompute the world-space Y range for the scan
        // sweep so it covers the full vertical extent of the model.
        objectGroup.updateMatrixWorld(true);
        const finalBox = new THREE.Box3().setFromObject(objectGroup);
        scanMin = finalBox.min.y - 0.1;
        scanMax = finalBox.max.y + 0.1;
      },
      undefined,
      (err) => console.error('GLB load failed:', err)
    );

    // ---------- Drag-to-orbit (matches Scene3D's input model) ----------
    let isDragging = false;
    const prev = { x: 0, y: 0 };
    let targetRotY = 0, currentRotY = 0;
    let targetRotX = 0, currentRotX = 0;

    type PS = { x: number; y: number; type: string };
    const activePointers = new Map<number, PS>();
    const need = (t: string) => (t === 'touch' ? 2 : 1);
    const mid = () => {
      let sx = 0, sy = 0;
      activePointers.forEach((p) => { sx += p.x; sy += p.y; });
      const n = Math.max(activePointers.size, 1);
      return { x: sx / n, y: sy / n };
    };

    const onDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      if (!isDragging && activePointers.size >= need(e.pointerType)) {
        isDragging = true;
        const m = mid();
        prev.x = m.x; prev.y = m.y;
        if (e.pointerType !== 'touch') mount.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      }
      if (!isDragging) return;
      const m = mid();
      const dx = m.x - prev.x;
      const dy = m.y - prev.y;
      targetRotY += dx * 0.008;
      targetRotX = Math.max(-0.7, Math.min(0.7, targetRotX + dy * 0.008));
      prev.x = m.x; prev.y = m.y;
    };
    const onUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (isDragging) {
        if (activePointers.size < need(e.pointerType)) isDragging = false;
        else { const m = mid(); prev.x = m.x; prev.y = m.y; }
      }
      try { mount.releasePointerCapture(e.pointerId); } catch {}
    };

    mount.addEventListener('pointerdown', onDown);
    mount.addEventListener('pointermove', onMove);
    mount.addEventListener('pointerup', onUp);
    mount.addEventListener('pointercancel', onUp);
    const blockMulti = (ev: TouchEvent) => { if (ev.touches.length >= 2) ev.preventDefault(); };
    const blockGesture = (ev: Event) => ev.preventDefault();
    mount.addEventListener('touchstart', blockMulti, { passive: false });
    mount.addEventListener('touchmove', blockMulti, { passive: false });
    mount.addEventListener('gesturestart', blockGesture as EventListener);
    mount.addEventListener('gesturechange', blockGesture as EventListener);
    mount.addEventListener('gestureend', blockGesture as EventListener);

    const onResize = () => {
      const w2 = mount.clientWidth, h2 = mount.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);

    // ---------- Animate ----------
    let frameId = 0;
    let scanTime = 0;
    let lastTime = performance.now();
    let scanWasActive = false;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      scanTime += dt;

      if (!isDragging) {
        targetRotY += dt * 0.28;
        targetRotX += (0 - targetRotX) * dt * 0.6;
      }
      currentRotY += (targetRotY - currentRotY) * 0.1;
      currentRotX += (targetRotX - currentRotX) * 0.1;
      objectGroup.rotation.y = currentRotY;
      objectGroup.rotation.x = currentRotX;

      // Scan cycle — same period/duration as the homepage scene so the
      // scan moments feel consistent across the site.
      const PERIOD = 7.5;
      const DUR = 2.2;
      const phase = scanTime % PERIOD;
      const isActive = phase < DUR;
      if (isActive !== scanWasActive) {
        if (isActive) {
          // Rising edge: pick the "after" state opposite to the current
          // "before" state. The shader will sweep pixels through the band
          // from old → new as uScanY rises.
          uNewIsGrey.value = uOldIsGrey.value > 0.5 ? 0.0 : 1.0;
        } else {
          // Falling edge: scan band has fully passed the model — sync the
          // settled "after" state into the next cycle's "before".
          uOldIsGrey.value = uNewIsGrey.value;
        }
        scanWasActive = isActive;
      }
      if (isActive) {
        const t = phase / DUR;
        const eased = 1 - Math.pow(1 - t, 2.4);
        uScanY.value = scanMin + eased * (scanMax - scanMin);
      } else {
        // Park the scan band well above the model so every pixel reads as
        // "post-scan" (pastScan = 1) and the shader settles on uNewIsGrey.
        uScanY.value = 100;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('pointerdown', onDown);
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerup', onUp);
      mount.removeEventListener('pointercancel', onUp);
      mount.removeEventListener('touchstart', blockMulti);
      mount.removeEventListener('touchmove', blockMulti);
      mount.removeEventListener('gesturestart', blockGesture as EventListener);
      mount.removeEventListener('gesturechange', blockGesture as EventListener);
      mount.removeEventListener('gestureend', blockGesture as EventListener);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      scanMat.dispose();
      if (envRT) envRT.dispose();
      dracoLoader.dispose();
      scene.environment = null;
      renderer.dispose();
    };
  }, [scanPath]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}
    />
  );
}
