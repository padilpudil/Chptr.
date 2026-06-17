"use client";

import { useState, useEffect } from "react";
import { useSession as useAuthSession } from "next-auth/react";
import CommentThread from "./CommentThread";
import { toast } from "sonner";
import { MessageSquare, RefreshCw, Send } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  workId: string;
  chapterId?: string | null;
  workAuthorId: string;
}

export default function CommentSection({
  workId,
  chapterId = null,
  workAuthorId,
}: CommentSectionProps) {
  const { data: session, status } = useAuthSession();
  const currentUserId = session?.user?.id || null;

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // New Comment Input
  const [newCommentText, setNewCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async (cursorVal?: string) => {
    if (cursorVal) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const queryParams = new URLSearchParams({
        workId,
        limit: "20",
      });
      if (chapterId) queryParams.set("chapterId", chapterId);
      if (cursorVal) queryParams.set("cursor", cursorVal);

      const response = await fetch(`/api/comments?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to load comments.");
      const data = await response.json();

      if (cursorVal) {
        setComments((prev) => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [workId, chapterId]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId,
          chapterId,
          content: newCommentText.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to send comment.");

      toast.success("Comment posted!");
      setNewCommentText("");
      // Refresh list
      fetchComments();
    } catch (err) {
      toast.error("Failed to send comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReplyAdded = () => {
    fetchComments();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-indigo-500/10 pb-3">
        <MessageSquare className="w-5 h-5 text-purple-500" />
        <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 uppercase tracking-wider">
          Community Discussion
        </h3>
      </div>

      {/* Write Comment Form */}
      {status === "authenticated" ? (
        <form onSubmit={handleCreateComment} className="space-y-3">
          <div className="flex gap-3">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.username || "avatar"}
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-650 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 mt-1">
                {session.user?.username?.substring(0, 2) || "U"}
              </div>
            )}
            <div className="flex-grow space-y-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write your thoughts or response about this story..."
                className="w-full h-24 px-3 py-2 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-xs sm:text-sm text-slate-850 dark:text-slate-250 placeholder-slate-450 focus:outline-none focus:border-indigo-500 resize-none"
                required
                disabled={submitting}
                maxLength={1000}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newCommentText.trim()}
                  className="px-4 py-2 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white text-xs font-bold rounded-none shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Post Comment"}
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center p-6 bg-slate-50 dark:bg-slate-950 border border-indigo-500/30 rounded-none">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-body-serif italic">
            Please{" "}
            <Link href={`/login?callbackUrl=/works/${workId}`} className="font-bold text-purple-655 hover:underline not-italic">
              log in
            </Link>{" "}
            first to participate in the discussion.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="w-full h-28 bg-slate-900/10 border border-indigo-500/10 rounded-none animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-450 italic text-xs sm:text-sm">
          No comments yet for this story. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              workAuthorId={workAuthorId}
              workId={workId}
              chapterId={chapterId}
              onDelete={handleDeleteComment}
              onReplyAdded={handleReplyAdded}
            />
          ))}

          {/* Load More Button */}
          {nextCursor && (
            <div className="text-center pt-2">
              <button
                onClick={() => fetchComments(nextCursor)}
                disabled={loadingMore}
                className="inline-flex items-center gap-1.5 py-2 px-4 border border-indigo-500/30 hover:bg-indigo-500/5 text-purple-655 dark:text-purple-400 font-bold uppercase tracking-widest text-xs rounded-none transition disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>View previous comments</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
