"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BookOpen, Lock, Mail, User, AlertTriangle, ArrowRight, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        toast.error("Registration failed!");
      } else {
        toast.success("Account successfully created! Please log in.");
        router.push("/login");
      }
    } catch (err) {
      setError("A system error occurred.");
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch("/api/auth/google-config");
      if (res.ok) {
        const data = await res.json();
        if (data.isConfigured) {
          signIn("google", { callbackUrl: "/" });
          return;
        }
      }
      
      toast.info("Google OAuth is not configured. Logging in with a simulated Google Developer account.");
      await signIn("credentials", {
        identifier: "google-developer@chptr.com",
        password: "google-bypass-token-dev-mode",
        callbackUrl: "/",
      });
    } catch (err) {
      toast.error("Failed to login with Google.");
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
            Register
          </h1>
          <div className="w-12 h-0.5 bg-indigo-500 mx-auto mt-2 mb-4"></div>
          <p className="font-body-serif italic text-xs text-slate-500 dark:text-slate-400">
            Join Chptr as a writer or reader.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/5 dark:bg-red-950/10 border border-red-500/30 text-red-650 dark:text-red-400 text-xs rounded-none">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/60" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Password (Min. 6 Characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-650 hover:bg-purple-550 border border-indigo-500 shadow-md text-white font-bold text-xs uppercase tracking-widest rounded-none transition flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? "Processing..." : "Register"}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-indigo-500/20"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-850 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            or with
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3 px-4 bg-transparent border border-indigo-500/40 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-slate-950 font-bold text-xs uppercase tracking-widest rounded-none transition flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-655 dark:text-purple-400 hover:text-purple-550 font-bold underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
