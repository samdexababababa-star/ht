"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch("/api/admin/auth/logout", { method: "POST" });
          router.push("/admin/login");
          router.refresh();
        })
      }
      className="text-xs hover:text-foreground"
    >
      Sign out
    </button>
  );
}
