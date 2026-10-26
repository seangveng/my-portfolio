import { NextRequest, NextResponse } from "next/server";
import connectDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  siteName: "My Portfolio",
  siteDescription: "My personal portfolio website",
  logoUrl: "",
  contactEmail: "",
  phone: "",
  address: "Cambodia",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  githubUrl: "",
  maintenanceMode: false,
  heroTitle: "សូមស្វាគមន៍! ខ្ញុំឈ្មោះ ស៊ូ ស៊ាងវេង គឺជាអ្នកអភិវឌ្ឍន៍គេហទំព័រ។",
  heroDescription:
    "I'm a Full Stack Developer focused on creating modern, responsive and scalable web applications with great user experiences.",
  developerTitle: "Full Stack Developer",
  profileImageUrl: "/images/veng.jpg",
  linkedinUrl: "",
};

const TEXT_FIELDS = [
  "siteName",
  "siteDescription",
  "logoUrl",
  "contactEmail",
  "phone",
  "address",
  "facebookUrl",
  "instagramUrl",
  "tiktokUrl",
  "githubUrl",
  "heroTitle",
  "heroDescription",
  "developerTitle",
  "profileImageUrl",
  "linkedinUrl",
] as const;

type TextField = (typeof TEXT_FIELDS)[number];

function isValidUrl(value: string) {
  if (!value) return true;

  if (value.startsWith("/")) {
    return !value.startsWith("//");
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validSettingsInput(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDatabase();

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      success: true,
      settings,
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
    await requireAdmin();

    const body: unknown = await request.json();

    if (!validSettingsInput(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const update: Partial<Record<TextField, string>> = {};

    for (const field of TEXT_FIELDS) {
      if (body[field] === undefined) continue;

      if (typeof body[field] !== "string") {
        return NextResponse.json(
          { success: false, message: `${field} must be text.` },
          { status: 400 },
        );
      }

      const value = body[field].trim();

      if (value.length > 2000) {
        return NextResponse.json(
          { success: false, message: `${field} is too long.` },
          { status: 400 },
        );
      }

      update[field] = value;
    }

    if (
      update.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.contactEmail)
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid contact email." },
        { status: 400 },
      );
    }

    const urlFields: TextField[] = [
      "logoUrl",
      "profileImageUrl",
      "facebookUrl",
      "instagramUrl",
      "tiktokUrl",
      "githubUrl",
      "linkedinUrl",
    ];

    for (const field of urlFields) {
      const value = update[field];

      if (value && !isValidUrl(value)) {
        return NextResponse.json(
          { success: false, message: `Invalid URL for ${field}.` },
          { status: 400 },
        );
      }
    }

    const mongoUpdate: Record<string, unknown> = { ...update };

    if (body.maintenanceMode !== undefined) {
      if (typeof body.maintenanceMode !== "boolean") {
        return NextResponse.json(
          { success: false, message: "maintenanceMode must be true or false." },
          { status: 400 },
        );
      }

      mongoUpdate.maintenanceMode = body.maintenanceMode;
    }

    await connectDatabase();

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: mongoUpdate,
        $setOnInsert: DEFAULT_SETTINGS,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

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
