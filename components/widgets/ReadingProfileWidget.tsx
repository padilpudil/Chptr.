"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Feather, 
  BookMarked, 
  Sparkles, 
  Compass, 
  Archive, 
  Award, 
  Crown,
  Lock
} from "lucide-react";

export default function ReadingProfileWidget() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [readingTime, setReadingTime] = useState(0); // in seconds
  const [readWorksCount, setReadWorksCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalHoveredBadge, setModalHoveredBadge] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const time = parseInt(localStorage.getItem("sastra_reading_time") || "0");
        const readWorks = JSON.parse(localStorage.getItem("sastra_read_works") || "[]");
        setReadingTime(time);
        setReadWorksCount(readWorks.length);
      } catch (e) {
        console.error("Failed to load reading stats", e);
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div className="border border-indigo-500 bg-slate-50/50 dark:bg-slate-900/10 p-6 rounded-none animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 w-2/3 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 w-full"></div>
      </div>
    );
  }

  // Define badges with expanded milestones (more challenging targets)
  const badges = [
    {
      id: "scribe",
      name: "Apprentice Scribe",
      desc: "Read 1 work",
      reqCount: 1,
      icon: Feather,
      unlocked: readWorksCount >= 1,
    },
    {
      id: "wanderer",
      name: "Folklore Wanderer",
      desc: "Read 10 works",
      reqCount: 10,
      icon: Compass,
      unlocked: readWorksCount >= 10,
    },
    {
      id: "collector",
      name: "Prose Collector",
      desc: "Read 25 works",
      reqCount: 25,
      icon: BookMarked,
      unlocked: readWorksCount >= 25,
    },
    {
      id: "archivist",
      name: "Library Archivist",
      desc: "Read 50 works",
      reqCount: 50,
      icon: Archive,
      unlocked: readWorksCount >= 50,
    },
    {
      id: "sage",
      name: "Sage of Words",
      desc: "Read 100 works",
      reqCount: 100,
      icon: Trophy,
      unlocked: readWorksCount >= 100,
    },
    {
      id: "grand_poet",
      name: "Grand Poet",
      desc: "Read 250 works",
      reqCount: 250,
      icon: Sparkles,
      unlocked: readWorksCount >= 250,
    },
    {
      id: "scroll_master",
      name: "Scroll Master",
      desc: "Read 500 works",
      reqCount: 500,
      icon: Award,
      unlocked: readWorksCount >= 500,
    },
    {
      id: "scholar",
      name: "Imperial Scholar",
      desc: "Read 1000 works",
      reqCount: 1000,
      icon: Crown,
      unlocked: readWorksCount >= 1000,
    },
  ];

  // Find next milestone
  const nextBadge = badges.find(b => !b.unlocked);

  // Calculate progress percent to next milestone
  let progressPercent = 100;
  let worksRemaining = 0;
  if (nextBadge) {
    const requiredForNext = nextBadge.reqCount;
    progressPercent = Math.min(100, Math.max(0, (readWorksCount / requiredForNext) * 100));
    worksRemaining = requiredForNext - readWorksCount;
  }

  // Find highest unlocked badge
  const currentBadge = [...badges].reverse().find(b => b.unlocked);
  const currentRankName = currentBadge ? currentBadge.name : "Initiate Scribe";
  const CurrentIcon = currentBadge ? currentBadge.icon : BookOpen;
  const currentRankDesc = currentBadge ? `Unlocked at ${currentBadge.reqCount} reads` : "Begin your reading journey";

  // Format reading time nicely (seconds -> hours/minutes/seconds)
  const formatReadingTime = (seconds: number) => {
    if (seconds === 0) {
      return "0 Seconds";
    }
    if (seconds < 60) {
      return "< 1 Minute";
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} Min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} Hrs`;
    }
    return `${hours} Hrs ${remainingMinutes} Min`;
  };

  const formattedTime = formatReadingTime(readingTime);
  const displayName = status === "authenticated" && session?.user?.username
    ? session.user.username
    : "Reader";

  // Active badge to display info for inside the modal
  const modalActiveBadge = modalHoveredBadge || currentBadge || badges[0];

  return (
    <div className="border border-indigo-500 bg-slate-50/50 dark:bg-slate-900/10 p-6 transition hover:border-indigo-500/80 flex flex-col gap-5">
      <div>
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5 block">
          Reading Achievements
        </span>
        <h3 className="font-serif text-lg text-purple-655 dark:text-purple-400 font-extrabold leading-tight italic">
          Welcome back, {displayName}!
        </h3>
        {status !== "authenticated" && (
          <p className="font-sans text-[11px] text-slate-400 mt-1 italic leading-snug">
            Guest Mode — Progress is saved locally.
          </p>
        )}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-indigo-500/15 p-3.5 text-center bg-slate-100/50 dark:bg-slate-950/20 rounded-none relative overflow-hidden">
          <div className="flex justify-center items-center gap-1.5 mb-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-500/70" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
          </div>
          <span className="font-serif text-sm sm:text-base font-extrabold text-purple-655 dark:text-purple-400 block truncate">
            {formattedTime}
          </span>
        </div>
        <div className="border border-indigo-500/15 p-3.5 text-center bg-slate-100/50 dark:bg-slate-950/20 rounded-none relative overflow-hidden">
          <div className="flex justify-center items-center gap-1.5 mb-1 text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500/70" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Read</span>
          </div>
          <span className="font-serif text-sm sm:text-base font-extrabold text-purple-655 dark:text-purple-400 block">
            {readWorksCount} {readWorksCount === 1 ? "Work" : "Works"}
          </span>
        </div>
      </div>

      {/* Current Level / Rank Spotlight Card */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="border border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] p-3 flex items-center gap-3.5 rounded-none cursor-pointer hover:bg-indigo-500/[0.07] active:scale-[0.98] transition-all duration-300 group"
      >
        <div className="w-10 h-10 flex items-center justify-center border border-indigo-500 bg-white dark:bg-slate-950 text-indigo-500 shadow-sm shrink-0 rounded-none group-hover:border-indigo-500/80 transition-colors">
          <CurrentIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-extrabold text-[#C5A059] uppercase tracking-widest block leading-none mb-1">
            Current Rank
          </span>
          <h4 className="font-serif text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-500 transition-colors">
            {currentRankName}
          </h4>
          <p className="font-sans text-[10px] text-slate-450 mt-0.5 leading-none">
            {currentRankDesc}
          </p>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      {nextBadge ? (
        <div className="border-t border-indigo-500/10 pt-4 flex flex-col gap-2">
          <div className="flex justify-between items-end text-xs">
            <span className="font-serif italic text-slate-600 dark:text-slate-400 text-[11px]">
              Towards <strong className="text-purple-655 dark:text-purple-400 font-bold not-italic">{nextBadge.name}</strong>
            </span>
            <span className="font-sans text-[11px] font-bold text-indigo-500">
              {readWorksCount} / {nextBadge.reqCount}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-none overflow-hidden border border-indigo-500/10">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="font-sans text-[10.5px] text-slate-450 leading-snug">
            Need <strong className="font-bold text-slate-600 dark:text-slate-350">{worksRemaining} more {worksRemaining === 1 ? "read" : "reads"}</strong> to unlock rank.
          </p>
        </div>
      ) : (
        <div className="border-t border-indigo-500/10 pt-4 text-center p-2.5 bg-indigo-500/5 border border-indigo-500/20">
          <Trophy className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
          <h4 className="font-serif text-xs font-bold text-purple-655 dark:text-purple-400">
            All ranks unlocked!
          </h4>
          <p className="font-sans text-[11px] text-slate-400 mt-0.5">
            You achieved the highest rank of Imperial Scholar!
          </p>
        </div>
      )}

      {/* Modal / Popup for Badge Gallery */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-indigo-500 rounded-none shadow-2xl p-6 z-10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-indigo-500/10 pb-3">
              <div>
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block mb-0.5">
                  Collection Guide
                </span>
                <h4 className="font-serif text-base font-extrabold text-purple-655 dark:text-purple-400">
                  Reading Rank Badges
                </h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-100 font-sans font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Grid of Badges */}
            <div className="grid grid-cols-4 gap-2.5">
              {badges.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <div
                    key={badge.id}
                    onMouseEnter={() => setModalHoveredBadge(badge)}
                    onMouseLeave={() => setModalHoveredBadge(null)}
                    className={`aspect-square flex flex-col items-center justify-center border relative group transition-all duration-300 cursor-pointer rounded-none ${
                      badge.unlocked
                        ? "border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] text-indigo-500 hover:bg-indigo-500/[0.08]"
                        : "border-slate-200/50 dark:border-slate-800/60 text-slate-400/50 opacity-40 hover:opacity-75"
                    }`}
                  >
                    {badge.unlocked ? (
                      <IconComponent className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-450/40" />
                    )}

                    {/* Custom Tooltip */}
                    <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 dark:bg-slate-950 text-white text-[10px] p-2 border border-indigo-500/30 rounded-none shadow-xl group-hover:block hidden z-20 text-center transition-all duration-200">
                      <span className="font-serif font-extrabold text-indigo-400 block mb-0.5">{badge.name}</span>
                      <span className="font-sans block text-slate-300">{badge.desc}</span>
                      <span className="font-sans block text-[9px] text-[#C5A059] font-bold mt-1">
                        {badge.unlocked ? "✓ Unlocked" : `Locked (Requires ${badge.reqCount} reads)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Info Panel inside Modal */}
            <div className="min-h-[72px] border border-indigo-500/10 p-3.5 bg-slate-100/30 dark:bg-slate-950/10 flex flex-col justify-center rounded-none">
              {modalActiveBadge ? (
                <div>
                  <h5 className="font-serif text-xs font-extrabold text-purple-655 dark:text-purple-400 flex items-center gap-1.5 leading-none mb-1.5">
                    {modalActiveBadge.unlocked ? (
                      <span className="text-[#C5A059] font-sans">★</span>
                    ) : (
                      <span className="text-slate-400 font-sans">☆</span>
                    )}
                    {modalActiveBadge.name}
                  </h5>
                  <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {modalActiveBadge.desc} • {modalActiveBadge.unlocked ? (
                      <span className="text-emerald-500 font-bold">Unlocked ✓</span>
                    ) : (
                      <span className="text-indigo-500 font-bold">Locked (Requires {modalActiveBadge.reqCount} reads)</span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="font-sans text-[11px] text-slate-400/80 italic text-center">
                  Hover over any badge to view details
                </p>
              )}
            </div>

            {/* Action Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full text-center border border-indigo-500 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-indigo-500 hover:text-slate-950 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer: Register / Login prompt */}
      {status !== "authenticated" && (
        <div className="border-t border-indigo-500/10 pt-4 flex flex-col gap-2.5">
          <p className="font-sans text-[9.5px] text-slate-400/90 leading-relaxed text-center">
            Save achievements by signing in.
          </p>
          <Link
            href="/login"
            className="w-full text-center border border-indigo-500 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-indigo-500 hover:text-slate-950 transition-all duration-300"
          >
            Sign In / Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
