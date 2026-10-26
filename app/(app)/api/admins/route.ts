import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/admin-auth";
import Admin, { type AdminRole } from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function isRole(value: unknown): value is AdminRole {
  return value === "admin" || value === "editor";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function serializeAdmin(admin: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: AdminRole;
  createdAt?: Date;
}) {
  return {
    _id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt ?? null,
  };
}

// GET /api/admins
export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    await dbConnect();

    const admins = await Admin.find({})
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: admins.map((admin) => ({
        ...admin,
        _id: String(admin._id),
      })),
    });
  } catch (error) {
    console.error("GET /api/admins:", error);
    return errorResponse("Failed to load team members.", 500);
  }
}
// POST /api/admins
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;

    if (name.length < 2 || name.length > 80) {
      return errorResponse("Name must be between 2 and 80 characters.");
    }

    if (!isValidEmail(email) || email.length > 254) {
      return errorResponse("Enter a valid email address.");
    }

    if (password.length < 12 || password.length > 128) {
      return errorResponse("Password must be between 12 and 128 characters.");
    }

    if (!isRole(role)) {
      return errorResponse("Invalid permission role.");
    }

    await dbConnect();

    const existing = await Admin.findOne({ email }).select("_id");

    if (existing) {
      return errorResponse("An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email,
      passwordHash,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Team member created successfully.",
        data: serializeAdmin(admin),
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return errorResponse("An account with this email already exists.", 409);
    }

    console.error("POST /api/admins:", error);
    return errorResponse("Failed to create team member.", 500);
  }
}

// PUT /api/admins
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();

    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid team member ID.");
    }

    if (name.length < 2 || name.length > 80) {
      return errorResponse("Name must be between 2 and 80 characters.");
    }

    if (!isValidEmail(email) || email.length > 254) {
      return errorResponse("Enter a valid email address.");
    }

    if (!isRole(role)) {
      return errorResponse("Invalid permission role.");
    }

    if (password && (password.length < 12 || password.length > 128)) {
      return errorResponse(
        "New password must be between 12 and 128 characters.",
      );
    }

    await dbConnect();

    const target = await Admin.findById(id);

    if (!target) {
      return errorResponse("Team member not found.", 404);
    }

    const duplicate = await Admin.findOne({
      email,
      _id: { $ne: target._id },
    }).select("_id");

    if (duplicate) {
      return errorResponse("An account with this email already exists.", 409);
    }

    // Prevent removal of the last administrator's role.
    if (target.role === "admin" && role !== "admin") {
      const adminCount = await Admin.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return errorResponse("You cannot demote the last administrator.", 409);
      }
    }

    target.name = name;
    target.email = email;
    target.role = role;

    if (password) {
      target.passwordHash = await bcrypt.hash(password, 12);
    }

    await target.save();

    return NextResponse.json({
      success: true,
      message: "Team member updated successfully.",
      data: serializeAdmin(target),
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return errorResponse("An account with this email already exists.", 409);
    }

    console.error("PUT /api/admins:", error);
    return errorResponse("Failed to update team member.", 500);
  }
}

// DELETE /api/admins?id=<adminId>
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const id = request.nextUrl.searchParams.get("id");

    if (!id || !mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid team member ID.");
    }

    if (id === auth.session?.id) {
      return errorResponse("You cannot delete your own account.", 409);
    }

    await dbConnect();

    const target = await Admin.findById(id);

    if (!target) {
      return errorResponse("Team member not found.", 404);
    }

    if (target.role === "admin") {
      const adminCount = await Admin.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return errorResponse("You cannot delete the last administrator.", 409);
      }
    }

    await Admin.deleteOne({ _id: target._id });

    return NextResponse.json({
      success: true,
      message: "Team member deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admins:", error);
    return errorResponse("Failed to delete team member.", 500);
  }
}
