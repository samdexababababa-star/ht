import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { ClaimWizard } from "@/components/site/ClaimWizard";

export const dynamic = "force-dynamic";

export default async function WarrantyPage() {
  const s = await getSettings();
  if (!s.warrantyEnabled) notFound();

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        Warranty &amp; claims
      </p>
      <h1 className="mt-2 text-4xl tracking-tight">
        Something <span className="serif-italic text-primary">off</span>?
      </h1>
      <p className="mt-3 text-muted max-w-xl">
        We back every order with a {s.warrantyDefaultDays}-day window.
        Tell us what happened — short message, a few photos if needed,
        we&apos;ll come back fast.
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
        Don&apos;t have your order number?{" "}
        <Link href="/" className="underline">
          Email us
        </Link>{" "}
        and we&apos;ll help.
      </p>
    </div>
  );
}
