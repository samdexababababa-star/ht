import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { ClaimWizard } from "@/components/site/ClaimWizard";

export const dynamic = "force-dynamic";

export default async function WarrantyPage() {
  const [s, t] = await Promise.all([getSettings(), getTranslations("warranty")]);
  if (!s.warrantyEnabled) notFound();

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{t("eyebrow")}</p>
      <h1 className="mt-2 text-4xl tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-muted max-w-xl">
        {t("intro", { days: s.warrantyDefaultDays })}
      </p>

      <div className="mt-8">
        <ClaimWizard
          requirePhoto={s.claimsRequirePhoto}
          allowMessage={s.claimsAllowMessage}
          maxPhotos={s.claimsMaxPhotos}
          warrantyDefaultDays={s.warrantyDefaultDays}
        />
      </div>

      <p className="mt-12 text-xs text-muted">
        {t.rich("noOrderNumber", {
          link: (chunks) => (
            <Link href="/" className="underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
