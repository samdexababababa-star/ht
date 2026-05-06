import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

type Setting = {
  tgEnabled: boolean;
  tgBotToken: string | null;
  tgChatId: string | null;
  waEnabled: boolean;
  waNumber: string | null;
  paymentsEnabled: boolean;
  lsApiKey: string | null;
  lsStoreId: string | null;
};

type Step = {
  href: string;
  title: string;
  hint: string;
  done: boolean;
};

export function SetupChecklist({ settings }: { settings: Setting }) {
  const steps: Step[] = [
    {
      href: "/admin/setup/lemonsqueezy",
      title: "LemonSqueezy",
      hint: "Accept card payments worldwide",
      done: Boolean(settings.paymentsEnabled && settings.lsApiKey && settings.lsStoreId),
    },
    {
      href: "/admin/setup/telegram",
      title: "Telegram bot",
      hint: "Get pings on your phone for orders & claims",
      done: Boolean(settings.tgEnabled && settings.tgBotToken && settings.tgChatId),
    },
    {
      href: "/admin/setup/whatsapp",
      title: "WhatsApp",
      hint: "Redirect customers to chat with you",
      done: Boolean(settings.waEnabled && settings.waNumber),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = completedCount === total;

  return (
    <section className="card p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg tracking-tight">Setup</h2>
          <p className="text-sm text-muted mt-1">
            {allDone
              ? "Everything wired up — you're good to go."
              : `${completedCount} of ${total} integrations configured.`}
          </p>
        </div>
        {!allDone ? (
          <div
            className="hidden sm:block h-1.5 w-32 rounded-full bg-border overflow-hidden"
            aria-hidden
          >
            <div
              className="h-full bg-primary transition-[width] duration-500"
              style={{ width: `${(completedCount / total) * 100}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3">
        {steps.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
              s.done
                ? "border-primary/20 bg-primary-soft"
                : "border-border bg-white hover:border-foreground/30"
            }`}
          >
            <span className={s.done ? "text-primary" : "text-muted"}>
              {s.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{s.title}</span>
              <span className="block text-xs text-muted">{s.hint}</span>
            </span>
            <ArrowRight
              size={16}
              className="text-muted opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
