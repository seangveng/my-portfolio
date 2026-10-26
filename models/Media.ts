import mongoose, { Schema, models, model } from "mongoose";

export type MediaType = "image" | "video";

export interface IMedia {
  name: string;
  url: string;
  type: MediaType;
  mimeType: string;
  size: number;
  altText: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    altText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  },
);

const Media = models.Media || model<IMedia>("Media", MediaSchema);

export default Media;
