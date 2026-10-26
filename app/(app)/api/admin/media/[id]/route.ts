import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import Media from "@/models/Media";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "media");

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid media ID." },
        { status: 400 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const update: { name?: string; altText?: string } = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          { success: false, message: "Name cannot be empty." },
          { status: 400 },
        );
      }

      update.name = name;
    }

    if (typeof body.altText === "string") {
      update.altText = body.altText.trim();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update." },
        { status: 400 },
      );
    }

    const media = await Media.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!media) {
      return NextResponse.json(
        { success: false, message: "Media not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Media updated successfully.",
      media,
    });
  } catch (error) {
    console.error("PATCH /api/admin/media/[id] failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update media." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid media ID." },
        { status: 400 },
      );
    }

    await dbConnect();

    const media = await Media.findById(id);

    if (!media) {
      return NextResponse.json(
        { success: false, message: "Media not found." },
        { status: 404 },
      );
    }

    // Only delete files stored in this application's media upload folder.
    const url = typeof media.url === "string" ? media.url : "";

    if (url.startsWith("/uploads/media/")) {
      const fileName = path.basename(url);
      const filePath = path.resolve(UPLOAD_DIR, fileName);

      if (fileName && filePath.startsWith(`${UPLOAD_DIR}${path.sep}`)) {
        await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== "ENOENT") {
            throw error;
          }
        });
      }
    }

    await Media.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/media/[id] failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete media." },
      { status: 500 },
    );
  }
}
