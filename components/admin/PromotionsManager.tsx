"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Promo = {
  id: string;
  code: string | null;
  title: string;
  description: string | null;
  type: string;
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  uses: number;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
  active: boolean;
  bannerText: string | null;
};

export function PromotionsManager({ initial }: { initial: Promo[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState({ title: "", code: "", type: "percent", value: 10 });

  function create() {
    if (!draft.title.trim()) return;
    start(async () => {
      const r = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (r.ok) {
        const j = await r.json();
        setList((p) => [j.promotion, ...p]);
        setDraft({ title: "", code: "", type: "percent", value: 10 });
        router.refresh();
      }
    });
  }

  function update(id: string, data: Partial<Promo>) {
    setList((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
    fetch(`/api/admin/promotions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => router.refresh());
  }

  function remove(id: string) {
    if (!confirm("Delete this promotion?")) return;
    setList((p) => p.filter((x) => x.id !== id));
    fetch(`/api/admin/promotions/${id}`, { method: "DELETE" }).then(() => router.refresh());
  }

  return (
    <div>
      <div className="card p-5 grid md:grid-cols-5 gap-2 mb-6">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Title"
          className="h-10 rounded-xl border border-border px-3 text-sm"
        />
        <input
          value={draft.code}
          onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
          placeholder="CODE"
          className="h-10 rounded-xl border border-border px-3 text-sm uppercase"
        />
        <select
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          className="h-10 rounded-xl border border-border px-3 text-sm"
        >
          <option value="percent">Percent</option>
          <option value="fixed">Fixed (cents)</option>
        </select>
        <input
          type="number"
          value={draft.value}
          onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
          placeholder="Value"
          className="h-10 rounded-xl border border-border px-3 text-sm"
        />
        <button type="button" disabled={pending} onClick={create} className="btn btn-primary">
          + Create promotion
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-2 text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="text-left p-3">Active</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Type</th>
              <th className="text-right p-3">Value</th>
              <th className="text-right p-3">Uses</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={(e) => update(p.id, { active: e.target.checked })}
                  />
                </td>
                <td className="p-3">
                  <input
                    value={p.title}
                    onChange={(e) => update(p.id, { title: e.target.value })}
                    className="w-full h-8 rounded-lg border border-border px-2 text-sm"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={p.code ?? ""}
                    onChange={(e) => update(p.id, { code: e.target.value.toUpperCase() })}
                    className="w-32 h-8 rounded-lg border border-border px-2 text-sm uppercase"
                  />
                </td>
                <td className="p-3">{p.type}</td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    value={p.value}
                    onChange={(e) => update(p.id, { value: Number(e.target.value) })}
                    className="w-20 h-8 rounded-lg border border-border px-2 text-sm text-right"
                  />
                </td>
                <td className="p-3 text-right text-muted">{p.uses}</td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(p.id)} className="text-xs text-muted hover:text-red-500">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted">No promotions yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
