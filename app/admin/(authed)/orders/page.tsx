import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div>
      <h1 className="text-3xl tracking-tight">Orders</h1>
      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-2 text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="text-left p-3">Number</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Source</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.number}</Link>
                </td>
                <td className="p-3">{o.email ?? "—"}</td>
                <td className="p-3"><span className="chip">{o.source ?? "site"}</span></td>
                <td className="p-3"><span className="chip">{o.status}</span></td>
                <td className="p-3 text-right">{formatPrice(o.total, o.currency)}</td>
                <td className="p-3 text-right text-muted">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted">No orders yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
