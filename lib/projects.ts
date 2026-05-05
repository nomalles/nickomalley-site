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
  | {
      kind: 'image';
      src: string;
      /** When present, cell is locked to this ratio + object-cover crop. */
      aspect?: string;
      alt?: string;
      /**
       * Source dimensions in pixels. Required when `aspect` is omitted so
       * Next/Image can reserve layout space and serve a responsive srcset.
       * Use `npx tsx scripts/measure-images.ts <folder>` to generate values.
       */
      width?: number;
      height?: number;
    }
  | {
      /** Interactive Three.js hero — currently used by Scene3DIcons. */
      kind: 'scene';
      scanPath: string;
      aspect?: string;
    };

/**
 * A phase's framing sentence. Either a plain string, or an array of
 * segments where each segment is either a plain string or an inline link.
 * The renderer in CaseStudyPhases stitches them together as one paragraph.
 */
export type FramingSegment = string | { text: string; href: string };

export type Phase = {
  framing: string | FramingSegment[];
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
    year: '2023-2025',
    client: 'Apple',
    title: 'Vision Pro App Store',
    role: '3D Lead, Motion, AD',
    tint: ['#1d65f0', '#0a1f4a'],
    hero: {
      kind: 'mux',
      playbackId: 'OtQYj2wu3jkXRHzbx00Hrn17Lf5nZQxtB3HGsKRc8Rdk',
      aspect: '21/9',
    },
    context:
      'We were tasked with designing and launching a new App Store for the Vision Pro. This store would leverage editorial 3D content to showcase the experiences on device. The work is spread across 2-3 years.',
    phases: [
      {
        framing:
          'The goal was to establish an App Store showcasing editorialized 3D content, shining a spotlight on the first apps on the system. We landed on a simple approach that we could evolve over time, yet work with all crops.',
        images: [
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/Arcade_ServiceValue_0111.png', width: 3840, height: 2160 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/ForeFlightVoyager-Hero.png', width: 2432, height: 1538 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/IMG_0203.PNG', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/IMG_0205.PNG', width: 1390, height: 792 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/IMG_0208.PNG', width: 515, height: 748 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/IMG_0209.PNG', width: 1494, height: 846 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/IMG_0217_edited.jpg', width: 1658, height: 933 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/LiveSurface-QuickTake_cropping-01.png', width: 3840, height: 2160 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/Lungy-QuickTake.png', width: 2048, height: 2732 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/SDS34-AS-WW-Numerics-QuickTake.png', width: 2048, height: 2732 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-01/TouchDesk_6K_CC-02.png', width: 2494, height: 1429 },
        ],
      },
      {
        framing:
          'After the first 6 months, we dialed in our 3D home environments, defined screen layouts, and reworked the design of 3D icons in content.',
        images: [
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Jigspace_LivingRoom_Reg-02.png', width: 3840, height: 2160 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Keynote_Office_5Kwide.png', width: 5000, height: 2812 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Redbull-02.png', width: 1080, height: 1080 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Screenshot 2025-03-27 at 12.06.55 PM.png', width: 1416, height: 1898 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Screenshot 2025-04-03 at 2.38.44 PM.png', width: 4506, height: 954 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Screenshot 2026-05-05 at 13.23.11.png', width: 2014, height: 756 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Screenshot 2026-05-05 at 13.24.00.png', width: 1988, height: 1218 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Screenshot 2026-05-05 at 13.24.54.png', width: 2016, height: 628 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-02/Screenshot 2026-05-05 at 13.25.31.png', width: 1998, height: 1210 },
        ],
      },
      {
        framing: [
          'After a year of Vision Pro, we worked with ',
          { text: 'Someform', href: 'http://someform.studio/' },
          ' studio to help evolve our systems, bringing in procedural platforms and color washes that could be shaped for all types of content.',
        ],
        images: [
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/Architecture_blank_03.png', width: 2048, height: 2732 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/BS169-AS-WW-Gucci.png', width: 3840, height: 2160 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/PicklePro_FirstLook.png', width: 3840, height: 2160 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/Screenshot 2025-04-03 at 11.46.08 AM.png', width: 1932, height: 1078 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/Screenshot 2025-04-03 at 11.54.39 AM.png', width: 2338, height: 1620 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/Screenshot 2026-05-04 at 22.58.33.png', width: 2010, height: 702 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/Screenshot 2026-05-05 at 13.19.09.png', width: 2304, height: 1388 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/Screenshot 2026-05-05 at 13.27.46.png', width: 2024, height: 1552 },
          { kind: 'image', src: '/projects/apple-vision-pro/phase-03/Screenshot 2026-05-05 at 13.37.12.png', width: 1930, height: 1098 },
        ],
      },
    ],
    credits: {
      team: [
        '3D Design / Motion — Nick O’Malley, Henry Barbera, Someform',
        'ADs — Jee Ann, Nick O’Malley',
        'Producers — Blake Davidhoff, Nikki Richter',
        'CD — Emersson Barillas',
      ],
    },
    // SHA-256 of the literal string "placeholder". Replace this hash AND the
    // password before launch. To regenerate:
    //   node -e "console.log(require('crypto').createHash('sha256').update('YOURPASSWORD').digest('hex'))"
    passwordHash: '4097889236a2af26c293033feb964c4cf118c0224e0d063fec0a89e9d0569ef2',
  },
  {
    id: '0022a',
    slug: 'apple-3d-icons',
    year: '2022-2025',
    client: 'Apple',
    title: '3D Icons',
    role: '3D Lead, AD',
    tint: ['#3b82f6', '#0a1f4a'],
    hero: {
      kind: 'scene',
      scanPath: '/scans/apple-3d-icons.glb',
      aspect: '21/9',
    },
    context:
      'Placeholder context paragraph for the 3D Icons project — replace with real copy describing scope, scale, and Nick’s contribution.',
    phases: [
      {
        framing:
          'Concepting — placeholder framing sentence describing the early exploration and system definition for the 3D icon language.',
        images: [
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/Blank_Angled-01.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/Chiclet_Guides-thickness-ISO.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/Chiclet_Guides_Apex.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/Chiclet_Guides_CANVA-colors.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/Moltres_Single_Angles.png', width: 1748, height: 1834 },
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/Screen Shot 2022-10-05 at 3.21.03 PM.png', width: 2928, height: 1628 },
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/Screenshot 2024-01-03 at 10.21.11 PM.png', width: 1572, height: 848 },
          { kind: 'image', src: '/projects/apple-3d-icons/Concepting/UV-expand.png', width: 1104, height: 870 },
        ],
      },
      {
        framing:
          'Usage — placeholder framing sentence describing how the icon system showed up across editorial layouts and product surfaces.',
        images: [
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/IMG_0431.jpg', width: 1260, height: 2572 },
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/IMG_2159.PNG', width: 1170, height: 2532 },
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/IMG_4436.PNG', width: 1170, height: 2532 },
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/IMG_4744.PNG', width: 1206, height: 2622 },
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/IMG_4972.PNG', width: 1206, height: 2622 },
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/IMG_6145.PNG', width: 1170, height: 2532 },
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/IMG_8644.PNG', width: 1260, height: 2736 },
          { kind: 'image', src: '/projects/apple-3d-icons/Usage/Screenshot 2025-02-12 at 12.08.45 PM.png', width: 1544, height: 1190 },
        ],
      },
      {
        framing:
          'Tool — placeholder framing sentence describing the production tool that supported the icon program.',
        images: [
          // VERIFY: Nick gave this as the asset ID — confirm in the Mux
          // dashboard that it's actually the *playback* ID. If not, swap
          // for the playback ID listed under the asset's Playback IDs.
          {
            kind: 'mux',
            playbackId: 'UVbVaezcuWK5DgqCqUbeWeSgaWRPhFtgkNT01psFQJFo',
            aspect: '160/127',
          },
        ],
      },
    ],
    credits: {
      team: ['Placeholder — replace with real credit lines'],
    },
    // Same hash as Apple Vision Pro so unlocking one gates the other in.
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
