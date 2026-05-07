import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { OrderDetail } from "@/components/admin/OrderDetail";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();
  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">← Back</Link>
      <h1 className="mt-2 text-3xl tracking-tight">Order #{order.number}</h1>
      <div className="mt-6">
        <OrderDetail order={order} />
      </div>
    </div>
  );
}
