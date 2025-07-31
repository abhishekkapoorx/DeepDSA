import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme'
import { shadcn } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepDSA",
  description: "DeepDSA - A platform for DSA enthusiasts",
  icons: {
    icon: [
      {
        url: '/SVG/LOGO_TRANS_DARK.svg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/SVG/LOGO_TRANS_LIGHT.svg',
        media: '(prefers-color-scheme: light)',
      },
    ],
    shortcut: '/SVG/LOGO_TRANS_LIGHT.svg',
    apple: '/SVG/LOGO_TRANS_LIGHT.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ClerkProvider
            appearance={{
              baseTheme: [shadcn],
            }}
          >
            <Navbar />
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
