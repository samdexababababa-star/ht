import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/settings";
import { LogoMark } from "./LogoMark";

export async function Logo({ className = "" }: { className?: string }) {
  const s = await getSettings();
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 text-foreground ${className}`}
    >
      {s.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.logoUrl} alt={s.brandName} className="h-6 w-6 object-contain" />
      ) : (
        <LogoMark className="h-5 w-5" />
      )}
      <span className="text-[15px] font-semibold tracking-tight">{s.brandName}</span>
    </Link>
  );
}

export { LogoMark };
