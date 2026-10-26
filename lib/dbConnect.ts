import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured in .env.local");
}

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

const cached = (globalThis.mongooseCache ??= {
  conn: null,
  promise: null,
});

export default async function dbConnect() {
  // Reuse an active connection.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Clear stale connection references.
  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}
