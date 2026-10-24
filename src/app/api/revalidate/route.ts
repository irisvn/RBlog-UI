import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { ALL } from "@/lib/rblog";

// Clears every cached RBlog answer at once: run it after configuring the webhook, since RBlog
// never replays events recorded while no URL was set (frontend guide §10, §14).
//   curl -X POST -H "Authorization: Bearer $RBLOG_WEBHOOK_SECRET" http://localhost:3000/api/revalidate
export async function POST(req: Request) {
  const secret = process.env.RBLOG_WEBHOOK_SECRET;
  if (!secret) return new Response("not configured", { status: 503 });

  const given = Buffer.from(req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "");
  const expected = Buffer.from(secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return new Response("unauthorized", { status: 401 });
  }

  revalidateTag(ALL, { expire: 0 });
  return new Response(null, { status: 204 });
}
