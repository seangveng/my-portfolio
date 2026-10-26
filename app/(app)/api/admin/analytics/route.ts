// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import Admin from "@/models/Admin";
import ContactMessage from "@/models/Contact-Message";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

async function isAuthenticated(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return errorResponse("Unauthorized. Please sign in again.", 401);
    }

    await dbConnect();

    const now = new Date();
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    const [
      totalProjects,
      totalContacts,
      unreadContacts,
      totalAdmins,
      recentProjects,
      recentContacts,
      projectActivity,
      contactActivity,
    ] = await Promise.all([
      Project.countDocuments({}),
      ContactMessage.countDocuments({}),
      ContactMessage.countDocuments({ isRead: false }),
      Admin.countDocuments({}),
      Project.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt")
        .lean(),
      ContactMessage.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email message isRead createdAt")
        .lean(),
      Project.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo, $lte: now } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ContactMessage.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo, $lte: now } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const chartDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDaysAgo);
      date.setUTCDate(date.getUTCDate() + index);

      const key = date.toISOString().slice(0, 10);

      return {
        date: key,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        projects: projectActivity.find((item) => item._id === key)?.count ?? 0,
        contacts: contactActivity.find((item) => item._id === key)?.count ?? 0,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          overview: {
            totalProjects,
            totalContacts,
            unreadContacts,
            totalAdmins,
          },
          chartDays,
          recentProjects,
          recentContacts,
          generatedAt: now.toISOString(),
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("GET /api/admin/analytics:", error);
    return errorResponse("Failed to load analytics.", 500);
  }
}
