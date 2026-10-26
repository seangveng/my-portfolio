"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed");
      }

      // Redirect after the server clears the session cookie.
      window.location.replace("/admin");
    } catch (err) {
      console.error("Logout error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to log out. Please try again.",
      );

      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {loading ? "Logging out..." : "Logout"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
