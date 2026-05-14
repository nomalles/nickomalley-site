# CLAUDE.md

Briefing for Claude (or any AI assistant) working on this codebase.

This is **Nick O'Malley's personal portfolio**. Nick is an Art Director and
Senior 3D Motion Designer based in Salzburg, Austria. Previously 3D Design
Lead at Apple (Vision Pro App Store, Apps & Games editorial). Native English
speaker (American), targeting clients and roles across the EU and UK.

The site exists to land senior creative roles at studios like Manvsmachine,
Buck, Tendril, and direct in-house teams at brands. The audience is other
senior designers and creative directors. Design decisions should optimize for
**that audience** — not for a general consumer or recruiter screening tool.

---

## Design thesis

> Swiss minimal layout with the working interface of a motion designer's
> tools peeking through. But also fun and quirky. Feel free to get a little weird and whimsical so that things stand out and feel fun.

The site itself is a portfolio piece. It demonstrates art direction, motion sensibility,
3D capability, and a coherent point of view. The polish IS the work.

**Aesthetic anchors:**

- Bureau Cool, Locomotive, Hello Monday for the editorial/Swiss base
- After Effects, Cinema 4D, Houdini viewport UI for the production-tool
  detailing (mono type, accent green readouts, FPS/triangle counts as quiet
  ornament)
- The trash photogrammetry homepage is a knowing flex disguised as humility:
  "here's some garbage I scanned for fun" demonstrates real-time WebGL,
  custom shaders, and photogrammetry workflow more convincingly than a
  conventional showreel would

**What to avoid (overdone, dated, or off-thesis):**

- Magnetic stretchy buttons, cursor-following gradient blobs
- Marquee logo strips, big "scroll" hint arrows beyond the single existing one
- Split-text reveals on every heading
- Horizontal-scroll case studies
- Crossfades — page transitions should be slice-wipes when added
- Generic Awwwards-bait flourishes

---

## Visual system

### Color

| Token         | Hex / RGBA                  | Use                                 |
|---------------|-----------------------------|-------------------------------------|
| `bg`          | `#0D0D0D`                   | Page background, always             |
| `fg`          | `#F4F2EE`                   | Primary text                        |
| `fg-90/70/55/45/30/15` | foreground at varying opacities | Secondary, tertiary text |
| `accent`      | `#00FF80`                   | The brand green (AE null-object green) |
| `accent-85/55/35` | accent at varying opacities | Subdued accent uses              |
| `scan`        | `#00F8FF`                   | Scan-line sweep + its `[ scanning ]` HUD label only |
| `hint`        | `#FF7878`                   | Touch-only gesture hint that fades after ~5s — used nowhere else |

The accent green is **load-bearing** — it should appear sparingly and
deliberately. Right now it's used for: live time dot, FPS/triangle stats,
project row hover (year), mono links on hover, the work indicator. Adding
it elsewhere dilutes it.

The scan cyan is reserved for the wireframe sweep moment — the colored
band that crosses the photogrammetry mesh every ~7.5s and the
`[ scanning ]` HUD readout that pulses in sync. Use only there. The split
between brand-green UI and cyan scan-state keeps the scan reading as a
discrete diegetic event ("the tool is doing something") rather than just
another UI accent.

### Typography

- **IBM Plex Sans** (400/500/600/700) — primary
- **IBM Plex Mono** (400/500) — all metadata, readouts, links, version info,
  anything that should feel like terminal/DCC output

Display type (the giant `NICK O'MALLEY` wordmark) is bold weight, tight
negative letter-spacing (`-0.045em`), `lineHeight: 0.85`, scaling fluidly
with `clamp(120px, 22vw, 440px)`.

### Easing

When adding any animation, use the canonical curve:

```css
cubic-bezier(0.65, 0, 0.35, 1)
```

Standard durations: 200ms (UI hover), 400ms (state changes), 800ms (page
transitions when added), 1200ms (deliberate moments).

### Cursor

The system cursor is hidden globally and replaced with a small green dot
(`CustomCursor` component). Don't add a magnetic ring or label-trail variant
without discussing — the restraint is intentional.

### Scroll

**Native scroll only.** No Lenis, no smooth-scroll library, no scroll
hijacking, no scroll-to-section snapping. The user explicitly chose this.
Scroll-triggered animations should be discrete events fired by intersection
observer, not continuous functions of scroll position (no parallax).

