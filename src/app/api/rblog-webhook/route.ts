import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

// RBlog's change webhook (docs/api.md, "Webhook"): verify, then revalidate every tag and path.

type Event = { tags?: string[]; paths?: { old?: string[]; new?: string[] } };

const MAX_SKEW_SECONDS = 300;

// Event ids already handled. One instance only: use Redis/KV with a TTL when running several.
const seen = new Set<string>();

export async function POST(req: Request) {
  const secret = process.env.RBLOG_WEBHOOK_SECRET;
  if (!secret) return new Response("webhook not configured", { status: 503 });

  const id = req.headers.get("x-rblog-event-id") ?? "";
  const ts = req.headers.get("x-rblog-timestamp") ?? "";
  const sig = req.headers.get("x-rblog-signature") ?? "";
  const body = Buffer.from(await req.arrayBuffer());

  // Verify the raw bytes before parsing anything.
  const expected = createHmac("sha256", secret).update(`${ts}.${id}.`).update(body).digest();
  const given = Buffer.from(sig, "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return new Response("bad signature", { status: 401 });
  }
  if (!/^\d+$/.test(ts) || Math.abs(Date.now() / 1000 - Number(ts)) > MAX_SKEW_SECONDS) {
    return new Response("stale", { status: 401 });
  }
  if (seen.has(id)) return new Response(null, { status: 204 });

  let event: Event;
  try {
    event = JSON.parse(body.toString("utf8"));
  } catch {
    return new Response("bad body", { status: 400 });
  }

  // Expire at once rather than serve stale: an author who just published expects to see it.
  for (const tag of event.tags ?? []) revalidateTag(tag, { expire: 0 });
  for (const path of [...(event.paths?.old ?? []), ...(event.paths?.new ?? [])]) {
    if (path.startsWith("/")) revalidatePath(path);
  }

  seen.add(id);
  if (seen.size > 5000) seen.delete(seen.values().next().value!);
  return new Response(null, { status: 204 });
}
