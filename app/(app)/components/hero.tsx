"use client";

import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type HeroSettings = {
  heroTitle: string;
  heroDescription: string;
  developerTitle: string;
  profileImageUrl: string;
  githubUrl: string;
  linkedinUrl: string;
};

const DEFAULT_SETTINGS: HeroSettings = {
  heroTitle: "សូមស្វាគមន៍! ខ្ញុំឈ្មោះ ស៊ូ ស៊ាងវេង គឺជាអ្នកអភិវឌ្ឍន៍គេហទំព័រ។",
  heroDescription:
    "I'm a Full Stack Developer focused on creating modern, responsive and scalable web applications with great user experiences.",
  developerTitle: "Full Stack Developer",
  profileImageUrl: "/images/veng.jpg",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
};

export default function Hero() {
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS);

  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load public settings from MongoDB.
  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings/public", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Settings request failed: ${response.status}`);
        }

        const data = await response.json();
        const saved = data.settings ?? data;

        if (!active) return;

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
        console.error("Failed to load Hero settings:", error);
      } finally {
        if (active) setSettingsLoaded(true);
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  // Typewriter animation, including when the saved title changes.
  useEffect(() => {
    if (!settingsLoaded) return;

    let delay = isDeleting ? 35 : 75;

    if (!isDeleting && displayedText === settings.heroTitle) {
      delay = 2000;
    }

    if (isDeleting && displayedText === "") {
      delay = 400;
    }

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (displayedText === settings.heroTitle) {
          setIsDeleting(true);
        } else {
          setDisplayedText(
            settings.heroTitle.slice(0, displayedText.length + 1),
          );
        }
      } else {
        if (displayedText === "") {
          setIsDeleting(false);
        } else {
          setDisplayedText(displayedText.slice(0, -1));
        }
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [displayedText, isDeleting, settings.heroTitle, settingsLoaded]);

  // Reset the animation when the administrator saves a different title.
  useEffect(() => {
    setDisplayedText("");
    setIsDeleting(false);
  }, [settings.heroTitle]);

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-black text-white"
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[150px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Hero content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">
                {settings.developerTitle}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="min-h-[180px] max-w-4xl text-4xl font-bold leading-[1.3] tracking-tight sm:min-h-[220px] sm:text-6xl lg:text-7xl"
            >
              <span className="font-[family-name:var(--font-kantumruy)]">
                {displayedText}
              </span>
              <span className="animate-pulse text-emerald-400">|</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg"
            >
              {settings.heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-emerald-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                View My Work
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="#contact"
                className="rounded-full border border-emerald-500/30 bg-emerald-500/5 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/15"
              >
                Let&apos;s Work Together
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              {settings.githubUrl && (
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="text-neutral-500 transition hover:text-emerald-400"
                >
                  <IconBrandGithub size={20} />
                </a>
              )}

              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="text-neutral-500 transition hover:text-emerald-400"
                >
                  <IconBrandLinkedin size={20} />
                </a>
              )}

              <span className="h-px w-12 bg-emerald-500/20" />

              <span className="text-xs text-neutral-500">
                Available for opportunities
              </span>
            </motion.div>
          </div>

          {/* Profile image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto mt-10 w-full max-w-lg lg:mt-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-neutral-950 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
              <Image
                src={settings.profileImageUrl}
                alt="Portfolio profile"
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 600px"
                className="scale-[1.02] object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#050B08] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050B08]/40 via-transparent to-transparent" />

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute left-6 top-6 rounded-2xl border border-emerald-500/30 bg-neutral-950/80 px-4 py-3 shadow-xl backdrop-blur-md"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Specialized in
                </p>
                <p className="mt-1.5 text-sm font-bold text-emerald-400">
                  Web Development
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-neutral-500 transition hover:text-emerald-400 md:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={14} className="text-emerald-400" />
      </motion.a>
    </section>
  );
}
