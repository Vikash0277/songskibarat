import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";
import { jsonError, jsonOk, rateLimit, clientIp } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(128),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`register:${clientIp(req)}`, 10, 300);
  if (!rl.success) {
    return jsonError("Too many attempts. Try again later.", 429);
  }

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return jsonError("Invalid input.", 400);
  }

  await connectDb();
  const { name, email, password } = body.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return jsonError("An account with this email already exists.", 409);
  }

  const user = await User.create({ name, email, passwordHash: hashPassword(password) });
  const token = await signToken({ userId: user.id, email: user.email, role: user.role });

  return jsonOk(
    {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
    201
  );
}
