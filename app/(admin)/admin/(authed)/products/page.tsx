import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-3xl tracking-tight">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">+ New product</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-2 text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Visible</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Variants</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted-2/50">
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  {p.featured ? <span className="chip chip-blue ml-2">Featured</span> : null}
                </td>
                <td className="p-3">{p.category?.name ?? "—"}</td>
                <td className="p-3">{p.visible ? "Yes" : "No"}</td>
                <td className="p-3 text-right">{formatPrice(p.basePrice, p.currency)}</td>
                <td className="p-3 text-right">{p.variants.length}</td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted">No products yet — create your first.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
