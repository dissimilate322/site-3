import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Work | Unconventional Solutions",
  description: "Otherlife is a creative agency elevating digital experiences using creativity and technology.",
  icons: { icon: "/assets/favicon-32x32.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/assets/ff9ccf87d4ee1f04-s.p.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/f6b0aeaf3ea04f3b-s.p.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
