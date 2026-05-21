import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VisualEffects } from "@/components/site/VisualEffects";
import { StickyPromoBanner } from "@/components/site/StickyPromoBanner";
import { BackToTop } from "@/components/site/BackToTop";
import { ExitIntentPopup } from "@/components/site/ExitIntentPopup";
import { getTranslations } from "next-intl/server";
import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [s, t] = await Promise.all([getSettings(), getTranslations("common")]);
  // Translate sticky promo / exit intent copy when admin hasn't overridden
  // the schema defaults. Once overridden, the admin's single string wins
  // across every locale.
  const stickyPromoText =
    s.stickyPromoText === SETTING_DEFAULTS.stickyPromoText
      ? t("stickyPromoText")
      : s.stickyPromoText;
  const exitIntentText =
    s.exitIntentText === SETTING_DEFAULTS.exitIntentText
      ? t("exitIntentText")
      : s.exitIntentText;
  return (
    <>
      <VisualEffects
        depth={s.depthEffectsEnabled}
        reveal={s.scrollRevealEnabled}
        parallax={s.parallaxEnabled ?? false}
      />
      {s.stickyPromoEnabled && stickyPromoText ? (
        <StickyPromoBanner
          text={stickyPromoText}
          href={s.stickyPromoLink}
        />
      ) : null}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer recentlyViewedEnabled={s.recentlyViewedEnabled} />
      {s.backToTopEnabled ? <BackToTop /> : null}
      {s.exitIntentEnabled && exitIntentText ? (
        <ExitIntentPopup text={exitIntentText} code={s.exitIntentCode} />
      ) : null}
    </>
  );
}
