import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetail } from "@/components/site/ProductDetail";
import { ProductCard } from "@/components/site/ProductCard";

export const revalidate = 30;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: { order: "asc" } },
      category: true,
    },
  });
  if (!product || !product.visible) notFound();

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
      <ProductDetail product={product} />

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
