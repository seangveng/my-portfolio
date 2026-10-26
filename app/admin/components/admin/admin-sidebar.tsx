"use client";

import {
  LayoutDashboard,
  FolderPlus,
  Users,
  Mail,
  BarChart3,
  Images,
  Settings,
  Activity,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ShieldCheck,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "add"
  | "admins"
  | "contacts"
  | "analytics"
  | "media"
  | "settings"
  | "activity";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void | Promise<void>;
  mobileOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userEmail?: string;
  userRole?: string;
  unreadContacts?: number;
}

const navigation: {
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "add", label: "Add Project", icon: FolderPlus },
  { id: "admins", label: "Admins", icon: Users },
  { id: "contacts", label: "Contacts", icon: Mail },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "media", label: "Media Library", icon: Images },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "activity", label: "Activity Logs", icon: Activity },
];

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onLogout,
  mobileOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
  userEmail,
  userRole,
  unreadContacts = 0,
}: AdminSidebarProps) {
  function selectTab(tab: AdminTab) {
    console.log("Sidebar clicked:", tab);
    setActiveTab(tab);
    onClose?.();
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        aria-label="Admin navigation"
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh flex-col",
          "border-r border-emerald-950 bg-[#07100b]",
          "transition-[transform,width] duration-300 ease-in-out",
          "md:sticky md:top-0 md:z-20 md:translate-x-0",
          "md:h-screen md:shrink-0",
          collapsed ? "md:w-20" : "md:w-64",
          "w-72 max-w-[85vw]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-emerald-950 px-4">
          <div
            className={[
              "flex min-w-0 items-center gap-3",
              collapsed ? "md:justify-center" : "",
            ].join(" ")}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div
              className={["min-w-0", collapsed ? "md:hidden" : ""].join(" ")}
            >
              <p className="truncate text-sm font-bold text-white">Portfolio</p>
              <p className="text-xs text-emerald-400">Admin Panel</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className="hidden rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white md:inline-flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          <p
            className={[
              "px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500",
              collapsed ? "md:hidden" : "",
            ].join(" ")}
          >
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            const showUnread = item.id === "contacts" && unreadContacts > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                title={
                  collapsed
                    ? `${item.label}${
                        showUnread ? ` — ${unreadContacts} unread` : ""
                      }`
                    : undefined
                }
                aria-current={active ? "page" : undefined}
                className={[
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-3",
                  "text-left text-sm font-medium transition-colors",
                  collapsed ? "md:justify-center md:px-2" : "",
                  active
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-transparent text-neutral-400 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-5 w-5 shrink-0",
                    active
                      ? "text-emerald-400"
                      : "text-neutral-500 group-hover:text-white",
                  ].join(" ")}
                />

                <span
                  className={["truncate", collapsed ? "md:hidden" : ""].join(
                    " ",
                  )}
                >
                  {item.label}
                </span>

                {showUnread && (
                  <span
                    aria-label={`${unreadContacts} unread contact messages`}
                    className={[
                      "flex h-5 min-w-5 items-center justify-center rounded-full",
                      "bg-red-500 px-1.5 text-[10px] font-bold text-white",
                      "ml-auto",
                      collapsed ? "md:hidden" : "",
                    ].join(" ")}
                  >
                    {unreadContacts > 99 ? "99+" : unreadContacts}
                  </span>
                )}

                {active && (
                  <span
                    className={[
                      "h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400",
                      showUnread ? "" : "ml-auto",
                      collapsed ? "md:hidden" : "",
                    ].join(" ")}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-emerald-950 p-3">
          {(userEmail || userRole) && (
            <div
              className={[
                "mb-3 rounded-xl bg-white/[0.03] p-3",
                collapsed ? "md:hidden" : "",
              ].join(" ")}
            >
              {userEmail && (
                <p className="truncate text-xs text-neutral-300">{userEmail}</p>
              )}

              {userRole && (
                <p className="mt-1 text-[11px] capitalize text-emerald-400">
                  {userRole}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => void onLogout()}
            title={collapsed ? "Logout" : undefined}
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3 py-3",
              "text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10",
              collapsed ? "md:justify-center md:px-2" : "",
            ].join(" ")}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
