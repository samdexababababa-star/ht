import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Logo } from "./Logo";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { ShoppingBag, Search } from "lucide-react";
import { CartIndicator } from "./CartIndicator";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { auth, signOut } from "@/auth";

async function signOutFromHeader() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function Header() {
  const [s, categories, t, session] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      where: { visible: true, parentId: null },
      orderBy: { order: "asc" },
      take: 6,
    }),
    getTranslations("nav"),
    auth(),
  ]);

  const u = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-border">
      {s.announcementBar ? (
        <div className="bg-foreground text-white text-[11px] md:text-[12px] tracking-wide text-center py-2 px-4 truncate">
          {s.announcementBar}
        </div>
      ) : null}
      <div className="max-w-6xl mx-auto px-4 md:px-5 h-14 flex items-center gap-3 md:gap-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-muted">
          <Link href="/catalog" className="hover:text-foreground">{t("catalog")}</Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <LanguageSwitcher variant="header" />
          <Link
            href="/catalog"
            aria-label={t("search")}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2"
          >
            <Search size={16} />
          </Link>
          <Link
            href="/cart"
            aria-label={t("cart")}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2 relative"
          >
            <ShoppingBag size={16} />
            <CartIndicator />
          </Link>
          <UserMenu user={u} signOutAction={signOutFromHeader} />
          <MobileMenu
            brand={s.brandName}
            categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))}
            user={u}
          />
        </div>
      </div>
    </header>
  );
}
