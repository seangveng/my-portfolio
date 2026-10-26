import { NextRequest, NextResponse } from "next/server";
import SiteSettings from "@/models/SiteSettings";
import { requireAdmin } from "@/lib/admin-auth";
import connectDatabase from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const allowedFields = [
  "siteName",
  "siteDescription",
  "logoUrl",
  "contactEmail",
  "phone",
  "address",
  "facebookUrl",
  "instagramUrl",
  "tiktokUrl",
  "maintenanceMode",
  "heroTitle",
  "heroDescription",
  "developerTitle",
  "profileImageUrl",
  "linkedinUrl",
  "githubUrl",
] as const;

type AllowedField = (typeof allowedFields)[number];

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateSettings(input: Record<string, unknown>): {
  update: Partial<Record<AllowedField, unknown>>;
  error?: string;
} {
  const update: Partial<Record<AllowedField, unknown>> = {};

  for (const field of allowedFields) {
    if (!(field in input)) continue;

    const value = input[field];

    if (field === "maintenanceMode") {
      if (typeof value !== "boolean") {
        return {
          update,
          error: "maintenanceMode must be a boolean.",
        };
      }

      update[field] = value;
      continue;
    }

    if (typeof value !== "string") {
      return {
        update,
        error: `${field} must be a string.`,
      };
    }

    const trimmed = value.trim();

    if (trimmed.length > 5000) {
      return {
        update,
        error: `${field} is too long.`,
      };
    }

    // Optional URL fields can be empty.
    const urlFields: AllowedField[] = [
      "logoUrl",
      "profileImageUrl",
      "facebookUrl",
      "instagramUrl",
      "tiktokUrl",
      "linkedinUrl",
      "githubUrl",
    ];

    if (urlFields.includes(field) && trimmed !== "") {
      if (!isValidUrl(trimmed)) {
        return {
          update,
          error: `${field} must be a valid HTTP or HTTPS URL.`,
        };
      }
    }

    update[field] = trimmed;
  }

  if (Object.keys(update).length === 0) {
    return {
      update,
      error: "No valid settings fields were provided.",
    };
  }

  return { update };
}

export async function GET() {
  try {
    // This route is for authenticated admin settings.
    // Adapt this line if requireAdmin returns a NextResponse
    // instead of throwing when authorization fails.
    await requireAdmin();

    await connectDatabase();

    const settings = await SiteSettings.findOne({}).lean().exec();

    return NextResponse.json({
      success: true,
      settings: settings ?? {},
    });
  } catch (error) {
    console.error("GET admin settings error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Confirm that this matches the return behavior of your
    // existing requireAdmin() helper.
    await requireAdmin();

    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { update: mongoUpdate, error } = validateSettings(
      body as Record<string, unknown>,
    );

    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    }

    await connectDatabase();

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: mongoUpdate },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    )
      .lean()
      .exec();

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
      settings,
    });
  } catch (error) {
    console.error("PUT admin settings error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save settings." },
      { status: 500 },
    );
  }
}
