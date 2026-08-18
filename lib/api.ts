import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { Ratelimit } from "@upstash/ratelimit";
import { connectDb } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { verifyToken, type AuthUser } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  status = 200
) {
  return Response.json({ success: true, ...data }, { status });
}

export function isValidObjectId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export async function requireUser(req: NextRequest): Promise<AuthUser | null> {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const user = await verifyToken(token);
  return user;
}

const rateLimiters = new Map<string, Ratelimit>();

export async function rateLimit(
  identifier: string,
  limit = 20,
  windowSeconds = 60
): Promise<{ success: boolean }> {
  const redis = getRedis();
  if (!redis) return { success: true };
  const key = `${identifier}:${limit}:${windowSeconds}`;
  let limiter = rateLimiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    });
    rateLimiters.set(key, limiter);
  }
  const result = await limiter.limit(identifier);
  return { success: result.success };
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-client"
  );
}

export async function withDb(): Promise<typeof mongoose> {
  return connectDb();
}
