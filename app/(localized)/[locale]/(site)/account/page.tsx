import type { Metadata } from "next";
import { getTranslations, getFormatter } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Mail, User as UserIcon, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title") };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, session] = await Promise.all([params, auth()]);

  // Middleware already guards `/account/*`, but we keep this as a defensive
  // belt-and-suspenders check (RSC could render in a race where the JWT
  // expired between middleware and the page render). `redirect()` throws and
  // never returns, but the TS signature isn't narrowed so we hint with a
  // local const.
  const userId = session?.user?.id;
  if (!userId) {
    redirect({ href: "/sign-in?callbackUrl=/account", locale });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: { select: { provider: true }, orderBy: { id: "asc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          currency: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              unitPrice: true,
              total: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect({ href: "/sign-in", locale });
    // `redirect()` throws — this line never runs, but it narrows the type for TS.
    return null;
  }

  const t = await getTranslations("account");
  const tSec = await getTranslations("account.sections");
  const tFld = await getTranslations("account.fields");
  const tMeth = await getTranslations("account.methods");
  const tOrd = await getTranslations("account.order");
  const tAuth = await getTranslations("auth");
  const fmt = await getFormatter({ locale });

  const provider = user.accounts[0]?.provider ?? "email";
  const methodLabel =
    provider === "google" ? tMeth("google") : tMeth("email");

  // Prices in the Order model are stored as integer minor units (cents).
  const moneyFromCents = (cents: number, currency: string) =>
    fmt.number(cents / 100, { style: "currency", currency: currency.toUpperCase() });

  const displayName = user.name || user.email.split("@")[0];

  return (
    <main className="px-5 py-10 md:py-14">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[12px] uppercase tracking-wider text-muted">
              {t("title")}
            </p>
            <h1 className="mt-1 text-3xl md:text-4xl tracking-tight">
              {t("welcome", { name: displayName })}
            </h1>
          </div>
          <SignOutButton label={tAuth("signOut")} />
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <ProfileCard
            title={tSec("profileTitle")}
            subtitle={tSec("profileSubtitle")}
            email={user.email}
            name={user.name}
            memberSince={fmt.dateTime(user.createdAt, { dateStyle: "medium" })}
            labels={{
              name: tFld("name"),
              email: tFld("email"),
              memberSince: tFld("memberSince"),
            }}
          />
          <SecurityCard
            title={tSec("securityTitle")}
            subtitle={tSec("securitySubtitle")}
            method={methodLabel}
            label={tFld("signInMethod")}
            provider={provider}
          />
          <AffiliateCard
            title={tSec("affiliateTitle")}
            subtitle={tSec("affiliateSubtitle")}
            cta={tSec("affiliateCta")}
          />
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl tracking-tight">{tSec("ordersTitle")}</h2>
              <p className="text-sm text-muted">{tSec("ordersSubtitle")}</p>
            </div>
            <ShoppingBag size={16} className="text-muted" />
          </div>

          {user.orders.length === 0 ? (
            <div className="mt-5 card p-8 text-center">
              <p className="text-sm text-muted">{t("noOrders")}</p>
              <Link
                href="/catalog"
                className="btn btn-primary mt-4 inline-flex"
              >
                {t("noOrdersCta")}
              </Link>
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {user.orders.map((o) => {
                const totalCents =
                  o.total ||
                  o.items.reduce(
                    (sum, it) => sum + (it.total || it.unitPrice * it.quantity),
                    0,
                  );
                return (
                  <li key={o.id} className="card p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted">
                          {tOrd("placedOn")}{" "}
                          {fmt.dateTime(o.createdAt, { dateStyle: "medium" })}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {tOrd("number", { number: o.id.slice(0, 8).toUpperCase() })}
                        </p>
                        <p className="mt-1 text-xs text-muted line-clamp-1">
                          {o.items.map((it) => it.name).join(" • ")}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-[11px] uppercase tracking-wider text-muted">
                          {tOrd("total")}
                        </p>
                        <p className="text-sm font-medium">
                          {moneyFromCents(totalCents, o.currency || "USD")}
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-foreground/70">
                          <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                          {o.status}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileCard({
  title,
  subtitle,
  email,
  name,
  memberSince,
  labels,
}: {
  title: string;
  subtitle: string;
  email: string;
  name: string | null;
  memberSince: string;
  labels: { name: string; email: string; memberSince: string };
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted-2">
          <UserIcon size={15} />
        </span>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-[11px] text-muted">{subtitle}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label={labels.name} value={name || "—"} />
        <Row
          label={labels.email}
          value={
            <span className="inline-flex items-center gap-1.5">
              <Mail size={12} className="text-muted" />
              {email}
            </span>
          }
        />
        <Row label={labels.memberSince} value={memberSince} />
      </dl>
    </div>
  );
}

function SecurityCard({
  title,
  subtitle,
  method,
  label,
  provider,
}: {
  title: string;
  subtitle: string;
  method: string;
  label: string;
  provider: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted-2">
          <ShieldCheck size={15} />
        </span>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-[11px] text-muted">{subtitle}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2.5 text-sm">
        <Row
          label={label}
          value={
            <span className="inline-flex items-center gap-2">
              <ProviderGlyph provider={provider} />
              {method}
            </span>
          }
        />
      </dl>
    </div>
  );
}

function AffiliateCard({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: string;
}) {
  return (
    <div className="card p-5 bg-gradient-to-br from-amber-50 to-white">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Sparkles size={15} />
        </span>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-[11px] text-muted">{subtitle}</p>
        </div>
      </div>
      <Link
        href="/affiliate"
        className="mt-4 btn btn-secondary inline-flex w-full justify-center"
      >
        {cta}
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm text-foreground text-end">{value}</dd>
    </div>
  );
}

function ProviderGlyph({ provider }: { provider: string }) {
  if (provider === "google") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.29-4.74 3.29-8.1Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.99.66-2.26 1.05-3.73 1.05-2.87 0-5.3-1.93-6.17-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.83 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.65-2.84Z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.65 2.84C6.7 7.31 9.13 5.38 12 5.38Z" />
      </svg>
    );
  }
  return <Mail size={13} className="text-muted" />;
}
