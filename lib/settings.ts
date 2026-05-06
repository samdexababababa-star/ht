import { prisma } from "./db";
import type { Setting } from "@/app/generated/prisma/client";

/**
 * Single-row settings model. We use an upsert so concurrent renders during
 * `next build` (which prerender many pages in parallel) don't race on the
 * unique constraint.
 */
export async function getSettings(): Promise<Setting> {
  return prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

export async function updateSettings(data: Partial<Setting>): Promise<Setting> {
  return prisma.setting.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
}
