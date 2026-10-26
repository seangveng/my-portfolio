import { NextRequest, NextResponse } from "next/server";
import connectDatabase from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedStatuses = ["success", "failed", "warning"] as const;

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDatabase();

    console.log("Activity Logs API DB:", ActivityLog.db.name);
    console.log("Activity Logs API Collection:", ActivityLog.collection.name);
    console.log("Activity Logs Total:", await ActivityLog.countDocuments({}));

    const params = request.nextUrl.searchParams;

    const search = (params.get("search") ?? "").trim().slice(0, 150);
    const action = (params.get("action") ?? "").trim().slice(0, 100);
    const status = params.get("status") ?? "";
    const from = parseDate(params.get("from"));
    const to = parseDate(params.get("to"));

    const requestedPage = Number(params.get("page") ?? "1");
    const requestedLimit = Number(params.get("limit") ?? "10");

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? Math.floor(requestedPage)
        : 1;

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 10;

    if (params.has("from") && !from) {
      return NextResponse.json(
        { success: false, message: "Invalid start date." },
        { status: 400 },
      );
    }

    if (params.has("to") && !to) {
      return NextResponse.json(
        { success: false, message: "Invalid end date." },
        { status: 400 },
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "'from' must be before 'to'.",
        },
        { status: 400 },
      );
    }

    if (
      status &&
      !allowedStatuses.includes(status as (typeof allowedStatuses)[number])
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid status filter." },
        { status: 400 },
      );
    }

    const filter: Record<string, unknown> = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { actorName: regex },
        { actorEmail: regex },
        { action: regex },
        { description: regex },
        { entityType: regex },
        { entityId: regex },
      ];
    }

    if (action) filter.action = action;
    if (status) filter.status = status;

    if (from || to) {
      const createdAt: Record<string, Date> = {};

      if (from) createdAt.$gte = from;
      if (to) createdAt.$lte = to;

      filter.createdAt = createdAt;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .select(
          "actorId actorName actorEmail action entityType entityId description status ipAddress userAgent metadata createdAt",
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      ActivityLog.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("GET activity logs error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load activity logs.",
      },
      { status: 500 },
    );
  }
}
