import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  return NextResponse.json({
    ok: true,
    categories: await prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
  });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ ok: false, message: "Name required" }, { status: 400 });
  const baseSlug = slugify(body.slug || name);
  let slug = baseSlug;
  let n = 2;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }
  const created = await prisma.category.create({
    data: {
      name,
      slug,
      description: body.description || null,
      icon: body.icon || null,
      image: body.image || null,
      parentId: body.parentId || null,
      order: Number(body.order ?? 0),
      visible: body.visible ?? true,
    },
  });
  return NextResponse.json({ ok: true, category: created });
}
