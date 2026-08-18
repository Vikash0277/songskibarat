import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { jsonError, jsonOk, requireUser } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth) return jsonError("Not authenticated.", 401);

  await connectDb();
  const user = await User.findById(auth.userId).select("name email role");
  if (!user) return jsonError("User not found.", 404);

  return jsonOk({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
