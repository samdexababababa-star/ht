import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Logo } from "./Logo";
import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";
import { RecentlyViewedRow } from "./RecentlyViewedRow";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function Footer({
  recentlyViewedEnabled = false,
}: {
  recentlyViewedEnabled?: boolean;
}) {
  const [s, t, tc] = await Promise.all([
    getSettings(),
    getTranslations("footer"),
    getTranslations("common"),
  ]);
  const year = new Date().getFullYear();
  // Translate tagline when admin hasn't overridden the schema default.
  const tagline =
    s.tagline === SETTING_DEFAULTS.tagline ? tc("tagline") : s.tagline;
  return (
    <footer className="mt-24">
      {recentlyViewedEnabled ? <RecentlyViewedRow /> : null}
      <div className="border-t border-border max-w-6xl mx-auto px-5 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 text-sm text-muted max-w-sm">{tagline}</p>
          <p className="mt-6 text-xs text-muted">
            © {year} {s.brandName}. {t("rights")}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-foreground font-medium mb-3">{t("shop")}</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/catalog" className="hover:text-foreground">{t("allProducts")}</Link></li>
            <li><Link href="/cart" className="hover:text-foreground">{t("shop")}</Link></li>
            <li><Link href="/affiliate" className="hover:text-foreground">{t("affiliate")}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-foreground font-medium mb-3">{t("support")}</p>
          <ul className="space-y-2 text-muted">
            {s.warrantyEnabled ? (
              <li><Link href="/warranty" className="hover:text-foreground">{t("warrantyClaims")}</Link></li>
            ) : null}
            <li>{t("instantDelivery")}</li>
            <li>{t("humanSupport")}</li>
          </ul>
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wider text-muted mb-2">{t("language")}</p>
            <LanguageSwitcher variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
