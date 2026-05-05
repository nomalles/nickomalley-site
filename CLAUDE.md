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
  layout.tsx          — root, fonts, metadata
  page.tsx            — homepage (just renders <Portfolio />)
  globals.css         — all global styles, color utility classes, animations

components/
  Portfolio.tsx       — composition root, z-index stacking
  Scene3D.tsx         — Three.js scene (client component)
  Header.tsx          — fixed top header (role, time, links, stats)
  BackgroundWordmark.tsx — giant NICK O'MALLEY type behind 3D
  CustomCursor.tsx    — green dot cursor
  ProjectList.tsx     — work list with hover thumbnail

lib/
  projects.ts         — single source of truth for project data

public/
  scans/              — .glb photogrammetry assets
  avatar/             — Nick's painted avatar art
```

### Z-index layering (do not change without thought)

| Layer | Element |
|-------|---------|
| 0     | `BackgroundWordmark` — giant type |
| 1     | `Scene3D` — fixed full-viewport 3D canvas |
| 2     | Scrollable content (hero spacer, `ProjectList`) |
| 50    | `Header` — fixed top bar |
| 95    | Hover thumbnail (in `ProjectList`) |
| 100   | `CustomCursor` |

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
  invisible regardless of `key.intensity`. ACES filmic tone
  mapping with `toneMappingExposure: 0.62` — tuned down from the previous
  non-HDRI value so the photogrammetry texture doesn't blow out under IBL.
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

---

## Pages still to build

- **`/scraps`** — personal/experimental work (Nick's IG-style stuff).
  Should have a brief blurb at top explaining these are personal tests.
  Denser masonry-ish grid, mixed aspect ratios. Each item gets a small mono
  caption: format, year, tools (e.g. `scan / 2024 / polycam + r3f`).
- **`/info`** — long-form about, client list, contact.

The 3D scene is currently still mounted only inside the homepage `Portfolio`
component. The intent is for the scan to remain persistent across `/work/*`,
`/scraps`, and `/info` (likely shrunk to a corner viewport on inner pages),
but the case study template ships standalone for now. To make Scene3D
persist, hoist the canvas out of `Portfolio` into a shared layout (or into
a top-level "scene root" component) so navigating between routes doesn't
unmount/remount it. Don't re-implement that without thinking through it —
remounting the GLB load and the cube-camera pipeline on every nav would be
a noticeable hit.

---

## Case study pages (`/work/[slug]`)

Built. Lives at `app/work/[slug]/page.tsx`, statically generated via
`generateStaticParams` from any project in `lib/projects.ts` that has a
`hero` field. Slugs without a hero return 404.

### Layout
1. `← INDEX` back link (top-left, mono)
2. Ultrawide (21:9) Mux player hero (`<CaseStudyHero>`)
3. Two-column grid: Swiss-style metadata block (Client/Year/Role/Scope) on
   the left, 2–3 sentence context paragraph on the right
4. Phase blocks (`<CaseStudyPhases>`) — chronological stages, each with a
   framing sentence + 3-column image grid with mixed aspect ratios.
   Blurred behind a password gate when `passwordHash` is set.
5. Small mono credits footer (team list + contribution notes)

### Project data shape
`lib/projects.ts` exports `Project` plus a `Media` discriminated union with
three kinds:
- `{ kind: 'mux', playbackId, aspect? }` — Mux video
- `{ kind: 'image', src, aspect?, alt?, width?, height? }` — static image
- `{ kind: 'scene', scanPath, aspect? }` — interactive Three.js hero,
  currently rendered by `Scene3DIcons`

Plus `Phase` and `Credits` types. Case-study-specific fields (`hero`,
`scope`, `context`, `phases`, `credits`, `passwordHash`) are all
optional; projects without case study pages can stay slug-only.

### Hero kinds
- **Mux** (`kind: 'mux'`) — `<CaseStudyHero>` lazy-loads
  `@mux/mux-player-react` and renders the player at the chosen aspect.
  Default `21/9`, `--media-object-fit: cover` so 16:9 sources fill
  ultrawide frames.
- **Image** (`kind: 'image'`) — `<Image fill priority>` with
  `sizes="100vw"`. Currently unused but kept type-honest.
- **Scene** (`kind: 'scene'`) — interactive Three.js hero via
  `<Scene3DIcons scanPath=...>`. Loads any GLB at `/scans/<file>.glb`,
  auto-rotates, scan-line shader sweeps every 7.5s, and on each scan
  completion **toggles the mesh material** between the source texture
  and a neutral grey. No trails / no cube camera (lighter than the
  homepage scene). Drag-to-orbit + two-finger touch input model
  matches `Scene3D`.

### Phase media
Phases accept any Media in their `images: Media[]` array. The renderer
detects:
- **Single Mux item** → renders full-width via `<SingleVideo>` (looks
  better than a skinny video in one masonry column)
- **Mixed or image-only** → CSS-columns masonry on `md+`, single-column
  stack on mobile

### Image optimization
All case study images render through Next/Image. Two modes per cell:
- **`aspect` set** → cell locked to that ratio, image fills via
  `<Image fill>` + `object-cover` (will crop). Use for uniform tile
  grids.
- **`aspect` omitted** → cell takes the image's natural height; no crop.
  Requires `width` and `height` on the Media so Next can reserve
  layout space and pick the right size from the responsive srcset.

Source files live uncompressed in `public/projects/<slug>/...`; Vercel
generates WebP/AVIF at responsive sizes on first request and caches at
the edge. The `sizes` prop on each cell is `(max-width: 768px) 100vw,
33vw` to match the 3-col grid.

For each new project:
1. Drop image files under `public/projects/<slug>/phase-N/` (any
   filename — non-ASCII characters like U+202F from macOS Screenshot
   should be normalized to ASCII first).
2. Run `node scripts/measure-images.mjs public/projects/<slug>/phase-N`
   to print Media-shaped entries (`{ kind: 'image', src, width, height }`)
   ready to paste into the project's `phases[].images` array.
3. Commit the images and the updated `lib/projects.ts`.

### Mux integration
- **Library**: `@mux/mux-player-react` (installed). Lazy-loaded via
  `next/dynamic` with `ssr: false` because the player is a web component
  that needs `customElements`.
- **Playback IDs are public** — they live in `lib/projects.ts` directly
  (`hero.playbackId`). Don't put them in env vars.
- **API tokens** (`MUX_TOKEN_ID` / `MUX_TOKEN_SECRET`) live in `.env.local`
  (server-only, never `NEXT_PUBLIC_`-prefixed). Used for upload scripts
  and asset queries — not for serving public videos.
- Hero player is autoPlay + muted + loop + playsInline + nohotkeys, with
  `onContextMenu` suppressed to hide the "Save Video As" menu. Determined
  viewers can still grab the HLS stream from the network tab — this is
  friction, not protection.
- Uploads currently go through the Mux dashboard. If we add a CLI helper
  later, drop it at `scripts/upload-mux.ts` and use the API token pair.

### Password-gate pattern (`<CaseStudyPhases>`)
- The phases stack is wrapped in `.phase-gate`, which is `filter: blur(24px)`
  + `pointer-events: none` + `user-select: none` until `.unlocked` is added.
  Filter transitions over 600ms cubic-bezier(0.65, 0, 0.35, 1) — the site's
  canonical state-change easing.
- Comparison is **client-side SHA-256** of the input vs `passwordHash` from
  `projects.ts`. Use Web Crypto (`crypto.subtle.digest`) — no library.
- Generate a hash with:
  ```
  node -e "console.log(require('crypto').createHash('sha256').update('YOURPASSWORD').digest('hex'))"
  ```
  Or `echo -n "YOURPASSWORD" | shasum -a 256` on macOS.
- **Unlock state is persisted to `sessionStorage`** under a single shared
  key `phase-gate-hash`, with the *unlocked password's hash* as the value.
  On mount, each project compares its own `passwordHash` against the
  stored value — if they match, it auto-unlocks. Effect: projects sharing
  the same password unlock together once any one is opened; projects with
  a different password still need their own unlock. Closing the tab
  forgets it.
- This is **polite gating, not security**. The hash is in the bundle and
  brute-forceable for weak passwords; the playback URL is still extractable
  from the network tab. Don't use this for anything that genuinely needs
  to stay private — for that we'd switch the videos to Mux signed playback
  + server-side JWT minting, and serve the page itself behind real auth.

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

- Adding new projects to `lib/projects.ts`
- Building out `/work/[slug]`, `/scraps`, `/info` pages following the design system
- Performance optimizations within the existing visual budget
- Accessibility improvements (the custom cursor and dark theme need careful
  thought here — don't break keyboard navigation)
- Swapping `trash_001.glb` for an updated scan
- Refactoring without changing visual output

---

## Stack notes

- **Next.js 14 App Router** — server components by default, `'use client'` only
  where needed (the 3D scene, header time, cursor, project hover state)
- **TypeScript strict mode** — all new code typed
- **Tailwind** — used for layout primitives (flex, grid, spacing). Color and
  typography use the explicit CSS classes in `globals.css` because Tailwind's
  arbitrary-value syntax with opacity (`text-[#F4F2EE]/45`) was unreliable
  in some build contexts. Stick with the `text-fg-XX` and `text-accent-XX`
  utility classes.
- **Three.js (~r165)** — bare three, not React Three Fiber. The scene is
  imperative on purpose; R3F adds reconciliation overhead that isn't worth
  it for a single hand-crafted scene.

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