"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Lock, Globe, X, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BookmarkButtonProps {
  workId: string;
  isAuthenticated?: boolean;
  initialBookmarked?: boolean;
  initialNotes?: string;
  initialIsPrivate?: boolean;
}

export default function BookmarkButton({
  workId,
  isAuthenticated = false,
  initialBookmarked,
  initialNotes = "",
  initialIsPrivate = false,
}: BookmarkButtonProps) {
  const { data: session, status } = useSession();

  const [bookmarked, setBookmarked] = useState(initialBookmarked ?? false);
  const [notes, setNotes] = useState(initialNotes);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [loading, setLoading] = useState(initialBookmarked === undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBookmarkStatus = async () => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/works/${workId}/bookmark`);
      if (response.ok) {
        const data = await response.json();
        setBookmarked(data.bookmarked);
        if (data.bookmarkDetails) {
          setNotes(data.bookmarkDetails.notes || "");
          setIsPrivate(data.bookmarkDetails.isPrivate || false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBookmarked === undefined && status === "authenticated") {
      fetchBookmarkStatus();
    }
  }, [workId, status, initialBookmarked]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated") {
      toast.error("Please log in first to bookmark this work.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/works/${workId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim(), isPrivate }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarked(data.bookmarked);
        toast.success("Bookmark saved successfully!");
        setModalOpen(false);
      } else {
        toast.error("Failed to save bookmark.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/works/${workId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: true }),
      });

      if (response.ok) {
        setBookmarked(false);
        setNotes("");
        setIsPrivate(false);
        toast.success("Bookmark removed.");
        setModalOpen(false);
      } else {
        toast.error("Failed to remove bookmark.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const isUserAuthenticated = status === "authenticated" || (status === "loading" && isAuthenticated);

  if (!isUserAuthenticated) {
    return (
      <Link
        href={`/login?callbackUrl=/works/${workId}`}
        className="inline-flex items-center gap-2 py-2 px-5 bg-white dark:bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5 text-slate-655 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 rounded-none font-bold text-xs sm:text-sm uppercase tracking-widest shadow-sm transition"
      >
        <Bookmark className="w-4 h-4" />
        <span>Bookmark Story</span>
      </Link>
    );
  }

  if (loading && status === "authenticated") {
    return (
      <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-none" />
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-2 py-2 px-5 rounded-none border transition-all duration-300 font-bold text-xs sm:text-sm shadow-sm uppercase tracking-widest ${
          bookmarked
            ? "bg-purple-500/10 border-indigo-500 text-purple-600 dark:text-purple-400"
            : "bg-white dark:bg-slate-900 border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5 text-slate-655 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400"
        }`}
        type="button"
      >
        <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-purple-500 text-purple-500" : ""}`} />
        <span>{bookmarked ? "Bookmarked" : "Bookmark Story"}</span>
      </button>

      {modalOpen && (
        <>
          {/* Backdrop Overlay */}
          <div className="fixed inset-0 bg-slate-950/45 dark:bg-slate-950/65 backdrop-blur-sm z-40" onClick={() => setModalOpen(false)}></div>

          {/* Modal Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 border border-indigo-500 p-6 rounded-none shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-180">
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-500" />
                <span>Save Bookmark</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400 mb-2">
                  Personal Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add custom notes for this story..."
                  className="w-full h-24 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-indigo-500/30 rounded-none text-sm placeholder-slate-450 focus:outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-200"
                  maxLength={500}
                />
              </div>

              {/* Private Checkbox */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-indigo-500/20 rounded-none">
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-250 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-650 border-slate-300 focus:ring-purple-500 dark:bg-slate-950"
                    />
                    <span>Set as Private Bookmark</span>
                  </label>
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 max-w-[280px]">
                    If checked, this bookmark will only be visible to you.
                  </p>
                </div>
                {isPrivate ? (
                  <Lock className="w-4 h-4 text-amber-500" />
                ) : (
                  <Globe className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-indigo-500/10">
                {bookmarked ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="py-2 px-4 border border-red-500/35 hover:bg-red-500/10 text-red-655 font-semibold text-xs rounded-none transition"
                  >
                    Remove Bookmark
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="py-2 px-4 border border-indigo-500/30 text-slate-655 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-xs rounded-none transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2 px-4 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white font-bold text-xs rounded-none transition shadow flex items-center gap-1.5"
                  >
                    <span>Save</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
