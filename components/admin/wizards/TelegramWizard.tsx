"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, WizardCard } from "../WizardShell";
import { ExternalLink, Send, Search, CheckCircle2 } from "lucide-react";

type Settings = {
  tgBotToken: string | null;
  tgChatId: string | null;
  tgEnabled: boolean;
};

export function TelegramWizard({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [pending, start] = useTransition();
  const [tokenStatus, setTokenStatus] = useState<{ ok: boolean; msg: string } | null>(
    initial.tgBotToken ? { ok: true, msg: "Token saved." } : null,
  );
  const [chatStatus, setChatStatus] = useState<{ ok: boolean; msg: string } | null>(
    initial.tgChatId ? { ok: true, msg: `Detected: ${initial.tgChatId}` } : null,
  );
  const [testStatus, setTestStatus] = useState<string | null>(null);

  function up<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((x) => ({ ...x, [k]: v }));
  }

  async function patchSettings(partial: Partial<Settings>) {
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (r.ok) {
      const j = await r.json();
      if (j.settings) {
        setS({
          tgBotToken: j.settings.tgBotToken,
          tgChatId: j.settings.tgChatId,
          tgEnabled: j.settings.tgEnabled,
        });
      }
      router.refresh();
    }
  }

  async function testToken() {
    setTokenStatus({ ok: false, msg: "Testing…" });
    const r = await fetch("/api/admin/telegram/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: s.tgBotToken }),
    });
    const j = await r.json();
    if (j.ok) {
      setTokenStatus({ ok: true, msg: `Connected as @${j.me?.username}` });
      start(() => patchSettings({ tgBotToken: s.tgBotToken }));
    } else {
      setTokenStatus({ ok: false, msg: j.message || "Token invalid." });
    }
  }

  async function detectChat() {
    setChatStatus({ ok: false, msg: "Looking for the latest /start message…" });
    const r = await fetch("/api/admin/telegram/detect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: s.tgBotToken, save: true }),
    });
    const j = await r.json();
    if (j.ok) {
      setChatStatus({ ok: true, msg: `Detected chat: ${j.chatTitle} (${j.chatId})` });
      up("tgChatId", j.chatId);
      up("tgEnabled", true);
      router.refresh();
    } else {
      setChatStatus({ ok: false, msg: j.message || "No /start message found." });
    }
  }

  async function sendTest() {
    setTestStatus("Sending…");
    const r = await fetch("/api/admin/telegram/test-message", {
      method: "POST",
    });
    const j = await r.json();
    setTestStatus(j.ok ? "✓ Sent — check your Telegram" : `❌ ${j.message}`);
  }

  const tokenOk = !!s.tgBotToken && !!tokenStatus?.ok;
  const chatOk = !!s.tgChatId && (chatStatus?.ok ?? !!s.tgChatId);
  const allDone = tokenOk && chatOk && s.tgEnabled;

  return (
    <WizardShell
      title="Set up Telegram bot"
      subtitle="Get an instant ping in Telegram every time someone places an order, pays, or files a warranty claim. Three steps, ~2 minutes."
      current={tokenOk ? (chatOk ? 2 : 1) : 0}
      steps={[
        { label: "Create bot + paste token", done: tokenOk },
        { label: "Send /start + auto-detect chat", done: chatOk },
        { label: "Send test message", done: allDone },
      ]}
    >
      <WizardCard
        step={1}
        title="Create your bot in Telegram"
        subtitle="Open @BotFather, send /newbot, follow the prompts, then paste the token here."
        done={tokenOk}
      >
        <a
          href="https://t.me/BotFather"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline inline-flex items-center gap-1"
        >
          Open BotFather <ExternalLink size={14} />
        </a>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Bot token</span>
          <input
            type="password"
            value={s.tgBotToken ?? ""}
            onChange={(e) => up("tgBotToken", e.target.value || null)}
            placeholder="123456789:ABC-XXXXXXXXXXXXXXXXXX"
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm font-mono"
          />
        </label>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={testToken}
            disabled={!s.tgBotToken || pending}
            className="btn btn-blue"
          >
            Verify token
          </button>
          {tokenStatus ? (
            <span
              className={`text-sm ${
                tokenStatus.ok ? "text-primary" : "text-red-500"
              }`}
            >
              {tokenStatus.msg}
            </span>
          ) : null}
        </div>
      </WizardCard>

      <WizardCard
        step={2}
        title="Send /start to your bot, then auto-detect"
        subtitle="Open your bot in Telegram (the one BotFather just gave you a link to), send /start, then click below."
        done={chatOk}
      >
        <p className="text-sm text-muted">
          Your token is needed for this. Then click the button — we&apos;ll fetch the most
          recent message and use that chat ID.
        </p>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={detectChat}
            disabled={!s.tgBotToken || pending}
            className="btn btn-primary inline-flex items-center gap-1"
          >
            <Search size={14} /> Auto-detect chat
          </button>
          {chatStatus ? (
            <span
              className={`text-sm ${
                chatStatus.ok ? "text-primary" : "text-red-500"
              }`}
            >
              {chatStatus.msg}
            </span>
          ) : null}
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Chat ID (manual override)
          </span>
          <input
            value={s.tgChatId ?? ""}
            onChange={(e) => up("tgChatId", e.target.value || null)}
            onBlur={() => start(() => patchSettings({ tgChatId: s.tgChatId }))}
            placeholder="-1001234567890"
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm font-mono"
          />
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={s.tgEnabled}
            onChange={(e) => {
              up("tgEnabled", e.target.checked);
              start(() => patchSettings({ tgEnabled: e.target.checked }));
            }}
          />
          <span className="text-sm">Enable Telegram notifications</span>
        </label>
      </WizardCard>

      <WizardCard
        step={3}
        title="Send a test message"
        subtitle="If everything is right, you should see a Salma message land in your chat."
        done={allDone && !!testStatus?.startsWith("✓")}
      >
        <button
          onClick={sendTest}
          disabled={!allDone}
          className="btn btn-blue inline-flex items-center gap-1"
        >
          <Send size={14} /> Send test message
        </button>
        {testStatus ? <p className="text-sm">{testStatus}</p> : null}
        {allDone ? (
          <p className="text-sm text-primary inline-flex items-center gap-1">
            <CheckCircle2 size={14} /> Telegram ready — you&apos;ll get pings for new
            orders &amp; claims.
          </p>
        ) : null}
      </WizardCard>
    </WizardShell>
  );
}
