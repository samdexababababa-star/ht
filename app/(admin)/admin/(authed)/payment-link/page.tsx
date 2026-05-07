import { PaymentLinkForm } from "@/components/admin/PaymentLinkForm";
import { getSettings } from "@/lib/settings";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaymentLinkPage() {
  const s = await getSettings();
  const ready = s.lsApiKey && s.lsStoreId;
  return (
    <div>
      <h1 className="text-3xl tracking-tight">Payment links</h1>
      {!ready ? (
        <div className="mt-4 card p-4 bg-primary-soft border-primary/20 text-sm">
          Add your LemonSqueezy API key and Store ID in{" "}
          <Link href="/admin/settings" className="underline">Settings</Link> first.
        </div>
      ) : null}
      <div className="mt-6">
        <PaymentLinkForm />
      </div>
    </div>
  );
}
