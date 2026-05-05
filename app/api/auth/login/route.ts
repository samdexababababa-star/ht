import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, ensureBootstrapAdmin, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Email + password required." }, { status: 400 });
  }

  await ensureBootstrapAdmin().catch(() => null);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
  }
  await createSession({ uid: user.id, email: user.email, role: user.role });
  return NextResponse.json({ ok: true });
}
