import { getSettings } from "@/lib/settings";
import { GrowthDashboard } from "@/components/admin/GrowthDashboard";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const settings = await getSettings();
  return <GrowthDashboard initial={settings} />;
}
