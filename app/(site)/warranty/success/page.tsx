import Link from "next/link";

type Search = { ref?: string };

export default async function ClaimSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { ref } = await searchParams;
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        Claim received
      </p>
      <h1 className="mt-2 text-4xl tracking-tight">
        Got it — <span className="serif-italic text-primary">we&apos;re on it</span>
      </h1>
      <p className="mt-3 text-muted">
        Reference: <span className="font-mono">{ref ?? "—"}</span>
      </p>
      <p className="mt-6 text-sm text-muted">
        We&apos;ll come back at the email you provided. Most claims get a first
        reply within a few hours.
      </p>
      <div className="mt-8">
        <Link href="/" className="btn btn-primary">Back home</Link>
      </div>
    </div>
  );
}
