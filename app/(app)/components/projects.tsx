"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  FolderCode,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { IconGitBranch } from "@tabler/icons-react";

type Project = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  tags?: string[];
  githubUrl?: string;
  liveUrl?: string;
};

type ProjectsResponse = {
  success: boolean;
  data?: Project[];
  message?: string;
};

const FALLBACK_IMAGE = "/images/veng.jpg";

function ProjectImage({ src, alt }: { src?: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImageSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover object-center transition duration-700 group-hover:scale-105"
        onError={() => {
          if (imageSrc !== FALLBACK_IMAGE) {
            setImageSrc(FALLBACK_IMAGE);
          }
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />

      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-500/15 bg-neutral-950/70">
      <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />

      <div className="space-y-4 p-6">
        <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.05]" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-emerald-500/10" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-emerald-500/10" />
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load projects (${response.status}).`);
      }

      const result: ProjectsResponse = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(
          result.message || "The projects API returned an invalid response.",
        );
      }

      setProjects(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return (
    <section
      id="projects"
      className="relative isolate scroll-mt-28 overflow-hidden border-t border-emerald-500/10 bg-black px-4 py-24 text-white sm:px-6 lg:px-8"
    >
      {/* Background effects — matching the Hero section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[150px]" />

        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-teal-500/[0.07] blur-[150px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-14 text-center sm:mb-16"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              My Portfolio
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Featured <span className="text-emerald-400">Projects</span>
            <span className="text-emerald-400">.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
            A selection of projects where I turn ideas into modern, responsive,
            and scalable web applications.
          </p>

          <div className="mx-auto mt-7 h-px w-20 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto max-w-lg rounded-3xl border border-emerald-500/20 bg-neutral-950/80 p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.05)] backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
              <AlertCircle size={26} className="text-red-400" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Unable to load projects
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">{error}</p>

            <button
              type="button"
              onClick={() => void fetchProjects()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div className="rounded-3xl border border-emerald-500/20 bg-neutral-950/70 px-6 py-16 text-center backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <FolderCode size={30} className="text-emerald-400" />
            </div>

            <h3 className="text-xl font-semibold text-white">
              Projects coming soon
            </h3>

            <p className="mt-3 text-sm text-neutral-400">
              My latest projects will be showcased here.
            </p>
          </div>
        )}

        {/* Project grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.article
                key={project._id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.06, 0.3),
                }}
                className="group relative overflow-hidden rounded-3xl border border-emerald-500/15 bg-neutral-950/75 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_0_35px_rgba(16,185,129,0.08)]"
              >
                {/* Subtle top highlight */}
                <div className="absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

                {/* Image */}
                <div className="relative">
                  <ProjectImage src={project.image} alt={project.title} />

                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} source code`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-black/70 text-white backdrop-blur-md transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
                      >
                        <IconGitBranch size={18} />
                      </Link>
                    )}

                    {project.liveUrl && (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.title} live demo`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-black/70 text-white backdrop-blur-md transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-black/65 px-3 py-1.5 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs font-medium text-emerald-300">
                      Featured Work
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-emerald-300">
                    {project.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-400">
                    {project.description}
                  </p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <span
                          key={`${project._id}-${tag}-${tagIndex}`}
                          className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300/90 transition-colors group-hover:border-emerald-500/25"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between border-t border-emerald-500/10 pt-5">
                    <span className="text-xs text-neutral-500">
                      Project {String(index + 1).padStart(2, "0")}
                    </span>

                    {project.liveUrl ? (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                      >
                        View Project
                        <ArrowUpRight
                          size={17}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    ) : project.githubUrl ? (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                      >
                        View Source
                        <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <span className="text-xs text-neutral-500">
                        Portfolio Project
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && !error && projects.length > 0 && (
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-neutral-400">
              Have a project in mind? Let&apos;s build something great.
            </p>

            <Link
              href="#contact"
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]"
            >
              Let&apos;s Work Together
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
