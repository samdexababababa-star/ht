import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="text-3xl tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-muted max-w-xl">
        Everything you can change without writing code: brand, payments, Telegram, WhatsApp.
      </p>
      <div className="mt-6">
        <SettingsForm initial={s} />
      </div>
    </div>
  );
}
