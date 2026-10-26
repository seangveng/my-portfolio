import mongoose, { Schema, type Model } from "mongoose";

export interface IContactMessage {
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const ContactMessage: Model<IContactMessage> =
  (mongoose.models.ContactMessage as Model<IContactMessage>) ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
