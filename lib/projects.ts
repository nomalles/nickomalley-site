// Selected work data. Add new entries here — the homepage list and any
// future /work/[slug] routes will pick them up automatically.
//
// `tint` is a 2-color gradient used for the hover thumbnail placeholder
// until you swap in real thumbnail images.

export type Project = {
  id: string;
  client: string;
  title: string;
  role: string;
  year: string;
  tint: [string, string];
  // Future fields:
  // thumbnail?: string;     // /public path or remote URL
  // hero?: string;          // hero video/image
  // body?: string;          // MDX path for case study
};

export const projects: Project[] = [
  {
    id: '0024',
    year: '2025',
    client: 'Red Bull',
    title: 'Energy Brand Campaign',
    role: 'Senior 3D Motion',
    tint: ['#a30418', '#1d3a8a'],
  },
  {
    id: '0023',
    year: '2024',
    client: 'Apple',
    title: 'Vision Pro App Store',
    role: '3D Lead, Motion, AD',
    tint: ['#1d65f0', '#0a1f4a'],
  },
  {
    id: '0022',
    year: '2024',
    client: 'Apple',
    title: 'Apps & Games Editorial',
    role: '3D Designer, AD',
    tint: ['#ff5d5d', '#ffb84d'],
  },
  {
    id: '0021',
    year: '2023',
    client: 'Apple',
    title: 'App Store Originals',
    role: '3D Design Lead',
    tint: ['#7e3eff', '#1f0a4a'],
  },
  {
    id: '0020',
    year: '2022',
    client: 'WarnerMedia',
    title: 'Win the Court',
    role: 'Motion Designer',
    tint: ['#1f4ec2', '#070a1a'],
  },
  {
    id: '0019',
    year: '2021',
    client: 'Gensler',
    title: 'Experiential Install (NDA)',
    role: 'Motion + AD',
    tint: ['#3a4a55', '#0c1014'],
  },
];
