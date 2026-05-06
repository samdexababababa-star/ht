export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border bg-white">
      <div className="marquee-track flex gap-12 py-4 whitespace-nowrap">
        {doubled.map((label, i) => (
          <span
            key={i}
            className="text-sm tracking-wide text-muted flex items-center gap-3"
          >
            <span className="h-1 w-1 rounded-full bg-primary" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
