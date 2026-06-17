"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface KudosButtonProps {
  workId: string;
  initialCount?: number;
  initialHasKudosed?: boolean;
}

export default function KudosButton({
  workId,
  initialCount,
  initialHasKudosed,
}: KudosButtonProps) {
  const [count, setCount] = useState(initialCount ?? 0);
  const [hasKudosed, setHasKudosed] = useState(initialHasKudosed ?? false);
  const [loading, setLoading] = useState(initialCount === undefined);
  const [animating, setAnimating] = useState(false);

  const fetchKudosStatus = async () => {
    try {
      const response = await fetch(`/api/works/${workId}/kudos`);
      if (response.ok) {
        const data = await response.json();
        setCount(data.count);
        setHasKudosed(data.hasKudosed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCount === undefined) {
      fetchKudosStatus();
    }
  }, [workId, initialCount]);

  const handleKudosClick = async () => {
    if (hasKudosed || loading) return;

    setAnimating(true);
    // Reset animation state shortly after
    setTimeout(() => setAnimating(false), 600);

    try {
      const response = await fetch(`/api/works/${workId}/kudos`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.info(data.error || "Failed to give kudos");
      } else {
        setCount(data.count);
        setHasKudosed(true);
        toast.success("Kudos sent! Thank you.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    }
  };

  return (
    <button
      onClick={handleKudosClick}
      disabled={hasKudosed || loading}
      className={`inline-flex items-center gap-2 py-2 px-5 rounded-none border transition-all duration-300 font-bold text-xs sm:text-sm shadow-sm ${
        hasKudosed
          ? "bg-rose-500/10 border-rose-500/30 text-rose-500 cursor-default"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400/50 hover:bg-rose-50/10 hover:text-rose-500 text-slate-600 dark:text-slate-200"
      }`}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-300 ${
          hasKudosed ? "fill-rose-500 text-rose-500" : ""
        } ${animating ? "scale-[1.5] animate-bounce" : ""}`}
      />
      <span>{count} Kudos</span>
    </button>
  );
}
