import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

// Disabling user-scalable is required for the canvas's two-finger orbit to
// fire on iOS — viewport pinch-zoom is a system-level gesture that runs
// below the JS layer, so element-level touch-action / preventDefault can't
// stop it. If/when long-form text pages are added (case studies, /info),
// consider overriding this per-page so users can still zoom for legibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Nick O'Malley — Art Director, Motion Designer, 3D",
  description:
    "Art Director and 3D motion designer based in Salzburg. Previously 3D Design Lead at Apple. Currently available for select projects.",
  metadataBase: new URL('https://nickomalley.net'),
  openGraph: {
    title: "Nick O'Malley",
    description: "Art Director · Motion Designer · 3D — Based in Salzburg",
    url: 'https://nickomalley.net',
    siteName: "Nick O'Malley",
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        {/* CustomCursor lives at the layout level so the green-dot cursor
            persists across every route (globals.css hides the system
            cursor site-wide, so without this, inner pages have no cursor
            at all). */}
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
