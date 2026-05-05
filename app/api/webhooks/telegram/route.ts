import { NextResponse } from "next/server";

/**
 * Stub for inbound Telegram updates. Wire this up later if you switch from
 * polling (auto-detect) to Telegram webhook mode.
 */
export async function POST() {
  return NextResponse.json({ ok: true });
}
