import Link from "next/link";
import { Logo } from "./Logo";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { ShoppingBag, Search } from "lucide-react";
import { CartIndicator } from "./CartIndicator";

export async function Header() {
  const [s, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      where: { visible: true, parentId: null },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-border">
      {s.announcementBar ? (
        <div className="bg-foreground text-white text-[12px] tracking-wide text-center py-2 px-4">
          {s.announcementBar}
        </div>
      ) : null}
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-muted">
          <Link href="/catalog" className="hover:text-foreground">Catalog</Link>
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
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/catalog"
            aria-label="Search"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2"
          >
            <Search size={16} />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2 relative"
          >
            <ShoppingBag size={16} />
            <CartIndicator />
          </Link>
        </div>
      </div>
    </header>
  );
}
