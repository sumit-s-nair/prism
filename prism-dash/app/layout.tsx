import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Prism Dashboard",
  description:
    "Prism is an edge-native accessibility auditor powered by Cloudflare Workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "dark",
        spaceGrotesk.variable,
        spaceMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
