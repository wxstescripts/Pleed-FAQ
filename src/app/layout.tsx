import type { Metadata, Viewport } from "next";

import "./globals.css";

import { NextAuthProvider } from "@/components/NextAuthProvider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  // PLACEHOLDER: SITE_URL comes from NEXT_PUBLIC_SITE_URL (no production domain in the repo yet).
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "technology",
  keywords: [
    "Discord bot",
    "anti-nuke",
    "Discord moderation",
    "auto moderation",
    "join gate",
    "Discord security",
    "auto responder",
  ],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c10", // = --color-canvas
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={cn("dark", fontVariables)}>
      <body className="min-h-dvh bg-canvas font-sans text-fg antialiased">
        <NextAuthProvider>
          <MotionProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </MotionProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
