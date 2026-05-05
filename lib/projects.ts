// Selected work data. Add new entries here — the homepage list and any
// /work/[slug] routes will pick them up automatically.
//
// `tint` is a 2-color gradient used for the hover thumbnail placeholder
// until you swap in real thumbnail images.
//
// Case-study fields (`hero`, `scope`, `context`, `phases`, `credits`,
// `passwordHash`) are optional — only projects that have a built-out
// case study at /work/<slug> need them. Other entries can be slug-only
// for now and the dynamic route will return 404 for those slugs.

export type Media =
  | { kind: 'mux'; playbackId: string; aspect?: string; alt?: string }
  | { kind: 'image'; src: string; aspect?: string; alt?: string };

export type Phase = {
  framing: string;
  images: Media[];
};

export type Credits = {
  team?: string[];
  notes?: string;
};

export type Project = {
  id: string;
  slug: string;
  client: string;
  title: string;
  role: string;
  year: string;
  tint: [string, string];

  // Case-study fields — optional. A project is considered to have a real
  // case-study page only if `hero` is present.
  hero?: Media;
  scope?: string[];
  context?: string;
  phases?: Phase[];
  credits?: Credits;
  // SHA-256 hex of the gating password. Generate with:
  //   node -e "console.log(require('crypto').createHash('sha256').update('YOURPASSWORD').digest('hex'))"
  // Omit to leave the phases ungated.
  passwordHash?: string;
};

export const projects: Project[] = [
  {
    id: '0024',
    slug: 'red-bull-energy-campaign',
    year: '2025',
    client: 'Red Bull',
    title: 'Energy Brand Campaign',
    role: 'Senior 3D Motion',
    tint: ['#a30418', '#1d3a8a'],
  },
  {
    id: '0023',
    slug: 'apple-vision-pro',
    year: '2024',
    client: 'Apple',
    title: 'Vision Pro App Store',
    role: '3D Lead, Motion, AD',
    tint: ['#1d65f0', '#0a1f4a'],
    hero: {
      kind: 'mux',
      playbackId: 'OtQYj2wu3jkXRHzbx00Hrn17Lf5nZQxtB3HGsKRc8Rdk',
      aspect: '21/9',
    },
    scope: ['App Store Onboarding', 'Editorial Motion', '3D Direction'],
    context:
      'Placeholder context paragraph — 2 to 3 sentences describing what this project is, the scale of the work, and Nick’s contribution. Replace with real copy before launch.',
    phases: [
      {
        framing:
          'Phase 01 — placeholder framing sentence describing the first stage of the work (research, exploration, pitch — whatever it actually was).',
        images: [
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/01.jpg', aspect: '4/3' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/02.jpg', aspect: '3/4' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/03.jpg', aspect: '1/1' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/04.jpg', aspect: '16/9' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/05.jpg', aspect: '4/3' },
        ],
      },
      {
        framing:
          'Phase 02 — placeholder framing sentence for the second stage (development, key visuals, motion tests).',
        images: [
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/01.jpg', aspect: '3/2' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/02.jpg', aspect: '1/1' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/03.jpg', aspect: '4/3' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/04.jpg', aspect: '3/4' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/05.jpg', aspect: '16/9' },
        ],
      },
      {
        framing:
          'Phase 03 — placeholder framing sentence for the final stage (delivery, polish, BTS).',
        images: [
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/01.jpg', aspect: '4/3' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/02.jpg', aspect: '4/3' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/03.jpg', aspect: '1/1' },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/04.jpg', aspect: '21/9' },
        ],
      },
    ],
    credits: {
      team: [
        'Design Lead — Nick O’Malley',
        'Director — Placeholder',
        'Producer — Placeholder',
        '3D — Placeholder',
        'Editorial — Placeholder',
      ],
      notes:
        'Placeholder credits notes — describe Nick’s specific contribution and any context worth surfacing. Replace with real copy before launch.',
    },
    // SHA-256 of the literal string "placeholder". Replace this hash AND the
    // password before launch. To regenerate:
    //   node -e "console.log(require('crypto').createHash('sha256').update('YOURPASSWORD').digest('hex'))"
    passwordHash: '4097889236a2af26c293033feb964c4cf118c0224e0d063fec0a89e9d0569ef2',
  },
  {
    id: '0022',
    slug: 'apple-apps-games-editorial',
    year: '2024',
    client: 'Apple',
    title: 'Apps & Games Editorial',
    role: '3D Designer, AD',
    tint: ['#ff5d5d', '#ffb84d'],
  },
  {
    id: '0021',
    slug: 'apple-app-store-originals',
    year: '2023',
    client: 'Apple',
    title: 'App Store Originals',
    role: '3D Design Lead',
    tint: ['#7e3eff', '#1f0a4a'],
  },
  {
    id: '0020',
    slug: 'warnermedia-win-the-court',
    year: '2022',
    client: 'WarnerMedia',
    title: 'Win the Court',
    role: 'Motion Designer',
    tint: ['#1f4ec2', '#070a1a'],
  },
  {
    id: '0019',
    slug: 'gensler-experiential',
    year: '2021',
    client: 'Gensler',
    title: 'Experiential Install (NDA)',
    role: 'Motion + AD',
    tint: ['#3a4a55', '#0c1014'],
  },
];
