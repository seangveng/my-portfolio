"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  X,
  Loader2,
  FileText,
} from "lucide-react";

type ActivityStatus = "success" | "failed" | "warning";

type ActivityItem = {
  _id: string;
  actorId?: string | null;
  actorName: string;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description: string;
  status: ActivityStatus;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  logs: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 10;

const cardClass = "rounded-2xl border border-emerald-900/40 bg-[#0a1510]";

const inputClass =
  "w-full rounded-xl border border-emerald-900/50 bg-[#07110c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function actionLabel(action: string) {
  return action
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const styles: Record<ActivityStatus, string> = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    failed: "border-red-500/20 bg-red-500/10 text-red-400",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  };

  const icons = {
    success: <CheckCircle2 size={14} />,
    failed: <ShieldAlert size={14} />,
    warning: <AlertCircle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles[status] ?? styles.warning}`}
    >
      {icons[status] ?? icons.warning}
      {status}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`${cardClass} p-5 transition hover:border-emerald-700/50`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-neutral-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-500">{description}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-emerald-900/30 bg-[#07110c] p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-2 break-words text-sm text-neutral-200">{value}</p>
    </div>
  );
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (search.trim()) params.set("search", search.trim());
      if (action) params.set("action", action);
      if (status) params.set("status", status);

      if (from) {
        params.set("from", new Date(`${from}T00:00:00`).toISOString());
      }

      if (to) {
        params.set("to", new Date(`${to}T23:59:59.999`).toISOString());
      }

      const response = await fetch(
        `/api/admin/activity-logs?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        },
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/admin/login?timeout=1";
        return;
      }

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load activity logs.");
      }

      setLogs(result.logs ?? []);
      setTotal(result.pagination?.total ?? 0);
      setTotalPages(result.pagination?.totalPages ?? 0);
    } catch (err) {
      setLogs([]);
      setTotal(0);
      setTotalPages(0);

      setError(
        err instanceof Error ? err.message : "Failed to load activity logs.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, action, status, from, to]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchLogs();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [fetchLogs]);

  function resetFilters() {
    setSearch("");
    setAction("");
    setStatus("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const successCount = logs.filter((log) => log.status === "success").length;

  const failedCount = logs.filter((log) => log.status === "failed").length;

  const warningCount = logs.filter((log) => log.status === "warning").length;

  return (
    <div className="min-w-0 space-y-6 pb-8 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Admin</span>
            <span>/</span>
            <span className="text-emerald-300">Activity Logs</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Activity Logs
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
            Monitor administrative actions, account events, and important
            changes across your portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchLogs()}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-900/50 bg-[#0a1510] px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1 break-words">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-sm text-emerald-300"
        >
          <Check size={18} />
          {notice}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Activities"
          value={total}
          description="Matching records in the database"
          icon={Activity}
        />

        <SummaryCard
          title="Successful"
          value={successCount}
          description="Successful events on this page"
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Failed"
          value={failedCount}
          description="Failed events on this page"
          icon={ShieldAlert}
        />

        <SummaryCard
          title="Warnings"
          value={warningCount}
          description="Warning events on this page"
          icon={AlertCircle}
        />
      </div>

      {/* Filters */}
      <section className={`${cardClass} overflow-hidden`}>
        <div className="flex items-start gap-3 border-b border-emerald-900/30 p-5 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <Filter size={19} />
          </div>

          <div>
            <h2 className="font-semibold">Filter Activities</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Search records and narrow them by action, status, or date.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block min-w-0 space-y-2 xl:col-span-2">
              <span className="text-sm font-medium text-neutral-300">
                Search
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search users, actions, descriptions..."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </label>

            <label className="block min-w-0 space-y-2">
              <span className="text-sm font-medium text-neutral-300">
                Action
              </span>
              <select
                value={action}
                onChange={(event) => {
                  setAction(event.target.value);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="">All actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE_PROJECT">Create project</option>
                <option value="UPDATE_PROJECT">Update project</option>
                <option value="DELETE_PROJECT">Delete project</option>
                <option value="CREATE_ADMIN">Create admin</option>
                <option value="UPDATE_SETTINGS">Update settings</option>
                <option value="FAILED_LOGIN">Failed login</option>
              </select>
            </label>

            <label className="block min-w-0 space-y-2">
              <span className="text-sm font-medium text-neutral-300">
                Status
              </span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="">All statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block min-w-0 space-y-2">
              <span className="text-sm font-medium text-neutral-300">
                From Date
              </span>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
                className={inputClass}
              />
            </label>

            <label className="block min-w-0 space-y-2">
              <span className="text-sm font-medium text-neutral-300">
                To Date
              </span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-emerald-900/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              {total.toLocaleString()} matching activities
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/50 px-4 py-2.5 text-sm text-neutral-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
            >
              <X size={15} />
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Activity table */}
      <section className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-emerald-900/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Clock size={19} />
            </div>
            <div>
              <h2 className="font-semibold">Recent Activity</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Latest events appear first.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-lg border border-emerald-900/40 bg-[#07110c] px-3 py-1.5 text-xs text-neutral-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-emerald-900/30 bg-[#07110c] text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Activity</th>
                <th className="px-5 py-4 font-medium">Resource</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date & Time</th>
                <th className="px-5 py-4 text-right font-medium">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-900/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-emerald-400" />
                    <p className="text-sm text-neutral-400">
                      Loading activity logs...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <AlertCircle className="mx-auto mb-3 h-7 w-7 text-red-400" />
                    <p className="text-sm text-neutral-400">
                      Could not load records. Please try again.
                    </p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-neutral-600" />
                    <p className="font-medium text-neutral-300">
                      No activity found
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Change your filters or record an activity from a backend
                      route.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="transition hover:bg-emerald-950/15"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                          <UserRound size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[170px] truncate font-medium text-white">
                            {log.actorName}
                          </p>
                          <p className="mt-1 max-w-[170px] truncate text-xs text-neutral-500">
                            {log.actorEmail || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-200">
                        {actionLabel(log.action)}
                      </p>
                      <p className="mt-1 max-w-[250px] truncate text-xs text-neutral-500">
                        {log.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="capitalize text-neutral-300">
                        {(log.entityType || "system").replace(/[_-]/g, " ")}
                      </p>
                      {log.entityId && (
                        <p className="mt-1 max-w-[130px] truncate font-mono text-xs text-neutral-500">
                          {log.entityId}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={log.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-neutral-400">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/50 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-300"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-emerald-900/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-neutral-500">
            {total === 0
              ? "Showing 0 records"
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  total,
                )} of ${total.toLocaleString()}`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-900/50 px-3 py-2 text-sm text-neutral-300 transition hover:border-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="min-w-16 text-center text-xs text-neutral-500">
              {totalPages === 0 ? 0 : page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-900/50 px-3 py-2 text-sm text-neutral-300 transition hover:border-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Details modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedLog(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-900/50 bg-[#0a1510] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-emerald-900/30 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Activity size={19} />
                </div>
                <div>
                  <h2
                    id="activity-detail-title"
                    className="font-semibold text-white"
                  >
                    Activity Details
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Full information for this event.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-emerald-950 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {actionLabel(selectedLog.action)}
                </h3>
                <StatusBadge status={selectedLog.status} />
              </div>

              <p className="text-sm leading-6 text-neutral-400">
                {selectedLog.description}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem label="User" value={selectedLog.actorName} />
                <DetailItem
                  label="Email"
                  value={selectedLog.actorEmail || "—"}
                />
                <DetailItem
                  label="Resource"
                  value={selectedLog.entityType || "system"}
                />
                <DetailItem
                  label="Resource ID"
                  value={selectedLog.entityId || "—"}
                />
                <DetailItem
                  label="Actor ID"
                  value={selectedLog.actorId || "—"}
                />
                <DetailItem
                  label="Date & Time"
                  value={formatDate(selectedLog.createdAt)}
                />
                <DetailItem
                  label="IP Address"
                  value={selectedLog.ipAddress || "Not recorded"}
                />
                <DetailItem
                  label="User Agent"
                  value={selectedLog.userAgent || "Not recorded"}
                />
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-300">
                  Metadata
                </h4>
                <pre className="overflow-x-auto rounded-xl border border-emerald-900/30 bg-[#07110c] p-4 text-xs leading-5 text-emerald-300">
                  {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#041009] transition hover:bg-emerald-400"
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
