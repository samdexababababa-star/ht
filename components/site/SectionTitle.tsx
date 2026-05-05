export function SectionTitle({
  eyebrow,
  title,
  italicTail,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  italicTail?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow ? (
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted mb-2">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl md:text-4xl tracking-tight font-medium">
        {title}{" "}
        {italicTail ? (
          <span className="serif-italic text-primary">{italicTail}</span>
        ) : null}
      </h2>
    </div>
  );
}
