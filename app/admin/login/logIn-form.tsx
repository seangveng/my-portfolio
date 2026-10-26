"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
} from "lucide-react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const timedOut = searchParams.get("timeout") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    timedOut ? "Your session expired. Please log in again." : "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const responseText = await response.text();

      if (!contentType.includes("application/json")) {
        console.error("Login API status:", response.status);
        console.error("Login API content type:", contentType);
        console.error("Login API response:", responseText.slice(0, 500));

        throw new Error(
          `Login API returned HTTP ${response.status}. Check app/(app)/api/admin/login/route.ts and your terminal.`,
        );
      }

      let data: {
        success?: boolean;
        error?: string;
        message?: string;
      };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("The login API returned invalid JSON.");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Login failed. Please try again.",
        );
      }

      // Login succeeded; navigate to the dashboard
      window.location.replace("/admin");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to connect to the server.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

      <section className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 shadow-lg shadow-emerald-950/30">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Secure Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>

          <p className="mt-3 text-sm text-slate-400">
            Sign in to manage your portfolio.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          {timedOut && (
            <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Your session expired. Please sign in again.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-emerald-400 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in securely
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <LockKeyhole className="h-3.5 w-3.5" />
            Protected admin access
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Unauthorized access is not permitted.
        </p>
      </section>
    </main>
  );
}
