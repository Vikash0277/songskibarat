import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";
import { jsonError, jsonOk, rateLimit, clientIp } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`login:${clientIp(req)}`, 10, 300);
  if (!rl.success) {
    return jsonError("Too many attempts. Try again later.", 429);
  }

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return jsonError("Invalid input.", 400);
  }

  await connectDb();
  const { email, password } = body.data;

  const user = await User.findOne({ email });
  if (!user || !comparePassword(password, user.passwordHash)) {
    return jsonError("Invalid email or password.", 401);
  }

  const token = await signToken({ userId: user.id, email: user.email, role: user.role });

  return jsonOk({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
