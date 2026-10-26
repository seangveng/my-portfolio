"use client";

import { motion } from "framer-motion";

const skillCategories = [
  {
    title: "Frontend Development",
    skills: [
      "React / Next.js",
      "TypeScript",
      "Tailwind CSS",
      "HTML5 / CSS3",
      "JavaScript (ES6+)",
    ],
  },
  {
    title: "Backend & APIs",
    skills: [
      "Node.js",
      "Express",
      "RESTful APIs",
      "Authentication",
      "Serverless",
    ],
  },
  {
    title: "Databases & Tools",
    skills: ["MongoDB", "PostgreSQL", "Git / GitHub", "Docker", "VS Code"],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function About() {
  return (
    <section
      id="about"
      className="relative scroll-mt-28 overflow-hidden border-t border-emerald-950/60 bg-[#050B08] py-24 sm:py-28 lg:py-32"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-[110px] sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute bottom-1/4 right-0 h-72 w-72 rounded-full bg-emerald-500/[0.05] blur-[120px] sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* About introduction */}
        <div className="grid items-start gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-4 py-2 shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />

              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                About Me
              </span>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-500">
              A little about who I am, what I build, and the technologies I use
              to bring ideas to life.
            </p>
          </motion.div>

          {/* Biography card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="rounded-3xl border border-emerald-900/40 bg-[#0a1510]/60 p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              I turn ideas into{" "}
              <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                functional digital products.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-7 text-neutral-400 sm:mt-7 sm:text-base sm:leading-8">
              I'm a passionate Full Stack Developer who enjoys building
              applications from frontend interfaces to backend systems,
              databases, and APIs. I focus on high performance, clean
              architecture, maintainable code, and immersive user experiences.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-5 border-t border-emerald-950 pt-7 sm:mt-10 sm:pt-8">
              <div>
                <p className="font-mono text-2xl font-bold text-white sm:text-3xl">
                  100%
                </p>

                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500 sm:text-xs">
                  Commitment
                </p>
              </div>

              <div>
                <p className="font-mono text-2xl font-bold text-emerald-400 sm:text-3xl">
                  Clean
                </p>

                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500 sm:text-xs">
                  Architecture
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Skills section */}
        <div className="mt-20 sm:mt-24 lg:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-10 max-w-2xl sm:mb-12"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-emerald-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">
                My Tech Stack
              </span>
            </div>

            <h3 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Technologies I <span className="text-emerald-400">use.</span>
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
              The tools, frameworks, and languages I use to build modern,
              scalable, and user-friendly digital products.
            </p>
          </motion.div>

          {/* Skill cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7"
          >
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-[#0a1510]/50 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#0b1912]/80 hover:shadow-[0_12px_40px_rgba(16,185,129,0.06)] sm:p-8"
              >
                {/* Card glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-400/[0.04] blur-3xl transition-colors duration-300 group-hover:bg-emerald-400/[0.10]" />

                <div className="relative">
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <h4 className="max-w-[230px] text-lg font-semibold leading-snug text-white sm:text-xl">
                      {category.title}
                    </h4>

                    <span className="shrink-0 font-mono text-xs text-emerald-500/60 transition-colors group-hover:text-emerald-400">
                      [0{index + 1}]
                    </span>
                  </div>

                  <div className="mb-6 h-px w-full bg-gradient-to-r from-emerald-500/30 via-emerald-900/40 to-transparent" />

                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-300 transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-900/40 hover:text-white sm:text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
