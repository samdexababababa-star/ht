import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type Search = { ref?: string };

export default async function ClaimSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const [{ ref }, t] = await Promise.all([
    searchParams,
    getTranslations("warranty.success"),
  ]);
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{t("eyebrow")}</p>
      <h1 className="mt-2 text-4xl tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-muted">
        {t("reference")}: <span className="font-mono">{ref ?? "—"}</span>
      </p>
      <p className="mt-6 text-sm text-muted">{t("body")}</p>
      <div className="mt-8">
        <Link href="/" className="btn btn-primary">{t("home")}</Link>
      </div>
    </div>
  );
}
