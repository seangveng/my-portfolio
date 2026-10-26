import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import dbConnect from "@/lib/dbConnect";
import Media from "@/models/Media";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media");

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

function detectFileType(buffer: Buffer): string | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  if (
    buffer.length >= 6 &&
    (buffer.toString("ascii", 0, 6) === "GIF87a" ||
      buffer.toString("ascii", 0, 6) === "GIF89a")
  ) {
    return "image/gif";
  }

  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    return "video/mp4";
  }

  if (
    buffer.length >= 4 &&
    buffer.toString("ascii", 0, 4) === "\x1a\x45\xdf\xa3"
  ) {
    return "video/webm";
  }

  return null;
}

function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };

  return extensions[mimeType] ?? "";
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() ?? "";
    const type = searchParams.get("type") ?? "all";

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { altText: { $regex: search, $options: "i" } },
        { mimeType: { $regex: search, $options: "i" } },
      ];
    }

    if (type === "image" || type === "video") {
      filter.type = type;
    }

    const [media, total, images, videos, sizeResult] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).lean(),
      Media.countDocuments(),
      Media.countDocuments({ type: "image" }),
      Media.countDocuments({ type: "video" }),
      Media.aggregate([
        { $group: { _id: null, totalSize: { $sum: "$size" } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      media,
      stats: {
        total,
        images,
        videos,
        totalSize: sizeResult[0]?.totalSize ?? 0,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/media failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load media." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file");
    const nameValue = formData.get("name");
    const altTextValue = formData.get("altText");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select a file." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, message: "The selected file is empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Maximum file size is 10 MB." },
        { status: 413 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file type." },
        { status: 415 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedType = detectFileType(buffer);

    if (!detectedType || detectedType !== file.type) {
      return NextResponse.json(
        { success: false, message: "File content does not match its type." },
        { status: 415 },
      );
    }

    const fileName = `${randomUUID()}${getExtension(detectedType)}`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, fileName), buffer, {
      flag: "wx",
    });

    const type = detectedType.startsWith("image/") ? "image" : "video";
    const url = `/uploads/media/${fileName}`;

    try {
      const media = await Media.create({
        name:
          typeof nameValue === "string" && nameValue.trim()
            ? nameValue.trim()
            : file.name,
        url,
        type,
        mimeType: detectedType,
        size: file.size,
        altText: typeof altTextValue === "string" ? altTextValue.trim() : "",
      });

      return NextResponse.json(
        { success: true, message: "Media uploaded successfully.", media },
        { status: 201 },
      );
    } catch (error) {
      const { unlink } = await import("node:fs/promises");

      await unlink(path.join(UPLOAD_DIR, fileName)).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error("POST /api/admin/media failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to upload media." },
      { status: 500 },
    );
  }
}
