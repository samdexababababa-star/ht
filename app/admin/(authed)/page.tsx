import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [s, productCount, orderCount, paidOrders, recentOrders] = await Promise.all([
    getSettings(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({ where: { status: "paid" }, select: { total: true, currency: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const revenue = paidOrders.reduce((a, o) => a + o.total, 0);
  const currency = paidOrders[0]?.currency ?? s.defaultCurrency;

  return (
    <div>
      <h1 className="text-3xl tracking-tight">
        Welcome <span className="serif-italic text-primary">back</span>
      </h1>

      {!s.paymentsEnabled || !s.lsApiKey ? (
        <div className="mt-6 card p-5 bg-primary-soft border-primary/20">
          <p className="text-sm">
            <strong>Payments are not configured yet.</strong> Add your LemonSqueezy
            API key in <Link className="underline" href="/admin/settings">Settings</Link> to start
            accepting cards.
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Products</p>
          <p className="mt-2 text-3xl tracking-tight">{productCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Orders</p>
          <p className="mt-2 text-3xl tracking-tight">{orderCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Revenue (paid)</p>
          <p className="mt-2 text-3xl tracking-tight">{formatPrice(revenue, currency)}</p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl tracking-tight">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-muted bg-muted-2">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3 font-medium">
                    <Link className="hover:underline" href={`/admin/orders/${o.id}`}>{o.number}</Link>
                  </td>
                  <td className="p-3">{o.email ?? "—"}</td>
                  <td className="p-3">
                    <span className="chip">{o.status}</span>
                  </td>
                  <td className="p-3 text-right">{formatPrice(o.total, o.currency)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted">No orders yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 card p-6">
        <h3 className="text-lg tracking-tight">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/products/new" className="btn btn-primary">Add a product</Link>
          <Link href="/admin/categories" className="btn btn-outline">Manage categories</Link>
          <Link href="/admin/promotions" className="btn btn-outline">Create a promotion</Link>
          <Link href="/admin/payment-link" className="btn btn-outline">Generate payment link</Link>
          <Link href="/admin/settings" className="btn btn-outline">Settings</Link>
        </div>
      </section>
    </div>
  );
}
