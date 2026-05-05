"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data?.message ?? "Login failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-muted-2 flex items-center justify-center px-5 py-12">
      <div className="card p-8 w-full max-w-sm">
        <Link href="/" className="text-foreground inline-flex items-center gap-2">
          <svg viewBox="0 0 64 64" fill="currentColor" className="h-5 w-5">
            <path d="M32 8 L38 18 L49 15 L46 26 L56 32 L46 38 L49 49 L38 46 L32 56 L26 46 L15 49 L18 38 L8 32 L18 26 L15 15 L26 18 Z" />
          </svg>
          <span className="font-semibold">Salma admin</span>
        </Link>
        <h1 className="mt-6 text-2xl tracking-tight">Sign <span className="serif-italic text-primary">in</span></h1>
        <p className="mt-1 text-sm text-muted">
          Default credentials: admin@salma.local / salma-admin (change them in Settings).
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-xl border border-border px-4 text-sm focus:outline-none focus:border-foreground"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl border border-border px-4 text-sm focus:outline-none focus:border-foreground"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
