import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: "TernoTrip — India's Favourite Tour Packages",
    template: '%s | TernoTrip',
  },
  description:
    "Discover India's best tour packages — Himalayas, Goa, Kerala, Rajasthan and more with TernoTrip.",
  keywords: ['travel', 'India', 'tour packages', 'trips', 'adventure', 'ternotrip'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
