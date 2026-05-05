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
  | {
      kind: 'mux';
      playbackId: string;
      aspect?: string;
      alt?: string;
      /**
       * Default 'autoplay-muted-loop' — silent looping background video,
       * used for hero clips and ambient grid tiles. Switch to
       * 'user-with-sound' for content that requires the user to press
       * play and starts unmuted (process walkthroughs, talkies, etc.).
       */
      playback?: 'autoplay-muted-loop' | 'user-with-sound';
    }
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
  /**
   * Heading shown above the framing sentence. When omitted on a multi-
   * phase project, the renderer falls back to "Phase 01", "Phase 02",
   * etc. On a single-phase project (one section, no chronological
   * structure), an absent label shows nothing — the section just renders
   * its grid with no heading.
   */
  label?: string;
  /** Optional. When omitted, the framing paragraph isn't rendered. */
  framing?: string | FramingSegment[];
  images: Media[];
  /**
   * Number of masonry columns on desktop (md+). Mobile is always 1.
   * Defaults to 3. Set to 2 for sparser grids (fewer items, larger
   * media tiles), or 4 for denser ones.
   */
  columns?: number;
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
  /** Production studio. When set, the metadata block adds a "Studio" row. */
  studio?: string;
  tint: [string, string];
  /**
   * Optional path under /public to a thumbnail image used for the hover
   * preview on the homepage list. When set, the hover card shows the
   * image (no text overlay); the row itself already carries the metadata.
   * Fall back to the `tint` gradient + text card when omitted.
   */
  thumbnail?: string;

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
    thumbnail: '/projects/apple-vision-pro/thumbnail.PNG',
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
    id: '0023a',
    slug: 'apple-app-store-awards',
    year: '2024 + 2025',
    client: 'Apple',
    title: 'App Store Awards',
    role: 'AD',
    tint: ['#ffaa42', '#3a1f4a'],
    thumbnail: '/projects/apple-app-awards/thumbnail.png',
    hero: {
      kind: 'mux',
      playbackId: 'nStn7ByAaOJnLCOKhUYsttlE01i01YL1zYjN4E9u9avwM',
      aspect: '16/9',
    },
    context:
      'App Store Awards for 2024 and 2025. These were Co-Art Directed, working with Brand New School for the design and motion.',
    phases: [
      {
        // No label, no framing — single flat grid section. Mixed images
        // and Mux videos flow through the masonry layout. 2 columns on
        // desktop since there are only six tiles; 3 would leave a
        // sparse trailing column.
        columns: 2,
        images: [
          { kind: 'mux', playbackId: 'dMn00brUD84EZ01fHsVDQIeiuQ4cQOGpVqhHzJZDgdyCg', aspect: '16/9' },
          { kind: 'image', src: '/projects/apple-app-awards/Screenshot 2024-10-16 at 3.22.55 PM.png', width: 5252, height: 2948 },
          { kind: 'image', src: '/projects/apple-app-awards/GOTY_iphone-AS-Newsroom-02.png', width: 3840, height: 2160 },
          { kind: 'mux', playbackId: 'vSpxs37m7AoVH6zndUamN00YoeI01huxotADwPo00ZKNNk', aspect: '16/9' },
          { kind: 'image', src: '/projects/apple-app-awards/Screenshot 2025-02-12 at 12.04.07 PM.png', width: 2036, height: 1140 },
          { kind: 'mux', playbackId: 'WJbMkm41WjCcNM8mM01lLDPCE00Vx78orh6O01bNcsOQyU', aspect: '16/9' },
        ],
      },
    ],
    // Same hash as the other Apple pages — unlocking one unlocks all.
    passwordHash: '4097889236a2af26c293033feb964c4cf118c0224e0d063fec0a89e9d0569ef2',
  },
  {
    id: '0022a',
    slug: 'apple-3d-icons',
    year: '2022-2025',
    client: 'Apple',
    title: 'Apps + Games 3D Icons',
    role: '3D Lead, AD',
    tint: ['#3b82f6', '#0a1f4a'],
    thumbnail: '/projects/apple-3d-icons/thumbnail.png',
    hero: {
      kind: 'scene',
      scanPath: '/scans/apple-3d-icons.glb',
      aspect: '21/9',
    },
    context:
      'In my time at Apple, I created a 3D icon model and guidelines to be used across store and marketing content, including an internal tool for teams across the org to craft icons for any usage.',
    phases: [
      {
        label: 'Concepting',
        framing:
          'Iterations made to define the 3D shape using the 2D rounded square as a base. The beveled edges are in communication with Apple devices, and UV mapping assures no image warping.',
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
        label: 'Usage',
        framing:
          'A few examples of the 3D icons being used across the App Store.',
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
        label: 'Tool',
        framing:
          'I developed a tool to be used internally at Apple for other designers and teams to quickly export images using icons of their choice. Positioning, lighting, and texture is all editable.',
        images: [
          {
            kind: 'mux',
            playbackId: '8tofFgIOzyX02nIBHBqZre9HcppRAgV9pyMPKJ8pCCe4',
            aspect: '160/127',
          },
        ],
      },
    ],
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
  {
    id: '0018',
    slug: 'grammy-mono-to-immersive',
    year: '2019',
    client: 'The Grammy Museum',
    title: 'Mono to Immersive',
    role: 'Motion Designer',
    studio: 'Gensler',
    tint: ['#6b46c1', '#1a0f2e'],
    hero: {
      kind: 'mux',
      playbackId: 'xnQ4BU1C7UH01NwukutCJg9B02BCEXiHbosHU7chQfSVU',
      aspect: '21/9',
    },
    context:
      'Mono to Immersive is an interactive exhibit at The Grammy Museum in Downtown LA, showcasing the visual evolution of sound through performances at the Grammy’s. The visuals are reacting to each performance, becoming more complex as sound quality progresses and more speakers are activated.',
    phases: [
      {
        // Single user-controlled video — full-width, sound on by default
        // when the visitor presses play.
        images: [
          {
            kind: 'mux',
            playbackId: '8tyUTYyzaZURQipF3PXTw9JlWWFV4v00zwqwZooPt6OU',
            aspect: '16/9',
            playback: 'user-with-sound',
          },
        ],
      },
      {
        // 2x2 grid of the four animated GIFs.
        columns: 2,
        images: [
          { kind: 'image', src: '/projects/grammy-museum/ColorTest_01.gif', width: 1114, height: 600 },
          { kind: 'image', src: '/projects/grammy-museum/Grammy_01.gif', width: 800, height: 941 },
          { kind: 'image', src: '/projects/grammy-museum/Rosalia_full_01.gif', width: 1200, height: 532 },
          { kind: 'image', src: '/projects/grammy-museum/Rosalia_full_02.gif', width: 1200, height: 532 },
        ],
      },
      {
        // Closing user-controlled video.
        images: [
          {
            kind: 'mux',
            playbackId: 'JZ5cKKNDidVLqVvDrgHcX01oL9iEEpbOjuQjlp1HIY01o',
            aspect: '16/9',
            playback: 'user-with-sound',
          },
        ],
      },
    ],
    // No passwordHash — public project, no gating.
  },
];
