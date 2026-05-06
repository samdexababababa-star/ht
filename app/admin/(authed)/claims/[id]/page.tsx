import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ClaimDetail } from "@/components/admin/ClaimDetail";
import { safeJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { order: { include: { items: true } } },
  });
  if (!claim) notFound();

  const photos = safeJson<string[]>(claim.photos, []);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/claims"
        className="text-sm text-muted hover:text-foreground"
      >
        ← All claims
      </Link>
      <ClaimDetail
        claim={{
          id: claim.id,
          number: claim.number,
          status: claim.status,
          reason: claim.reason,
          message: claim.message,
          adminNote: claim.adminNote,
          customerEmail: claim.customerEmail,
          customerName: claim.customerName,
          customerPhone: claim.customerPhone,
          createdAt: claim.createdAt.toISOString(),
          orderNumber: claim.order?.number ?? null,
          photos,
        }}
      />
    </div>
  );
}
