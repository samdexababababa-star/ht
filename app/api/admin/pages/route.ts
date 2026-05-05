import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  return NextResponse.json({ ok: true, pages: await prisma.page.findMany({ orderBy: { updatedAt: "desc" } }) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const b = await req.json();
  const title = String(b.title ?? "Untitled").trim() || "Untitled";
  const baseSlug = slugify(b.slug || title);
  let slug = baseSlug;
  let n = 2;
  while (await prisma.page.findUnique({ where: { slug } })) slug = `${baseSlug}-${n++}`;
  const created = await prisma.page.create({
    data: {
      title,
      slug,
      kind: b.kind || "custom",
      content: typeof b.content === "string" ? b.content : JSON.stringify(b.content ?? []),
      visible: b.visible ?? true,
      seoTitle: b.seoTitle || null,
      seoDescription: b.seoDescription || null,
    },
  });
  return NextResponse.json({ ok: true, page: created });
}
