import { getCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 pt-16 pb-20 text-center">
        <h1 className="text-4xl tracking-tight">
          Your cart is <span className="serif-italic text-primary">empty</span>.
        </h1>
        <Link href="/catalog" className="btn btn-primary mt-6">Browse the catalog →</Link>
      </div>
    );
  }

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
        productName: p.name,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  const currency = products[0]?.currency ?? settings.defaultCurrency;

  return (
    <div className="max-w-6xl mx-auto px-5 pt-12 pb-20">
      <h1 className="text-4xl md:text-5xl tracking-tight">
        Final <span className="serif-italic text-primary">step</span>
      </h1>
      <p className="mt-2 text-muted">Just your email and we&apos;ll handle the rest.</p>
      <div className="mt-8">
        <CheckoutForm
          lines={lines}
          subtotal={subtotal}
          currency={currency}
          paymentsEnabled={settings.paymentsEnabled && !!settings.lsApiKey && !!settings.lsStoreId}
          whatsappEnabled={settings.waEnabled && !!settings.waNumber}
          whatsappBeforePayment={settings.waRedirectMode === "before" || settings.waRedirectMode === "both"}
        />
      </div>
    </div>
  );
}
