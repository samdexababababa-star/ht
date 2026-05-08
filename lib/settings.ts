import { prisma } from "./db";
import type { Setting } from "@/app/generated/prisma/client";

// Re-export the content defaults from a Prisma-free module so client
// components can import them without dragging the SQLite adapter into
// the browser bundle (better-sqlite3 has a Node-only runtime).
export { SETTING_DEFAULTS, PRODUCT_DEFAULTS } from "./content-defaults";

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
