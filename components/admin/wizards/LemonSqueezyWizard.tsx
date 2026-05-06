"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, WizardCard } from "../WizardShell";
import { CheckCircle2, ExternalLink, Copy } from "lucide-react";

type Settings = {
  lsApiKey: string | null;
  lsStoreId: string | null;
  lsWebhookSecret: string | null;
  paymentsEnabled: boolean;
};

export function LemonSqueezyWizard({
  initial,
  publicSiteUrl,
}: {
  initial: Settings;
  publicSiteUrl: string;
}) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

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

  async function testConnection() {
    setTestStatus({ ok: false, msg: "Pinging LemonSqueezy…" });
    const r = await fetch("/api/admin/lemonsqueezy/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ apiKey: s.lsApiKey, storeId: s.lsStoreId }),
    });
    const j = await r.json();
    if (j.ok) {
      setTestStatus({
        ok: true,
        msg: `Connected to store: ${j.storeName ?? s.lsStoreId}`,
      });
    } else {
      setTestStatus({ ok: false, msg: j.message || "Connection failed." });
    }
  }

  const apiOk = !!s.lsApiKey;
  const storeOk = !!s.lsStoreId;
  const allDone = apiOk && storeOk && s.paymentsEnabled;
  const webhookUrl = `${publicSiteUrl.replace(/\/$/, "")}/api/webhooks/lemonsqueezy`;

  return (
    <WizardShell
      title="Set up LemonSqueezy"
      subtitle="LemonSqueezy is a merchant of record — they handle taxes, fraud, and worldwide cards. You get paid out monthly."
      current={apiOk ? (storeOk ? 2 : 1) : 0}
      steps={[
        { label: "Create account & store", done: false },
        { label: "API key", done: apiOk },
        { label: "Store ID", done: storeOk },
        { label: "Webhook", done: !!s.lsWebhookSecret },
        { label: "Test", done: allDone && testStatus?.ok === true },
      ]}
    >
      <WizardCard
        step={1}
        title="Create your LemonSqueezy account & store"
        subtitle="Go through their onboarding (you'll need a tax form). The store name doesn't have to match your brand."
      >
        <a
          href="https://app.lemonsqueezy.com/register"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline inline-flex items-center gap-1"
        >
          Sign up at LemonSqueezy <ExternalLink size={14} />
        </a>
        <p className="text-xs text-muted">
          Once your store is approved, come back here.
        </p>
      </WizardCard>

      <WizardCard
        step={2}
        title="Paste your API key"
        subtitle="In LemonSqueezy go to Settings → API → Create API key. Give it a name like 'Salma server'."
        done={apiOk}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            API key
          </span>
          <input
            type="password"
            value={s.lsApiKey ?? ""}
            onChange={(e) => up("lsApiKey", e.target.value || null)}
            onBlur={() => patch({ lsApiKey: s.lsApiKey })}
            placeholder="eyJ0eXAi..."
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm font-mono"
          />
        </label>
      </WizardCard>

      <WizardCard
        step={3}
        title="Paste your Store ID"
        subtitle="In LemonSqueezy: Stores → click your store → the ID is in the URL (e.g. /stores/12345)."
        done={storeOk}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Store ID
          </span>
          <input
            value={s.lsStoreId ?? ""}
            onChange={(e) => up("lsStoreId", e.target.value || null)}
            onBlur={() => patch({ lsStoreId: s.lsStoreId })}
            placeholder="12345"
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm font-mono"
          />
        </label>
      </WizardCard>

      <WizardCard
        step={4}
        title="Webhook endpoint (recommended)"
        subtitle="Tell LemonSqueezy where to ping us when an order is paid. Without this, paid orders won't auto-update."
        done={!!s.lsWebhookSecret}
      >
        <div className="rounded-xl border border-border bg-white p-3 flex items-center gap-2">
          <code className="text-xs flex-1 truncate font-mono">{webhookUrl}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(webhookUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="btn btn-outline inline-flex items-center gap-1 text-xs"
          >
            <Copy size={12} /> {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted">
          In LemonSqueezy: Settings → Webhooks → New. Paste the URL above, copy the
          signing secret, paste it below.
        </p>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Webhook signing secret
          </span>
          <input
            type="password"
            value={s.lsWebhookSecret ?? ""}
            onChange={(e) => up("lsWebhookSecret", e.target.value || null)}
            onBlur={() => patch({ lsWebhookSecret: s.lsWebhookSecret })}
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm font-mono"
          />
        </label>
      </WizardCard>

      <WizardCard
        step={5}
        title="Test & enable"
        subtitle="Make a real call to LemonSqueezy and flip payments live."
        done={allDone}
      >
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={testConnection}
            disabled={!apiOk || !storeOk || pending}
            className="btn btn-outline"
          >
            Test connection
          </button>
          {testStatus ? (
            <span
              className={`text-sm ${
                testStatus.ok ? "text-primary" : "text-red-500"
              }`}
            >
              {testStatus.msg}
            </span>
          ) : null}
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={s.paymentsEnabled}
            onChange={(e) => {
              up("paymentsEnabled", e.target.checked);
              patch({ paymentsEnabled: e.target.checked });
            }}
          />
          <span className="text-sm">Enable card payments on the storefront</span>
        </label>
        {savedAt ? <p className="text-xs text-muted">Saved {savedAt}</p> : null}
        {allDone ? (
          <p className="text-sm text-primary inline-flex items-center gap-1">
            <CheckCircle2 size={14} /> Payments live.
          </p>
        ) : null}
      </WizardCard>
    </WizardShell>
  );
}
