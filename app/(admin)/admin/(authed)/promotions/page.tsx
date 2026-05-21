import { prisma } from "@/lib/db";
import { PromotionsManager } from "@/components/admin/PromotionsManager";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const promos = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-3xl tracking-tight">Promotions</h1>
      <p className="mt-2 text-sm text-muted max-w-xl">
        Use codes for personal offers, or leave the code blank for a banner-only
        promotion that displays subtly on product cards.
      </p>
      <div className="mt-6">
        <PromotionsManager
          initial={promos.map((p) => ({
            ...p,
            startsAt: p.startsAt ? p.startsAt.toISOString() : null,
            endsAt: p.endsAt ? p.endsAt.toISOString() : null,
          }))}
        />
      </div>
    </div>
  );
}