---

## Architecture

```
app/
  layout.tsx                  — root, fonts + viewport meta, Vercel
                                Analytics, persistent CustomCursor
  page.tsx                    — homepage (renders <Portfolio />)
  icon.svg                    — favicon ("no" in white on #0D0D0D)
  globals.css                 — all global styles, color utility classes,
                                animations, modal CSS, phase grid CSS
  work/[slug]/page.tsx        — dynamic case study route, statically
                                generated from projects.ts

components/
  Portfolio.tsx               — homepage composition root, z-index stack
  Scene3D.tsx                 — homepage Three.js scene (trash/rocks scan)
  Scene3DIcons.tsx            — case-study Three.js hero variant (no
                                trails, no cube camera, texture-toggle
                                on scan)
  Header.tsx                  — fixed top header (role, time, nav,
                                FPS/tri stats, Info+Scraps popup triggers)
  BackgroundWordmark.tsx      — giant NICK O'MALLEY type behind 3D
  CustomCursor.tsx            — green dot cursor (mounted at layout)
  ProjectList.tsx             — homepage work list with hover thumbnail
  CaseStudyHero.tsx           — case study hero dispatcher
                                (mux / image / scene / youtube)
  CaseStudyPhases.tsx         — phase blocks (grid, single-video,
                                full-width trailing, password gate)
  Framing.tsx                 — inline-text renderer (plain string OR
                                segment array with links — internal
                                #anchor or external new-tab)
  YouTubeEmbed.tsx            — YouTube iframe with playback-mode helpers
  InfoModal.tsx               — "About Nick" popup (portal at body)
  ComingSoonModal.tsx         — generic small popup (Scraps placeholder)

lib/
  projects.ts                 — single source of truth for all project
                                data, Media/Phase/Project types

scripts/
  measure-images.mjs          — CLI to print Media-shaped entries with
                                width/height from a folder of images

public/
  hdri/forest.exr             — shared HDRI for both 3D scenes
  scans/                      — .glb assets (Draco + 2K WebP compressed)
  projects/<slug>/...         — case study images, GIFs, optional
                                thumbnails / hero / phase subfolders
  avatar/                     — Nick's painted avatar art (header)
```

### Z-index layering (do not change without thought)

| Layer | Element |
|-------|---------|
| 0     | `BackgroundWordmark` — giant type |
| 1     | `Scene3D` — fixed full-viewport 3D canvas |
| 2     | Scrollable content (hero spacer, `ProjectList`) |
| 50    | `Header` — fixed top bar |
| 95    | Hover thumbnail (in `ProjectList`) |
| 1000  | `InfoModal` backdrop (rendered via portal at body) |
| 9999  | `CustomCursor` (above modals so the green dot is visible everywhere) |

The layout intentionally inverts the usual stacking — content scrolls *over*
the fixed 3D scene, with the type sitting behind everything as foundation.

### Pointer events

Several fixed-position layers use `pointerEvents: 'none'` on their containers
so canvas drag interactions pass through, with nested clickable elements
opting back in with `pointerEvents: 'auto'`. When adding new fixed UI, follow
this pattern — don't block drag-to-orbit.

---

## The 3D scene (`Scene3D.tsx`)

This is the most complex component. Key facts:

- Loads a `.glb` from `/public/scans/` via `GLTFLoader`. Auto-centers and
  scales any model so the longest axis is 2.4 units. New scans drop straight in.
- Uses the source GLB's textured material (don't replace with plain gray —
  the texture is essential for the photogrammetry to read as real)
