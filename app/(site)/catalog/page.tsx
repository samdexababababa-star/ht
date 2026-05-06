import { ProductCard } from "@/components/site/ProductCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { Reveal } from "@/components/site/Reveal";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 30;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const cat = sp.category?.trim() ?? "";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { visible: true, parentId: null },
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany({
      where: {
        visible: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { tagline: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
        ...(cat ? { category: { slug: cat } } : {}),
      },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-5 pt-12 pb-20">
      <SectionTitle eyebrow="Catalog" title="Everything we" italicTail="offer" />

      <form className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search…"
          className="flex-1 h-11 rounded-full border border-border px-5 text-sm focus:outline-none focus:border-foreground"
        />
        {cat ? <input type="hidden" name="category" value={cat} /> : null}
        <button className="btn btn-primary">Search</button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/catalog"
          className={`chip ${!cat ? "chip-blue" : ""}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/catalog?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`chip ${cat === c.slug ? "chip-blue" : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.05, 0.4)}>
            <ProductCard p={p} />
          </Reveal>
        ))}
        {products.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <p className="text-2xl tracking-tight">
              Nothing here <span className="serif-italic text-primary">yet</span>.
            </p>
            <p className="mt-2 text-sm text-muted">
              Try a different search or browse a category.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
