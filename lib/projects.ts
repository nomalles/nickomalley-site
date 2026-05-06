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
    }
  | {
      /**
       * YouTube embed. Pass the video ID (the part after `?v=` or
       * `/embed/`). `playback` defaults to 'autoplay-muted-loop' (matches
       * Mux hero behavior); 'user' disables autoplay/loop and shows the
       * normal YouTube poster + play button.
       */
      kind: 'youtube';
      videoId: string;
      aspect?: string;
      playback?: 'autoplay-muted-loop' | 'user';
    };

/**
 * A phase's framing sentence. Either a plain string, or an array of
 * segments where each segment is either a plain string or an inline link.
 * The renderer in CaseStudyPhases stitches them together as one paragraph.
 */
export type FramingSegment = string | { text: string; href: string };

export type Phase = {
  /**
   * Heading shown above the framing sentence.
   *   - `string`        → use it
   *   - `undefined`     → if other phases are labeled/framed, fall back
   *                       to "Phase 01" / "Phase 02"; otherwise show none
   *   - `null` (explicit)→ render no heading at all, even on a project
   *                       where other phases are labeled. Useful for
   *                       continuation phases that visually belong to the
   *                       previous labeled section
   */
  label?: string | null;
  /** Optional. When omitted, the framing paragraph isn't rendered. */
  framing?: string | FramingSegment[];
  images: Media[];
  /**
   * Number of masonry columns on desktop (md+). Defaults to 3. Set
   * to 2 for sparser grids, 4 for denser ones.
   */
  columns?: number;
  /**
   * Number of masonry columns on mobile. Defaults to 1 (stacked).
   * Set to 2 to keep a 2-up layout on phones for grids that read
   * better as a tight 2×N (e.g. balanced 2×2 portrait sections).
   */
  mobileColumns?: number;
  /**
   * Optional list of media items rendered at full content width
   * BELOW the grid, in order. Use for "concluding" hero stills,
   * full-bleed videos that punctuate a phase, etc. Each item is
   * rendered at its natural aspect ratio.
   */
  trailing?: Media[];
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
  /**
   * Optional second hero block that sits between the page hero and the
   * phases. Used when the project's intro paragraph is baked into a
   * design image rather than written copy. The standard meta block +
   * context paragraph is suppressed when `planHero` is set; instead the
   * client / year / role values are overlaid in black on the top-left
   * of this image.
   */
  planHero?: {
    src: string;
    width: number;
    height: number;
    alt?: string;
  };
  scope?: string[];
  /**
   * Top-of-page paragraph. Either a plain string or a segment array
   * (same shape as phase framing) when you want inline links — including
   * `#anchor` hrefs that scroll to a phase block lower on the page.
   */
  context?: string | FramingSegment[];
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
    slug: 'redbull-3d-billboard',
    year: '2026',
    client: 'Red Bull',
    title: '3D Billboard',
    role: 'AD, Motion Designer',
    tint: ['#a30418', '#1d3a8a'],
    thumbnail: '/projects/redbull-billbooard/thumbnail.png',
    hero: {
      kind: 'image',
      src: '/projects/redbull-billbooard/hero/Screenshot 2026-05-06 at 11.45.18.png',
      aspect: '3632 / 1826',
    },
    planHero: {
      src: '/projects/redbull-billbooard/planning/plan-hero.png',
      width: 3616,
      height: 1632,
    },
    // No `context` — the project blurb lives inside plan-hero.png.
    phases: [
      {
        label: 'Planning',
        columns: 2,
        mobileColumns: 2,
        images: [
          { kind: 'image', src: '/projects/redbull-billbooard/planning/Screenshot 2025-10-01 at 8.24.40 PM-24095.png', width: 2350, height: 1666 },
          { kind: 'image', src: '/projects/redbull-billbooard/planning/Screenshot 2026-05-06 at 11.29.00.png', width: 2438, height: 1214 },
          { kind: 'image', src: '/projects/redbull-billbooard/planning/Screenshot 2026-05-06 at 11.29.30.png', width: 2358, height: 1160 },
          { kind: 'image', src: '/projects/redbull-billbooard/planning/Screenshot 2026-05-06 at 11.42.37.png', width: 2890, height: 1334 },
        ],
      },
      {
        label: 'Concepting',
        // Default desktop columns (3); mobile bumps to 2.
        mobileColumns: 2,
        images: [
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Billboard_Scene_02.png', width: 2266, height: 1132 },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/BubbleTest_0003.png', width: 1920, height: 959 },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Screenshot 2025-09-27 at 4.19.13 PM-24280.png', width: 2112, height: 1050 },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Screenshot 2025-09-27 at 7.37.00 PM-24461.png', width: 2110, height: 1050 },
          { kind: 'mux', playbackId: '2WPJFE28f15HJm01i6F1h00aeEcrL1Os1Plw5i5TNhQ400', aspect: '16/9' },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Screenshot 2025-09-28 at 2.38.02 PM-24498.png', width: 2046, height: 1158 },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Screenshot 2025-09-28 at 3.37.08 PM-24517.png', width: 1558, height: 870 },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Screenshot 2025-09-28 at 4.07.59 PM-24290.png', width: 1540, height: 828 },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Screenshot 2025-09-28 at 8.51.35 PM-24479.png', width: 1562, height: 776 },
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/Screenshot 2025-09-28 at 9.28.47 PM-24399.png', width: 1546, height: 774 },
        ],
        // themain.png renders below the grid as its own full-width block.
        trailing: [
          { kind: 'image', src: '/projects/redbull-billbooard/concepting/themain.png', width: 1842, height: 1118 },
        ],
      },
      {
        label: 'Production',
        columns: 2,
        mobileColumns: 2,
        images: [
          { kind: 'mux', playbackId: 'aZOsoWEAlAarw1brFbOb8eN00XCMWkNhpEQ90100otasLA', aspect: '16/9' },
          { kind: 'image', src: '/projects/redbull-billbooard/production/Screenshot 2025-10-01 at 4.09.31 PM-24700.png', width: 2824, height: 1408 },
          { kind: 'image', src: '/projects/redbull-billbooard/production/Screenshot 2025-10-01 at 10.38.02 PM-24914.png', width: 2362, height: 1482 },
          { kind: 'image', src: '/projects/redbull-billbooard/production/Screenshot 2025-10-01 at 10.38.34 PM-24908.png', width: 2350, height: 1486 },
        ],
        // After the grid: full-bleed Mux clip, then thefinal still.
        trailing: [
          { kind: 'mux', playbackId: 'jp8HjNd7P01CeS5901RVkwDRWIWUsGYF9vpHW7dmrM00tE', aspect: '16/9' },
          { kind: 'image', src: '/projects/redbull-billbooard/production/thefinal.png', width: 2876, height: 1104 },
        ],
      },
      {
        label: 'Pixel Map Export',
        // Single-mux phase — renders full-width via SingleVideo.
        images: [
          { kind: 'mux', playbackId: 'pTFcYeUnZFNMI7EFdfP6A55IpiDJyaS4W85JgtkgkHk', aspect: '16/9' },
        ],
      },
    ],
    // No passwordHash — public.
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
    // SHA-256 of "nickwork" — shared across the gated projects so one
    // unlock opens the others (see CaseStudyPhases for the cross-page
    // unlock logic). To regenerate for a new password:
    //   node -e "console.log(require('crypto').createHash('sha256').update('YOURPASSWORD').digest('hex'))"
    passwordHash: '3ded20af90c0727c2c4cfe46504c55567704f6af930be426e2ad8e369649e4de',
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
    passwordHash: '3ded20af90c0727c2c4cfe46504c55567704f6af930be426e2ad8e369649e4de',
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
    context: [
      'In my time at Apple, I created a 3D icon model and guidelines to be used across store and marketing content, including an ',
      { text: 'internal tool', href: '#phase-tool' },
      ' for teams across the org to craft icons for any usage.',
    ],
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
    passwordHash: '3ded20af90c0727c2c4cfe46504c55567704f6af930be426e2ad8e369649e4de',
  },
  {
    id: '0020a',
    slug: 'pokemon-go-season-of-go',
    year: '2022',
    client: 'Niantic, The Pokemon Company',
    title: 'Season of GO',
    role: 'Motion Designer',
    studio: 'Trailer Park',
    tint: ['#ffd23f', '#1e2c5e'],
    thumbnail: '/projects/pokemon-go/thumbnail.png',
    hero: {
      kind: 'youtube',
      videoId: 'xI4CGC_jc4o',
      aspect: '16/9',
    },
    context:
      'Animation for Pokemon GO narrative spots, used across their socials for the Season of GO Fest 2022. Each episode focused on the introduction of new Pokemon in the game.',
    phases: [
      {
        label: 'Ultrabeasts campaign',
        images: [
          { kind: 'youtube', videoId: 'upiuMRWfll8', aspect: '16/9', playback: 'user' },
        ],
      },
      {
        label: 'Content snippets',
        images: [
          { kind: 'image', src: '/projects/pokemon-go/Frame_09.gif', width: 1000, height: 563 },
          { kind: 'image', src: '/projects/pokemon-go/PGO-Narr_MAIN_ENG-1920x1080_1_3.gif', width: 1000, height: 563 },
          { kind: 'image', src: '/projects/pokemon-go/PGO-Narr_MAIN_ENG-1920x1080_1_4.gif', width: 1000, height: 563 },
          { kind: 'image', src: '/projects/pokemon-go/PGO_GIF_nihilego.gif', width: 1280, height: 720 },
          { kind: 'image', src: '/projects/pokemon-go/PGO_GIF_shaymin.gif', width: 1280, height: 720 },
          { kind: 'mux', playbackId: 'dCTLZg8lXjBK97bNsTXqQ6LD5Yd6jzF00009onJ5z008kI', aspect: '16/9' },
          { kind: 'image', src: '/projects/pokemon-go/bts.png', width: 1346, height: 1220 },
        ],
      },
      {
        label: 'Even more ultrabeasts',
        images: [
          { kind: 'youtube', videoId: 'd6evxdX1iVI', aspect: '16/9', playback: 'user' },
        ],
      },
    ],
    // No passwordHash — public.
  },
  {
    id: '0020b',
    slug: 'playstation-tournaments',
    year: '2021-2022',
    client: 'Playstation',
    title: 'Playstation Tournaments',
    role: 'Motion Designer',
    studio: 'Jellyfish',
    tint: ['#0070d1', '#000000'],
    thumbnail: '/projects/playstation/thumbnail.png',
    hero: {
      kind: 'mux',
      playbackId: 'wl1KfiDQALyV1Bo7uW3wJg5cQgCB9Zo00jKL34zPkaRA',
      aspect: '21/9',
    },
    context:
      'Motion Design for Playstation Tournaments promotional videos + motion templates for live broadcasts and social media material.',
    phases: [
      {
        label: 'Promotional Videos',
        columns: 2,
        images: [
          { kind: 'mux', playbackId: 'FfxhW01WfDa00VfnYjqgubapgsLfk3YNbFFT00NLj4tg01E', aspect: '16/9', playback: 'user-with-sound' },
          { kind: 'mux', playbackId: 'm1Ok4TZVegE21po01O00qr5vUfw4s5tVsANujgasCFWZQ', aspect: '16/9' },
          { kind: 'mux', playbackId: 'loX6ekDNbMiKXss2pj7lpYcFBUoN02RHc02z5fIMgGECo', aspect: '16/9' },
          { kind: 'image', src: '/projects/playstation/winTheCourt.gif', width: 1912, height: 1078 },
        ],
      },
      {
        label: 'Broadcast Template',
        images: [
          { kind: 'mux', playbackId: 'Q9Shxppd1RgBJ202AM4wU0201rSRAtg2NUcIFB9o1q00lOA', aspect: '16/9', playback: 'user-with-sound' },
        ],
      },
      {
        label: 'Misc.',
        columns: 2,
        images: [
          { kind: 'mux', playbackId: 'qSfoe1cK01Iwc001jjyvtbi6XlFNpXmC81L8p5LdkpuMk', aspect: '16/9' },
          { kind: 'image', src: '/projects/playstation/SummerWinning_PromoAsset_16x9_choppy.gif', width: 1280, height: 720 },
        ],
      },
    ],
    // No passwordHash — public.
  },
  {
    id: '0018b',
    slug: 'warner-media-lobby',
    year: '2019-2020',
    client: 'WarnerMedia',
    title: 'Lobby Installation',
    role: '3D + Motion Designer',
    studio: 'Gensler',
    tint: ['#1a4ba0', '#0c1530'],
    thumbnail: '/projects/warner-media/thumbnail.png',
    hero: {
      kind: 'mux',
      playbackId: 'x6CKlZLvxu02WgrI1zGXJmg3dQI8JZsqRsz013RN601D02k',
      aspect: '16/9',
    },
    context:
      'Installation and Content Design for WarnerMedia’s lobby at the Culver City train station. The challenge was crafting something that communicated the brand while spotlighting content beyond a rectangle.',
    phases: [
      {
        label: 'Concepting',
        images: [
          { kind: 'image', src: '/projects/warner-media/concepting/Screen Shot 2019-12-10 at 1.56.57 PM.png', width: 3174, height: 1882 },
          { kind: 'image', src: '/projects/warner-media/concepting/Screen Shot 2019-12-10 at 2.07.49 PM.png', width: 3154, height: 2104 },
          { kind: 'image', src: '/projects/warner-media/concepting/Screen Shot 2019-12-10 at 2.35.23 PM.png', width: 2202, height: 1216 },
          { kind: 'mux', playbackId: 'xtU00Pn2S6qeuI301an57hJFMlbuXtNk1wuk4FYQbDUdM', aspect: '16/9' },
          { kind: 'image', src: '/projects/warner-media/concepting/Screen Shot 2020-06-26 at 12.34.41 PM.png', width: 3346, height: 1524 },
          { kind: 'image', src: '/projects/warner-media/concepting/Screen Shot 2020-06-26 at 12.39.57 PM.png', width: 3488, height: 1602 },
        ],
      },
      {
        label: 'Content Testing',
        images: [
          { kind: 'image', src: '/projects/warner-media/content/image83.gif', width: 800, height: 449 },
          { kind: 'image', src: '/projects/warner-media/content/image84.gif', width: 800, height: 450 },
          { kind: 'image', src: '/projects/warner-media/content/image85.png', width: 3602, height: 1952 },
          { kind: 'mux', playbackId: 'REdfclaVhWMrMxXhNUjyAEP63s8UbOIA3rVPo9MsuIU', aspect: '16/9' },
          { kind: 'image', src: '/projects/warner-media/content/image88.jpg', width: 4121, height: 1080 },
          { kind: 'image', src: '/projects/warner-media/content/image89.png', width: 892, height: 1616 },
          { kind: 'image', src: '/projects/warner-media/content/image92.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/warner-media/content/warnermedia.gif', width: 800, height: 450 },
          { kind: 'image', src: '/projects/warner-media/content/wmghibli.png', width: 2958, height: 1652 },
        ],
      },
    ],
    // No passwordHash — public.
  },
  {
    id: '0018a',
    slug: 'twitch-rivals-broadcast',
    year: '2020-2021',
    client: 'Twitch',
    title: 'Twitch Rivals Broadcast',
    role: 'Motion Designer',
    studio: 'Esports Engine',
    tint: ['#9147ff', '#0e0e10'],
    thumbnail: '/projects/twitch/thumbnail.png',
    hero: {
      kind: 'mux',
      playbackId: 'bNeFRP2K33Fodsz00mKMMzkN02aCImaNWh00I48pflFJpA',
      aspect: '21/9',
    },
    context:
      'Motion Design for various Twitch Rivals esports broadcasts, including a full redesign of their main stream graphics. Designed to work with data from vMix.',
    phases: [
      {
        label: 'Transitions + Overlays',
        images: [
          { kind: 'image', src: '/projects/twitch/DBD_wipe_02.gif', width: 1500, height: 843 },
          { kind: 'image', src: '/projects/twitch/DBD_wipe_03.gif', width: 1500, height: 843 },
          { kind: 'image', src: '/projects/twitch/FS_Fortnite_Scoring.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/twitch/Format_Anims.gif', width: 1500, height: 786 },
          { kind: 'image', src: '/projects/twitch/Format_Day02_p1.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/twitch/Master Chips Ref_v02.png', width: 1920, height: 1080 },
          { kind: 'image', src: '/projects/twitch/TR_Trackmania_Tires_opt01.gif', width: 1500, height: 843 },
          { kind: 'image', src: '/projects/twitch/Template_Draft.gif', width: 1500, height: 840 },
          { kind: 'image', src: '/projects/twitch/WR_Wipe_02.gif', width: 1500, height: 843 },
          { kind: 'image', src: '/projects/twitch/WR_Wipe_diagonal.gif', width: 1500, height: 843 },
        ],
      },
    ],
    // No passwordHash — public.
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
    thumbnail: '/projects/grammy-museum/thumbnail.png',
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
