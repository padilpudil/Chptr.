"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface RatingWidgetProps {
  workId: string;
  isAuthor?: boolean;
  initialAverageRating?: number;
  initialRatingCount?: number;
  initialUserRating?: number | null;
}

export default function RatingWidget({
  workId,
  isAuthor,
  initialAverageRating,
  initialRatingCount,
  initialUserRating = null,
}: RatingWidgetProps) {
  const [averageRating, setAverageRating] = useState(initialAverageRating ?? 0);
  const [ratingCount, setRatingCount] = useState(initialRatingCount ?? 0);
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(initialAverageRating === undefined);
  const [submitting, setSubmitting] = useState(false);

  const fetchRatingStatus = async () => {
    try {
      const response = await fetch(`/api/works/${workId}/rating`);
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.averageRating);
        setRatingCount(data.count);
        setUserRating(data.userRating);
      }
    } catch (err) {
      console.error("Failed to fetch rating status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAverageRating === undefined) {
      fetchRatingStatus();
    }
  }, [workId, initialAverageRating]);

  const handleRate = async (value: number) => {
    if (isAuthor) {
      toast.info("You cannot rate your own story.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/works/${workId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to submit rating");
      } else {
        setAverageRating(data.averageRating);
        setRatingCount(data.count);
        setUserRating(data.userRating);
        toast.success(`Story rated ${value} stars! Thank you.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while submitting rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[38px] sm:h-[42px] w-48 bg-slate-100 dark:bg-slate-950 border border-indigo-500/20 rounded-none animate-pulse"></div>
    );
  }

  // Determine which stars to fill (hover has precedence, then user rating, then average)
  const activeStars = hoverRating !== null ? hoverRating : (userRating || Math.round(averageRating));

  return (
    <div className="inline-flex items-center gap-3.5 px-5 py-2 border border-indigo-500/30 bg-white dark:bg-slate-900/10 rounded-none shadow-sm h-[38px] sm:h-[42px] transition-colors duration-300">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            onClick={() => handleRate(starValue)}
            onMouseEnter={() => !isAuthor && setHoverRating(starValue)}
            onMouseLeave={() => !isAuthor && setHoverRating(null)}
            disabled={isAuthor || submitting}
            className={`transition duration-150 ${isAuthor ? "cursor-default" : "hover:scale-110 active:scale-95"}`}
            title={isAuthor ? `Story rating: ${averageRating}` : `Rate ${starValue} stars`}
          >
            <Star
              className={`w-4 h-4 ${
                starValue <= activeStars
                  ? "text-[#C5A059] fill-[#C5A059]"
                  : "text-slate-200 dark:text-slate-800"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="h-3 w-px bg-indigo-500/20"></div>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-200">
        {ratingCount > 0 ? (
          <span>
            {averageRating.toFixed(1)} <span className="text-[10px] text-slate-400 font-semibold normal-case">({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})</span>
          </span>
        ) : (
          <span className="text-[10px] italic text-slate-400 dark:text-slate-500 normal-case">No ratings yet</span>
        )}
      </span>
      {userRating && (
        <>
          <div className="h-3 w-px bg-indigo-500/20"></div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 border border-[#C5A059]/30">
            Rated: {userRating} ★
          </span>
        </>
      )}
    </div>
  );
}
