import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VisualEffects } from "@/components/site/VisualEffects";
import { StickyPromoBanner } from "@/components/site/StickyPromoBanner";
import { BackToTop } from "@/components/site/BackToTop";
import { ExitIntentPopup } from "@/components/site/ExitIntentPopup";
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
      {s.stickyPromoEnabled && s.stickyPromoText ? (
        <StickyPromoBanner
          text={s.stickyPromoText}
          href={s.stickyPromoLink}
        />
      ) : null}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer recentlyViewedEnabled={s.recentlyViewedEnabled} />
      {s.backToTopEnabled ? <BackToTop /> : null}
      {s.exitIntentEnabled && s.exitIntentText ? (
        <ExitIntentPopup text={s.exitIntentText} code={s.exitIntentCode} />
      ) : null}
    </>
  );
}
