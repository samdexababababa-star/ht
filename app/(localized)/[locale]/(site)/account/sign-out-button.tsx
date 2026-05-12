"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "./sign-out-action";

export function SignOutButton({ label }: { label: string }) {
  const [pending, start] = useTransition();
  return (
    <form
      action={() => {
        start(async () => {
          await signOutAction();
        });
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground disabled:opacity-50 transition"
      >
        <LogOut size={14} />
        <span>{label}</span>
      </button>
    </form>
  );
}
