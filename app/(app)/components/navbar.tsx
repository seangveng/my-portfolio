"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);

  const updateActiveSection = useCallback(() => {
    setIsScrolled(window.scrollY > 20);

    const sections = navItems
      .map((item) => ({
        label: item.label,
        element: document.querySelector(item.href),
      }))
      .filter(
        (
          section,
        ): section is {
          label: string;
          element: Element;
        } => section.element !== null,
      );

    if (window.scrollY < 50) {
      setActiveLink("Home");
      return;
    }

    // Find the section closest to the top navigation offset.
    const scrollPosition = window.scrollY + 140;
    let currentSection = sections[0]?.label ?? "Home";

    for (const section of sections) {
      const element = section.element as HTMLElement;
      const sectionTop = element.getBoundingClientRect().top + window.scrollY;

      if (sectionTop <= scrollPosition) {
        currentSection = section.label;
      }
    }

    setActiveLink(currentSection);
  }, []);

  useEffect(() => {
    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [updateActiveSection]);

  const handleNavigation = (label: string) => {
    setActiveLink(label);
    setMobileOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <nav
          className={`rounded-2xl border px-5 py-3 backdrop-blur-2xl transition-all duration-300 ${
            isScrolled
              ? "border-emerald-500/20 bg-[#050B08]/95 shadow-[0_8px_35px_rgba(0,0,0,0.35),0_0_20px_rgba(16,185,129,0.08)]"
              : "border-emerald-900/40 bg-[#050B08]/75 shadow-[0_0_25px_rgba(16,185,129,0.08)]"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={() => handleNavigation("Home")}
              aria-label="Go to Home"
              className="group flex shrink-0 items-center"
            >
              <Image
                src="/images/sou_seangveng_logo.png"
                alt="Sou Seangveng Logo"
                width={140}
                height={40}
                priority
                sizes="140px"
                className="h-10 w-auto rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-7 rounded-full border border-emerald-950 bg-[#0a1510]/70 px-7 py-2 md:flex lg:gap-8">
              {navItems.map((item) => {
                const isActive = activeLink === item.label;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavigation(item.label)}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative py-1 text-sm transition-colors duration-200 ${
                      isActive
                        ? "font-semibold text-emerald-400"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {item.label}

                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-indicator"
                        className="absolute -bottom-2 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex">
              <a
                href="#cv"
                className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-all duration-300 hover:bg-emerald-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.45)] active:scale-95"
              >
                <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                Download CV
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="rounded-lg border border-emerald-900/50 bg-emerald-950/40 p-2 text-emerald-400 transition-colors hover:bg-emerald-900/30 md:hidden"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile navigation */}
          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                id="mobile-navigation"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden md:hidden"
              >
                <div className="mt-3 flex flex-col gap-1.5 border-t border-emerald-900/30 pt-4">
                  {navItems.map((item) => {
                    const isActive = activeLink === item.label;

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => handleNavigation(item.label)}
                        aria-current={isActive ? "location" : undefined}
                        className={`rounded-xl px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? "border border-emerald-800/40 bg-emerald-950/50 font-medium text-emerald-400"
                            : "text-neutral-400 hover:bg-emerald-950/20 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}

                  <a
                    href="#cv"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-colors hover:bg-emerald-300"
                  >
                    <Download className="h-4 w-4" />
                    Download CV
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
}
