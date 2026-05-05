import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-3xl tracking-tight">New <span className="serif-italic text-primary">product</span></h1>
      <div className="mt-6">
        <ProductForm
          initial={{
            name: "",
            currency: "USD",
            kind: "subscription",
            basePrice: 0,
            visible: true,
            featured: false,
            scarcityEnabled: false,
            variants: [{ name: "1 month", price: 0 }],
            gallery: "[]",
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
