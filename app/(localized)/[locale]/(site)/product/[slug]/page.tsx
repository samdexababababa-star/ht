import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ProductDetail } from "@/components/site/ProductDetail";
import { ProductCard } from "@/components/site/ProductCard";
import { RecentlyViewedTracker } from "@/components/site/RecentlyViewedTracker";

export const revalidate = 30;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        variants: { orderBy: { order: "asc" } },
        category: true,
      },
    }),
    getSettings(),
  ]);
  if (!product || !product.visible) notFound();

  // Fetch bundle partner product if one is configured AND the master toggle is
  // on. Avoid the extra query when bundles are off site-wide.
  const bundle =
    settings.bundlesEnabled && product.bundleProductId
      ? await prisma.product.findUnique({
          where: { id: product.bundleProductId },
          select: {
            id: true,
            slug: true,
            name: true,
            basePrice: true,
            currency: true,
            thumbnail: true,
            visible: true,
          },
        })
      : null;

  const related = await prisma.product.findMany({
    where: {
      visible: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-20">
      <RecentlyViewedTracker
        enabled={settings.recentlyViewedEnabled}
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          basePrice: product.basePrice,
          currency: product.currency,
          thumbnail: product.thumbnail,
        }}
      />
      <ProductDetail
        product={product}
        settings={{
          negotiableEnabled: settings.negotiableEnabled,
          trustBadgesEnabled: settings.trustBadgesEnabled,
          liveVisitorCountEnabled: settings.liveVisitorCountEnabled,
          socialProofGlobalEnabled: settings.socialProofGlobalEnabled,
          bundlesEnabled: settings.bundlesEnabled,
        }}
        bundle={bundle && bundle.visible ? bundle : null}
      />

      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="text-2xl tracking-tight mb-6">
            You might also <span className="serif-italic text-primary">like</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
