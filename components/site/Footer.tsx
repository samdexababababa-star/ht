import Link from "next/link";
import { Logo } from "./Logo";
import { getSettings } from "@/lib/settings";
import { RecentlyViewedRow } from "./RecentlyViewedRow";

export async function Footer({
  recentlyViewedEnabled = false,
}: {
  recentlyViewedEnabled?: boolean;
}) {
  const s = await getSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24">
      {recentlyViewedEnabled ? <RecentlyViewedRow /> : null}
      <div className="border-t border-border max-w-6xl mx-auto px-5 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 text-sm text-muted max-w-sm">{s.tagline}</p>
          <p className="mt-6 text-xs text-muted">
            © {year} {s.brandName}. All rights reserved.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-foreground font-medium mb-3">Shop</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/catalog" className="hover:text-foreground">All products</Link></li>
            <li><Link href="/cart" className="hover:text-foreground">Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-foreground">Checkout</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-foreground font-medium mb-3">Support</p>
          <ul className="space-y-2 text-muted">
            {s.warrantyEnabled ? (
              <li><Link href="/warranty" className="hover:text-foreground">Warranty &amp; claims</Link></li>
            ) : null}
            <li>Instant or fast manual delivery</li>
            <li>Real human support</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
