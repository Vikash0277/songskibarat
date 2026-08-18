import { NextResponse } from "next/server";

const BASE = 1000;
const STALE_MS = 30_000;

declare global {
  var __onlineClients: Map<string, number> | undefined;
}

function getClients(): Map<string, number> {
  if (!globalThis.__onlineClients) {
    globalThis.__onlineClients = new Map();
  }
  return globalThis.__onlineClients;
}

export async function GET() {
  const clients = getClients();
  const now = Date.now();
  for (const [id, lastSeen] of clients) {
    if (now - lastSeen > STALE_MS) clients.delete(id);
  }
  return NextResponse.json({ online: BASE + clients.size });
}

export async function POST(req: Request) {
  const clients = getClients();
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id;
  if (typeof id === "string" && id.length > 0 && id.length <= 128) {
    clients.set(id, Date.now());
  }
  return NextResponse.json({ online: BASE + clients.size });
}
