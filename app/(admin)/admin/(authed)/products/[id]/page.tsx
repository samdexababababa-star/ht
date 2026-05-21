import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, s, otherProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getSettings(),
    prisma.product.findMany({
      where: { visible: true, id: { not: id } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-3xl tracking-tight">
        Edit <span className="serif-italic text-primary">{product.name}</span>
      </h1>
      <div className="mt-6">
        <ProductForm
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            tagline: product.tagline,
            description: product.description,
            longDescription: product.longDescription,
            basePrice: product.basePrice,
            currency: product.currency,
            compareAtPrice: product.compareAtPrice,
            thumbnail: product.thumbnail,
            gallery: product.gallery,
            kind: product.kind,
            durationDays: product.durationDays,
            visible: product.visible,
            featured: product.featured,
            badge: product.badge,
            deliveryMode: product.deliveryMode,
            deliveryNotes: product.deliveryNotes,
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
            categoryId: product.categoryId,
            scarcityEnabled: product.scarcityEnabled,
            scarcityText: product.scarcityText,
            scarcityCount: product.scarcityCount,
            urgencyEndsAt: product.urgencyEndsAt
              ? new Date(product.urgencyEndsAt).toISOString().slice(0, 16)
              : null,
            warrantyDays: product.warrantyDays,
            allowQuantity: product.allowQuantity,
            negotiable: product.negotiable,
            minOfferPrice: product.minOfferPrice,
            // phase 8 — growth boosters
            socialProofEnabled: product.socialProofEnabled,
            socialProofText: product.socialProofText,
            trustBadgeText: product.trustBadgeText,
            bestSellerBadge: product.bestSellerBadge,
            newBadge: product.newBadge,
            highlightSavings: product.highlightSavings,
            bundleProductId: product.bundleProductId,
            variants: product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              durationDays: v.durationDays,
              stock: v.stock,
              lsVariantId: v.lsVariantId,
            })),
          }}
          categories={categories}
          otherProducts={otherProducts}
          siteFlags={{
            bundlesEnabled: s.bundlesEnabled,
            socialProofGlobalEnabled: s.socialProofGlobalEnabled,
          }}
        />
      </div>
    </div>
  );
}
