import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "open", "accepted", "rejected", "counter", "expired"] as const;
type S = (typeof STATUSES)[number];

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as S)
    : "all";

  const offers = await prisma.offer.findMany({
    where: status === "all" ? {} : { status },
    include: { product: { select: { name: true, currency: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const counts = await prisma.offer.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;

  return (
    <div>
      <h1 className="text-3xl tracking-tight">Offers</h1>
      <p className="mt-1 text-sm text-muted">
        Customer price proposals on negotiable products.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const active = status === s;
          const n = s === "all" ? offers.length : countMap[s] ?? 0;
          return (
            <Link
              key={s}
              href={s === "all" ? "/admin/offers" : `/admin/offers?status=${s}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border text-muted hover:text-foreground"
              }`}
            >
              {s} <span className="opacity-70">({n})</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-muted bg-muted-2">
            <tr>
              <th className="text-left p-3">Ref</th>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-right p-3">Offered</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono">
                  <Link
                    href={`/admin/offers/${o.id}`}
                    className="hover:underline"
                  >
                    {o.number}
                  </Link>
                </td>
                <td className="p-3">{o.product?.name ?? "—"}</td>
                <td className="p-3">
                  {o.customerName ?? o.customerEmail}
                </td>
                <td className="p-3 text-right">
                  {formatPrice(o.proposedPrice, o.product?.currency ?? "USD")}
                </td>
                <td className="p-3">
                  <span className="chip">{o.status}</span>
                </td>
                <td className="p-3 text-muted">
                  {o.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {offers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">
                  No offers yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
