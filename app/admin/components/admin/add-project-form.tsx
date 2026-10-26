"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import type { ProjectItem } from "./project-types";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  RefreshCw,
  LoaderCircle,
  ExternalLink,
  GitBranchIcon,
} from "lucide-react";

type Project = ProjectItem;

interface ApiResponse {
  success: boolean;
  data?: Project | Project[];
  message?: string;
  error?: string;
}

interface FormData {
  title: string;
  description: string;
  tags: string;
  liveUrl: string;
  githubUrl: string;
  image: string;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  tags: "",
  liveUrl: "",
  githubUrl: "",
  image: "",
};

const inputClass =
  "w-full rounded-xl border border-emerald-900/60 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400";

export default function AddProjectForm({
  initialProject = null,
}: {
  initialProject?: ProjectItem | null;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialProject) {
      setForm(emptyForm);
      setEditingId(null);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setEditingId(initialProject._id);
    setForm({
      title: initialProject.title ?? "",
      description: initialProject.description ?? "",
      tags: Array.isArray(initialProject.tags)
        ? initialProject.tags.join(", ")
        : "",
      liveUrl: initialProject.liveUrl ?? "",
      githubUrl: initialProject.githubUrl ?? "",
      image: initialProject.image ?? "",
    });
    setPreview(initialProject.image ?? "");
    setError("");
    setNotice("");
  }, [initialProject]);

  const fetchProjects = useCallback(async () => {
    setListLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || "Failed to load projects.",
        );
      }

      setProjects(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setPreview("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function startEditing(project: Project) {
    setEditingId(project._id);
    setForm({
      title: project.title ?? "",
      description: project.description ?? "",
      tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
      liveUrl: project.liveUrl ?? "",
      githubUrl: project.githubUrl ?? "",
      image: project.image ?? "",
    });
    setPreview(project.image ?? "");
    setError("");
    setNotice("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a PNG, JPG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Unable to read this image.");
        return;
      }

      setPreview(reader.result);
      updateField("image", reader.result);
    };

    reader.onerror = () => setError("Unable to read this image.");
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        title: form.title.trim(),
        description: form.description.trim(),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        liveUrl: form.liveUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        image: form.image || "/images/sou_seangveng_logo.png",
      };

      const response = await fetch("/api/projects", {
        method: editingId ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || "Failed to save project.",
        );
      }

      setNotice(
        editingId
          ? "Project updated successfully!"
          : "Project added successfully!",
      );

      resetForm();
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(project: Project) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Delete "${project.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(project._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/projects?id=${encodeURIComponent(project._id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || "Failed to delete project.",
        );
      }

      setProjects((previous) =>
        previous.filter((item) => item._id !== project._id),
      );

      if (editingId === project._id) {
        resetForm();
      }

      setNotice(`"${project.title}" deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex min-w-0 w-full flex-col gap-8">
      {/* Add / Edit form */}
      <section className="rounded-3xl border border-emerald-900/40 bg-[#0a1510]/70 p-5 shadow-xl sm:p-8 lg:p-10">
        <div className="mb-8 flex items-center gap-3 border-b border-emerald-950 pb-6">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
            {editingId ? (
              <Pencil className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              {editingId ? "Edit Project" : "Add New Project"}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {editingId
                ? "Update the project details below."
                : "Publish a new project to your portfolio."}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-300"
          >
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project-title" className={labelClass}>
              Project Title *
            </label>
            <input
              id="project-title"
              className={inputClass}
              placeholder="My Portfolio Website"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div>
            <label htmlFor="project-description" className={labelClass}>
              Description *
            </label>
            <textarea
              id="project-description"
              className={`${inputClass} min-h-32 resize-y`}
              placeholder="Describe your project..."
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              maxLength={5000}
              required
              rows={5}
            />
          </div>

          <div>
            <label className={labelClass}>Project Screenshot</label>

            <div className="rounded-2xl border border-dashed border-emerald-900/70 bg-neutral-950/60 p-4 sm:p-6">
              {preview ? (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900">
                    <Image
                      src={preview}
                      alt="Project preview"
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="rounded-xl border border-emerald-800 px-4 py-2.5 text-sm text-emerald-300 hover:bg-emerald-950/40"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreview("");
                        updateField("image", "");
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-900/60 px-4 py-2.5 text-sm text-red-300 hover:bg-red-950/30"
                    >
                      <X className="h-4 w-4" />
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl text-neutral-400 hover:bg-emerald-950/20"
                >
                  <Upload className="h-7 w-7 text-emerald-400" />
                  <span className="text-sm">Click to upload a screenshot</span>
                  <span className="text-xs text-neutral-500">
                    PNG, JPG, WEBP, GIF · Maximum 5 MB
                  </span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-tags" className={labelClass}>
              Technologies / Tags
            </label>
            <input
              id="project-tags"
              className={inputClass}
              placeholder="Next.js, React, Tailwind CSS, MongoDB"
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
            />
            <p className="mt-2 text-xs text-neutral-500">
              Separate tags with commas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="project-live" className={labelClass}>
                Live Demo URL
              </label>
              <input
                id="project-live"
                type="url"
                className={inputClass}
                placeholder="https://example.com"
                value={form.liveUrl}
                onChange={(event) => updateField("liveUrl", event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="project-github" className={labelClass}>
                GitHub URL
              </label>
              <input
                id="project-github"
                type="url"
                className={inputClass}
                placeholder="https://github.com/username/project"
                value={form.githubUrl}
                onChange={(event) =>
                  updateField("githubUrl", event.target.value)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-emerald-950 pt-6 sm:flex-row sm:justify-end">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setError("");
                  setNotice("Editing cancelled.");
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 px-6 py-3.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-900 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Project"
                  : "Add Project"}
            </button>
          </div>
        </form>
      </section>

      {/* Project list on the same page */}
      <section className="rounded-3xl border border-emerald-900/40 bg-[#0a1510]/70 p-5 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Manage Existing Projects
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {projects.length} project{projects.length === 1 ? "" : "s"} in
              your portfolio
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchProjects()}
            disabled={listLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/60 px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-950/40 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${listLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects..."
          className={`${inputClass} mb-6`}
        />

        {listLoading && projects.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-neutral-400">
            <LoaderCircle className="h-5 w-5 animate-spin text-emerald-400" />
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-900/50 px-5 py-12 text-center">
            <p className="font-semibold text-white">
              {projects.length === 0
                ? "No projects yet"
                : "No matching projects"}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              {projects.length === 0
                ? "Add your first project using the form above."
                : "Try searching for a different project."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredProjects.map((project) => (
              <article
                key={project._id}
                className="min-w-0 overflow-hidden rounded-2xl border border-emerald-900/40 bg-neutral-950/50"
              >
                {project.image && (
                  <div className="relative aspect-video w-full bg-neutral-900">
                    <Image
                      src={project.image}
                      alt={`${project.title} screenshot`}
                      fill
                      unoptimized
                      sizes="(max-width: 1280px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="break-words text-lg font-bold text-white">
                    {project.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-sm leading-6 text-neutral-400">
                    {project.description}
                  </p>

                  {!!project.tags?.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-4">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Live Demo
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white"
                      >
                        <GitBranchIcon className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                  </div>

                  <div className="mt-5 flex gap-3 border-t border-emerald-950 pt-4">
                    <button
                      type="button"
                      onClick={() => startEditing(project)}
                      disabled={deletingId !== null || loading}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-800 px-3 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-950/40 disabled:opacity-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(project)}
                      disabled={deletingId !== null || loading}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-900/60 px-3 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/30 disabled:opacity-50"
                    >
                      {deletingId === project._id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {deletingId === project._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
