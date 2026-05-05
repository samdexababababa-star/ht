import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const COOKIE_NAME = "soha_admin";

function getSecret() {
  const secret = process.env.AUTH_SECRET || "dev-only-change-me-in-production";
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  uid: string;
  email: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Bootstrap a default admin if no users exist.
 * Returns the credentials used so they can be displayed to the operator on first run.
 */
export async function ensureBootstrapAdmin() {
  const count = await prisma.user.count();
  if (count > 0) return null;

  const email = process.env.ADMIN_EMAIL || "admin@soha.local";
  const password = process.env.ADMIN_PASSWORD || "soha-admin";
  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { email, passwordHash, role: "admin", name: "Admin" },
  });
  return { email, password };
}
