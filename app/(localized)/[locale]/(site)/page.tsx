import { Hero } from "@/components/site/Hero";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";
import { ensureBootstrapAdmin } from "@/lib/auth";

export const revalidate = 30;

export default async function HomePage() {
  // First-run convenience: bootstrap admin so the operator can log in immediately.
  await ensureBootstrapAdmin().catch(() => null);

  const [s, featured, recent, t] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { visible: true, featured: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { visible: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    getTranslations("home"),
  ]);

  // When the admin hasn't customized the hero copy, surface translated
  // strings instead of the schema's English defaults. Once the admin
  // overrides any field, that override wins across every locale.
  const heroTitle =
    s.heroTitle === SETTING_DEFAULTS.heroTitle
      ? t("hero.title")
      : s.heroTitle.replace(/\n/g, " ");
  const heroSubtitle =
    s.heroSubtitle === SETTING_DEFAULTS.heroSubtitle
      ? t("hero.subtitle")
      : s.heroSubtitle;
  const heroCtaLabel =
    s.heroCtaLabel === SETTING_DEFAULTS.heroCtaLabel
      ? t("hero.ctaLabel")
      : s.heroCtaLabel;

  return (
    <>
      <Hero
        eyebrow={t("heroEyebrow")}
        title={heroTitle}
        subtitle={heroSubtitle}
        ctaLabel={heroCtaLabel}
        ctaHref={s.heroCtaHref}
      />

      <Marquee
        items={[
          t("marquee.instantDelivery"),
          t("marquee.refund24"),
          t("marquee.humanSupport"),
          t("marquee.poweredByLS"),
          t("marquee.builtForMENA"),
          t("marquee.premiumQuality"),
        ]}
      />

      <CategoryStrip />

      <section id="featured" className="max-w-6xl mx-auto px-5 py-12">
        <Reveal>
          <SectionTitle
            eyebrow={t("featured.eyebrow")}
            title={t("featured.title")}
            italicTail={t("featured.italicTail")}
          />
        </Reveal>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {(featured.length > 0 ? featured : recent).slice(0, 6).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard p={p} />
            </Reveal>
          ))}
          {recent.length === 0 && featured.length === 0 ? (
            <EmptyState />
          ) : null}
        </div>
      </section>

      {/* Editorial split */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-10 items-end">
        <Reveal>
          <h3 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
            {t("editorial.title")}
          </h3>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-lg text-muted max-w-md">{t("editorial.body")}</p>
          <div className="mt-6 flex gap-3">
            <Link href="/catalog" className="btn btn-blue">{t("editorial.browseCta")}</Link>
            <Link href="/affiliate" className="btn btn-outline">{t("editorial.affiliateCta")}</Link>
          </div>
        </Reveal>
      </section>

      {recent.length > 6 ? (
        <section className="max-w-6xl mx-auto px-5 py-12">
          <Reveal>
            <SectionTitle
              eyebrow={t("fresh.eyebrow")}
              title={t("fresh.title")}
              italicTail={s.brandName}
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recent.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.04}>
                <ProductCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <SocialProof brand={s.brandName} />
    </>
  );
}

async function EmptyState() {
  const t = await getTranslations("home.empty");
  return (
    <div className="col-span-full card p-10 text-center">
      <p className="text-2xl tracking-tight">{t("title")}</p>
      <p className="mt-2 text-sm text-muted">
        {t("hint")}{" "}
        {/* /admin lives outside the localized route group; full reload is intentional. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin" className="underline">/admin</a>.
      </p>
    </div>
  );
}

async function SocialProof({ brand }: { brand: string }) {
  const t = await getTranslations("home.proof");
  return (
    <section className="max-w-6xl mx-auto px-5 pt-8 pb-20">
      <div className="card p-8 md:p-12 bg-blue-glow">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl tracking-tight">10k+</p>
            <p className="text-sm text-muted mt-1">{t("delivered")}</p>
          </div>
          <div>
            <p className="text-5xl tracking-tight">24h</p>
            <p className="text-sm text-muted mt-1">{t("refundWindow")}</p>
          </div>
          <div>
            <p className="text-5xl tracking-tight">4.9★</p>
            <p className="text-sm text-muted mt-1">{t("rating")}</p>
          </div>
        </div>
        <p className="text-center mt-8 text-muted text-sm">{t("trusted", { brand })}</p>
      </div>
    </section>
  );
}
