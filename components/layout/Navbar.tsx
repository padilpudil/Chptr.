"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { BookOpen, Search, Sun, Moon, PenTool, Bookmark, User as UserIcon, LogOut, ChevronDown, Menu, X, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbarSearch, setShowNavbarSearch] = useState(false);
  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.username) {
      const fetchAvatar = async () => {
        try {
          const res = await fetch(`/api/users/${session.user.username}`);
          if (res.ok) {
            const data = await res.json();
            if (data.user?.avatarUrl) {
              setDbAvatarUrl(data.user.avatarUrl);
            }
          }
        } catch (err) {
          console.error("Failed to fetch avatar from DB:", err);
        }
      };
      fetchAvatar();
    } else {
      setDbAvatarUrl(null);
    }
  }, [status, session?.user?.username]);

  const avatarSrc = dbAvatarUrl || session?.user?.image;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setShowNavbarSearch(true);
      return;
    }

    // Hide initially on homepage
    setShowNavbarSearch(false);

    const heroSearch = document.getElementById("hero-search-form");
    
    if (!heroSearch) {
      // Fallback scroll listener if element is not found
      const handleScroll = () => {
        if (window.scrollY > 460) {
          setShowNavbarSearch(true);
        } else {
          setShowNavbarSearch(false);
        }
      };
      handleScroll();
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show navbar search only when the hero search bar is scrolled past the sticky navbar (64px)
        const showSearch = !entry.isIntersecting && entry.boundingClientRect.top < 64;
        setShowNavbarSearch(showSearch);
      },
      {
        rootMargin: "-64px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(heroSearch);
    return () => observer.disconnect();
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/works?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isReaderPage = /^\/works\/[^/]+\/chapters\/[^/]+$/.test(pathname);
  if (isReaderPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-500/20 bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="font-logo text-3xl sm:text-4xl text-purple-655 dark:text-purple-400 transition hover:text-indigo-500 normal-case tracking-normal font-normal">
            Chptr.
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <form 
          onSubmit={handleSearch} 
          className={`hidden lg:flex relative max-w-xs lg:max-w-md w-full mx-4 transition-all duration-300 ${
            showNavbarSearch 
              ? "opacity-100 translate-y-0 pointer-events-auto" 
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <input
            type="text"
            placeholder="Search works, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-0 pr-8 py-1.5 bg-transparent border-0 border-b border-indigo-500/40 text-slate-800 dark:text-slate-200 placeholder-slate-400/60 focus:outline-none focus:border-indigo-500 focus:ring-0 transition text-sm italic"
          />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
        </form>

        {/* Navigation & Controls - Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/works" className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-350 hover:text-indigo-500 transition">
            Archive
          </Link>
          {status === "authenticated" && (
            <Link href="/bookmarks" className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-350 hover:text-indigo-500 transition flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks</span>
            </Link>
          )}
          <Link
            href="/works/new"
            className="text-xs font-bold uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-550 py-2 px-4 border border-indigo-500 shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-lg transition"
            aria-label="Toggle Dark Mode"
          >
            {mounted ? (
              resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* User Section */}
          {status === "loading" ? (
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : status === "authenticated" ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-900 border border-indigo-500/35 rounded-none transition"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={session.user.username || "avatar"}
                    className="w-5 h-5 object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 bg-purple-655 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {session.user?.username?.substring(0, 2) || "UN"}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[80px] truncate">
                  {session.user?.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-450" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-50 dark:bg-slate-900 border border-indigo-500 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150 rounded-none">
                  <div className="px-4 py-2 border-b border-indigo-500/20">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">LOGGED IN AS</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {session.user?.email}
                    </p>
                  </div>
                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-red-650 dark:text-red-400 hover:bg-red-500/5 transition font-bold uppercase tracking-wider border-b border-indigo-500/20"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <Link
                    href={`/users/${session.user?.username}`}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-750 dark:text-slate-350 hover:bg-slate-200/50 dark:hover:bg-slate-850/50 transition uppercase tracking-wider"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-450" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/bookmarks"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-750 dark:text-slate-350 hover:bg-slate-200/50 dark:hover:bg-slate-850/50 transition uppercase tracking-wider"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-450" />
                    <span>Bookmarks</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-650 hover:bg-red-500/5 transition text-left border-t border-indigo-500/20 mt-1 uppercase tracking-wider font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs font-semibold uppercase tracking-widest text-slate-655 dark:text-slate-300 hover:text-indigo-500 transition">
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 py-1.5 px-4 border border-indigo-500 shadow transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Controls - Mobile & Tablet (Hamburger + Theme) */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-lg transition"
          >
            {mounted ? (
              resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-indigo-500/20 bg-slate-50 dark:bg-slate-950 px-4 py-4 space-y-4 animate-in fade-in duration-200">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-0 pr-8 py-2 bg-transparent border-0 border-b border-indigo-500/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 italic focus:ring-0"
            />
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
          </form>

          {/* Links */}
          <nav className="flex flex-col space-y-2">
            <Link
              href="/works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-indigo-500 px-2 py-2 rounded-none hover:bg-slate-200/50 dark:hover:bg-slate-900 transition-colors"
            >
              Explore Archive
            </Link>
            {status === "authenticated" && (
              <Link
                href="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-indigo-500 px-2 py-2 rounded-none hover:bg-slate-200/50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>My Bookmarks</span>
              </Link>
            )}
            <Link
              href="/works/new"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-widest text-purple-655 dark:text-purple-400 hover:text-purple-550 px-2 py-2 rounded-none hover:bg-slate-200/50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Write Story</span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="border-t border-indigo-500/20 pt-4">
            {status === "authenticated" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={session.user.username || "avatar"}
                      className="w-8 h-8 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-655 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {session.user?.username?.substring(0, 2) || "UN"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-250 truncate">
                      {session.user?.username}
                    </p>
                    <p className="text-xs text-slate-455 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-red-650 dark:text-red-400 font-bold px-2 py-2 hover:bg-red-500/5 flex items-center gap-2 uppercase tracking-wider transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <Link
                    href={`/users/${session.user?.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-slate-655 dark:text-slate-350 px-2 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-900 flex items-center gap-2 uppercase tracking-wider transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-xs text-red-655 px-2 py-2 hover:bg-red-500/5 flex items-center gap-2 text-left uppercase tracking-wider transition-colors font-bold border-t border-indigo-500/20 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-widest border border-indigo-500/40 text-slate-700 dark:text-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-widest bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-indigo-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
