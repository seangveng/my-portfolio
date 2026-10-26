import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 },
      );
    }

    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret || secret.length < 32) {
      console.error("ADMIN_SESSION_SECRET is missing or too short.");

      return NextResponse.json(
        { success: false, error: "Server authentication is not configured." },
        { status: 500 },
      );
    }

    await dbConnect();

    const admin = await Admin.findOne({ email }).select("+passwordHash");

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await new SignJWT({
      email: admin.email,
      name: admin.name,
      role: admin.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(admin._id))
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(secret));

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
    });

    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/login:", error);

    return NextResponse.json(
      { success: false, error: "Login failed due to a server error." },
      { status: 500 },
    );
  }
}
