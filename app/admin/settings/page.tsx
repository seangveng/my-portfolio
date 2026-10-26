"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Save,
  Settings2,
} from "lucide-react";

type Settings = {
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
  heroTitle: string;
  heroDescription: string;
  developerTitle: string;
  profileImageUrl: string;
  linkedinUrl: string;
};

const defaults: Settings = {
  siteName: "My Portfolio",
  siteDescription: "My personal portfolio website",
  logoUrl: "",
  contactEmail: "",
  phone: "",
  address: "Cambodia",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  githubUrl: "",
  maintenanceMode: false,
  heroTitle: "សូមស្វាគមន៍! ខ្ញុំឈ្មោះ ស៊ូ ស៊ាងវេង គឺជាអ្នកអភិវឌ្ឍន៍គេហទំព័រ។",
  heroDescription:
    "I'm a Full Stack Developer focused on creating modern, responsive and scalable web applications with great user experiences.",
  developerTitle: "Full Stack Developer",
  profileImageUrl: "/images/veng.jpg",
  linkedinUrl: "",
};

const fields: {
  key: keyof Pick<
    Settings,
    | "heroTitle"
    | "developerTitle"
    | "heroDescription"
    | "profileImageUrl"
    | "githubUrl"
    | "linkedinUrl"
  >;
  label: string;
  hint: string;
  multiline?: boolean;
}[] = [
  {
    key: "heroTitle",
    label: "Hero welcome text",
    hint: "The animated headline on your homepage.",
    multiline: true,
  },
  {
    key: "developerTitle",
    label: "Developer title",
    hint: "The badge above your headline.",
  },
  {
    key: "heroDescription",
    label: "Hero description",
    hint: "The paragraph under the headline.",
    multiline: true,
  },
  {
    key: "profileImageUrl",
    label: "Profile image URL",
    hint: "Example: /images/veng.jpg",
  },
  {
    key: "githubUrl",
    label: "GitHub URL",
    hint: "Your public GitHub profile.",
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn URL",
    hint: "Your public LinkedIn profile.",
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load settings.");
        }

        if (active) {
          setSettings({ ...defaults, ...data.settings });
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load settings.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save settings.");
      }

      setSettings({ ...defaults, ...data.settings });
      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050807] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-emerald-400"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </a>

        <header className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
            <Settings2 size={25} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Website Settings
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Edit your portfolio homepage without changing your code.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-neutral-300">
            <LoaderCircle className="animate-spin" size={20} />
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
              <h2 className="mb-1 text-lg font-semibold">Hero section</h2>
              <p className="mb-6 text-sm text-neutral-400">
                These fields control the content visitors see on your homepage.
              </p>

              <div className="space-y-5">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="mb-2 block text-sm font-medium text-neutral-200"
                    >
                      {field.label}
                    </label>

                    {field.multiline ? (
                      <textarea
                        id={field.key}
                        value={settings[field.key]}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        rows={field.key === "heroTitle" ? 3 : 4}
                        maxLength={2000}
                        className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    ) : (
                      <input
                        id={field.key}
                        type="text"
                        value={settings[field.key]}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        maxLength={2000}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    )}

                    <p className="mt-2 text-xs text-neutral-500">
                      {field.hint}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
              <h2 className="mb-1 text-lg font-semibold">
                Website information
              </h2>
              <p className="mb-6 text-sm text-neutral-400">
                These values are also used by your other public sections.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ["siteName", "Website name"],
                    ["siteDescription", "Website description"],
                    ["logoUrl", "Logo URL"],
                    ["contactEmail", "Contact email"],
                    ["phone", "Phone"],
                    ["address", "Address"],
                    ["facebookUrl", "Facebook URL"],
                    ["instagramUrl", "Instagram URL"],
                    ["tiktokUrl", "TikTok URL"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label
                      htmlFor={key}
                      className="mb-2 block text-sm font-medium text-neutral-200"
                    >
                      {label}
                    </label>
                    <input
                      id={key}
                      value={settings[key]}
                      onChange={(event) => updateField(key, event.target.value)}
                      maxLength={2000}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-emerald-500/60"
                    />
                  </div>
                ))}
              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-4">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(event) =>
                    updateField("maintenanceMode", event.target.checked)
                  }
                  className="size-4 accent-emerald-500"
                />
                <span>
                  <span className="block text-sm font-medium">
                    Maintenance mode
                  </span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Saves the setting; connect it to your site-wide maintenance
                    logic separately if needed.
                  </span>
                </span>
              </label>
            </section>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300"
              >
                <CheckCircle2 size={18} />
                {message}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-400 transition hover:text-emerald-400"
              >
                Preview portfolio ↗
              </a>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving..." : "Save settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
