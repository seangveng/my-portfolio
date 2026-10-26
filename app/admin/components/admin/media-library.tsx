"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  Images,
  Upload,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Video,
  FileImage,
  FileVideo,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  HardDrive,
  AlertCircle,
  Film,
  Plus,
} from "lucide-react";

type MediaItem = {
  _id: string;
  name: string;
  url: string;
  type: "image" | "video";
  mimeType: string;
  size: number;
  altText: string;
  createdAt: string;
  updatedAt?: string;
};

type MediaStats = {
  total: number;
  images: number;
  videos: number;
};

type FilterType = "all" | "image" | "video";

const EMPTY_STATS: MediaStats = {
  total: 0,
  images: 0,
  videos: 0,
};

const cardClass = "rounded-2xl border border-emerald-900/40 bg-[#0a1510]";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function MediaPreview({
  item,
  large = false,
}: {
  item: MediaItem;
  large?: boolean;
}) {
  if (item.type === "video") {
    return (
      <video
        src={item.url}
        controls={large}
        preload="metadata"
        playsInline
        className={`h-full w-full object-contain ${
          large ? "bg-black" : "bg-[#07110c]"
        }`}
        aria-label={item.altText || item.name}
      />
    );
  }

  return (
    <img
      src={item.url}
      alt={item.altText || item.name}
      loading="lazy"
      className="h-full w-full object-contain"
    />
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Images;
  color: "emerald" | "sky" | "violet";
}) {
  const colors = {
    emerald: {
      icon: "text-emerald-400",
      background: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    sky: {
      icon: "text-sky-400",
      background: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    violet: {
      icon: "text-violet-400",
      background: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
  };

  const style = colors[color];

  return (
    <div className={`${cardClass} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {value.toLocaleString()}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${style.border} ${style.background}`}
        >
          <Icon className={`h-5 w-5 ${style.icon}`} />
        </div>
      </div>
    </div>
  );
}

export default function MediaLibrary() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats>(EMPTY_STATS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (filter !== "all") {
        params.set("type", filter);
      }

      const response = await fetch(`/api/admin/media?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/admin/login?timeout=1";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load media.");
      }

      const mediaItems: MediaItem[] = Array.isArray(result.media)
        ? result.media
        : Array.isArray(result.data)
          ? result.data
          : [];

      setMedia(mediaItems);

      setStats({
        total: Number(result.stats?.total ?? mediaItems.length),
        images: Number(
          result.stats?.images ??
            mediaItems.filter((item) => item.type === "image").length,
        ),
        videos: Number(
          result.stats?.videos ??
            mediaItems.filter((item) => item.type === "video").length,
        ),
      });
    } catch (err) {
      setMedia([]);
      setStats(EMPTY_STATS);

      setError(err instanceof Error ? err.message : "Failed to load media.");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        void loadMedia();
      },
      search ? 250 : 0,
    );

    return () => window.clearTimeout(timer);
  }, [loadMedia, search]);

  const uploadFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);

    if (!selectedFiles.length) return;

    setError("");
    setNotice("");
    setUploading(true);

    let uploadedCount = 0;
    const failures: string[] = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("altText", file.name.replace(/\.[^/.]+$/, ""));

        try {
          const response = await fetch("/api/admin/media", {
            method: "POST",
            credentials: "include",
            body: formData,
          });

          if (response.status === 401 || response.status === 403) {
            window.location.href = "/admin/login?timeout=1";
            return;
          }

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.message || "Upload failed.");
          }

          uploadedCount++;
        } catch (err) {
          failures.push(
            `${file.name}: ${
              err instanceof Error ? err.message : "Upload failed"
            }`,
          );
        }
      }

      if (uploadedCount > 0) {
        setNotice(
          `${uploadedCount} file${uploadedCount === 1 ? "" : "s"} uploaded successfully.`,
        );
      }

      if (failures.length > 0) {
        setError(failures.join(" "));
      }

      await loadMedia();
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      void uploadFiles(event.target.files);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (event.dataTransfer.files.length) {
      void uploadFiles(event.dataTransfer.files);
    }
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      const fullUrl = new URL(item.url, window.location.origin).href;

      await navigator.clipboard.writeText(fullUrl);

      setCopiedId(item._id);
      setNotice("Media URL copied to clipboard.");

      window.setTimeout(() => {
        setCopiedId((current) => (current === item._id ? "" : current));
      }, 1800);
    } catch {
      setError("Could not copy URL. Check your browser permissions.");
    }
  };

  const openEditor = (item: MediaItem) => {
    setEditing(item);
    setEditName(item.name);
    setEditAltText(item.altText || "");
    setError("");
    setNotice("");
  };

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editing) return;

    const name = editName.trim();

    if (!name) {
      setError("Please enter a media name.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/media/${editing._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          altText: editAltText.trim(),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/admin/login?timeout=1";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update media.");
      }

      setEditing(null);
      setNotice("Media details updated successfully.");
      await loadMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update media.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMedia = async (item: MediaItem) => {
    const confirmed = window.confirm(
      `Delete "${item.name}" permanently? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(item._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/media/${item._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/admin/login?timeout=1";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete media.");
      }

      if (selected?._id === item._id) setSelected(null);
      if (editing?._id === item._id) setEditing(null);

      setNotice("Media deleted successfully.");
      await loadMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete media.");
    } finally {
      setDeletingId("");
    }
  };

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Images className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Media Library
            </h1>
          </div>

          <p className="mt-1 text-sm text-neutral-400">
            Upload, organize, preview, and manage your media files.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadMedia()}
            disabled={loading || uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/50 bg-[#0a1510] px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#041009] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Upload media
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={clearMessages}
            className="text-red-300 hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {notice && !error && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-emerald-300">
          <Check className="h-5 w-5 shrink-0" />
          <p className="flex-1 text-sm">{notice}</p>
          <button
            type="button"
            onClick={clearMessages}
            aria-label="Dismiss notification"
            className="text-emerald-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="All media"
          value={stats.total}
          icon={Images}
          color="emerald"
        />
        <StatCard
          label="Images"
          value={stats.images}
          icon={ImageIcon}
          color="sky"
        />
        <StatCard
          label="Videos"
          value={stats.videos}
          icon={Video}
          color="violet"
        />
      </div>

      {/* Upload dropzone */}
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();

          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={`rounded-2xl border border-dashed p-6 text-center transition sm:p-8 ${
          dragging
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-emerald-900/50 bg-[#0a1510] hover:border-emerald-500/40"
        }`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
          {uploading ? (
            <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
          ) : (
            <Upload className="h-6 w-6 text-emerald-400" />
          )}
        </div>

        <h2 className="mt-4 font-semibold text-white">
          {uploading ? "Uploading your files..." : "Drop files here to upload"}
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Or choose files from your computer. Maximum 10 MB per file.
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          JPG, PNG, WEBP, GIF, MP4, WEBM
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Please wait..." : "Choose files"}
        </button>
      </div>

      {/* Search and filters */}
      <section className={`${cardClass} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search media by name or alt text..."
              className="w-full rounded-xl border border-emerald-900/50 bg-[#07110c] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "all", label: "All media", icon: Images },
                { value: "image", label: "Images", icon: FileImage },
                { value: "video", label: "Videos", icon: FileVideo },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-500 text-[#041009]"
                      : "border border-emerald-900/40 bg-[#0a1510] text-neutral-400 hover:border-emerald-500/30 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-emerald-900/30 pt-4">
          <p className="text-sm text-neutral-400">
            {loading
              ? "Loading media..."
              : `${media.length} file${media.length === 1 ? "" : "s"} shown`}
          </p>

          <p className="text-xs text-neutral-500">Sorted by newest</p>
        </div>
      </section>

      {/* Media grid */}
      {loading && media.length === 0 ? (
        <div
          className={`${cardClass} flex min-h-64 items-center justify-center`}
        >
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
            <p className="text-sm text-neutral-400">
              Loading your media library...
            </p>
          </div>
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {media.map((item) => (
            <article
              key={item._id}
              className={`${cardClass} group overflow-hidden transition hover:border-emerald-500/30`}
            >
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="relative block aspect-[4/3] w-full overflow-hidden bg-[#07110c] text-left"
                aria-label={`Preview ${item.name}`}
              >
                <MediaPreview item={item} />

                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  {item.type === "image" ? (
                    <ImageIcon className="h-3.5 w-3.5" />
                  ) : (
                    <Film className="h-3.5 w-3.5" />
                  )}
                  {item.type === "image" ? "Image" : "Video"}
                </span>

                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                  <span className="rounded-full border border-white/20 bg-black/60 p-3 text-white">
                    <ExternalLink className="h-5 w-5" />
                  </span>
                </span>
              </button>

              <div className="space-y-3 p-4">
                <div className="min-w-0">
                  <h3
                    className="truncate text-sm font-semibold text-neutral-100"
                    title={item.name}
                  >
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    {formatSize(item.size)} · {formatDate(item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-emerald-900/30 pt-3">
                  <button
                    type="button"
                    onClick={() => void copyUrl(item)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-900/40 bg-[#07110c] px-2 py-2 text-xs font-medium text-neutral-300 transition hover:border-emerald-500/30 hover:text-emerald-300"
                  >
                    {copiedId === item._id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedId === item._id ? "Copied" : "Copy URL"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditor(item)}
                    aria-label={`Edit ${item.name}`}
                    className="rounded-lg border border-emerald-900/40 bg-[#07110c] p-2 text-neutral-400 transition hover:border-emerald-500/30 hover:text-emerald-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteMedia(item)}
                    disabled={deletingId === item._id}
                    aria-label={`Delete ${item.name}`}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === item._id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div
          className={`${cardClass} flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <Images className="h-7 w-7 text-emerald-400" />
          </div>

          <h2 className="mt-4 font-semibold text-white">
            {search || filter !== "all"
              ? "No matching media"
              : "Your media library is empty"}
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-400">
            {search || filter !== "all"
              ? "Try another search term or change the selected filter."
              : "Upload images and videos to use throughout your portfolio."}
          </p>

          {search || filter !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="mt-4 rounded-xl border border-emerald-900/40 px-4 py-2 text-sm text-neutral-300 transition hover:text-emerald-300"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#041009] transition hover:bg-emerald-400"
            >
              <Upload className="h-4 w-4" />
              Upload your first file
            </button>
          )}
        </div>
      )}

      {/* Preview modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-emerald-900/50 bg-[#0a1510] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-emerald-900/40 p-4 sm:p-5">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white">
                  {selected.name}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {selected.mimeType} · {formatSize(selected.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close preview"
                className="rounded-lg border border-emerald-900/40 p-2 text-neutral-400 transition hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-[#050b08] p-3 sm:p-6">
              <div className="mx-auto max-h-[60vh] max-w-full">
                <div className="mx-auto max-h-[60vh] max-w-full overflow-hidden rounded-xl">
                  {selected.type === "video" ? (
                    <video
                      src={selected.url}
                      controls
                      autoPlay={false}
                      playsInline
                      className="max-h-[60vh] w-full"
                    />
                  ) : (
                    <img
                      src={selected.url}
                      alt={selected.altText || selected.name}
                      className="mx-auto max-h-[60vh] max-w-full object-contain"
                    />
                  )}
                </div>
              </div>

              {selected.altText && (
                <p className="mt-4 text-center text-sm text-neutral-400">
                  {selected.altText}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-900/40 p-4">
              <p className="text-xs text-neutral-500">
                Uploaded {formatDate(selected.createdAt)}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyUrl(selected)}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/40 px-3 py-2 text-sm text-neutral-300 hover:text-emerald-300"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const item = selected;
                    setSelected(null);
                    openEditor(item);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-[#041009] hover:bg-emerald-400"
                >
                  <Pencil className="h-4 w-4" />
                  Edit details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-lg rounded-2xl border border-emerald-900/50 bg-[#0a1510] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-emerald-900/40 p-5">
              <div>
                <h2 className="font-semibold text-white">Edit media</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Update the name and accessibility description.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close edit form"
                className="rounded-lg border border-emerald-900/40 p-2 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="media-name"
                  className="mb-2 block text-sm font-medium text-neutral-300"
                >
                  Media name
                </label>

                <input
                  id="media-name"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  maxLength={160}
                  required
                  className="w-full rounded-xl border border-emerald-900/50 bg-[#07110c] px-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  placeholder="Enter media name"
                />
              </div>

              <div>
                <label
                  htmlFor="media-alt"
                  className="mb-2 block text-sm font-medium text-neutral-300"
                >
                  Alt text
                </label>

                <textarea
                  id="media-alt"
                  value={editAltText}
                  onChange={(event) => setEditAltText(event.target.value)}
                  maxLength={300}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-emerald-900/50 bg-[#07110c] px-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  placeholder="Describe the image for accessibility"
                />

                <p className="mt-1 text-xs text-neutral-500">
                  Helpful for screen readers and image accessibility.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-900/30 bg-[#07110c] p-3">
                <p className="text-xs text-neutral-500">File URL</p>
                <p className="mt-1 break-all text-sm text-emerald-300">
                  {editing.url}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-emerald-900/40 p-5">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="rounded-xl border border-emerald-900/40 px-4 py-2.5 text-sm text-neutral-300 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !editName.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#041009] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
