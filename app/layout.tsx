import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, Source_Sans_3, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-pinyon",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Chptr. - Read, Write, and Explore Stories",
  description: "Premium curated multi-genre story platform. Discover, read, and write various fiction, fanfiction, and poetry with a premium reading experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${sourceSerif.variable} ${sourceSans.variable} ${pinyon.variable} font-sans antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 flex flex-col`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
