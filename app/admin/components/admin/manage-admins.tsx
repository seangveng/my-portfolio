"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  X,
  Shield,
  User,
  RefreshCw,
  LoaderCircle,
  Search,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type AdminRole = "admin" | "editor";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt?: string | null;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: AdminUser[];
}

const inputClass =
  "w-full rounded-xl border border-emerald-900/60 bg-[#050b08] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success",
  );

  const fetchAdmins = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admins", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load team members.");
      }

      setAdmins(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to load team members.",
      );
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("editor");
    setFeedback("");
  }

  function editAdmin(admin: AdminUser) {
    setEditingId(admin._id);
    setName(admin.name);
    setEmail(admin.email);
    setPassword("");
    setRole(admin.role);
    setFeedback("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setFeedback("Name must contain at least 2 characters.");
      setFeedbackType("error");
      return;
    }

    if (!editingId && password.length < 12) {
      setFeedback("Password must contain at least 12 characters.");
      setFeedbackType("error");
      return;
    }

    if (password && password.length < 12) {
      setFeedback("New password must contain at least 12 characters.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    setFeedback("");

    try {
      const payload: Record<string, string> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
      };

      if (password) {
        payload.password = password;
      }

      if (editingId) {
        payload.id = editingId;
      }

      const response = await fetch("/api/admins", {
        method: editingId ? "PUT" : "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to save team member.");
      }

      setFeedback(
        data.message ||
          (editingId
            ? "Team member updated successfully."
            : "Team member created successfully."),
      );
      setFeedbackType("success");

      resetForm();
      await fetchAdmins();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(admin: AdminUser) {
    const confirmed = window.confirm(
      `Delete ${admin.name} (${admin.email})? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(admin._id);
    setFeedback("");

    try {
      const response = await fetch(
        `/api/admins?id=${encodeURIComponent(admin._id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to delete team member.");
      }

      setAdmins((current) => current.filter((item) => item._id !== admin._id));

      if (editingId === admin._id) {
        resetForm();
      }

      setFeedback(data.message || "Team member deleted successfully.");
      setFeedbackType("success");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to delete account.",
      );
      setFeedbackType("error");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredAdmins = admins.filter((admin) => {
    const query = search.trim().toLowerCase();

    return (
      (admin.name ?? "").toLowerCase().includes(query) ||
      (admin.email ?? "").toLowerCase().includes(query) ||
      (admin.role ?? "").toLowerCase().includes(query)
    );
  });

  const adminCount = admins.filter((admin) => admin.role === "admin").length;
  const editorCount = admins.filter((admin) => admin.role === "editor").length;

  return (
    <div className="space-y-8 text-white">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            <Shield className="h-4 w-4" />
            Access Control
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Manage Admins
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Manage team accounts, permissions, and access to your portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchAdmins()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-300 transition hover:bg-emerald-900/40 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            feedbackType === "success"
              ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
              : "border-red-500/30 bg-red-950/30 text-red-300"
          }`}
        >
          {feedbackType === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback("")}
            aria-label="Dismiss message"
            className="ml-auto shrink-0 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Members"
          value={admins.length}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Administrators"
          value={adminCount}
          icon={<Shield className="h-5 w-5" />}
        />
        <StatCard
          label="Editors"
          value={editorCount}
          icon={<User className="h-5 w-5" />}
        />
      </div>

      {/* Create / edit form */}
      <section className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#0a1510]/80 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3 border-b border-emerald-900/30 px-5 py-5 sm:px-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            {editingId ? (
              <Edit3 className="h-5 w-5" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              {editingId ? "Edit Team Member" : "Add Team Member"}
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {editingId
                ? "Update account details or leave the password blank."
                : "Create an account with the appropriate permissions."}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="admin-name"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Full Name
              </label>
              <input
                id="admin-name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Sou Seangveng"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="user@example.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required={!editingId}
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  editingId
                    ? "Leave blank to keep current"
                    : "At least 12 characters"
                }
                className={inputClass}
              />
              <p className="mt-2 text-xs text-neutral-500">
                {editingId
                  ? "Only enter a password if you want to change it."
                  : "Use a unique password of at least 12 characters."}
              </p>
            </div>

            <div>
              <label
                htmlFor="admin-role"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Permission Role
              </label>
              <select
                id="admin-role"
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
                className={inputClass}
              >
                <option value="editor">Editor — Manage projects</option>
                <option value="admin">Administrator — Full access</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-emerald-900/30 pt-5 sm:flex-row sm:justify-end">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-neutral-800 px-5 py-3 text-sm text-neutral-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <Edit3 className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Member"
                  : "Create Member"}
            </button>
          </div>
        </form>
      </section>

      {/* Team list */}
      <section className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#0a1510]/80 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 border-b border-emerald-900/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <h2 className="font-semibold">Team Members</h2>
            <p className="mt-1 text-xs text-neutral-400">
              {admins.length} account{admins.length === 1 ? "" : "s"} registered
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              aria-label="Search team members"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or role..."
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-neutral-400">
              <LoaderCircle className="h-5 w-5 animate-spin text-emerald-400" />
              Loading team members...
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <Users className="mb-3 h-8 w-8 text-neutral-600" />
              <p className="font-medium text-neutral-300">
                {admins.length === 0
                  ? "No team members found"
                  : "No matching team members"}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {admins.length === 0
                  ? "Create an account using the form above."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex min-w-0 flex-col gap-4 rounded-xl border border-emerald-900/40 bg-[#050b08]/70 p-4 transition hover:border-emerald-700/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {admin.name}
                      </p>

                      <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-neutral-400">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{admin.email}</span>
                      </p>

                      <span
                        className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          admin.role === "admin"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-300"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {admin.role === "admin" ? "Administrator" : "Editor"}
                      </span>

                      {admin.createdAt && (
                        <p className="mt-2 text-[11px] text-neutral-500">
                          Joined{" "}
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => editAdmin(admin)}
                      disabled={saving || deletingId !== null}
                      aria-label={`Edit ${admin.name}`}
                      title="Edit member"
                      className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-2.5 text-emerald-300 transition hover:bg-emerald-900/50 disabled:opacity-40"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(admin)}
                      disabled={deletingId !== null || saving}
                      aria-label={`Delete ${admin.name}`}
                      title="Delete member"
                      className="rounded-lg border border-red-900/50 bg-red-950/20 p-2.5 text-red-300 transition hover:bg-red-900/40 disabled:opacity-40"
                    >
                      {deletingId === admin._id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-900/40 bg-[#0a1510]/80 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-400">{label}</p>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-300">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Current registered accounts
      </p>
    </div>
  );
}
