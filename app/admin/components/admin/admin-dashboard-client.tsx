"use client";

import { useCallback, useEffect, useState } from "react";
import AdminSidebar, { type AdminTab } from "./admin-sidebar";
import AddProjectForm from "./add-project-form";
import SessionTimeout from "./session-timeout";
import ManageAdmins from "./manage-admins";
import ContactMessages from "./contact-messages";
import ManageProjects from "./manage-projects";
import Analytics from "./analytics";
import MediaLibrary from "./media-library";
import SettingsPanel from "./settings-panel";
import ActivityLogPage from "../../activity/page";
import type { ProjectItem } from "./project-types";

interface ContactResponse {
  success?: boolean;
  messages?: Array<{ isRead: boolean }>;
  unreadCount?: number;
  error?: string;
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [unreadContacts, setUnreadContacts] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null,
  );

  const checkContacts = useCallback(async () => {
    try {
      const response = await fetch("/api/contact", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) return;
      const data: ContactResponse = await response.json();
      if (typeof data.unreadCount === "number") {
        setUnreadContacts(data.unreadCount);
      } else if (Array.isArray(data.messages)) {
        setUnreadContacts(
          data.messages.filter((message) => !message.isRead).length,
        );
      }
    } catch (error) {
      console.error("Failed to check contact notifications:", error);
    }
  }, []);

  useEffect(() => {
    void checkContacts();
    const interval = window.setInterval(() => void checkContacts(), 15000);
    return () => window.clearInterval(interval);
  }, [checkContacts]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.error || data.message || "Logout failed");
      window.location.replace("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  }

  function openAddProject() {
    setSelectedProject(null);
    setActiveTab("add");
  }

  function openEditProject(project: ProjectItem) {
    setSelectedProject(project);
    setActiveTab("add");
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "overview":
        return (
          <ManageProjects onEdit={openEditProject} onAdd={openAddProject} />
        );
      case "add":
        return (
          <AddProjectForm
            key={selectedProject?._id ?? "new-project"}
            initialProject={selectedProject}
          />
        );
      case "admins":
        return <ManageAdmins />;
      case "contacts":
        return <ContactMessages />;
      case "analytics":
        return <Analytics />;
      case "media":
        return <MediaLibrary />;
      case "settings":
        return <SettingsPanel />;
      case "activity":
        return <ActivityLogPage />;
      default:
        return (
          <div className="rounded-2xl border border-emerald-900/40 bg-[#0a1510] p-6">
            <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Select a section from the sidebar.
            </p>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#050B08] text-white">
      <SessionTimeout />
      <div className="flex min-h-screen">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          unreadContacts={unreadContacts}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {logoutError && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300"
              >
                {logoutError}
              </p>
            )}
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
}
