import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });
  return NextResponse.json({ ok: true, products });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ ok: false, message: "Name required" }, { status: 400 });

  const baseSlug = slugify(body.slug || name);
  let slug = baseSlug;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const created = await prisma.product.create({
    data: {
      name,
      slug,
      tagline: body.tagline || null,
      description: body.description || "",
      longDescription: body.longDescription || "",
      basePrice: Number(body.basePrice ?? 0),
      currency: body.currency || "USD",
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
      thumbnail: body.thumbnail || null,
      gallery: typeof body.gallery === "string" ? body.gallery : JSON.stringify(body.gallery ?? []),
      kind: body.kind || "subscription",
      durationDays: body.durationDays ? Number(body.durationDays) : null,
      visible: body.visible ?? true,
      featured: body.featured ?? false,
      badge: body.badge || null,
      deliveryMode: body.deliveryMode || "manual",
      deliveryNotes: body.deliveryNotes || "",
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      categoryId: body.categoryId || null,
      scarcityEnabled: body.scarcityEnabled ?? false,
      scarcityText: body.scarcityText || null,
      scarcityCount: body.scarcityCount ? Number(body.scarcityCount) : null,
      urgencyEndsAt: body.urgencyEndsAt ? new Date(body.urgencyEndsAt) : null,
      warrantyDays:
        body.warrantyDays === null || body.warrantyDays === undefined
          ? null
          : Number(body.warrantyDays),
      allowQuantity: body.allowQuantity ?? true,
      negotiable: body.negotiable ?? false,
      minOfferPrice:
        body.minOfferPrice === null || body.minOfferPrice === undefined
          ? null
          : Number(body.minOfferPrice),
      order: Number(body.order ?? 0),
      variants: Array.isArray(body.variants) && body.variants.length > 0
        ? {
            create: body.variants.map((v: Record<string, unknown>) => ({
              name: String(v.name ?? "Variant"),
              price: Number(v.price ?? 0),
              compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              durationDays: v.durationDays ? Number(v.durationDays) : null,
              stock: v.stock != null ? Number(v.stock) : null,
              lsVariantId: (v.lsVariantId as string) || null,
              order: Number(v.order ?? 0),
            })),
          }
        : undefined,
    },
  });
  return NextResponse.json({ ok: true, product: created });
}
