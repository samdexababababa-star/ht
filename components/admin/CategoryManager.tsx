"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Cat = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  visible: boolean;
  parentId: string | null;
};

export function CategoryManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [cats, setCats] = useState(initial);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✱");
  const [pending, start] = useTransition();

  function create() {
    if (!name.trim()) return;
    start(async () => {
      const r = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });
      if (r.ok) {
        const json = await r.json();
        setCats((c) => [...c, json.category]);
        setName("");
        router.refresh();
      }
    });
  }

  function update(id: string, data: Partial<Cat>) {
    setCats((c) => c.map((x) => (x.id === id ? { ...x, ...data } : x)));
    fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => router.refresh());
  }

  function remove(id: string) {
    if (!confirm("Delete this category? Products will become uncategorized.")) return;
    setCats((c) => c.filter((x) => x.id !== id));
    fetch(`/api/admin/categories/${id}`, { method: "DELETE" }).then(() => router.refresh());
  }

  return (
    <div>
      <div className="card p-5 flex flex-wrap gap-2 items-end mb-6">
        <label className="flex-1 min-w-[200px]">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Streaming"
            className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:border-foreground"
          />
        </label>
        <label className="w-24">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Icon</span>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:border-foreground"
          />
        </label>
        <button type="button" disabled={pending} onClick={create} className="btn btn-primary">
          + Add category
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-2 text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="text-left p-3">Icon</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Visible</th>
              <th className="text-right p-3">Order</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">
                  <input
                    value={c.icon ?? ""}
                    onChange={(e) => update(c.id, { icon: e.target.value })}
                    className="w-12 h-8 rounded-lg border border-border px-2 text-sm"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={c.name}
                    onChange={(e) => update(c.id, { name: e.target.value })}
                    className="w-full h-8 rounded-lg border border-border px-2 text-sm"
                  />
                </td>
                <td className="p-3 text-muted">{c.slug}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={c.visible}
                    onChange={(e) => update(c.id, { visible: e.target.checked })}
                  />
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    value={c.order}
                    onChange={(e) => update(c.id, { order: Number(e.target.value) })}
                    className="w-16 h-8 rounded-lg border border-border px-2 text-sm text-right"
                  />
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(c.id)} className="text-xs text-muted hover:text-red-500">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {cats.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted">No categories yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
