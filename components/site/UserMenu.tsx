"use client";

import { useTransition } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LogIn, User as UserIcon, LogOut, Sparkles } from "lucide-react";

export type UserMenuUser = {
  name: string | null;
  email: string;
  image: string | null;
};

/**
 * Header user widget. When the visitor is signed in, shows an avatar that
 * opens a small dropdown (account, affiliate, sign out). When signed out,
 * shows a clean "Sign in" pill linking to /sign-in.
 *
 * The sign-out server action is passed in from the (server) Header so this
 * component stays a pure presentational client component.
 */
export function UserMenu({
  user,
  signOutAction,
}: {
  user: UserMenuUser | null;
  signOutAction: () => Promise<void>;
}) {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground hover:bg-muted-2 transition"
      >
        <LogIn size={13} />
        <span>{tAuth("signIn")}</span>
      </Link>
    );
  }

  const initial = (user.name?.trim() || user.email).charAt(0).toUpperCase();
  const displayName = user.name?.trim() || user.email.split("@")[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("account")}
          className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <Avatar image={user.image} initial={initial} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] rounded-2xl border border-border bg-white p-1.5 shadow-xl shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <div className="px-3 py-2.5">
            <p className="text-xs text-muted">{tAuth("signIn")}</p>
            <p className="mt-0.5 text-sm font-medium truncate">{displayName}</p>
            <p className="text-[11px] text-muted truncate">{user.email}</p>
          </div>
          <DropdownMenu.Separator className="h-px bg-border my-1" />
          <DropdownMenu.Item asChild>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted-2 focus:bg-muted-2 outline-none cursor-pointer"
            >
              <UserIcon size={14} className="text-muted" />
              <span>{t("account")}</span>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/affiliate"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted-2 focus:bg-muted-2 outline-none cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>{t("affiliate")}</span>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-border my-1" />
          <SignOutItem signOutAction={signOutAction} label={tAuth("signOut")} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SignOutItem({
  signOutAction,
  label,
}: {
  signOutAction: () => Promise<void>;
  label: string;
}) {
  const [pending, start] = useTransition();
  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        // Prevent the menu from closing instantly — keep it open while we
        // call the server action so the user sees a tiny "ending session"
        // beat instead of a flash.
        e.preventDefault();
        start(() => signOutAction());
      }}
      disabled={pending}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted-2 focus:bg-muted-2 outline-none cursor-pointer data-[disabled]:opacity-60"
    >
      <LogOut size={14} className="text-muted" />
      <span>{label}</span>
    </DropdownMenu.Item>
  );
}

function Avatar({ image, initial }: { image: string | null; initial: string }) {
  if (image) {
    // Use a plain <img> here: avatars come from arbitrary Google CDN URLs,
    // adding next/image config for every possible avatar host is more pain
    // than it's worth.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className="h-7 w-7 rounded-full object-cover border border-border"
      />
    );
  }
  return (
    <span className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-foreground text-white text-xs font-medium">
      {initial}
    </span>
  );
}
