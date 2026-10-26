import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { createActivityLog } from "@/lib/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!token || !secret) return false;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    return (
      typeof payload.email === "string" &&
      ["admin", "editor"].includes(String(payload.role))
    );
  } catch {
    return false;
  }
}

// --------------------------------------------------
// ACTIVITY LOGGING
// --------------------------------------------------

type ProjectActivityAction =
  | "CREATE_PROJECT"
  | "UPDATE_PROJECT"
  | "DELETE_PROJECT";

async function recordProjectActivity(
  request: NextRequest,
  action: ProjectActivityAction,
  projectId: string,
  projectTitle: string,
  updatedFields?: string[],
) {
  try {
    const token = request.cookies.get("admin_session")?.value;
    const secret = process.env.ADMIN_SESSION_SECRET;

    let actorId: string | undefined;
    let actorEmail: string | undefined;
    let actorName: string | undefined;

    if (token && secret) {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
      );

      actorId = payload.sub;
      actorEmail =
        typeof payload.email === "string" ? payload.email : undefined;

      // Use the name claim if your session token contains one.
      // Otherwise, use the admin's email as the display name.
      actorName =
        typeof payload.name === "string"
          ? payload.name
          : (actorEmail ?? "Admin");
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    await createActivityLog({
      actorId,
      actorName,
      actorEmail,
      action,
      entityType: "project",
      entityId: projectId,
      description: `${action.replaceAll("_", " ")}: ${projectTitle}`,
      status: "success",
      ipAddress,
      userAgent: request.headers.get("user-agent") || undefined,
      ...(updatedFields
        ? {
            metadata: {
              updatedFields,
            },
          }
        : {}),
    });
  } catch (error) {
    // Do not undo a successful project operation if logging fails.
    console.error(`Failed to record ${action} activity:`, error);
  }
}

// --------------------------------------------------
// ERROR RESPONSE
// --------------------------------------------------

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

// --------------------------------------------------
// GET /api/projects
// Public: fetch all projects.
// --------------------------------------------------

export async function GET() {
  try {
    await dbConnect();

    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        data: projects,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/projects:", error);

    return errorResponse("Failed to load projects.", 500);
  }
}

// --------------------------------------------------
// POST /api/projects
// Authenticated: create a project and log the event.
// --------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return errorResponse("Unauthorized. Please sign in again.", 401);
    }

    const body = await request.json();

    const { title, description, tags, liveUrl, githubUrl, image } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return errorResponse("Title and description are required.", 400);
    }

    // Normalize tags.
    const formattedTags: string[] = Array.isArray(tags)
      ? tags
          .filter((tag: unknown): tag is string => typeof tag === "string")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      : typeof tags === "string"
        ? tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];

    const projectImage =
      typeof image === "string" && image.trim()
        ? image
        : "/images/my-photo.jpg";

    // Validate Base64 images and limit their size.
    if (projectImage.startsWith("data:")) {
      const match = projectImage.match(
        /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/,
      );

      if (!match) {
        return errorResponse(
          "Upload a valid PNG, JPG, WEBP, or GIF image.",
          400,
        );
      }

      const base64Content = match[2].replace(/\s/g, "");
      const approximateBytes = Math.floor((base64Content.length * 3) / 4);

      if (approximateBytes > 5 * 1024 * 1024) {
        return errorResponse("Please use an image smaller than 5 MB.", 400);
      }
    }

    await dbConnect();

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      tags: formattedTags,
      liveUrl:
        typeof liveUrl === "string" && liveUrl.trim() ? liveUrl.trim() : "#",
      githubUrl:
        typeof githubUrl === "string" && githubUrl.trim()
          ? githubUrl.trim()
          : "#",
      image: projectImage,
    });

    // Log successful project creation.
    await recordProjectActivity(
      request,
      "CREATE_PROJECT",
      project._id.toString(),
      project.title,
    );

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("POST /api/projects:", error);

    return errorResponse("Failed to publish project.", 500);
  }
}

// --------------------------------------------------
// PUT /api/projects
// Authenticated: update a project and log the event.
// --------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return errorResponse("Unauthorized. Please sign in again.", 401);
    }

    const body = await request.json();

    const { id, title, description, tags, liveUrl, githubUrl, image } = body;

    // Validate project ID.
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      return errorResponse("A valid project ID is required.", 400);
    }

    // Validate required fields.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return errorResponse("Title and description are required.", 400);
    }

    // Normalize tags.
    const formattedTags: string[] = Array.isArray(tags)
      ? tags
          .filter((tag: unknown): tag is string => typeof tag === "string")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      : typeof tags === "string"
        ? tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];

    // Preserve the existing image if no new image was provided.
    let projectImage: string | undefined;

    if (image === undefined || image === null || image === "") {
      projectImage = undefined;
    } else if (typeof image === "string") {
      projectImage = image;
    } else {
      return errorResponse("Invalid project image.", 400);
    }

    // Validate uploaded Base64 images.
    if (projectImage?.startsWith("data:")) {
      const match = projectImage.match(
        /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/,
      );

      if (!match) {
        return errorResponse(
          "Upload a valid PNG, JPG, WEBP, or GIF image.",
          400,
        );
      }

      const base64Content = match[2].replace(/\s/g, "");
      const approximateBytes = Math.floor((base64Content.length * 3) / 4);

      if (approximateBytes > 5 * 1024 * 1024) {
        return errorResponse("Please use an image smaller than 5 MB.", 400);
      }
    }

    await dbConnect();

    // Build the update data.
    const updateData: {
      title: string;
      description: string;
      tags: string[];
      liveUrl: string;
      githubUrl: string;
      image?: string;
    } = {
      title: title.trim(),
      description: description.trim(),
      tags: formattedTags,
      liveUrl:
        typeof liveUrl === "string" && liveUrl.trim() ? liveUrl.trim() : "#",
      githubUrl:
        typeof githubUrl === "string" && githubUrl.trim()
          ? githubUrl.trim()
          : "#",
    };

    // Only change the image when a new image is supplied.
    if (projectImage !== undefined) {
      updateData.image = projectImage;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedProject) {
      return errorResponse("Project not found.", 404);
    }

    // Log successful project update.
    await recordProjectActivity(
      request,
      "UPDATE_PROJECT",
      updatedProject._id.toString(),
      updatedProject.title,
      Object.keys(updateData),
    );

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully.",
        data: updatedProject,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("PUT /api/projects:", error);

    return errorResponse("Failed to update project.", 500);
  }
}

// --------------------------------------------------
// DELETE /api/projects?id=PROJECT_ID
// Authenticated: delete a project and log the event.
// --------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return errorResponse("Unauthorized. Please sign in again.", 401);
    }

    const id = request.nextUrl.searchParams.get("id");

    if (!id || !mongoose.isValidObjectId(id)) {
      return errorResponse("A valid project ID is required.", 400);
    }

    await dbConnect();

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return errorResponse("Project not found.", 404);
    }

    // Log successful project deletion.
    await recordProjectActivity(
      request,
      "DELETE_PROJECT",
      deletedProject._id.toString(),
      deletedProject.title,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Project deleted successfully.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("DELETE /api/projects:", error);

    return errorResponse("Failed to delete project.", 500);
  }
}
