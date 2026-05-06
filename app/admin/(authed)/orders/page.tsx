import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = { view?: string; status?: string };

const STATUSES = ["all", "pending", "paid", "fulfilled", "refunded", "cancelled"] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const settings = await getSettings();
  const view = sp.view === "grouped" ? "grouped" : "list";
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "")
    ? sp.status
    : "all";

  const where = status && status !== "all" ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Orders</h1>
          <p className="text-sm text-muted mt-1">
            {orders.length} order{orders.length === 1 ? "" : "s"}
            {status !== "all" ? ` · ${status}` : ""}
          </p>
        </div>
        {settings.orderGroupingEnabled ? (
          <div className="inline-flex rounded-full border border-border bg-white p-1 text-xs">
            <Link
              href={`/admin/orders${status !== "all" ? `?status=${status}` : ""}`}
              className={`px-3 py-1 rounded-full transition ${
                view === "list" ? "bg-foreground text-white" : "text-muted hover:text-foreground"
              }`}
            >
              List view
            </Link>
            <Link
              href={`/admin/orders?view=grouped${status !== "all" ? `&status=${status}` : ""}`}
              className={`px-3 py-1 rounded-full transition ${
                view === "grouped" ? "bg-foreground text-white" : "text-muted hover:text-foreground"
              }`}
            >
              Grouped by product
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
        {STATUSES.map((s) => {
          const active = (status ?? "all") === s;
          return (
            <Link
              key={s}
              href={s === "all"
                ? `/admin/orders${view === "grouped" ? "?view=grouped" : ""}`
                : `/admin/orders?status=${s}${view === "grouped" ? "&view=grouped" : ""}`}
              className={`px-2.5 py-1 rounded-full border transition ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border text-muted hover:text-foreground"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      {view === "grouped" && settings.orderGroupingEnabled
        ? <GroupedView orders={orders} />
        : <ListView orders={orders} />}
    </div>
  );
}

type OrderWithItems = Awaited<ReturnType<typeof prisma.order.findMany>>[number] & {
  items: Awaited<ReturnType<typeof prisma.orderItem.findMany>>;
};

function ListView({ orders }: { orders: OrderWithItems[] }) {
  return (
    <div className="mt-6 card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted-2 text-xs uppercase tracking-[0.16em] text-muted">
          <tr>
            <th className="text-left p-3">Number</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Items</th>
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
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                  {o.number}
                </Link>
              </td>
              <td className="p-3">{o.email ?? "—"}</td>
              <td className="p-3 text-muted">
                {o.items.length} item{o.items.length === 1 ? "" : "s"}
                {o.items[0]
                  ? ` · ${o.items[0].name}${o.items.length > 1 ? "…" : ""}`
                  : ""}
              </td>
              <td className="p-3">
                <span className="chip">{o.source ?? "site"}</span>
              </td>
              <td className="p-3">
                <span className="chip">{o.status}</span>
              </td>
              <td className="p-3 text-right">{formatPrice(o.total, o.currency)}</td>
              <td className="p-3 text-right text-muted">
                {new Date(o.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-muted">
                No orders match this filter.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

type Group = {
  key: string;
  productName: string;
  variantName: string | null;
  productId: string | null;
  totalQuantity: number;
  totalRevenue: number;
  currency: string;
  orderCount: number;
  pendingCount: number;
  paidCount: number;
  orders: { id: string; number: string; email: string | null; status: string; createdAt: Date; quantity: number }[];
};

function GroupedView({ orders }: { orders: OrderWithItems[] }) {
  const groups = new Map<string, Group>();
  for (const o of orders) {
    for (const it of o.items) {
      const key = `${it.productId ?? "_"}|${it.variantId ?? "_"}|${it.name}`;
      const g = groups.get(key) ?? {
        key,
        productName: it.name,
        variantName: it.variantName,
        productId: it.productId,
        totalQuantity: 0,
        totalRevenue: 0,
        currency: o.currency,
        orderCount: 0,
        pendingCount: 0,
        paidCount: 0,
        orders: [] as Group["orders"],
      };
      g.totalQuantity += it.quantity;
      g.totalRevenue += it.total;
      g.orderCount += 1;
      if (o.status === "pending") g.pendingCount += 1;
      if (o.status === "paid" || o.status === "fulfilled") g.paidCount += 1;
      g.orders.push({
        id: o.id,
        number: o.number,
        email: o.email,
        status: o.status,
        createdAt: o.createdAt,
        quantity: it.quantity,
      });
      groups.set(key, g);
    }
  }
  const groupList = [...groups.values()].sort(
    (a, b) => b.totalQuantity - a.totalQuantity,
  );

  return (
    <div className="mt-6 space-y-3">
      {groupList.length === 0 ? (
        <p className="card p-6 text-center text-muted text-sm">
          No orders match this filter.
        </p>
      ) : null}
      {groupList.map((g) => (
        <details
          key={g.key}
          className="card p-4 group"
        >
          <summary className="cursor-pointer list-none flex flex-wrap items-baseline gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium tracking-tight truncate">
                {g.productName}
                {g.variantName ? (
                  <span className="text-muted"> — {g.variantName}</span>
                ) : null}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {g.orderCount} order{g.orderCount === 1 ? "" : "s"}
                {" · "}
                <span className="text-primary font-medium">
                  ×{g.totalQuantity} sold
                </span>
                {g.pendingCount > 0 ? ` · ${g.pendingCount} pending` : ""}
                {" · "}
                {formatPrice(g.totalRevenue, g.currency)} revenue
              </p>
            </div>
            <span className="text-xs text-muted opacity-0 group-open:opacity-100">
              ▾
            </span>
          </summary>
          <div className="mt-3 border-t border-border pt-3 space-y-1.5">
            {g.orders.map((o) => (
              <Link
                key={o.id + o.number}
                href={`/admin/orders/${o.id}`}
                className="flex items-baseline gap-3 text-sm rounded-lg px-2 py-1 hover:bg-muted-2"
              >
                <span className="font-mono text-xs">{o.number}</span>
                <span className="text-muted text-xs flex-1 truncate">{o.email ?? "no email"}</span>
                <span className="text-xs text-muted">×{o.quantity}</span>
                <span className="chip text-xs">{o.status}</span>
                <span className="text-xs text-muted">
                  {new Date(o.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
