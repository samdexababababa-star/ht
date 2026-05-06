import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VisualEffects } from "@/components/site/VisualEffects";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  return (
    <>
      <VisualEffects
        depth={s.depthEffectsEnabled}
        reveal={s.scrollRevealEnabled}
        parallax={s.parallaxEnabled ?? false}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
