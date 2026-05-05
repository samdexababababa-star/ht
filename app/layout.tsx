import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  let s;
  try {
    s = await getSettings();
  } catch {
    s = null;
  }
  const brand = s?.brandName ?? "Soha";
  const tagline = s?.tagline ?? "Premium digital subscriptions, services & boosts.";
  return {
    title: { default: `${brand} — ${tagline}`, template: `%s — ${brand}` },
    description: tagline,
    icons: { icon: s?.faviconUrl || "/brand/favicon.svg" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
