import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionTitle } from "@/components/site/SectionTitle";

export const revalidate = 30;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { visible: true },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!cat || !cat.visible) notFound();

  return (
    <div className="max-w-6xl mx-auto px-5 pt-12 pb-20">
      <SectionTitle eyebrow="Category" title={cat.name} italicTail="collection" />
      {cat.description ? (
        <p className="mt-4 text-muted max-w-2xl">{cat.description}</p>
      ) : null}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {cat.products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
        {cat.products.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-muted">
            No products yet in this category.
          </div>
        ) : null}
      </div>
    </div>
  );
}