- **Camera**: `(0, 0.7, 4.6)` looking at origin. Slight downward tilt.
- **Lighting**: HDRI environment lighting (`/public/hdri/forest.exr`,
  prefiltered through PMREMGenerator and assigned to `scene.environment`)
  contributes most of the diffuse/specular character but is held back
  hard (`envMapIntensity: 0.25` on the scan material) so the HDRI's
  HDR-unit fill doesn't drown shadowed regions in ambient. A
  directional key (`intensity: 0.85`, `shadow.radius: 2`) provides the
  PCF shadow casting from the chrome trails onto the scan, plus a
  modest direct light contribution. ACES filmic tone mapping with
  `toneMappingExposure: 0.5` brings absolute brightness down so the
  scene doesn't feel washed out under the IBL. These three values
  (`envMapIntensity`, `key.intensity`, `toneMappingExposure`) are
  tuned together — the relationship is:
    - lower `envMapIntensity` → darker shadows, less HDRI character
    - higher `key.intensity` → crisper shadows, more "key lit" feel
    - lower `toneMappingExposure` → darker overall, contrast preserved
  At wider PCF radii the soft penumbra erodes the shadow of the thin
  (~0.013 unit radius) trails into invisibility, hence radius 2.
  `key.target` is explicitly added to the scene so its world matrix
  stays current each frame; without that the shadow camera direction
  can lag.

  **Shadow-aware IBL attenuation (shader injection).** Three.js shadows
  only attenuate *direct* light. Under a bright HDRI, shadowed pixels
  still get full IBL fill and the shadow visually disappears no matter
  how the value knobs are tuned. Scene3D works around this by hooking
  the scan material's fragment shader (`onBeforeCompile`) to also
  attenuate `reflectedLight.indirectDiffuse` and `indirectSpecular` by
  the directional light's shadow factor. The strength is exposed as
  the `uShadowedEnvAmount` uniform — `1.0` = no extra darkening,
  `0.0` = pitch black in shadow. Currently `0.4`. This is what makes
  the trail shadows read; removing the injection brings them back to
  invisible regardless of `key.intensity`.
- **Object group**: mesh + wireframe + trails are all children of a single
  `THREE.Group` so user drag rotates them together. Lights and cube camera
  stay in world space.
- **Input model**:
  - **Mouse / pen**: single-button drag orbits.
  - **Touch**: requires **two fingers** to orbit (midpoint of the two pointers
    drives rotation). Single-finger touch is left to the browser for native
    page scroll. Combined with `touch-action: pan-y` on the canvas mount,
    this lets mobile users scroll the page over the fixed scene without
    fighting the orbit handler. Don't simplify back to single-finger touch
    orbit — that would re-introduce the scroll/orbit conflict on mobile.
    Pinch-zoom is also explicitly blocked on the canvas via
    `touchstart`/`touchmove` `preventDefault` (`{ passive: false }`) plus
    Safari's `gesturestart`/`change`/`end` events. **And** the site-wide
    `viewport` export in `app/layout.tsx` sets `maximumScale: 1` and
    `userScalable: false` — without that, iOS handles pinch at the system
    level (below the JS layer) and the two-finger orbit never fires. If
    long-form text pages are added later (case studies, `/info`), consider
    overriding the viewport per-page to re-enable pinch-zoom for
    accessibility on those routes.
  - A coral (`#FF7878`) "↻ two-finger orbit" hint surfaces on touch-only
    devices via `.touch-hint` (CSS media query `(hover: none) and
    (pointer: coarse)`) and fades after ~5s.
- **Wireframe scan effect**: world-space Y-band shader. Sweeps every 7.5s for
  2.2s. The active state is exposed via `onScanActive` callback for the HUD.
- **Chrome trails**: 5 thin tubes (radius 0.013, 80-point history) with mirror
  metallic material + real-time scene reflections via `WebGLCubeRenderTarget`
  (updated every 3 frames; trails hidden during capture to avoid feedback).
  Motion is target-seeking with tangential bias and noise jitter — produces
  gestural "drawing" curves rather than orbits or wandering.
- **Shadows**: Trails cast shadows onto the scan. Mesh self-shadows. This
  ground integration is what binds the chrome layer to the photogrammetry layer.

### Performance budget

The scene runs ~60fps on modern laptops. The expensive operations per frame:
- Cube map render (every 3rd frame, 6 face passes including shadows)
- 5 tube geometry rebuilds (~3000 verts/frame total)
- Shadow map render (2048×2048 PCF)

If FPS drops on lower-end hardware, the easiest cuts are:
1. `key.shadow.mapSize.set(1024, 1024)` — half-res shadows
2. `cubeRenderTarget` size from 128 to 64
3. `TRAIL_RADIAL_SEGMENTS` from 5 to 4
4. Reflection capture from every-3-frames to every-5-frames

Don't disable shadows or reflections entirely — they're load-bearing for the
visual integration of the trails into the scene.

### Color space gotchas

