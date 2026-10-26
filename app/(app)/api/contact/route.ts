import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { getAdminSession } from "@/lib/admin-auth";
import ContactMessage from "@/models/Contact-Message";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// PUBLIC: Submit a contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return jsonError("Name, email, and message are required.", 400);
    }

    if (name.length < 2 || name.length > 100) {
      return jsonError("Name must be between 2 and 100 characters.", 400);
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Please enter a valid email address.", 400);
    }

    if (message.length < 10 || message.length > 5000) {
      return jsonError("Message must be between 10 and 5000 characters.", 400);
    }

    await dbConnect();

    const contact = await ContactMessage.create({
      name,
      email,
      message,
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message was sent successfully.",
        id: contact._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact submission failed:", error);
    return jsonError("Unable to send your message. Please try again.", 500);
  }
}

// ADMIN: List contact messages
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonError("Unauthorized. Please log in.", 401);
    }

    await dbConnect();

    const messages = await ContactMessage.find({})
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = messages.filter((item) => item.isRead === false).length;

    return NextResponse.json({
      success: true,
      messages: messages.map((item) => ({
        _id: item._id.toString(),
        name: item.name,
        email: item.email,
        message: item.message,
        isRead: item.isRead,
        createdAt: item.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to load contacts:", error);
    return jsonError("Unable to load contact messages.", 500);
  }
}

// ADMIN: Mark a message read/unread
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonError("Unauthorized. Please log in.", 401);
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const isRead = body.isRead;

    if (!mongoose.isValidObjectId(id)) {
      return jsonError("Invalid contact message ID.", 400);
    }

    if (typeof isRead !== "boolean") {
      return jsonError("isRead must be true or false.", 400);
    }

    await dbConnect();

    const contact = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { isRead } },
      { new: true, runValidators: true },
    );

    if (!contact) {
      return jsonError("Contact message not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Contact message updated.",
      contact: {
        _id: contact._id.toString(),
        isRead: contact.isRead,
      },
    });
  } catch (error) {
    console.error("Failed to update contact:", error);
    return jsonError("Unable to update contact message.", 500);
  }
}

// ADMIN: Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonError("Unauthorized. Please log in.", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.isValidObjectId(id)) {
      return jsonError("Invalid contact message ID.", 400);
    }

    await dbConnect();

    const contact = await ContactMessage.findByIdAndDelete(id);

    if (!contact) {
      return jsonError("Contact message not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Contact message deleted.",
    });
  } catch (error) {
    console.error("Failed to delete contact:", error);
    return jsonError("Unable to delete contact message.", 500);
  }
}
