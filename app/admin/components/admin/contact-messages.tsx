"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  Circle,
  Trash2,
  LoaderCircle,
  AlertCircle,
  Inbox,
  UserRound,
  Clock,
} from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch("/api/contact", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load messages.");
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();

    const interval = window.setInterval(() => {
      void loadMessages(true);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [loadMessages]);

  async function toggleRead(contact: ContactMessage) {
    setBusyId(contact._id);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: contact._id,
          isRead: !contact.isRead,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update message.");
      }

      setMessages((current) =>
        current.map((item) =>
          item._id === contact._id
            ? { ...item, isRead: !contact.isRead }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update message.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function deleteMessage(contact: ContactMessage) {
    const confirmed = window.confirm(
      `Delete the message from ${contact.name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyId(contact._id);
    setError("");

    try {
      const response = await fetch(
        `/api/contact?id=${encodeURIComponent(contact._id)}`,
        { method: "DELETE" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete message.");
      }

      setMessages((current) =>
        current.filter((item) => item._id !== contact._id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete message.",
      );
    } finally {
      setBusyId("");
    }
  }

  const unreadCount = messages.filter((item) => !item.isRead).length;

  const filteredMessages = messages.filter((item) => {
    if (filter === "unread") return !item.isRead;
    if (filter === "read") return item.isRead;
    return true;
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <Mail className="h-6 w-6 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Contact Messages
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Messages submitted through your portfolio.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadMessages(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/50 bg-[#0a1510] px-4 py-3 text-sm font-medium text-neutral-200 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-900/40 bg-[#0a1510] p-5">
          <p className="text-sm text-neutral-400">Total messages</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {messages.length}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5">
          <p className="text-sm text-neutral-400">Unread messages</p>
          <p className="mt-2 text-3xl font-bold text-red-300">{unreadCount}</p>
        </div>

        <div className="rounded-2xl border border-emerald-900/40 bg-[#0a1510] p-5">
          <p className="text-sm text-neutral-400">Read messages</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">
            {messages.length - unreadCount}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "unread", "read"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
              filter === item
                ? "bg-emerald-500 text-[#041009]"
                : "border border-emerald-900/40 bg-[#0a1510] text-neutral-400 hover:text-white"
            }`}
          >
            {item === "all"
              ? `All (${messages.length})`
              : item === "unread"
                ? `Unread (${unreadCount})`
                : `Read (${messages.length - unreadCount})`}
          </button>
        ))}
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-emerald-900/40 bg-[#0a1510] text-neutral-400">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading messages...
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-900/50 bg-[#0a1510] px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Inbox className="h-7 w-7 text-emerald-400" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-white">
            {filter === "unread"
              ? "You're all caught up"
              : filter === "read"
                ? "No read messages"
                : "No contact messages yet"}
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-400">
            {filter === "unread"
              ? "There are no unread messages right now."
              : "Messages submitted through your website's contact form will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((contact) => (
            <article
              key={contact._id}
              className={`rounded-2xl border p-5 transition sm:p-6 ${
                contact.isRead
                  ? "border-emerald-900/40 bg-[#0a1510]"
                  : "border-emerald-500/30 bg-emerald-950/10"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        contact.isRead ? "bg-neutral-600" : "bg-red-400"
                      }`}
                    />

                    <h3 className="break-words text-lg font-semibold text-white">
                      {contact.name}
                    </h3>

                    {!contact.isRead && (
                      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
                        New
                      </span>
                    )}
                  </div>

                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-2 inline-block break-all text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    {contact.email}
                  </a>

                  <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(contact.createdAt)}
                  </div>

                  <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-300">
                    {contact.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleRead(contact)}
                    disabled={busyId === contact._id}
                    title={contact.isRead ? "Mark as unread" : "Mark as read"}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/50 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50"
                  >
                    {busyId === contact._id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : contact.isRead ? (
                      <Circle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {contact.isRead ? "Mark unread" : "Mark read"}
                  </button>

                  <a
                    href={`mailto:${contact.email}?subject=${encodeURIComponent(
                      "Re: Your portfolio message",
                    )}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-[#041009] transition hover:bg-emerald-400"
                  >
                    <Mail className="h-4 w-4" />
                    Reply
                  </a>

                  <button
                    type="button"
                    onClick={() => void deleteMessage(contact)}
                    disabled={busyId === contact._id}
                    title="Delete message"
                    className="inline-flex items-center justify-center rounded-xl border border-red-500/20 px-3 py-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-neutral-500">
        <UserRound className="mr-1 inline h-3.5 w-3.5" />
        Contact messages refresh automatically every 15 seconds while this page
        is open.
      </p>
    </section>
  );
}
