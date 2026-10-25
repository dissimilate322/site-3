import type { Metadata } from "next";
import "./globals.css";
import PageTransition from '@/components/PageTransition';
import MotionSettings from '@/components/MotionSettings';
import SmoothScroll from '@/components/SmoothScroll';
import HomeColorFilters from '@/components/HomeColorFilters';

export const metadata: Metadata = {
  title: "meruem | Unconventional Solutions",
  description: "meruem is a creative agency elevating digital experiences using creativity and technology.",
  icons: { icon: "/assets/meruem-icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-motion="full" data-site-version="meruem-dark-wordmark-20261026">
      <head>
        <link rel="preload" href="/assets/ff9ccf87d4ee1f04-s.p.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/f6b0aeaf3ea04f3b-s.p.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body><HomeColorFilters/><MotionSettings><SmoothScroll/><PageTransition>{children}</PageTransition></MotionSettings></body>
    </html>
  );
}
