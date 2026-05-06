import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function WizardShell({
  title,
  subtitle,
  steps,
  current,
  children,
}: {
  title: string;
  subtitle?: string;
  steps: { label: string; done: boolean }[];
  current: number;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>
      <h1 className="mt-2 text-3xl tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-muted max-w-2xl">{subtitle}</p> : null}

      <ol className="mt-6 flex flex-wrap gap-2 text-xs">
        {steps.map((s, i) => {
          const active = i === current;
          const done = s.done;
          return (
            <li
              key={i}
              className={`px-3 py-1.5 rounded-full border ${
                active
                  ? "bg-primary text-white border-primary"
                  : done
                  ? "bg-primary-soft text-primary border-primary/30"
                  : "bg-white text-muted border-border"
              }`}
            >
              <span className="font-mono mr-1.5 opacity-70">{i + 1}.</span>
              {s.label}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}

export function WizardCard({
  step,
  title,
  subtitle,
  children,
  done,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  done?: boolean;
}) {
  return (
    <section
      className={`card p-6 ${done ? "border-primary/20 bg-primary-soft/40" : ""}`}
    >
      <div className="flex items-baseline gap-3">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
            done ? "bg-primary text-white" : "bg-muted-2 text-foreground"
          }`}
        >
          {done ? "✓" : step}
        </span>
        <div>
          <h2 className="text-lg tracking-tight">{title}</h2>
          {subtitle ? <p className="text-sm text-muted mt-0.5">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-4 ml-10 space-y-3">{children}</div>
    </section>
  );
}
