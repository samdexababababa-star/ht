import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, ensureBootstrapAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Percent,
  FileText,
  Settings as SettingsIcon,
  Link as LinkIcon,
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
    { href: "/admin/promotions", label: "Promotions", icon: Percent },
    { href: "/admin/pages", label: "Pages", icon: FileText },
    { href: "/admin/payment-link", label: "Payment links", icon: LinkIcon },
    { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-muted-2">
      <aside className="fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-border p-4 hidden md:block">
        <Link href="/admin" className="inline-flex items-center gap-2 px-2 py-1">
          <svg viewBox="0 0 64 64" fill="currentColor" className="h-5 w-5 text-foreground">
            <path d="M32 4l3.6 22.4 21.4-7L40 32l21.4 12.6-21.4-7L32 60l-3.6-22.4-21.4 7L24 32 2.6 19.4l21.4 7L32 4z" />
          </svg>
          <span className="font-semibold tracking-tight">Soha admin</span>
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
        <header className="md:hidden bg-white border-b border-border p-3 flex items-center gap-2">
          <Link href="/admin" className="font-semibold">Soha admin</Link>
        </header>
        <main className="p-5 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
