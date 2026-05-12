import { getSettings } from "@/lib/settings";
import { TelegramWizard } from "@/components/admin/wizards/TelegramWizard";

export const dynamic = "force-dynamic";

export default async function TelegramSetupPage() {
  const s = await getSettings();
  return (
    <TelegramWizard
      initial={{
        tgBotToken: s.tgBotToken,
        tgChatId: s.tgChatId,
        tgEnabled: s.tgEnabled,
      }}
    />
  );
}
