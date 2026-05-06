import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, s, otherProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getSettings(),
    prisma.product.findMany({
      where: { visible: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <div>
      <h1 className="text-3xl tracking-tight">
        New <span className="serif-italic text-primary">product</span>
      </h1>
      <div className="mt-6">
        <ProductForm
          initial={{
            name: "",
            currency: s.defaultCurrency,
            kind: "subscription",
            basePrice: 0,
            visible: true,
            featured: false,
            scarcityEnabled: false,
            allowQuantity: s.allowQuantityByDefault,
            negotiable: false,
            warrantyDays: null,
            socialProofEnabled: false,
            bestSellerBadge: false,
            newBadge: false,
            highlightSavings: false,
            variants: [{ name: "1 month", price: 0 }],
            gallery: "[]",
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
