"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BookOpen, Mail, AlertTriangle, ArrowRight, Sun, Moon, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devLink, setDevLink] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setDevLink("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to initiate password reset.");
        toast.error("Password reset failed!");
      } else {
        setSuccess(true);
        if (data.devLink) {
          setDevLink(data.devLink);
        }
        toast.success("Password reset request submitted!");
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
            Forgot Password
          </h1>
          <div className="w-12 h-0.5 bg-indigo-500 mx-auto mt-2 mb-4"></div>
          <p className="font-body-serif italic text-xs text-slate-500 dark:text-slate-400">
            Reset your account password securely.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/5 dark:bg-red-955/10 border border-red-500/30 text-red-650 dark:text-red-400 text-xs rounded-none">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-650 hover:bg-purple-550 border border-indigo-500 shadow-md text-white font-bold text-xs uppercase tracking-widest rounded-none transition flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Processing..." : "Send Reset Link"}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
              Reset Link Generated
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body-serif italic">
              We have generated a password reset request. In production, a secure link would be sent to your email.
            </p>

            {devLink && (
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-700/10 border border-emerald-500/20 text-left rounded-none">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Development Mode reset link
                </p>
                <Link
                  href={devLink}
                  className="text-xs text-emerald-650 dark:text-emerald-400 hover:underline break-all font-mono"
                >
                  http://localhost:3000{devLink}
                </Link>
              </div>
            )}
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
