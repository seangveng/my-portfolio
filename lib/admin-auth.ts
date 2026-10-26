import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { AdminRole } from "@/models/Admin";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

const COOKIE_NAME = "admin_session";

function getSecret(): Uint8Array | null {
  const value = process.env.ADMIN_SESSION_SECRET;

  if (!value || value.length < 32) {
    console.error(
      "ADMIN_SESSION_SECRET must be configured with at least 32 characters.",
    );
    return null;
  }

  return new TextEncoder().encode(value);
}

async function verifyToken(
  token: string | undefined,
): Promise<AdminSession | null> {
  if (!token) return null;

  const secret = getSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "admin" && payload.role !== "editor")
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch (error) {
    console.error(
      "Admin session verification failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function getAdminSessionFromRequest(
  request: Request,
): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    return verifyToken(
      decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)),
    );
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return {
      session: null,
      response: Response.json(
        { success: false, error: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  if (session.role !== "admin") {
    return {
      session: null,
      response: Response.json(
        { success: false, error: "Administrator access required." },
        { status: 403 },
      ),
    };
  }

  return { session, response: null };
}
