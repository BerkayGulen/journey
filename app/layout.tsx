import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Handwriting display font ("Enjoy It!") — the app-wide hand/wordmark font,
// exposed as --font-hand. Bundled locally from public/fonts.
const enjoyIt = localFont({
  src: "../public/fonts/EnjoyIt-Regular.ttf",
  variable: "--font-enjoy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journey",
  description: "An interactive AI learning journey.",
};

// Ensure mobile devices scale to device width (zoom left enabled for a11y).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${enjoyIt.variable} h-full`}>
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  );
}
