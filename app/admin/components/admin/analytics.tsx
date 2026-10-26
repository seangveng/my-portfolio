"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  FolderKanban,
  Mail,
  MailOpen,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

type Overview = {
  totalProjects: number;
  totalContacts: number;
  unreadContacts: number;
  totalAdmins: number;
};

type ChartDay = {
  date: string;
  label: string;
  projects: number;
  contacts: number;
};

type RecentProject = {
  _id: string;
  title?: string;
  name?: string;
  createdAt?: string;
};

type RecentContact = {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
};

type AnalyticsData = {
  overview: Overview;
  chartDays: ChartDay[];
  recentProjects: RecentProject[];
  recentContacts: RecentContact[];
  generatedAt?: string;
};

const EMPTY_OVERVIEW: Overview = {
  totalProjects: 0,
  totalContacts: 0,
  unreadContacts: 0,
  totalAdmins: 0,
};

const cardClass = "rounded-2xl border border-emerald-900/40 bg-[#0a1510]";

function formatDate(value?: string) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "Unknown time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProjectTitle(project: RecentProject) {
  return project.title || project.name || "Untitled project";
}

function getInitials(name?: string) {
  if (!name?.trim()) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-emerald-400",
  iconBackground = "bg-emerald-500/10",
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Activity;
  iconColor?: string;
  iconBackground?: string;
}) {
  return (
    <div
      className={`${cardClass} group p-5 transition-colors duration-200 hover:border-emerald-500/30`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-400">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-neutral-500">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 ${iconBackground}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>

      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/admin/analytics", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/admin/login?timeout=1";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load analytics.");
      }

      setData(result.data as AnalyticsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading analytics.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const overview = data?.overview ?? EMPTY_OVERVIEW;
  const chartDays = data?.chartDays ?? [];
  const recentProjects = data?.recentProjects ?? [];
  const recentContacts = data?.recentContacts ?? [];

  const maxChartValue = Math.max(
    1,
    ...chartDays.map((day) => Math.max(day.projects, day.contacts)),
  );

  const totalWeeklyProjects = chartDays.reduce(
    (sum, day) => sum + day.projects,
    0,
  );

  const totalWeeklyContacts = chartDays.reduce(
    (sum, day) => sum + day.contacts,
    0,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Overview of your portfolio activity and content.
          </p>
        </div>

        <div
          className={`${cardClass} flex min-h-64 items-center justify-center`}
        >
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
            <p className="text-sm text-neutral-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Analytics
            </h1>
          </div>

          <p className="mt-1 text-sm text-neutral-400">
            Monitor your portfolio, messages, and admin activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchAnalytics(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/50 bg-[#0a1510] px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="text-sm font-medium">Unable to load analytics</p>
            <p className="mt-1 text-sm text-red-300/80">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void fetchAnalytics(true)}
            className="shrink-0 text-sm font-semibold hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={overview.totalProjects}
          description="Projects in your portfolio"
          icon={FolderKanban}
        />

        <MetricCard
          title="Total Messages"
          value={overview.totalContacts}
          description="Messages received"
          icon={Mail}
          iconColor="text-sky-400"
          iconBackground="bg-sky-500/10"
        />

        <MetricCard
          title="Unread Messages"
          value={overview.unreadContacts}
          description="Messages waiting for review"
          icon={MailOpen}
          iconColor="text-red-300"
          iconBackground="bg-red-500/10"
        />

        <MetricCard
          title="Administrators"
          value={overview.totalAdmins}
          description="Registered admin accounts"
          icon={ShieldCheck}
          iconColor="text-amber-300"
          iconBackground="bg-amber-500/10"
        />
      </div>

      {/* Weekly activity chart */}
      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            title="Weekly Activity"
            description="Projects and messages created over the last 7 days."
            icon={TrendingUp}
          />

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-400" />
              Projects
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              Messages
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-900/30 bg-[#07110c] p-4">
            <p className="text-sm text-neutral-400">Projects this week</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {totalWeeklyProjects}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-900/30 bg-[#07110c] p-4">
            <p className="text-sm text-neutral-400">Messages this week</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {totalWeeklyContacts}
            </p>
          </div>
        </div>

        {chartDays.length > 0 ? (
          <div className="mt-8">
            <div className="flex h-52 items-end justify-between gap-2 border-b border-emerald-900/40 pb-3 sm:gap-4">
              {chartDays.map((day) => {
                const projectHeight = (day.projects / maxChartValue) * 100;
                const contactHeight = (day.contacts / maxChartValue) * 100;

                return (
                  <div
                    key={day.date}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1.5 sm:gap-2">
                      <div
                        title={`Projects: ${day.projects}`}
                        className="w-3 max-w-[35%] rounded-t-md bg-indigo-400 transition-all duration-300 sm:w-5"
                        style={{
                          height: `${Math.max(projectHeight, day.projects ? 4 : 0)}%`,
                        }}
                      />

                      <div
                        title={`Messages: ${day.contacts}`}
                        className="w-3 max-w-[35%] rounded-t-md bg-emerald-400 transition-all duration-300 sm:w-5"
                        style={{
                          height: `${Math.max(contactHeight, day.contacts ? 4 : 0)}%`,
                        }}
                      />
                    </div>

                    <span className="text-[10px] text-neutral-500 sm:text-xs">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-center text-xs text-neutral-500">
              Daily activity
            </p>
          </div>
        ) : (
          <div className="mt-6 flex min-h-36 items-center justify-center rounded-xl border border-dashed border-emerald-900/40 bg-[#07110c]">
            <p className="text-sm text-neutral-500">
              No activity data available yet.
            </p>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent projects */}
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-emerald-900/30 p-5">
            <SectionHeader
              title="Recent Projects"
              description="Your latest portfolio projects"
              icon={FolderKanban}
            />

            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              {recentProjects.length}
            </span>
          </div>

          {recentProjects.length > 0 ? (
            <div className="divide-y divide-emerald-900/30">
              {recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center gap-3 p-4 transition hover:bg-emerald-950/20 sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                    <FolderKanban className="h-5 w-5 text-emerald-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-100">
                      {getProjectTitle(project)}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Created {formatDate(project.createdAt)}
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center px-5 text-center">
              <FolderKanban className="h-8 w-8 text-neutral-600" />
              <p className="mt-3 text-sm font-medium text-neutral-300">
                No projects yet
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Your recent projects will appear here.
              </p>
            </div>
          )}
        </section>

        {/* Recent messages */}
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-emerald-900/30 p-5">
            <SectionHeader
              title="Recent Messages"
              description="Latest messages from your visitors"
              icon={Mail}
            />

            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              {recentContacts.length}
            </span>
          </div>

          {recentContacts.length > 0 ? (
            <div className="divide-y divide-emerald-900/30">
              {recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`p-4 transition hover:bg-emerald-950/20 sm:p-5 ${
                    !contact.isRead ? "bg-emerald-950/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-300">
                      {getInitials(contact.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-neutral-100">
                          {contact.name}
                        </p>

                        {!contact.isRead && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            UNREAD
                          </span>
                        )}
                      </div>

                      <p className="mt-1 break-all text-xs text-neutral-500">
                        {contact.email}
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-300">
                        {contact.message}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDateTime(contact.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center px-5 text-center">
              <Mail className="h-8 w-8 text-neutral-600" />
              <p className="mt-3 text-sm font-medium text-neutral-300">
                No messages yet
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                New contact messages will appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Footer information */}
      <div className="flex flex-col gap-2 rounded-xl border border-emerald-900/30 bg-[#07110c] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Activity className="h-4 w-4 text-emerald-400" />
          Analytics overview
        </div>

        <p className="text-xs text-neutral-500">
          {data?.generatedAt
            ? `Last updated ${formatDateTime(data.generatedAt)}`
            : "Data updates when you refresh this page."}
        </p>
      </div>
    </div>
  );
}
