import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/seo/JsonLd';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://oric.shu.edu.pk'),
  title: {
    default: 'SHU ORIC AI – Research, Innovation & Industry Intelligence Ecosystem',
    template: '%s | Salim Habib University ORIC AI'
  },
  description: 'AI-powered full-stack research, innovation and industry intelligence platform for the Office of Research, Innovation & Commercialization (ORIC), Salim Habib University (SHU), Karachi, Pakistan.',
  keywords: [
    'Salim Habib University',
    'SHU ORIC',
    'Research Commercialization Pakistan',
    'Karachi Industrial Clusters',
    'Korangi Industrial Area R&D',
    'SITE Industrial Area Innovation',
    'ERL Readiness Assessment',
    'Entrepreneurship Readiness Level',
    'Pharmaceutical Research Sindh',
    'Biomedical AI Karachi'
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
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-900 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
