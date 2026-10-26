"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FolderGit2,
  ShieldCheck,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Pencil,
  Plus,
  LoaderCircle,
  AlertCircle,
  Image as ImageIcon,
  GitBranchIcon,
} from "lucide-react";
import Image from "next/image";
import type { ProjectItem } from "./project-types";

interface ProjectsResponse {
  success: boolean;
  data?: ProjectItem[];
  message?: string;
  error?: string;
}

interface ManageProjectsProps {
  onEdit: (project: ProjectItem) => void;
  onAdd: () => void;
}

export default function ManageProjects({ onEdit, onAdd }: ManageProjectsProps) {
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/projects", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const data: ProjectsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Failed to fetch projects.",
        );
      }

      setProjectsList(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  async function handleDelete(id: string) {
    const project = projectsList.find((item) => item._id === id);

    if (!project || deletingId !== null) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/projects?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const data: ProjectsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Failed to delete project.",
        );
      }

      setProjectsList((previous) => previous.filter((item) => item._id !== id));

      setNotice(`"${project.title}" was deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const query = searchQuery.trim().toLowerCase();

  const filteredProjects = projectsList.filter((project) => {
    if (!query) return true;

    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      (Array.isArray(project.tags) &&
        project.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="flex min-w-0 w-full flex-col gap-5 sm:gap-6 lg:gap-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Manage Projects
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Add, edit, and organize the projects displayed in your portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="min-w-0 rounded-2xl border border-emerald-900/40 bg-[#0a1510]/70 p-5 shadow-lg sm:rounded-3xl sm:p-6">
          <div className="mb-3 flex items-center gap-3 text-emerald-400">
            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <FolderGit2 className="h-5 w-5" />
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Total Projects
            </h3>
          </div>

          <p className="font-mono text-3xl font-bold text-white sm:text-4xl">
            {projectsList.length}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Projects currently published in your portfolio.
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-emerald-900/40 bg-[#0a1510]/70 p-5 shadow-lg sm:rounded-3xl sm:p-6">
          <div className="mb-3 flex items-center gap-3 text-emerald-400">
            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider">
              API Status
            </h3>
          </div>

          <p
            className={`break-words text-sm font-semibold ${
              loading
                ? "text-amber-300"
                : error
                  ? "text-red-400"
                  : "text-emerald-300"
            }`}
          >
            {loading
              ? "Checking connection..."
              : error
                ? "Needs attention"
                : "Response received"}
          </p>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Status is based on the latest projects API request.
          </p>
        </div>
      </div>

      {/* Search and refresh */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects, descriptions, or tags..."
            className="w-full rounded-xl border border-emerald-900/50 bg-[#0a1510]/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={() => void fetchProjects()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/50 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-950/40 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh List
        </button>
      </div>

      {/* Feedback messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">Unable to load projects</p>
            <p className="mt-1 break-words leading-6">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void fetchProjects()}
            className="shrink-0 text-xs font-semibold underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-4 text-sm text-emerald-300"
        >
          {notice}
        </div>
      )}

      {/* Project list heading */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Your Projects</h2>

          <p className="mt-1 text-xs text-neutral-500">
            Showing {filteredProjects.length} of {projectsList.length} projects
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && projectsList.length === 0 && (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-900/30 bg-[#0a1510]/40 p-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm text-neutral-400">Loading your projects...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projectsList.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-900/50 bg-[#0a1510]/40 p-8 text-center sm:rounded-3xl">
          <div className="mb-4 rounded-2xl bg-emerald-500/10 p-4 text-emerald-400">
            <FolderGit2 className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-bold text-white">No projects yet</h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-400">
            Publish your first project to start building your portfolio.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Create First Project
          </button>
        </div>
      )}

      {/* No search results */}
      {!loading && projectsList.length > 0 && filteredProjects.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-[#0a1510]/50 p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-neutral-600" />

          <h3 className="mt-3 font-semibold text-white">
            No matching projects
          </h3>

          <p className="mt-1 text-sm text-neutral-400">
            Try a different search term.
          </p>
        </div>
      )}

      {/* Project cards */}
      {filteredProjects.length > 0 && (
        <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredProjects.map((project) => (
            <article
              key={project._id}
              className="min-w-0 overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#0a1510]/70 shadow-lg transition hover:border-emerald-800 sm:rounded-3xl"
            >
              {/* Screenshot */}
              <div className="relative aspect-video w-full overflow-hidden border-b border-emerald-950 bg-neutral-950">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    fill
                    unoptimized
                    sizes="(max-width: 1280px) 100vw, 50vw"
                    className="object-cover transition duration-500 hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-600">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs">No screenshot</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold text-white sm:text-xl">
                      {project.title}
                    </h3>

                    <p className="mt-2 line-clamp-4 whitespace-pre-line break-words text-sm leading-6 text-neutral-400">
                      {project.description}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                </div>

                {/* Tags */}
                {Array.isArray(project.tags) && project.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="max-w-full break-words rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* External links */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-2 break-all text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      Live Demo
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-2 break-all text-xs font-semibold text-neutral-300 transition hover:text-white"
                    >
                      <GitBranchIcon className="h-4 w-4 shrink-0" />
                      GitHub Repository
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-emerald-950 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onEdit(project)}
                    disabled={deletingId === project._id}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-800/70 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-950/50 disabled:opacity-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Project
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(project._id)}
                    disabled={deletingId !== null}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-900/60 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === project._id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}

                    {deletingId === project._id
                      ? "Deleting..."
                      : "Delete Project"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
