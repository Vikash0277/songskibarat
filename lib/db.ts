import mongoose from "mongoose";

declare global {
  var __songskibaratMongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = globalThis.__songskibaratMongoose ?? (globalThis.__songskibaratMongoose = { conn: null, promise: null });

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
