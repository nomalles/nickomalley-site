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
  handles most of the diffuse/specular IBL. A directional key
  (`intensity: 0.55`) is retained primarily for PCF shadow casting from the
  chrome trails onto the scan — at lower intensities the HDRI fill washed
  out the shadow contrast and trails appeared to float. ACES filmic tone
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

- **`/work/[slug]`** — case study pages. Template should have:
  - Slug header with client/project/year/role/type metadata block (Swiss style)
  - Full-bleed hero video autoplay loop
  - 2-3 sentence editorial paragraph (context, scale, contribution)
  - Mixed media body (stills, looped clips, 3D turntables, BTS)
  - Small mono credits block at end
  - Slice-wipe transition into next project on scroll-end
- **`/scraps`** — personal/experimental work (Nick's IG-style stuff).
  Should have a brief blurb at top explaining these are personal tests.
  Denser masonry-ish grid, mixed aspect ratios. Each item gets a small mono
  caption: format, year, tools (e.g. `scan / 2024 / polycam + r3f`).
- **`/info`** — long-form about, client list, contact.

When building these, KEEP THE 3D SCENE PERSISTENT. The scan should still be
visible behind subsequent pages — likely shrunk into a corner viewport, or
just continuing to fill the background. The site is one continuous workspace,
not a series of pages.

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