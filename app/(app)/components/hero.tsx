"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Code2 } from "lucide-react";
import { IconBrandLinkedin, IconGitBranch } from "@tabler/icons-react";

interface HeroSettings {
  heroTitle: string;
  heroDescription: string;
  developerTitle: string;
  profileImageUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

const DEFAULT_SETTINGS: HeroSettings = {
  heroTitle: "សូមស្វាគមន៍! ខ្ញុំឈ្មោះ ស៊ូ ស៊ាងវេង គឺជាអ្នកអភិវឌ្ឍន៍គេហទំព័រ។",
  heroDescription:
    "I'm a Full Stack Developer focused on creating modern, responsive and scalable web applications with great user experiences.",
  developerTitle: "Full Stack Developer",
  profileImageUrl: "/images/veng.JPG",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
};

export default function Hero() {
  // Show default content immediately without waiting for the API.
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings/public", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load settings: ${response.status}`);
        }

        const data = await response.json();
        const saved = data.settings ?? data;

        if (cancelled || !saved) return;

        setSettings({
          heroTitle: saved.heroTitle || DEFAULT_SETTINGS.heroTitle,
          heroDescription:
            saved.heroDescription || DEFAULT_SETTINGS.heroDescription,
          developerTitle:
            saved.developerTitle || DEFAULT_SETTINGS.developerTitle,
          profileImageUrl:
            saved.profileImageUrl || DEFAULT_SETTINGS.profileImageUrl,
          githubUrl: saved.githubUrl || DEFAULT_SETTINGS.githubUrl,
          linkedinUrl: saved.linkedinUrl || DEFAULT_SETTINGS.linkedinUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Unable to load public hero settings:", error);
        }

        // Keep default content visible if the API fails.
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-white px-6 py-24 dark:bg-neutral-950 sm:px-10 lg:px-16"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(#a3a3a3_0.7px,transparent_0.7px)] [background-size:24px_24px] opacity-20" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Text content */}
        <div className="order-2 space-y-7 lg:order-1">
          {/* Developer badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300">
            <Code2 className="h-4 w-4 text-blue-500" />

            <span>{settings.developerTitle}</span>

            <span className="relative ml-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          </div>

          {/* Main title */}
          <h1 className="max-w-3xl whitespace-pre-line text-3xl font-bold leading-relaxed tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
            {settings.heroTitle}
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-400 sm:text-lg">
            {settings.heroDescription}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="#projects"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              View My Work
              <ArrowDown className="h-4 w-4" />
            </Link>

            <Link
              href="#contact"
              className="inline-flex items-center rounded-xl border border-neutral-300 px-6 py-3.5 font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              Contact Me
            </Link>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4 pt-3">
            <span className="text-sm text-neutral-500">Connect with me</span>

            <a
              href={settings.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-lg border border-neutral-200 p-2.5 text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <IconGitBranch className="h-5 w-5" />
            </a>

            <a
              href={settings.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-lg border border-neutral-200 p-2.5 text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <IconBrandLinkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Profile image */}
        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative">
            {/* Decorative rings */}
            <div className="absolute -inset-5 rounded-[2rem] border border-blue-500/20 rotate-6" />

            <div className="absolute -inset-3 rounded-[2rem] border border-purple-500/20 -rotate-3" />

            {/* Image container */}
            <div className="relative h-[320px] w-[280px] overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-neutral-100 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:h-[420px] sm:w-[360px] lg:h-[480px] lg:w-[400px]">
              <Image
                src={settings.profileImageUrl}
                alt="Sou Seangveng - Full Stack Developer"
                fill
                priority
                unoptimized
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 360px, 400px"
                className="object-cover object-center"
              />
            </div>

            {/* Floating label */}
            <div className="absolute -bottom-6 -left-5 rounded-2xl border border-neutral-200 bg-white/95 px-5 py-4 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 sm:-left-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Code2 className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">
                    Full Stack
                  </p>

                  <p className="text-sm text-neutral-500">Web Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
