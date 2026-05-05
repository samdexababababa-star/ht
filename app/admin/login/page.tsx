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
            <path d="M32 4l3.6 22.4 21.4-7L40 32l21.4 12.6-21.4-7L32 60l-3.6-22.4-21.4 7L24 32 2.6 19.4l21.4 7L32 4z" />
          </svg>
          <span className="font-semibold">Soha admin</span>
        </Link>
        <h1 className="mt-6 text-2xl tracking-tight">Sign <span className="serif-italic text-primary">in</span></h1>
        <p className="mt-1 text-sm text-muted">
          Default credentials: admin@soha.local / soha-admin (change them in Settings).
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
