import Link from "next/link";
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
  const [order, settings] = await Promise.all([
    orderNumber
      ? prisma.order.findUnique({ where: { number: orderNumber }, include: { items: true } })
      : Promise.resolve(null),
    getSettings(),
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
      <h1 className="text-4xl md:text-5xl tracking-tight">
        Thank <span className="serif-italic text-primary">you</span>
      </h1>
      <p className="mt-3 text-muted">
        Your order {order ? <span className="font-semibold">#{order.number}</span> : null} has been placed.
        We&apos;ll deliver it shortly — and pop into your inbox if we need anything.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {waLink ? (
          <Link href={waLink} className="btn btn-blue" target="_blank">
            Continue on WhatsApp →
          </Link>
        ) : null}
        <Link href="/catalog" className="btn btn-outline">
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
