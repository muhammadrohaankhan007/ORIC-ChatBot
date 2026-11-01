import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/seo/JsonLd';

const outfit = Outfit({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://oric.shu.edu.pk'),
  title: {
    default: 'Salim Habib University ORIC | Office of Research, Innovation & Commercialization',
    template: '%s | Salim Habib University ORIC'
  },
  description: 'Official research commercialization and industry intelligence portal for the Office of Research, Innovation & Commercialization (ORIC) at Salim Habib University, Karachi. Bridging academic laboratory research with national manufacturing.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  },
  keywords: [
    'Salim Habib University',
    'SHU ORIC',
    'Research Commercialization Pakistan',
    'Karachi Industrial Estates',
    'Korangi Industrial Area R&D',
    'SITE Industrial Area Innovation',
    'ERL Readiness Assessment',
    'Entrepreneurship Readiness Level',
    'Pharmaceutical Drug Formulation Research',
    'Biomedical Devices Sindh'
  ],
  authors: [{ name: 'Salim Habib University ORIC Team' }],
  creator: 'Salim Habib University (SHU)',
  publisher: 'Salim Habib University',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'SHU ORIC AI – Research, Innovation & Industry Intelligence Ecosystem',
    description: 'Transforming university research into commercial products and high-impact industrial partnerships across Pakistan.',
    url: 'https://oric.shu.edu.pk',
    siteName: 'SHU ORIC AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHU ORIC AI Multi-Agent Ecosystem',
    description: 'Bridging Salim Habib University research to Karachi industries with 11 specialized AI agents.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${plusJakarta.variable} font-sans h-full antialiased overflow-x-hidden`}
    >
      <head>
        <JsonLd />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-white text-zinc-900 selection:bg-red-600 selection:text-white overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
