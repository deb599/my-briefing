import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const KEY = "briefing_count";

// GET — return current count
export async function GET() {
  try {
    const count = (await kv.get<number>(KEY)) || 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST — increment and return new count
export async function POST() {
  try {
    const count = await kv.incr(KEY);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
