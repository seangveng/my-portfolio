import mongoose, { Schema, type Model } from "mongoose";

export type AdminRole = "admin" | "editor";

export interface IAdmin {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "editor"],
      default: "editor",
      required: true,
    },
  },
  { timestamps: true },
);

const Admin: Model<IAdmin> =
  (mongoose.models.Admin as Model<IAdmin> | undefined) ??
  mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
