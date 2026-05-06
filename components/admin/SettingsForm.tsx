"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  brandName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  accentColor: string;
  supportEmail: string | null;
  defaultCurrency: string;
  defaultLocale: string;
  lsApiKey: string | null;
  lsStoreId: string | null;
  lsWebhookSecret: string | null;
  paymentsEnabled: boolean;
  tgBotToken: string | null;
  tgChatId: string | null;
  tgEnabled: boolean;
  waNumber: string | null;
  waEnabled: boolean;
  waRedirectMode: string;
  waPrefilledMessage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  marketplaceEnabled: boolean;
  vendorSignupOpen: boolean;
  announcementBar: string | null;
  // phase 7
  warrantyEnabled: boolean;
  warrantyDefaultDays: number;
  claimsRequirePhoto: boolean;
  claimsAllowMessage: boolean;
  claimsMaxPhotos: number;
  orderGroupingEnabled: boolean;
  allowQuantityByDefault: boolean;
  negotiableEnabled: boolean;
  depthEffectsEnabled: boolean;
  scrollRevealEnabled: boolean;
  parallaxEnabled: boolean;
  tgNotifyOnNewOrder: boolean;
  tgNotifyOnPaid: boolean;
  tgNotifyOnClaim: boolean;
  tgNotifyOnOffer: boolean;
  tgNotifyOnError: boolean;
  tgOrderTemplate: string;
  tgPaidTemplate: string;
  tgClaimTemplate: string;
  tgOfferTemplate: string;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [pending, start] = useTransition();
  const [tgStatus, setTgStatus] = useState<string | null>(null);
  const [lsStatus, setLsStatus] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function up<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((x) => ({ ...x, [k]: v }));
  }

  function save(partial?: Partial<Settings>) {
    const data = partial ?? s;
    start(async () => {
      const r = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        setSavedAt(new Date().toLocaleTimeString());
        const j = await r.json();
        if (j.settings) setS(j.settings);
        router.refresh();
      }
    });
  }

  async function testTelegram() {
    setTgStatus("Testing…");
    const r = await fetch("/api/admin/telegram/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: s.tgBotToken }),
    });
    const j = await r.json();
    setTgStatus(j.ok ? `Connected as @${j.me?.username}` : `❌ ${j.message}`);
  }

  async function detectTelegramChat() {
    setTgStatus("Looking for the latest /start message…");
    const r = await fetch("/api/admin/telegram/detect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: s.tgBotToken, save: true }),
    });
    const j = await r.json();
    if (j.ok) {
      setTgStatus(`✓ Detected chat: ${j.chatTitle} (${j.chatId}). Saved & enabled.`);
      up("tgChatId", j.chatId);
      up("tgEnabled", true);
    } else {
      setTgStatus(`❌ ${j.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-muted-2 -mx-5 md:-mx-8 px-5 md:px-8 py-3 z-10 border-b border-border">
        <p className="text-sm text-muted">
          {savedAt ? `Saved ${savedAt}` : "Changes auto-save when you click 'Save'"}
        </p>
        <button type="button" onClick={() => save()} disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>

      <Section title="Brand">
        <Grid>
          <F label="Brand name">
            <I value={s.brandName} onChange={(v) => up("brandName", v)} />
          </F>
          <F label="Tagline">
            <I value={s.tagline} onChange={(v) => up("tagline", v)} />
          </F>
          <F label="Logo URL">
            <I value={s.logoUrl ?? ""} onChange={(v) => up("logoUrl", v || null)} />
          </F>
          <F label="Favicon URL">
            <I value={s.faviconUrl ?? ""} onChange={(v) => up("faviconUrl", v || null)} />
          </F>
          <F label="Primary color (hex)">
            <I value={s.primaryColor} onChange={(v) => up("primaryColor", v)} />
          </F>
          <F label="Accent color (hex)">
            <I value={s.accentColor} onChange={(v) => up("accentColor", v)} />
          </F>
          <F label="Support email">
            <I value={s.supportEmail ?? ""} onChange={(v) => up("supportEmail", v || null)} />
          </F>
          <F label="Announcement bar (top of every page)">
            <I value={s.announcementBar ?? ""} onChange={(v) => up("announcementBar", v || null)} placeholder="🎉 Spring sale — up to 50% off" />
          </F>
        </Grid>
      </Section>

      <Section title="Homepage">
        <Grid>
          <F label="Hero title">
            <T value={s.heroTitle} onChange={(v) => up("heroTitle", v)} rows={2} />
          </F>
          <F label="Hero subtitle">
            <T value={s.heroSubtitle} onChange={(v) => up("heroSubtitle", v)} rows={2} />
          </F>
          <F label="CTA label">
            <I value={s.heroCtaLabel} onChange={(v) => up("heroCtaLabel", v)} />
          </F>
          <F label="CTA link">
            <I value={s.heroCtaHref} onChange={(v) => up("heroCtaHref", v)} />
          </F>
        </Grid>
      </Section>

      <Section title="Currency & locale">
        <Grid>
          <F label="Default currency (ISO)">
            <I value={s.defaultCurrency} onChange={(v) => up("defaultCurrency", v.toUpperCase())} />
          </F>
          <F label="Default locale (BCP-47)">
            <I value={s.defaultLocale} onChange={(v) => up("defaultLocale", v)} />
          </F>
        </Grid>
      </Section>

      <Section
        title="Payments — LemonSqueezy"
        subtitle="Get an API key from app.lemonsqueezy.com → Settings → API. The Store ID is in your store URL."
      >
        <Grid>
          <F label="API key">
            <I type="password" value={s.lsApiKey ?? ""} onChange={(v) => up("lsApiKey", v || null)} />
          </F>
          <F label="Store ID">
            <I value={s.lsStoreId ?? ""} onChange={(v) => up("lsStoreId", v || null)} />
          </F>
          <F label="Webhook signing secret">
            <I type="password" value={s.lsWebhookSecret ?? ""} onChange={(v) => up("lsWebhookSecret", v || null)} />
          </F>
          <F label="Payments enabled">
            <Toggle value={s.paymentsEnabled} onChange={(v) => up("paymentsEnabled", v)} />
          </F>
        </Grid>
        <p className="text-xs text-muted">
          Your webhook URL: <code>/api/webhooks/lemonsqueezy</code> — paste your full
          deployed URL into the LemonSqueezy webhook settings.
        </p>
        <button
          type="button"
          onClick={async () => {
            setLsStatus("Saving + checking…");
            await save({ lsApiKey: s.lsApiKey, lsStoreId: s.lsStoreId, lsWebhookSecret: s.lsWebhookSecret, paymentsEnabled: s.paymentsEnabled });
            setLsStatus("Saved.");
          }}
          className="btn btn-outline"
        >
          Save payment settings
        </button>
        {lsStatus ? <p className="text-sm">{lsStatus}</p> : null}
      </Section>

      <Section
        title="Telegram bot"
        subtitle="Create a bot via @BotFather in Telegram, copy the token here, then send /start to your bot and click 'Auto-detect chat'."
      >
        <Grid>
          <F label="Bot token (from BotFather)">
            <I type="password" value={s.tgBotToken ?? ""} onChange={(v) => up("tgBotToken", v || null)} />
          </F>
          <F label="Chat ID (auto-detected)">
            <I value={s.tgChatId ?? ""} onChange={(v) => up("tgChatId", v || null)} />
          </F>
          <F label="Enabled">
            <Toggle value={s.tgEnabled} onChange={(v) => up("tgEnabled", v)} />
          </F>
        </Grid>
        <div className="flex gap-2">
          <button type="button" onClick={testTelegram} className="btn btn-outline">Test token</button>
          <button type="button" onClick={detectTelegramChat} className="btn btn-blue">Auto-detect chat</button>
        </div>
        {tgStatus ? <p className="text-sm">{tgStatus}</p> : null}
      </Section>

      <Section title="WhatsApp">
        <Grid>
          <F label="Number (international, no '+')">
            <I value={s.waNumber ?? ""} onChange={(v) => up("waNumber", v || null)} placeholder="213700000000" />
          </F>
          <F label="Enabled">
            <Toggle value={s.waEnabled} onChange={(v) => up("waEnabled", v)} />
          </F>
          <F label="Redirect mode">
            <select
              value={s.waRedirectMode}
              onChange={(e) => up("waRedirectMode", e.target.value)}
              className="input"
            >
              <option value="off">Off</option>
              <option value="before">Before payment</option>
              <option value="after">After payment</option>
              <option value="both">Both</option>
            </select>
          </F>
          <F label="Pre-filled message template">
            <T
              value={s.waPrefilledMessage}
              onChange={(v) => up("waPrefilledMessage", v)}
              rows={3}
              placeholder="Hello, I'd like to order: {product} ({variant}) — Order {order}."
            />
          </F>
        </Grid>
        <p className="text-xs text-muted">
          Tokens you can use in the template: <code>{"{product}"}</code>, <code>{"{variant}"}</code>,{" "}
          <code>{"{order}"}</code>, <code>{"{total}"}</code>, <code>{"{currency}"}</code>.
        </p>
      </Section>

      <Section
        title="Warranty & claims"
        subtitle="Lets buyers file a claim with photos and a message after delivery. Toggle off to hide the public /warranty page entirely."
      >
        <Grid>
          <F label="Enable warranty page">
            <Toggle value={s.warrantyEnabled} onChange={(v) => up("warrantyEnabled", v)} />
          </F>
          <F label="Default warranty window (days)">
            <I
              type="number"
              value={String(s.warrantyDefaultDays)}
              onChange={(v) => up("warrantyDefaultDays", Number(v || "0"))}
            />
          </F>
          <F label="Require at least one photo">
            <Toggle value={s.claimsRequirePhoto} onChange={(v) => up("claimsRequirePhoto", v)} />
          </F>
          <F label="Allow customer message">
            <Toggle value={s.claimsAllowMessage} onChange={(v) => up("claimsAllowMessage", v)} />
          </F>
          <F label="Max photos per claim">
            <I
              type="number"
              value={String(s.claimsMaxPhotos)}
              onChange={(v) => up("claimsMaxPhotos", Math.max(1, Number(v || "1")))}
            />
          </F>
        </Grid>
      </Section>

      <Section
        title="Selling defaults"
        subtitle="Defaults applied to brand-new products. Each product can override these from its own form."
      >
        <Grid>
          <F label="Allow quantity selection by default">
            <Toggle
              value={s.allowQuantityByDefault}
              onChange={(v) => up("allowQuantityByDefault", v)}
            />
          </F>
          <F label="Enable Make-an-offer storefront-wide">
            <Toggle
              value={s.negotiableEnabled}
              onChange={(v) => up("negotiableEnabled", v)}
            />
          </F>
          <F label="Group orders by product in admin">
            <Toggle
              value={s.orderGroupingEnabled}
              onChange={(v) => up("orderGroupingEnabled", v)}
            />
          </F>
        </Grid>
      </Section>

      <Section
        title="Visual polish"
        subtitle="Subtle elevation, scroll-reveal, and parallax. Off-by-default for parallax to keep things calm; depth + reveal are on by default."
      >
        <Grid>
          <F label="Soft elevation on cards">
            <Toggle
              value={s.depthEffectsEnabled}
              onChange={(v) => up("depthEffectsEnabled", v)}
            />
          </F>
          <F label="Scroll-reveal animations">
            <Toggle
              value={s.scrollRevealEnabled}
              onChange={(v) => up("scrollRevealEnabled", v)}
            />
          </F>
          <F label="Parallax on hero S marks">
            <Toggle
              value={s.parallaxEnabled}
              onChange={(v) => up("parallaxEnabled", v)}
            />
          </F>
        </Grid>
        <p className="text-xs text-muted">
          All effects respect each user&apos;s OS-level &ldquo;reduce motion&rdquo; preference automatically.
        </p>
      </Section>

      <Section
        title="Telegram notifications"
        subtitle="Pick the events that should ping your Telegram chat. Each template supports {variable} tokens — see hints below each field."
      >
        <Grid>
          <F label="On new order">
            <Toggle value={s.tgNotifyOnNewOrder} onChange={(v) => up("tgNotifyOnNewOrder", v)} />
          </F>
          <F label="On payment received">
            <Toggle value={s.tgNotifyOnPaid} onChange={(v) => up("tgNotifyOnPaid", v)} />
          </F>
          <F label="On warranty claim">
            <Toggle value={s.tgNotifyOnClaim} onChange={(v) => up("tgNotifyOnClaim", v)} />
          </F>
          <F label="On price offer">
            <Toggle value={s.tgNotifyOnOffer} onChange={(v) => up("tgNotifyOnOffer", v)} />
          </F>
          <F label="On error">
            <Toggle value={s.tgNotifyOnError} onChange={(v) => up("tgNotifyOnError", v)} />
          </F>
        </Grid>
        <TemplateField
          label="New order template"
          tokens={["{order}", "{customer}", "{email}", "{items}", "{total}"]}
          value={s.tgOrderTemplate}
          onChange={(v) => up("tgOrderTemplate", v)}
        />
        <TemplateField
          label="Payment received template"
          tokens={["{order}", "{customer}", "{total}"]}
          value={s.tgPaidTemplate}
          onChange={(v) => up("tgPaidTemplate", v)}
        />
        <TemplateField
          label="Claim template"
          tokens={["{claim}", "{customer}", "{email}", "{order}", "{reason}", "{message}"]}
          value={s.tgClaimTemplate}
          onChange={(v) => up("tgClaimTemplate", v)}
        />
        <TemplateField
          label="Offer template"
          tokens={["{offer}", "{product}", "{customer}", "{email}", "{price}", "{message}"]}
          value={s.tgOfferTemplate}
          onChange={(v) => up("tgOfferTemplate", v)}
        />
      </Section>

      <Section
        title="Marketplace (hidden / future)"
        subtitle="Future: open the store to third-party vendors. The DB is ready; the UI is not — keep this off until Phase 3 is built."
      >
        <Grid>
          <F label="Marketplace enabled">
            <Toggle value={s.marketplaceEnabled} onChange={(v) => up("marketplaceEnabled", v)} />
          </F>
          <F label="Vendor signup open">
            <Toggle value={s.vendorSignupOpen} onChange={(v) => up("vendorSignupOpen", v)} />
          </F>
        </Grid>
      </Section>

      <style jsx>{`
        .input {
          width: 100%; height: 40px; border-radius: 12px;
          border: 1px solid var(--border); padding: 0 12px;
          font-size: 14px; background: white;
        }
        textarea.input { height: auto; padding: 10px 12px; line-height: 1.5; }
        .input:focus { outline: none; border-color: var(--foreground); }
      `}</style>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6 space-y-4">
      <div>
        <h2 className="text-lg tracking-tight">{title}</h2>
        {subtitle ? <p className="text-sm text-muted mt-1 max-w-2xl">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function I(props: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={props.type ?? "text"}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      className="input"
    />
  );
}

function T(props: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      rows={props.rows}
      placeholder={props.placeholder}
      className="input"
    />
  );
}

function TemplateField({
  label,
  tokens,
  value,
  onChange,
}: {
  label: string;
  tokens: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  // Live preview with stub values
  const stub: Record<string, string> = {
    "{order}": "SAL-ABC123",
    "{customer}": "Sarah K.",
    "{email}": "sarah@example.com",
    "{items}": "Netflix Premium ×1\nDisney+ ×2",
    "{total}": "$24.98",
    "{claim}": "CLM-X8K7M2",
    "{reason}": "Subscription expired early",
    "{message}": "It stopped working after 3 days.",
    "{offer}": "OFR-Q9L2",
    "{product}": "Netflix Premium",
    "{price}": "9.99",
  };
  const preview = value.replace(/\{[a-zA-Z]+\}/g, (m) => stub[m] ?? "");

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="input mt-1"
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange((value || "") + (value && !value.endsWith(" ") ? " " : "") + t)}
            className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-border text-muted hover:text-foreground hover:border-foreground/40"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-dashed border-border bg-muted-2/60 p-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Preview</p>
        <pre className="text-xs whitespace-pre-wrap leading-relaxed">{preview || "—"}</pre>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        value ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
