"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; variantName: string | null; quantity: number; total: number };
type Order = {
  id: string;
  number: string;
  status: string;
  email: string | null;
  name: string | null;
  whatsapp: string | null;
  notes: string | null;
  total: number;
  currency: string;
  paymentUrl: string | null;
  items: Item[];
};

export function OrderDetail({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [pending, start] = useTransition();
  function update(s: string) {
    setStatus(s);
    start(async () => {
      await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      router.refresh();
    });
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card p-6">
        <h2 className="text-lg tracking-tight">Items</h2>
        <table className="w-full mt-4 text-sm">
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="py-3">
                  {it.name}
                  {it.variantName ? <span className="text-muted"> — {it.variantName}</span> : null}
                </td>
                <td className="py-3 text-right">×{it.quantity}</td>
                <td className="py-3 text-right">
                  {(it.total / 100).toFixed(2)} {order.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{(order.total / 100).toFixed(2)} {order.currency}</span>
        </div>
        {order.paymentUrl ? (
          <p className="mt-4 text-sm">
            Payment link:{" "}
            <a href={order.paymentUrl} target="_blank" className="text-primary underline">
              {order.paymentUrl}
            </a>
          </p>
        ) : null}
      </div>

      <aside className="card p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Status</p>
          <select
            value={status}
            disabled={pending}
            onChange={(e) => update(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Customer</p>
          <p className="text-sm">{order.email ?? "—"}</p>
          {order.name ? <p className="text-sm">{order.name}</p> : null}
          {order.whatsapp ? <p className="text-sm">WA: {order.whatsapp}</p> : null}
        </div>
        {order.notes ? (
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Notes</p>
            <p className="text-sm whitespace-pre-line">{order.notes}</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
