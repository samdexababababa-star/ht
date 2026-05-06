import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "open", "reviewing", "resolved", "rejected"] as const;
type S = (typeof STATUSES)[number];

const labels: Record<string, string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  rejected: "Rejected",
};

const reasonLabels: Record<string, string> = {
  not_delivered: "Not delivered",
  wrong_item: "Wrong item",
  not_working: "Doesn't work",
  quality_issue: "Quality issue",
  other: "Other",
};

export default async function ClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as S)
    : "all";
  const claims = await prisma.claim.findMany({
    where: status === "all" ? {} : { status },
    include: { order: { select: { number: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const counts = await prisma.claim.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;

  return (
    <div>
      <h1 className="text-3xl tracking-tight">Warranty claims</h1>
      <p className="mt-1 text-sm text-muted">
        Customers&apos; warranty/refund requests with photos and message.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const active = status === s;
          const n = s === "all" ? claims.length : countMap[s] ?? 0;
          return (
            <Link
              key={s}
              href={s === "all" ? "/admin/claims" : `/admin/claims?status=${s}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border text-muted hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : labels[s]} <span className="opacity-70">({n})</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-muted bg-muted-2">
            <tr>
              <th className="text-left p-3">Ref</th>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Reason</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Filed</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-mono">
                  <Link href={`/admin/claims/${c.id}`} className="hover:underline">
                    {c.number}
                  </Link>
                </td>
                <td className="p-3">{c.order?.number ?? "—"}</td>
                <td className="p-3">{c.customerEmail}</td>
                <td className="p-3">{reasonLabels[c.reason] ?? c.reason}</td>
                <td className="p-3">
                  <span className="chip">{labels[c.status] ?? c.status}</span>
                </td>
                <td className="p-3">{c.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {claims.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">
                  No claims yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
