"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BookOpen, Lock, AlertTriangle, ArrowRight, Sun, Moon, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing in the URL.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password.");
        toast.error("Password reset failed!");
      } else {
        setSuccess(true);
        toast.success("Password updated successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError("A system error occurred.");
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 bg-slate-100 dark:bg-slate-850 border border-indigo-500/30 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-none transition"
          aria-label="Toggle Dark Mode"
        >
          {mounted ? (
            resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Parchment Fibers Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.015] flex justify-center items-center">
        <img
          className="w-full h-full object-cover filter sepia grayscale"
          src="https://www.transparenttextures.com/patterns/paper-fibers.png"
          alt="Parchment overlay"
        />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-850 border border-indigo-500 p-8 sm:p-10 rounded-none shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-purple-650/10 border border-indigo-500/30 text-purple-655 dark:text-purple-400 rounded-none mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-extrabold uppercase tracking-widest text-purple-655 dark:text-purple-400">
            Reset Password
          </h1>
          <div className="w-12 h-0.5 bg-indigo-500 mx-auto mt-2 mb-4"></div>
          <p className="font-body-serif italic text-xs text-slate-500 dark:text-slate-400">
            Create a new strong password for your account.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/5 dark:bg-red-955/10 border border-red-500/30 text-red-650 dark:text-red-400 text-xs rounded-none">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {!token && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-500/5 dark:bg-amber-955/10 border border-amber-500/30 text-amber-650 dark:text-amber-400 text-xs rounded-none">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>No reset token detected in the URL. Please check your link.</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                New Password (Min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm font-medium"
                  required
                  disabled={!token}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/60" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm font-medium"
                  required
                  disabled={!token}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 px-4 bg-purple-650 hover:bg-purple-550 border border-indigo-500 shadow-md text-white font-bold text-xs uppercase tracking-widest rounded-none transition flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Saving New Password..." : "Update Password"}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
              Password Reset Successful
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body-serif italic">
              Your password has been successfully updated. Redirecting you to login page...
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-indigo-500/10 pt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-purple-655 dark:text-purple-400 hover:text-purple-550 font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="animate-spin rounded-none h-6 w-6 border-t border-b border-indigo-500"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
