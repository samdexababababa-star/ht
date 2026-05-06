import { getSettings } from "@/lib/settings";
import { WhatsAppWizard } from "@/components/admin/wizards/WhatsAppWizard";

export const dynamic = "force-dynamic";

export default async function WhatsAppSetupPage() {
  const s = await getSettings();
  return (
    <WhatsAppWizard
      initial={{
        waNumber: s.waNumber,
        waEnabled: s.waEnabled,
        waRedirectMode: s.waRedirectMode,
        waPrefilledMessage: s.waPrefilledMessage,
      }}
    />
  );
}
