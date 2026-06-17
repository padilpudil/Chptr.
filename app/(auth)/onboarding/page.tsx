"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookOpen, User, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && session?.user?.username && !session.user.username.startsWith("pending_google_")) {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || (status === "authenticated" && session?.user?.username && !session.user.username.startsWith("pending_google_"))) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent animate-spin rounded-none"></div>
          <p className="font-body-serif italic text-xs text-slate-500 dark:text-slate-400">
            {status === "loading" ? "Checking session..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username can only contain alphanumeric characters and underscores.");
      return;
    }

    if (cleanUsername.startsWith("pending_google_")) {
      setError("This prefix is reserved. Please choose another username.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update username.");
        toast.error("Username update failed!");
      } else {
        // Force NextAuth session cookie update
        if (update) {
          await update({ username: cleanUsername });
        }
        toast.success("Welcome to Chptr! Your username has been saved.");
        router.push("/");
        router.refresh();
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
            Choose Username
          </h1>
          <div className="w-12 h-0.5 bg-indigo-500 mx-auto mt-2 mb-4"></div>
          <p className="font-body-serif italic text-xs text-slate-500 dark:text-slate-400">
            Welcome! Please choose a unique username to complete your profile.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/5 dark:bg-red-955/10 border border-red-500/30 text-red-650 dark:text-red-400 text-xs rounded-none">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Desired Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/60" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., custom_writer"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-650 hover:bg-purple-550 border border-indigo-500 shadow-md text-white font-bold text-xs uppercase tracking-widest rounded-none transition flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Setup"}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>
        </form>
      </div>
    </div>
  );
}