Three.js changed the color space API around r152 (`SRGBColorSpace`/
`outputColorSpace` replacing `sRGBEncoding`/`outputEncoding`). The code uses
feature detection so it works in both eras, but if you upgrade Three.js,
double-check the conditional blocks in `Scene3D.tsx`.

### Compressed scans (Draco + 2K WebP)

The homepage GLBs were optimized via `gltf-transform optimize` with
Draco mesh compression + 2K WebP texture re-encoding:
- `trash_001.glb`: 94 MB → 2 MB
- `rocks.glb`: 10 MB → 645 KB

Both `Scene3D` and `Scene3DIcons` configure a `DRACOLoader` on their
`GLTFLoader`, pointing at
`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`. The decoder
WASM is cached cross-origin, so it loads once per browser. Non-Draco
GLBs (currently `apple-3d-icons.glb`) still load through the same
loader unchanged.

To optimize a new scan:
```
npx -y @gltf-transform/cli@latest optimize input.glb output.glb \
  --texture-compress webp --texture-size 2048 \
  --compress draco --simplify false
```

`--simplify false` keeps mesh topology intact (only texture downsampling
+ Draco). Combined effect: visually identical at on-screen display size,
~95% smaller payload.

---

## The case-study 3D scene (`Scene3DIcons.tsx`)

Smaller cousin of `Scene3D`, used as a `kind: 'scene'` hero on projects
that ship an interactive model (currently apple-3d-icons). Reuses the
same HDRI lighting, ACES tone mapping, scan-line shader, and
mouse/touch input model — but drops chrome trails and cube-camera
reflections (lighter resource use).

Two distinguishing features:

1. **Sweep-driven texture transition**. The scan band does double duty:
   as it crosses each pixel of the model, the mesh's shader transitions
   that pixel's diffuse from the source texture to a darker reveal
   (`vec3(0.12)`) and drops roughness to `0.08` so the HDRI shows up as
   a glossy reflection. Two uniforms (`uOldIsGrey`, `uNewIsGrey`) toggle
   on the rising / falling edges of each scan so every cycle reverses
   direction. Wireframe shader and mesh shader share `uScanY` /
   `uScanWidth` uniforms by reference so they sweep in lockstep.

2. **Initial Z-axis roll** (`root.rotation.z = 0.18` rad, ~10°) so the
   model doesn't sit perfectly upright. Auto-Y-rotation (0.28 rad/s,
   slightly faster than `Scene3D`'s 0.18) layers on top.

The hero wrapper (`.case-study-hero-scene`) is 21:9 on desktop but
overrides to `4/5` portrait at `<= 768px` so the model has real estate
on phones.

A coral "↻ two-finger orbit" hint fades in/out over 3s on touch-only
devices via `.touch-hint-3s` (separate from the homepage's 5.5s
`.touch-hint`).

---

## Pages still to build

