import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { safeJson } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

type Block =
  | { type: "hero"; eyebrow?: string; title: string; italicTail?: string; subtitle?: string; cta?: { label: string; href: string } }
  | { type: "text"; body: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "cta"; title: string; href: string; label: string }
  | { type: "html"; html: string };

export const revalidate = 60;

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.visible) notFound();
  const blocks = safeJson<Block[]>(page.content, []);

  return (
    <div className="max-w-4xl mx-auto px-5 pt-12 pb-20">
      {blocks.length === 0 ? (
        <article>
          <h1 className="text-4xl md:text-5xl tracking-tight">{page.title}</h1>
          <p className="mt-4 text-muted">This page has no content yet.</p>
        </article>
      ) : (
        blocks.map((b, i) => <BlockRenderer key={i} block={b} />)
      )}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return (
        <section className="my-10">
          {block.eyebrow ? (
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted mb-2">{block.eyebrow}</p>
          ) : null}
          <h1 className="text-5xl md:text-7xl tracking-tight font-medium leading-[1.05]">
            {block.title}{" "}
            {block.italicTail ? <span className="serif-italic text-primary">{block.italicTail}</span> : null}
          </h1>
          {block.subtitle ? (
            <p className="mt-5 text-lg text-muted max-w-2xl">{block.subtitle}</p>
          ) : null}
          {block.cta ? (
            <Link href={block.cta.href} className="btn btn-primary mt-6">{block.cta.label} →</Link>
          ) : null}
        </section>
      );
    case "text":
      return <p className="my-6 text-foreground/90 whitespace-pre-line">{block.body}</p>;
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={block.src} alt={block.alt || ""} className="my-8 rounded-2xl w-full" />;
    case "cta":
      return (
        <div className="my-12 card p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-2xl tracking-tight">{block.title}</p>
          <Link href={block.href} className="btn btn-blue">{block.label} →</Link>
        </div>
      );
    case "html":
      return <div className="my-6" dangerouslySetInnerHTML={{ __html: block.html }} />;
    default:
      return null;
  }
}
