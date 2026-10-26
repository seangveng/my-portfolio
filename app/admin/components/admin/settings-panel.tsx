"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Settings2,
  Globe,
  Mail,
  Share2,
  ShieldCheck,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Music2,
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

const INITIAL_SETTINGS: SiteSettings = {
  siteName: "My Portfolio",
  siteDescription: "My personal portfolio website",
  logoUrl: "",
  contactEmail: "",
  phone: "",
  address: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  githubUrl: "",
  maintenanceMode: false,
};

const cardClass = "rounded-2xl border border-emerald-900/40 bg-[#0a1510]";

const inputClass =
  "w-full rounded-xl border border-emerald-900/50 bg-[#07110c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10";

function SettingsField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  help?: string;
}) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="text-sm font-medium text-neutral-300">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />

      {help && <span className="block text-xs text-neutral-500">{help}</span>}
    </label>
  );
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="flex items-start gap-3 border-b border-emerald-900/30 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-neutral-400">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const updateField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setNotice("");
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/admin/login?timeout=1";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load website settings.");
      }

      setSettings({
        ...INITIAL_SETTINGS,
        ...result.settings,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load website settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/admin/login?timeout=1";
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save website settings.");
      }

      setSettings({
        ...INITIAL_SETTINGS,
        ...result.settings,
      });

      setNotice("Website settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save website settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={`${cardClass} flex min-h-72 items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
          <p className="text-sm text-neutral-400">
            Loading website settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
            <Settings2 className="h-4 w-4 text-emerald-400" />
            <span>Admin</span>
            <span>/</span>
            <span className="text-emerald-300">Settings</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Website Settings
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Manage your portfolio information, contact details, and website
            preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSettings()}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/50 bg-[#0a1510] px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1 break-words">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-sm text-emerald-300"
        >
          <Check className="h-5 w-5 shrink-0" />
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-emerald-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-6">
        {/* General settings */}
        <SettingsSection
          title="General Information"
          description="Manage the name, description, and branding of your portfolio."
          icon={Globe}
        >
          <SettingsField
            label="Website Name"
            value={settings.siteName}
            onChange={(value) => updateField("siteName", value)}
            placeholder="My Portfolio"
          />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-neutral-300">
              Website Description
            </span>

            <textarea
              value={settings.siteDescription}
              onChange={(event) =>
                updateField("siteDescription", event.target.value)
              }
              rows={4}
              maxLength={500}
              placeholder="Describe your portfolio..."
              className={`${inputClass} resize-y`}
            />

            <p className="text-right text-xs text-neutral-500">
              {settings.siteDescription.length}/500 characters
            </p>
          </label>

          <SettingsField
            label="Logo URL"
            value={settings.logoUrl}
            onChange={(value) => updateField("logoUrl", value)}
            placeholder="https://example.com/logo.png"
            type="url"
            help="Enter the URL of your website logo."
          />

          {settings.logoUrl && (
            <div className="flex items-center gap-4 rounded-xl border border-emerald-900/40 bg-[#07110c] p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-900/40 bg-[#0a1510]">
                <img
                  src={settings.logoUrl}
                  alt="Website logo preview"
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Logo Preview</p>
                <p className="mt-1 break-all text-xs text-neutral-500">
                  {settings.logoUrl}
                </p>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Contact settings */}
        <SettingsSection
          title="Contact Information"
          description="Choose how visitors can reach you."
          icon={Mail}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SettingsField
              label="Contact Email"
              value={settings.contactEmail}
              onChange={(value) => updateField("contactEmail", value)}
              placeholder="hello@example.com"
              type="email"
            />

            <SettingsField
              label="Phone Number"
              value={settings.phone}
              onChange={(value) => updateField("phone", value)}
              placeholder="+855 ..."
              type="tel"
            />
          </div>

          <SettingsField
            label="Address"
            value={settings.address}
            onChange={(value) => updateField("address", value)}
            placeholder="Your address or office location"
          />
        </SettingsSection>

        {/* Social media */}
        <SettingsSection
          title="Social Media"
          description="Connect your portfolio to your social profiles."
          icon={Share2}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="relative">
              <IconBrandFacebook className="absolute left-3 top-[42px] h-4 w-4 text-emerald-500" />
              <div className="[&_input]:pl-10">
                <SettingsField
                  label="Facebook"
                  value={settings.facebookUrl}
                  onChange={(value) => updateField("facebookUrl", value)}
                  placeholder="https://facebook.com/yourpage"
                  type="url"
                />
              </div>
            </div>

            <div className="relative">
              <IconBrandInstagram className="absolute left-3 top-[42px] h-4 w-4 text-emerald-500" />
              <div className="[&_input]:pl-10">
                <SettingsField
                  label="Instagram"
                  value={settings.instagramUrl}
                  onChange={(value) => updateField("instagramUrl", value)}
                  placeholder="https://instagram.com/yourprofile"
                  type="url"
                />
              </div>
            </div>

            <div className="relative">
              <Music2 className="absolute left-3 top-[42px] h-4 w-4 text-emerald-500" />
              <div className="[&_input]:pl-10">
                <SettingsField
                  label="TikTok"
                  value={settings.tiktokUrl}
                  onChange={(value) => updateField("tiktokUrl", value)}
                  placeholder="https://tiktok.com/@yourprofile"
                  type="url"
                />
              </div>
            </div>

            <div className="relative">
              <IconGitBranch className="absolute left-3 top-[42px] h-4 w-4 text-emerald-500" />
              <div className="[&_input]:pl-10">
                <SettingsField
                  label="GitHub"
                  value={settings.githubUrl}
                  onChange={(value) => updateField("githubUrl", value)}
                  placeholder="https://github.com/yourusername"
                  type="url"
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Website controls */}
        <SettingsSection
          title="Website Controls"
          description="Manage website availability and maintenance preferences."
          icon={ShieldCheck}
        >
          <div className="flex flex-col gap-4 rounded-xl border border-emerald-900/40 bg-[#07110c] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="font-medium text-white">Maintenance Mode</p>
                <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-400">
                  {settings.maintenanceMode
                    ? "Enabled. The public website must implement this setting to display a maintenance page."
                    : "Disabled. Your public website can operate normally."}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.maintenanceMode}
              onClick={() =>
                updateField("maintenanceMode", !settings.maintenanceMode)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                settings.maintenanceMode ? "bg-emerald-500" : "bg-neutral-700"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  settings.maintenanceMode ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ImageIcon className="h-4 w-4 text-emerald-400" />
            Your changes will be stored in your MongoDB database.
          </div>
        </SettingsSection>

        {/* Save settings */}
        <div
          className={`${cardClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
        >
          <div>
            <p className="font-semibold text-white">Save Changes</p>
            <p className="mt-1 text-sm text-neutral-400">
              Save your website preferences and settings.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#041009] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
