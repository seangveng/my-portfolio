import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

loadEnvConfig(process.cwd());

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Check .env.local");
  }

  const rl = readline.createInterface({ input, output });

  try {
    const email = (await rl.question("Admin email: ")).trim().toLowerCase();

    const password = await rl.question(
      "Enter your new password (minimum 12 characters): ",
    );

    if (!email || password.length < 12) {
      throw new Error(
        "Enter a valid email and a password of at least 12 characters.",
      );
    }

    await mongoose.connect(uri);

    const admins = mongoose.connection.collection("admins");

    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const admin = await admins.findOne({
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });

    if (!admin) {
      throw new Error("Existing admin account was not found.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await admins.updateOne(
      { _id: admin._id },
      { $set: { passwordHash, updatedAt: new Date() } },
    );

    if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
      throw new Error("The admin password was not updated.");
    }

    // Read back the saved hash and verify it against the new password.
    const updatedAdmin = await admins.findOne(
      { _id: admin._id },
      { projection: { email: 1, passwordHash: 1 } },
    );

    if (
      !updatedAdmin?.passwordHash ||
      typeof updatedAdmin.passwordHash !== "string"
    ) {
      throw new Error("Could not verify the saved password hash.");
    }

    const matches = await bcrypt.compare(password, updatedAdmin.passwordHash);

    console.log("Admin account found:", updatedAdmin.email);
    console.log("Password hash saved:", true);
    console.log("Password verification:", matches ? "PASS" : "FAIL");

    if (!matches) {
      throw new Error("Saved password verification failed.");
    }

    console.log("Admin password reset completed successfully.");
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Password reset failed:", error.message);
  process.exitCode = 1;
});
