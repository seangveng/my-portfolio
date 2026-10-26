import mongoose, { Schema, model, models } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    actorId: {
      type: String,
      default: null,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    actorEmail: {
      type: String,
      default: "",
      trim: true,
      maxlength: 254,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    entityType: {
      type: String,
      default: "system",
      trim: true,
      maxlength: 100,
    },
    entityId: {
      type: String,
      default: "",
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["success", "failed", "warning"],
      default: "success",
      index: true,
    },
    ipAddress: {
      type: String,
      default: "",
      maxlength: 100,
    },
    userAgent: {
      type: String,
      default: "",
      maxlength: 500,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({
  actorName: "text",
  actorEmail: "text",
  action: "text",
  description: "text",
});

const ActivityLog =
  models.ActivityLog || model("ActivityLog", ActivityLogSchema);

export default ActivityLog;