- **`/scraps`** — currently a coming-soon popup (not a route).
  Triggered from the header. Eventually: personal/experimental work
  (Nick's IG-style stuff), denser masonry-ish grid, mixed aspect ratios,
  small mono caption per item (`scan / 2024 / polycam + r3f`).
- **`/info` was scoped, then dropped** — replaced with an in-place
  `<InfoModal>` triggered from the header. If you want a bookmarkable
  `/info` route later, build it as a server-rendered page; otherwise
  the modal stays.

The 3D scene is currently still mounted only inside the homepage
`Portfolio` component. The original intent was for the scan to remain
persistent across `/work/*` and any future inner pages (likely shrunk
to a corner viewport), but the case study template ships standalone
for now. To make Scene3D persist, hoist the canvas out of `Portfolio`
into a shared layout (or into a top-level "scene root" component) so
navigating between routes doesn't unmount/remount it. Don't
re-implement that without thinking through it — remounting the GLB
load and the cube-camera pipeline on every nav would be a noticeable
hit.

---

## Case study pages (`/work/[slug]`)

Built. Lives at `app/work/[slug]/page.tsx`, statically generated via
`generateStaticParams` from any project in `lib/projects.ts` that has
a `hero` field. Slugs without a hero return 404.

### Live case studies

| Slug | Project | Year |
|------|---------|------|
| `redbull-3d-billboard` | Red Bull / 3D Billboard | 2026 |
| `apple-vision-pro` | Apple / Vision Pro App Store | 2023-2025 |
| `apple-app-store-awards` | Apple / App Store Awards | 2024 + 2025 |
| `apple-3d-icons` | Apple / Apps + Games 3D Icons | 2022-2025 |
| `pokemon-go-season-of-go` | Pokemon GO / Season of GO | 2022 |
| `playstation-tournaments` | Playstation / Tournaments | 2021-2022 |
| `warner-media-lobby` | WarnerMedia / Lobby Installation | 2019-2020 |
| `twitch-rivals-broadcast` | Twitch / Twitch Rivals Broadcast | 2020-2021 |
| `grammy-mono-to-immersive` | The Grammy Museum / Mono to Immersive | 2019 |

The homepage list renders only projects with a `hero` field — no
placeholder rows. The list order is determined by the order in
`projects.ts`.

### Default layout
1. `← INDEX` back link (top-left, mono)
2. Hero — Mux / image / scene / YouTube (see Hero kinds below)
3. **Either** Swiss meta block (Client / Year / Role [/ Studio /
   Scope]) + context paragraph on the right, **or** a `planHero`
   image with metadata overlaid in black on the top-left
4. Phase blocks (`<CaseStudyPhases>`) — each with optional label,
   framing, and grid; optionally gated by password
5. Optional credits footer (team list + contribution notes)

### `Project` fields

- `id` — unique short ID; controls list order via array position
- `slug` — URL slug (`/work/<slug>`)
- `client`, `title`, `year`, `role` — required metadata
- `studio?` — production studio (renders "Studio" row in meta block)
- `tint` — gradient fallback for hover thumbnail when no thumbnail set
- `thumbnail?` — `/projects/<slug>/thumbnail.<ext>` path; replaces
  the tint gradient card on the homepage hover
- `hero?: Media` — presence determines whether a case study page is
  generated
- `planHero?: { src, width, height, alt? }` — secondary hero with
  client/year/role overlaid in black on the top-left. When set, the
  standard meta block + context section is suppressed (the project's
  written intro is baked into the image)
- `scope?: string[]` — renders "Scope" row in meta block, joined by `·`
- `context?: string | FramingSegment[]` — top-of-page paragraph. Use
  the segment array for inline links (`{ text, href }`), including
  `#phase-<slug>` internal anchor links
- `phases?: Phase[]`
- `credits?: { team?: string[], notes?: string }`
- `passwordHash?: string` — SHA-256 hex; gates the phases

### `Media` kinds (discriminated union)

- `{ kind: 'mux', playbackId, aspect?, alt?, playback? }`
  - `playback`: `'autoplay-muted-loop'` (default — silent ambient
    looping) or `'user-with-sound'` (poster + play button, sound on,
    no loop)
- `{ kind: 'image', src, aspect?, alt?, width?, height?, fullBleed? }`
  - `aspect` set → cell locked to that ratio + object-cover crop
  - `aspect` omitted + `width`/`height` → natural aspect, no crop;
    Next/Image reserves layout space and serves a responsive srcset
  - `fullBleed` (**hero-only**) → no horizontal page padding,
    edge-to-edge across the viewport
  - `.gif` source → `unoptimized` passed to Next/Image so animation
    passes through
- `{ kind: 'scene', scanPath, aspect? }`
  - Interactive Three.js hero rendered via `<Scene3DIcons>`
- `{ kind: 'youtube', videoId, aspect?, playback? }`
  - Embed via `<YouTubeEmbed>`. `playback`:
    `'autoplay-muted-loop'` (default — `autoplay`, `mute`, `loop`,
    `controls=0`) or `'user'` (poster + manual play, normal controls)
  - `vq=hd1080` URL hint set on all embeds (best-effort starting
    quality)
  - `loading="lazy"` so off-screen embeds don't pull YT player JS

### `Phase` fields

- `label?: string | null`
  - `string` → use it
  - `undefined` → auto-fall-back to "Phase 01" / "Phase 02" only when
    at least one other phase on the project has a string label or
    framing (structured project)
  - `null` (explicit) → render no heading; useful for continuation
    phases that visually attach to a previous labeled section
- `framing?: string | FramingSegment[]` — optional intro paragraph
  with inline-link support (same shape as `context`)
- `images: Media[]` — grid content
- `columns?: number` — desktop masonry column count (default 3)
- `mobileColumns?: number` — mobile column count (default 1 = stack).
  Set to 2 for grids that read better as 2-up on phones
- `trailing?: Media[]` — array of full-width blocks rendered below the
  grid, each at its natural aspect. Used for "concluding" media after
  a grid (e.g. a final hero still, a full-bleed video punctuating a
  section). Mux/YouTube/image dispatch through `FullWidthMedia`

### Phase rendering rules

- **Single-video phase** (one item, `kind: 'mux'` or `'youtube'`) →
  renders full-width via `<SingleVideo>` / YouTube wrapper instead of
  a skinny 1-cell grid column
- **Mixed / image-only phase** → CSS-columns masonry. Column count
  driven by `--phase-cols` (desktop, default 3) and
  `--phase-cols-mobile` (default 1) custom properties. Per-phase
  overrides via `columns` / `mobileColumns` are emitted as inline
  CSS variables on the wrapper.
- **Trailing media** → each item rendered via `<FullWidthMedia>` below
  the grid at its natural aspect. Image items get the same
  `.shimmer` loading state as grid cells.
- **`#phase-<label-slug>`** id auto-generated from `phase.label`
  (e.g. `"Tool"` → `id="phase-tool"`), with `scrollMarginTop: 90` so
  in-page anchor jumps land below the fixed header.

### "The Work" header + auto phase numbering
Both render only when at least one phase has a string label or
framing. Flat-content projects (visual blocks with no copy) get neither
the section heading nor auto "Phase NN" numbering.

### Image optimization

All case study images render through Next/Image. Source files live
uncompressed in `public/projects/<slug>/...`; Vercel generates WebP /
AVIF at responsive sizes on first request and caches at the edge.
Default `sizes="(max-width: 768px) 100vw, 33vw"` for grid cells.

Animated `.gif` sources get `unoptimized: true` (the optimizer strips
animation otherwise). PNGs and JPGs get full responsive optimization.

### Adding a new project

1. Drop assets under `public/projects/<slug>/...`. Subfolder shape
   is free-form; use whatever organization fits the project.
2. Run `node scripts/measure-images.mjs <folder>` per image directory
   to print Media entries with width/height filled in.
3. Add the project entry to `lib/projects.ts` with `hero`, `phases`,
   etc.
4. Commit images + `projects.ts`.

### Filename normalization

macOS Screenshot files contain `U+202F` (narrow no-break space) between
the time and AM/PM. Renders identical to ASCII space but is a
different byte sequence; case-sensitive deployments (Vercel/Linux)
won't resolve paths that use a regular space. Normalize before
referencing — use an explicit ` ` escape (source-level
`' '` → `' '` in a heredoc has silently failed for me when both
chars rendered the same in the editor):

```python
python3 -c "
import os
for r, d, fs in os.walk('public/projects/<slug>'):
    for f in fs:
        if ' ' in f:
            os.rename(os.path.join(r, f),
                      os.path.join(r, f.replace(' ', ' ')))
"
```

### Mux integration
- **Library**: `@mux/mux-player-react`. Lazy-loaded via `next/dynamic`
  with `ssr: false` because the player is a web component that needs
  `customElements`.
- **Playback IDs are public** — they live in `lib/projects.ts` directly.
- **API tokens** (`MUX_TOKEN_ID` / `MUX_TOKEN_SECRET`) live in
  `.env.local` (server-only, never `NEXT_PUBLIC_`-prefixed). Used for
  upload scripts and asset queries — not for serving public videos.
- Default hero player: `autoPlay="muted" muted loop playsInline
  nohotkeys`, with `onContextMenu` suppressed.
- Hero `--media-object-fit: cover` on the wrapper so 16:9 sources
  fill 21:9 ultrawide frames (with ~15% top/bottom crop).
- Uploads go through the Mux dashboard.

### YouTube integration

`<YouTubeEmbed>` wraps the iframe. URL params set per `playback` mode:
- `autoplay-muted-loop`: `autoplay=1 mute=1 loop=1 playlist=<id>
  controls=0 modestbranding=1 playsinline=1 rel=0 vq=hd1080`
- `user`: `modestbranding=1 rel=0 vq=hd1080` (no autoplay)

The `playlist=<id>` is YouTube's quirk for looping a single video.
`vq=hd1080` is unofficial but historically respected as a starting-
quality hint.

### Password-gate pattern (`<CaseStudyPhases>`)

- Phases are wrapped in `.phase-gate`: `filter: blur(24px)` +
  `pointer-events: none` + `user-select: none` until `.unlocked` is
  added. Filter transitions over 600ms cubic-bezier(0.65, 0, 0.35, 1).
- Comparison: client-side SHA-256 (Web Crypto `crypto.subtle.digest`)
  of the input vs `passwordHash`.
- Generate a hash:
  ```
  node -e "console.log(require('crypto').createHash('sha256').update('YOURPASSWORD').digest('hex'))"
  ```
- **Unlock state in `sessionStorage`** under shared key
  `phase-gate-hash`, with the *unlocked password's hash* as the value.
  Projects sharing the same hash auto-unlock together. Different
  hashes need their own unlock. Tab close forgets.
- **Current shared password is `nickwork`.** Three projects use it
  (Vision Pro, App Store Awards, 3D Icons). The other case studies
  are public.
- This is **polite gating, not security**. The hash is in the bundle
  and brute-forceable for weak passwords; HLS streams are extractable
  from devtools. For genuine privacy, switch to Mux signed playback
  + server-side JWT minting + real auth on the page.

### Inline-text rendering (`<Framing>`)

Shared component used for both `context` (project) and `framing`
(phase). Accepts `string | FramingSegment[] | undefined`:
- Plain string → renders as-is
- Segment array → mapped, with `{ text, href }` entries becoming
  anchors:
  - `href` starting with `#` → in-page anchor link, no
    `target="_blank"`, glides via the global `scroll-behavior: smooth`
  - Otherwise → external link with `target="_blank"
    rel="noopener noreferrer"`
- Underlined, hover-accent color for both modes

Example (3D Icons context):
```ts
context: [
  'In my time at Apple, I created a 3D icon model and guidelines... including an ',
  { text: 'internal tool', href: '#phase-tool' },
  ' for teams...',
]
```

---

---

## Modals (`InfoModal`, `ComingSoonModal`)

Two popups triggered from the header. Both render at `document.body`
via `createPortal` so they escape the Header's `pointer-events: none`
wrapper (otherwise the X button and backdrop click would silently
fail — that bug bit once already). Share modal CSS in `globals.css`:

- `.info-modal-backdrop` — full-screen, `rgba(0,0,0,0.85)` +
  `backdrop-filter: blur(8px)`, fades in over 200ms
- `.info-modal` — centered panel, max-width 760px, scales in on mount
- `.coming-soon-modal` — narrower variant (max-width 420px) on top of
  `.info-modal`

Close behaviors (both modals): X button, backdrop click, Escape key.
While open, body scroll is locked via `document.body.style.overflow`.

- **`<InfoModal>`** — "About Nick" with photo (`public/projects/info-pic.png`)
  + bio + mailto link. Triggered by clicking "Info" in the header.
  Replaces what would have been an `/info` route.
- **`<ComingSoonModal>`** — generic small popup taking `label` +
  `message` props. Wired to the header's Scraps link with
  `label="Scraps"`, `message="coming soon :)"`.

---

## Live site

- **Domain**: `nickomalley.net` — registered at Namecheap, DNS at
  Namecheap PremiumDNS (Wix nameservers fully out of the loop).
  Records:
  - A (apex): `76.76.21.21`
  - CNAME (`www`): `cname.vercel-dns.com.`
- **Deployment**: Vercel auto-deploys every push to `main`.
- **Analytics**: Vercel Analytics (`@vercel/analytics`). Cookieless —
  no consent banner needed for EU/UK. Mounted at root layout. View
  data at vercel.com → project → Analytics.
  - **Custom event**: header Instagram link fires
    `track('instagram_click')` on click. Easy pattern to extend for
    any other CTA: `onClick={() => track('event_name', { meta })}`.
  - **About bot hits on weird paths** (e.g. `/admin`): expected — the
    `<Analytics />` component fires on every route including 404s, so
    automated scanners probing common admin URLs show up as page
    views. Not real visitors.
- **Favicon**: `app/icon.svg` — "no" in white on `#0D0D0D`. Next 14
  App Router auto-wires `<link rel="icon">`. No `apple-icon.png` yet
  — iOS "Add to Home Screen" falls back to the SVG.

---

## Things Nick has explicitly opted out of

These came up in conversation and were rejected. Don't re-suggest:

- ❌ Smiley face SVG component (was tried, removed — Nick's painted avatar
  art is the personal mark instead)
- ❌ Project ID numbers like `#0023`
- ❌ Year column in the project list
- ❌ Row dividers between projects
- ❌ Selection bracket corner indicators on hover
- ❌ Smooth scroll / Lenis
- ❌ "American in EU" tagline (replaced with "Based in Salzburg")

## Things to ask before doing

- Adding any new color beyond the existing palette
- Adding any third-party UI library
- Changing the camera angle, framing, or autorotation
- Modifying the trail count, radius, or motion model
- Replacing the photogrammetry scan with a different asset
- Restructuring the z-index stack

## Things that are fair game

- Adding new projects to `lib/projects.ts` (data only)
- Adding new media kinds or Phase fields when a project needs a layout
  the existing template can't express — prefer extending the data model
  over special-casing inside components
- Building out `/scraps` whenever Nick is ready (currently a popup)
- Performance optimizations within the existing visual budget
- Accessibility improvements (the custom cursor and dark theme need
  careful thought here — don't break keyboard navigation)
- Swapping any scan for an updated one (run it through gltf-transform
  optimize first if it's heavy)
- Refactoring without changing visual output
- Wiring new Vercel Analytics custom events on CTAs

---

## Stack notes

- **Next.js 14 App Router** — server components by default,
  `'use client'` only where needed (the 3D scenes, modals, header
  time, custom cursor, project list hover state, case study renderer)
- **TypeScript strict mode** — all new code typed
- **Tailwind** — used for layout primitives (flex, grid, spacing).
  Color and typography use the explicit CSS classes in `globals.css`
  because Tailwind's arbitrary-value-with-opacity syntax
  (`text-[#F4F2EE]/45`) was unreliable in some build contexts. Stick
  with `text-fg-XX` and `text-accent-XX`
- **Three.js (~r165)** — bare three, not React Three Fiber.
  Imperative scenes; R3F's reconciliation overhead isn't worth it
  for hand-crafted scenes
- **`@mux/mux-player-react`** — Mux hero / inline video playback
- **`@vercel/analytics`** — page views + custom events (`track()`)
- **`@next/third-parties`** was used briefly for Google Analytics
  then removed — current analytics is Vercel-only
- **`gltf-transform`** — invoked via `npx -y @gltf-transform/cli@latest`
  for scan compression (not a permanent dependency)

---

## Contact

Nick: nomalley70@gmail.com
Site: nickomalley.net

---

## README maintenance

**Keep the README up to date.** Every time a meaningful change is made to the project — new screen added, dependency changed, environment variable added, deployment process updated, schema migrated — update README.md to reflect it. The README should always be accurate enough for a new developer (or a future you) to get the project running from scratch without asking questions.

At minimum the README should always contain:
- What the app is and who it's for
- How to install dependencies and run locally
- Required environment variables and where to get them
- How to run database migrations
- How to build and deploy

---

## Global Development Rules

These rules apply to every part of this project, always.

### Root cause

No quick fixes. Always diagnose to the root cause and devise proper solutions. Never apply patches or workarounds unless explicitly asked.

---

### Security & secrets

- Never hardcode secrets or commit them to git
- Use separate API tokens/credentials for dev, staging, and prod environments
- Validate all input server-side — never trust client data
- Add rate limiting on auth and write operations

### Architecture & code quality

- Design architecture before building — don't let it emerge from spaghetti
- Break up large components early
- Wrap external API calls in a clean service layer (easier to cache, swap, or extend later)
- Version database schema changes through proper migrations
- Use real feature flags, not commented-out code

### Observability

- Add crash reporting from day one
- Implement persistent logging (not just console output)
- Include a `/health` endpoint for every service

### Environments & deployment

- Maintain a real staging environment that mirrors production
- Set CORS to specific origins, never `*`
- Set up CI/CD early — deploys come from the pipeline, not a laptop
- Document how to run, build, and deploy the project

### Testing & resilience

- Test unhappy paths: network failures, unexpected API responses, malformed data
- Test backup restores at least once — don't wait for an emergency
- Don't assume the happy path is sufficient

### Time handling

- Store all timestamps in UTC
- Convert to local time only on display

### Discipline

- Fix hacky code now or create a tracked ticket with a deadline — "later" never comes
- Don't skip fundamentals just because the code compiles and runs