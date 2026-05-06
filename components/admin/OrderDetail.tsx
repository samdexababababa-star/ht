"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; variantName: string | null; quantity: number; unitPrice: number; total: number };
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
  const [items, setItems] = useState<Item[]>(order.items);

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

  function setQty(itemId: string, q: number) {
    if (q < 1) return;
    setItems((arr) =>
      arr.map((i) =>
        i.id === itemId ? { ...i, quantity: q, total: i.unitPrice * q } : i,
      ),
    );
    start(async () => {
      const r = await fetch(`/api/admin/orders/${order.id}/items/${itemId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity: q }),
      });
      if (r.ok) router.refresh();
    });
  }

  const subtotal = items.reduce((a, i) => a + i.total, 0);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card p-6">
        <h2 className="text-lg tracking-tight">Items</h2>
        <table className="w-full mt-4 text-sm">
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-border align-top">
                <td className="py-3">
                  {it.name}
                  {it.variantName ? <span className="text-muted"> — {it.variantName}</span> : null}
                </td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQty(it.id, it.quantity - 1)}
                      disabled={pending || it.quantity <= 1}
                      className="h-7 w-7 rounded-lg border border-border text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        setQty(it.id, Math.max(1, Number(e.target.value || "1")))
                      }
                      className="w-12 h-7 text-center rounded-lg border border-border text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setQty(it.id, it.quantity + 1)}
                      disabled={pending}
                      className="h-7 w-7 rounded-lg border border-border text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-3 text-right">
                  {(it.total / 100).toFixed(2)} {order.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{(subtotal / 100).toFixed(2)} {order.currency}</span>
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
