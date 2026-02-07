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
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./(backend)/api/uploadthing/core";

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
  title: "Gym Dashboard v2",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} ${lato.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            signInFallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
          >
            <AppearanceProvider>
              <ReactQueryProvider>
                <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
                {children}
                <Analytics />
                <Toaster />
              </ReactQueryProvider>
            </AppearanceProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
