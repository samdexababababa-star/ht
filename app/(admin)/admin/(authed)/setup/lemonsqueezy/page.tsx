import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";
import { LemonSqueezyWizard } from "@/components/admin/wizards/LemonSqueezyWizard";

export const dynamic = "force-dynamic";

export default async function LemonSqueezySetupPage() {
  const s = await getSettings();
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host") || "localhost:3000";
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

  return (
    <LemonSqueezyWizard
      initial={{
        lsApiKey: s.lsApiKey,
        lsStoreId: s.lsStoreId,
        lsWebhookSecret: s.lsWebhookSecret,
        paymentsEnabled: s.paymentsEnabled,
      }}
      publicSiteUrl={publicSiteUrl}
    />
  );
}
