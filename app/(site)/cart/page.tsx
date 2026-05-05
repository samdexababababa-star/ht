import { getCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { CartView } from "@/components/site/CartView";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);

  const productIds = [...new Set(cart.map((c) => c.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  const lines = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.productId);
      if (!p) return null;
      const v = c.variantId ? p.variants.find((x) => x.id === c.variantId) : undefined;
      const unitPrice = v?.price ?? p.basePrice;
      return {
        productId: p.id,
        variantId: v?.id,
        variantName: v?.name,
        quantity: c.quantity,
        unitPrice,
        lineTotal: unitPrice * c.quantity,
        product: {
          name: p.name,
          slug: p.slug,
          thumbnail: p.thumbnail,
          currency: p.currency,
        },
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  const currency = lines[0]?.product.currency ?? settings.defaultCurrency;

  return (
    <div className="max-w-6xl mx-auto px-5 pt-12 pb-20">
      <h1 className="text-4xl md:text-5xl tracking-tight">
        Your <span className="serif-italic text-primary">cart</span>
      </h1>
      <div className="mt-8">
        <CartView lines={lines} subtotal={subtotal} currency={currency} />
      </div>
    </div>
  );
}
