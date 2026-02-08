import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Outfit,
  Lato,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppearanceProvider } from "@/components/appearance-provider";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./(backend)/api/uploadthing/core";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Izi Gym SaaS",
  description: "Supervisa el desempeño de tu gimnasio",
  keywords: [
    "gym",
    "dashboard",
    "fitness",
    "supervision",
    "performance",
    "gimnasio",
    "panel",
    "supervisión",
    "rendimiento",
    "gimnasio",
    "panel",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { orgId } = await auth();
  let initialFont: "inter" | "outfit" | "lato" = "inter";

  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { settings: true }
    });
    const settings = (org?.settings as any) || {};
    if (settings.appearance?.font) {
      initialFont = settings.appearance.font;
    }
  }

  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
      }}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/"
    >
      <html
        lang="es"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} ${lato.variable}`}
        data-font={initialFont}
      >
        <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppearanceProvider initialFont={initialFont}>
              <ReactQueryProvider>
                <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
                {children}
                <Analytics />
                <Toaster />
              </ReactQueryProvider>
            </AppearanceProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
