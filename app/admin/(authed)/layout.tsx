import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, ensureBootstrapAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { LogoMark } from "@/components/site/LogoMark";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Percent,
  FileText,
  Settings as SettingsIcon,
  Link as LinkIcon,
  ShieldCheck,
  MessagesSquare,
} from "lucide-react";

export default async function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureBootstrapAdmin().catch(() => null);
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tag },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/claims", label: "Claims", icon: ShieldCheck },
    { href: "/admin/offers", label: "Offers", icon: MessagesSquare },
    { href: "/admin/promotions", label: "Promotions", icon: Percent },
    { href: "/admin/pages", label: "Pages", icon: FileText },
    { href: "/admin/payment-link", label: "Payment links", icon: LinkIcon },
    { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-muted-2">
      <aside className="fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-border p-4 hidden md:block">
        <Link href="/admin" className="inline-flex items-center gap-2 px-2 py-1">
          <LogoMark className="h-5 w-5 text-foreground" />
          <span className="font-semibold tracking-tight">Salma admin</span>
        </Link>
        <nav className="mt-6 space-y-0.5">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] text-foreground/80 hover:bg-muted-2 hover:text-foreground"
            >
              <n.icon size={16} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-xs text-muted">
          <div className="flex-1 truncate">{session.email}</div>
          <LogoutButton />
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-border px-4 h-14 flex items-center gap-2">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <LogoMark className="h-5 w-5 text-foreground" />
            <span className="font-semibold tracking-tight">Salma admin</span>
          </Link>
          <AdminMobileNav
            items={nav.map((n) => ({ href: n.href, label: n.label }))}
            email={session.email}
          />
        </header>
        <main className="p-4 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
