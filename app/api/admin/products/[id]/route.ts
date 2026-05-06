import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  // Pull variants out — we replace them wholesale to keep the UI simple.
  const { variants, ...rest } = body as { variants?: Record<string, unknown>[] } & Record<string, unknown>;

  const data: Record<string, unknown> = {};
  const passthrough = [
    "name", "slug", "tagline", "description", "longDescription", "currency",
    "thumbnail", "gallery", "kind", "deliveryMode", "deliveryNotes", "seoTitle",
    "seoDescription", "badge", "scarcityText", "categoryId",
    "socialProofText", "trustBadgeText",
  ];
  for (const k of passthrough) if (k in rest) data[k] = rest[k];
  // bundleProductId — empty string clears the relation
  if ("bundleProductId" in rest) {
    const v = rest.bundleProductId;
    data.bundleProductId = typeof v === "string" && v ? v : null;
  }
  for (const k of ["basePrice", "compareAtPrice", "durationDays", "scarcityCount", "order", "warrantyDays", "minOfferPrice"]) {
    if (k in rest && rest[k] !== "" && rest[k] != null)
      data[k] = Number(rest[k] as string | number);
    else if (k in rest && (rest[k] === "" || rest[k] == null))
      data[k] = null;
  }
  for (const k of [
    "visible", "featured", "scarcityEnabled", "allowQuantity", "negotiable",
    "socialProofEnabled", "bestSellerBadge", "newBadge", "highlightSavings",
  ]) {
    if (k in rest) data[k] = Boolean(rest[k]);
  }
  if ("urgencyEndsAt" in rest) {
    data.urgencyEndsAt = rest.urgencyEndsAt ? new Date(rest.urgencyEndsAt as string) : null;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({ where: { id }, data });
    if (Array.isArray(variants)) {
      await tx.variant.deleteMany({ where: { productId: id } });
      for (const v of variants) {
        await tx.variant.create({
          data: {
            productId: id,
            name: String(v.name ?? "Variant"),
            price: Number(v.price ?? 0),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            durationDays: v.durationDays ? Number(v.durationDays) : null,
            stock: v.stock != null && v.stock !== "" ? Number(v.stock) : null,
            lsVariantId: (v.lsVariantId as string) || null,
            order: Number(v.order ?? 0),
          },
        });
      }
    }
    return p;
  });
  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
