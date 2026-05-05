import { prisma } from "@/lib/db";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const cats = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return (
    <div>
      <h1 className="text-3xl tracking-tight">Categories</h1>
      <p className="mt-2 text-sm text-muted max-w-xl">
        Categories appear in the header and on the homepage strip. Add as many as you need.
      </p>
      <div className="mt-6">
        <CategoryManager initial={cats} />
      </div>
    </div>
  );
}
