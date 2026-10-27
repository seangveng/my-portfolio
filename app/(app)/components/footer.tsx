"use client";

import { motion } from "framer-motion";

const projects = [
  "Full-Stack Development",
  "Next.js Applications",
  "POS Management System",
  "Admin Dashboard",
  "Personal Portfolio",
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-emerald-500/10 bg-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Centered Brand */}
        <div className="text-center">
          <p className="text-sm text-neutral-500">
            © {currentYear}{" "}
            <span className="font-semibold text-emerald-400">
              Sou Seangveng
            </span>
            . All rights reserved.
          </p>
        </div>

        {/* Sliding Projects */}
        <div className="relative mt-8 overflow-hidden border-y border-white/5 py-4">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-black to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-black to-transparent sm:w-24" />

          <motion.div
            className="flex w-max items-center gap-10"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...projects, ...projects].map((project, index) => (
              <div
                key={`${project}-${index}`}
                className="flex shrink-0 items-center gap-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 transition-colors duration-300 hover:text-emerald-400 sm:text-sm">
                  {project}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Brand tagline */}
        <p className="mt-5 text-center text-xs tracking-wide text-neutral-600">
          Designed & built with{" "}
          <span className="text-emerald-400">passion</span> by Sou Seangveng.
        </p>
      </div>
    </footer>
  );
}
