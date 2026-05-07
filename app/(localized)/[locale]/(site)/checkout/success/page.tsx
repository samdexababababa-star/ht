import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { LogoMark } from "@/components/site/LogoMark";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const sp = await searchParams;
  const orderNumber = sp.order;
  const [order, settings, t] = await Promise.all([
    orderNumber
      ? prisma.order.findUnique({ where: { number: orderNumber }, include: { items: true } })
      : Promise.resolve(null),
    getSettings(),
    getTranslations("checkout.success"),
  ]);

  const showWhatsApp =
    settings.waEnabled &&
    settings.waNumber &&
    (settings.waRedirectMode === "after" || settings.waRedirectMode === "both");
  const waLink = showWhatsApp
    ? await buildWhatsAppLink({
        productName: order?.items[0]?.name,
        variantName: order?.items[0]?.variantName ?? undefined,
        order: order ?? undefined,
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-20 pb-24 text-center">
      <div className="text-primary mx-auto mb-6">
        <LogoMark className="salma-loop w-16 h-16 mx-auto" />
      </div>
      <h1 className="text-4xl md:text-5xl tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-muted">
        {order ? t("body", { order: `#${order.number}` }) : t("body", { order: "" })}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {waLink ? (
          <a href={waLink} className="btn btn-blue" target="_blank" rel="noreferrer">
            {t("whatsapp")} →
          </a>
        ) : null}
        <Link href="/catalog" className="btn btn-outline">
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
