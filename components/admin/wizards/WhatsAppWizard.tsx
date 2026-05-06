"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, WizardCard } from "../WizardShell";
import { CheckCircle2, ExternalLink } from "lucide-react";

type Settings = {
  waNumber: string | null;
  waEnabled: boolean;
  waRedirectMode: string;
  waPrefilledMessage: string;
};

export function WhatsAppWizard({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function up<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((x) => ({ ...x, [k]: v }));
  }

  async function patch(partial: Partial<Settings>) {
    start(async () => {
      const r = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(partial),
      });
      if (r.ok) {
        setSavedAt(new Date().toLocaleTimeString());
        router.refresh();
      }
    });
  }

  const numberOk = !!s.waNumber && /^\d{8,15}$/.test(s.waNumber);
  const messageOk = s.waPrefilledMessage.trim().length > 0;
  const allDone = numberOk && messageOk && s.waEnabled;

  function preview() {
    const msg = (s.waPrefilledMessage || "")
      .replaceAll("{product}", "Netflix Premium")
      .replaceAll("{variant}", "12 months")
      .replaceAll("{order}", "SAL-DEMO123")
      .replaceAll("{total}", "139.99")
      .replaceAll("{currency}", "USD");
    const url = new URL(`https://wa.me/${(s.waNumber ?? "").replace(/\D/g, "")}`);
    if (msg.trim()) url.searchParams.set("text", msg);
    return url.toString();
  }

  return (
    <WizardShell
      title="Set up WhatsApp"
      subtitle="Redirect customers to a personal WhatsApp chat with a prefilled message — before payment, after, or both."
      current={numberOk ? (messageOk ? 2 : 1) : 0}
      steps={[
        { label: "Phone number", done: numberOk },
        { label: "Redirect & message", done: messageOk },
        { label: "Test link", done: allDone },
      ]}
    >
      <WizardCard
        step={1}
        title="Your WhatsApp number"
        subtitle="International format, digits only. Country code first, no '+' or spaces."
        done={numberOk}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Number
          </span>
          <input
            value={s.waNumber ?? ""}
            onChange={(e) => up("waNumber", e.target.value.replace(/\D/g, "") || null)}
            onBlur={() => patch({ waNumber: s.waNumber })}
            placeholder="213700000000"
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm font-mono"
          />
        </label>
        <p className="text-xs text-muted">
          Examples: <code>213700000000</code> (Algeria), <code>33612345678</code> (France),{" "}
          <code>14155551234</code> (US).
        </p>
      </WizardCard>

      <WizardCard
        step={2}
        title="When should we redirect?"
        subtitle="Choose when the customer lands on WhatsApp, and what the prefilled message says."
        done={messageOk}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Redirect mode
          </span>
          <select
            value={s.waRedirectMode}
            onChange={(e) => {
              up("waRedirectMode", e.target.value);
              patch({ waRedirectMode: e.target.value });
            }}
            className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm bg-white"
          >
            <option value="off">Off — never redirect</option>
            <option value="before">Before payment (when they click &quot;Buy now&quot;)</option>
            <option value="after">After payment (on the success page)</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Prefilled message
          </span>
          <textarea
            value={s.waPrefilledMessage}
            onChange={(e) => up("waPrefilledMessage", e.target.value)}
            onBlur={() => patch({ waPrefilledMessage: s.waPrefilledMessage })}
            rows={3}
            className="input mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
          />
        </label>
        <p className="text-xs text-muted">
          Tokens: <code>{"{product}"}</code>, <code>{"{variant}"}</code>,{" "}
          <code>{"{order}"}</code>, <code>{"{total}"}</code>, <code>{"{currency}"}</code>
        </p>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={s.waEnabled}
            onChange={(e) => {
              up("waEnabled", e.target.checked);
              patch({ waEnabled: e.target.checked });
            }}
          />
          <span className="text-sm">Enable WhatsApp redirect</span>
        </label>
      </WizardCard>

      <WizardCard
        step={3}
        title="Test the link"
        subtitle="Opens WhatsApp with the prefilled message, exactly as a customer will see it."
        done={allDone}
      >
        <a
          href={numberOk ? preview() : "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!numberOk}
          className={`btn btn-blue inline-flex items-center gap-1 ${
            !numberOk ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Open test link <ExternalLink size={14} />
        </a>
        {savedAt ? (
          <p className="text-xs text-muted">Saved {savedAt}</p>
        ) : pending ? (
          <p className="text-xs text-muted">Saving…</p>
        ) : null}
        {allDone ? (
          <p className="text-sm text-primary inline-flex items-center gap-1">
            <CheckCircle2 size={14} /> WhatsApp redirect is live.
          </p>
        ) : null}
      </WizardCard>
    </WizardShell>
  );
}
