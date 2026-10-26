import dbConnect from "@/lib/dbConnect";
import ActivityLog from "@/models/ActivityLog";

export type ActivityLogInput = {
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description: string;
  status?: "success" | "failed" | "warning";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export async function createActivityLog(input: ActivityLogInput) {
  await dbConnect();

  return ActivityLog.create({
    ...input,
    action: input.action.trim(),
    description: input.description.trim(),
  });
}
