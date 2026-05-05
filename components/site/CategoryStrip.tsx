import Link from "next/link";
import { prisma } from "@/lib/db";

export async function CategoryStrip() {
  const categories = await prisma.category.findMany({
    where: { visible: true, parentId: null },
    orderBy: { order: "asc" },
    take: 8,
  });
  if (categories.length === 0) return null;
  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl tracking-tight">
          Browse by <span className="serif-italic text-primary">category</span>
        </h2>
        <Link href="/catalog" className="text-sm text-muted hover:text-foreground">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="card p-5 flex items-center gap-3"
          >
            <span className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center text-lg">
              {c.icon || "✱"}
            </span>
            <div>
              <p className="font-medium leading-tight">{c.name}</p>
              {c.description ? (
                <p className="text-[12px] text-muted line-clamp-1">{c.description}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
