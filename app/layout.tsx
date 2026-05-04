import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
