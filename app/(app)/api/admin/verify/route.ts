import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

import connectDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { createActivityLog } from "@/lib/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getClientIp(request: NextRequest): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}

async function recordLoginActivity(input: {
  actorId?: string;
  actorName?: string;
  actorEmail: string;
  description: string;
  status: "success" | "failed";
  request: NextRequest;
}) {
  try {
    await createActivityLog({
      actorId: input.actorId,
      actorName: input.actorName,
      actorEmail: input.actorEmail,
      action: "login",
      entityType: "admin",
      entityId: input.actorId,
      description: input.description,
      status: input.status,
      ipAddress: getClientIp(input.request),
      userAgent: input.request.headers.get("user-agent") || undefined,
    });
  } catch (error) {
    // A logging failure should not interrupt authentication.
    console.error("Failed to record login activity:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 },
      );
    }

    const admin = await Admin.findOne({ email });

    // Use a generic message to avoid revealing whether an email exists.
    if (!admin) {
      await recordLoginActivity({
        actorEmail: email,
        description: "Failed admin login attempt",
        status: "failed",
        request,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      await recordLoginActivity({
        actorId: admin._id.toString(),
        actorName: admin.name,
        actorEmail: admin.email,
        description: "Failed admin login attempt",
        status: "failed",
        request,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret) {
      // console.error("ADMIN_SESSION_SECRET is not configured.");

      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error.",
        },
        { status: 500 },
      );
    }

    // Create a session token consistent with the admin_session cookie.
    const token = await new SignJWT({
      email: admin.email,
      role: admin.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(admin._id.toString())
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(secret));

    // Record a successful login after password verification.
    await recordLoginActivity({
      actorId: admin._id.toString(),
      actorName: admin.name,
      actorEmail: admin.email,
      description: "Admin logged in successfully",
      status: "success",
      request,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process login.",
      },
      { status: 500 },
    );
  }
}
