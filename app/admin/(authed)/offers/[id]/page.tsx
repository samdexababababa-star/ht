import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OfferDetail } from "@/components/admin/OfferDetail";

export const dynamic = "force-dynamic";

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!offer) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/offers"
        className="text-sm text-muted hover:text-foreground"
      >
        ← All offers
      </Link>
      <OfferDetail
        offer={{
          id: offer.id,
          number: offer.number,
          status: offer.status,
          proposedPrice: offer.proposedPrice,
          counterPrice: offer.counterPrice,
          adminNote: offer.adminNote,
          customerEmail: offer.customerEmail,
          customerName: offer.customerName,
          message: offer.message,
          createdAt: offer.createdAt.toISOString(),
          productName: offer.product?.name ?? null,
          productCurrency: offer.product?.currency ?? "USD",
          productPrice: offer.product?.basePrice ?? 0,
        }}
      />
    </div>
  );
}
