"use client";

import { useEffect } from "react";

export default function SessionTimeout() {
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "same-origin",
        });
      } catch (error) {
        console.error("Logout request failed:", error);
      } finally {
        window.location.replace("/admin/login?timeout=1");
      }
    }, 500_0000);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
