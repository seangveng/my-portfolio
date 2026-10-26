import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  image: string;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], required: true },
  liveUrl: { type: String, required: true },
  githubUrl: { type: String, required: true },
  image: { type: String, default: "/images/sou_seangveng_logo.png" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
