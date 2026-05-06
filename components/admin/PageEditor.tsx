"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Page = {
  id: string;
  title: string;
  slug: string;
  kind: string;
  content: string;
  visible: boolean;
};

export function PagesManager({ initial }: { initial: Page[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [active, setActive] = useState<Page | null>(initial[0] ?? null);
  const [draft, setDraft] = useState({ title: "", slug: "", kind: "custom" });
  const [pending, start] = useTransition();

  function create() {
    if (!draft.title.trim()) return;
    start(async () => {
      const r = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, content: "[]" }),
      });
      if (r.ok) {
        const j = await r.json();
        setList((p) => [j.page, ...p]);
        setActive(j.page);
        setDraft({ title: "", slug: "", kind: "custom" });
        router.refresh();
      }
    });
  }

  function save() {
    if (!active) return;
    start(async () => {
      await fetch(`/api/admin/pages/${active.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(active),
      });
      setList((p) => p.map((x) => (x.id === active.id ? active : x)));
      router.refresh();
    });
  }

  function remove() {
    if (!active) return;
    if (!confirm("Delete this page?")) return;
    start(async () => {
      await fetch(`/api/admin/pages/${active.id}`, { method: "DELETE" });
      setList((p) => p.filter((x) => x.id !== active.id));
      setActive(null);
      router.refresh();
    });
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      <aside>
        <div className="card p-4 space-y-2 mb-3">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Title"
            className="h-10 w-full rounded-xl border border-border px-3 text-sm"
          />
          <select
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            className="h-10 w-full rounded-xl border border-border px-3 text-sm"
          >
            <option value="custom">Custom page</option>
            <option value="landing">Landing page</option>
            <option value="limited_offer">Limited offer</option>
            <option value="fake_offer">Fake / scarcity offer</option>
          </select>
          <button type="button" disabled={pending} onClick={create} className="btn btn-primary w-full">
            + New page
          </button>
        </div>
        <ul className="card divide-y divide-border">
          {list.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setActive(p)}
                className={`w-full text-left p-3 hover:bg-muted-2 ${active?.id === p.id ? "bg-muted-2" : ""}`}
              >
                <p className="font-medium leading-tight truncate">{p.title}</p>
                <p className="text-xs text-muted truncate">/p/{p.slug}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section>
        {active ? (
          <div className="card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={active.title}
                onChange={(e) => setActive({ ...active, title: e.target.value })}
                className="h-10 rounded-xl border border-border px-3 text-sm"
              />
              <input
                value={active.slug}
                onChange={(e) => setActive({ ...active, slug: e.target.value })}
                className="h-10 rounded-xl border border-border px-3 text-sm"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active.visible}
                onChange={(e) => setActive({ ...active, visible: e.target.checked })}
              />
              Visible publicly at /p/{active.slug}
            </label>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted mb-1">Content (JSON blocks)</p>
              <p className="text-xs text-muted mb-2">
                Format: an array of blocks. Block types: <code>hero</code>, <code>text</code>, <code>image</code>, <code>cta</code>, <code>html</code>.
                See <code>app/(site)/p/[slug]/page.tsx</code> for the schema.
              </p>
              <textarea
                rows={16}
                value={active.content}
                onChange={(e) => setActive({ ...active, content: e.target.value })}
                className="w-full rounded-xl border border-border px-3 py-3 text-sm font-mono"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={save} disabled={pending} className="btn btn-primary">
                {pending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={remove} className="btn btn-outline text-red-500">Delete</button>
              <a href={`/p/${active.slug}`} target="_blank" className="text-sm text-muted hover:text-foreground">
                Open public page →
              </a>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-muted">
            Select or create a page on the left.
          </div>
        )}
      </section>
    </div>
  );
}
