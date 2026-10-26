"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Music2,
  Globe,
} from "lucide-react";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconGitBranch,
} from "@tabler/icons-react";

type SiteSettings = {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  contactEmail: string;
  phone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  githubUrl: string;
  maintenanceMode: boolean;
};

const defaultSettings: SiteSettings = {
  siteName: "My Portfolio",
  siteDescription: "Have a project in mind or want to discuss an opportunity?",
  logoUrl: "",
  contactEmail: "",
  phone: "",
  address: "Cambodia",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  githubUrl: "",
  maintenanceMode: false,
};

const inputClass =
  "w-full rounded-xl border border-emerald-900/50 bg-[#07100b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60";

const socialLinkClass =
  "flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-900/40 text-neutral-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400";

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const [settingsLoading, setSettingsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the latest public website settings.
  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings/public", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load website settings.");
        }

        const data = await response.json();

        // Supports either { settings: {...} } or a direct settings object.
        const savedSettings = data.settings ?? data;

        if (active) {
          setSettings({
            ...defaultSettings,
            ...savedSettings,
          });
        }
      } catch (err) {
        console.error("Failed to load contact settings:", err);
      } finally {
        if (active) {
          setSettingsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data: {
        success?: boolean;
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.error || data.message || "Failed to send your message.",
        );
      }

      setSuccess(
        data.message || "Thank you! Your message has been sent successfully.",
      );

      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const socialLinks = [
    {
      label: "GitHub",
      href: settings.githubUrl,
      Icon: IconGitBranch,
    },
    {
      label: "Facebook",
      href: settings.facebookUrl,
      Icon: IconBrandFacebook,
    },
    {
      label: "Instagram",
      href: settings.instagramUrl,
      Icon: IconBrandInstagram,
    },
    {
      label: "TikTok",
      href: settings.tiktokUrl,
      Icon: Music2,
    },
  ].filter((item) => item.href.trim() !== "");

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#050B08] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
            <Mail className="h-4 w-4" />
            Get in touch
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Let&apos;s work <span className="text-emerald-400">together.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-neutral-400 sm:text-lg">
            {settings.siteDescription ||
              "Have a project in mind or want to discuss an opportunity? Send me a message."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Contact information */}
          <div className="rounded-3xl border border-emerald-900/40 bg-[#0a1510] p-6 sm:p-8">
            <h3 className="text-xl font-semibold">Contact information</h3>

            <p className="mt-3 leading-7 text-neutral-400">
              Feel free to reach out. I&apos;m always open to discussing new
              projects, creative ideas, and opportunities.
            </p>

            <div className="mt-8 space-y-3">
              {settingsLoading ? (
                <div className="flex items-center gap-3 p-3 text-sm text-neutral-400">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading contact information...
                </div>
              ) : (
                <>
                  {settings.contactEmail.trim() && (
                    <a
                      href={`mailto:${settings.contactEmail.trim()}`}
                      className="group flex items-start gap-4 rounded-2xl border border-transparent p-3 transition hover:border-emerald-900/50 hover:bg-white/[0.03]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Mail className="h-5 w-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm text-neutral-400">
                          Email
                        </span>
                        <span className="mt-1 block break-all text-sm font-medium text-white group-hover:text-emerald-400">
                          {settings.contactEmail}
                        </span>
                      </span>
                    </a>
                  )}

                  {settings.phone.trim() && (
                    <a
                      href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                      className="group flex items-start gap-4 rounded-2xl border border-transparent p-3 transition hover:border-emerald-900/50 hover:bg-white/[0.03]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Phone className="h-5 w-5" />
                      </span>

                      <span>
                        <span className="block text-sm text-neutral-400">
                          Phone
                        </span>
                        <span className="mt-1 block text-sm font-medium text-white group-hover:text-emerald-400">
                          {settings.phone}
                        </span>
                      </span>
                    </a>
                  )}

                  {settings.address.trim() && (
                    <div className="flex items-start gap-4 rounded-2xl p-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <MapPin className="h-5 w-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm text-neutral-400">
                          Location
                        </span>
                        <span className="mt-1 block whitespace-pre-line text-sm font-medium text-white">
                          {settings.address}
                        </span>
                      </span>
                    </div>
                  )}

                  {!settings.contactEmail.trim() &&
                    !settings.phone.trim() &&
                    !settings.address.trim() && (
                      <p className="rounded-xl border border-emerald-900/40 bg-[#07110c] p-4 text-sm text-neutral-400">
                        Contact details have not been configured yet.
                      </p>
                    )}
                </>
              )}
            </div>

            <div className="mt-8 border-t border-emerald-900/40 pt-6">
              <p className="text-sm text-neutral-400">Find me online</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={socialLinkClass}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}

                {!settingsLoading && socialLinks.length === 0 && (
                  <p className="text-sm text-neutral-500">
                    Social links will appear here when configured.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-3xl border border-emerald-900/40 bg-[#0a1510] p-6 sm:p-8">
            <h3 className="text-xl font-semibold">Send me a message</h3>

            <p className="mt-2 text-sm text-neutral-400">
              Fill in the form below to get in touch.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium text-neutral-200"
                >
                  Your name
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium text-neutral-200"
                >
                  Email address
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-neutral-200"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tell me about your project..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  disabled={loading}
                  className={`${inputClass} resize-y leading-6`}
                />

                <p className="mt-2 text-right text-xs text-neutral-500">
                  {message.length}/5000
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-sm text-emerald-300"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-[#041009] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Sending message...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-neutral-500">
                Your message will be sent securely to the portfolio contact
                system.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
