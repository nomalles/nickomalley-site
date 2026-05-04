# nickomalley.net

Personal portfolio site for Nick O'Malley — Art Director, Motion Designer, 3D.

Built with Next.js 14 (App Router), TypeScript, Tailwind, and Three.js. The
homepage features a real-time WebGL scene of a photogrammetry-scanned trash
pile with chrome ribbon trails wandering through it, set against a giant
typographic backdrop.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build & deploy

```bash
npm run build
npm run start
```

This is a standard Next.js app — deploy to Vercel, Cloudflare Pages, Netlify,
or any Node host.

## Adding a project

Edit [`lib/projects.ts`](./lib/projects.ts). Every project is a single object
with `id`, `client`, `title`, `role`, `year`, and a 2-color `tint` gradient
used for the hover thumbnail placeholder.

## Swapping the homepage 3D asset

Drop a new `.glb` file into [`public/scans/`](./public/scans/) and update the
`scanPath` prop passed to `<Scene3D>` in
[`components/Portfolio.tsx`](./components/Portfolio.tsx).

The scene auto-normalizes (centers and uniformly scales) any model on load,
so you don't need to manually size new scans.

## Project conventions

See [CLAUDE.md](./CLAUDE.md) for design system, component architecture, and
constraints when extending the site (especially via Claude Code).
