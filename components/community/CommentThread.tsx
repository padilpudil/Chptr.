"use client";

import { useState } from "react";
import { MessageSquare, Trash2, CornerDownRight, Send, X } from "lucide-react";
import { toast } from "sonner";

interface Author {
  username: string;
  avatarUrl: string | null;
}

interface ReplyComment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: Author;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: Author;
  replies?: ReplyComment[];
}

interface CommentThreadProps {
  comment: Comment;
  currentUserId: string | null;
  workAuthorId: string;
  workId: string;
  chapterId?: string | null;
  onDelete: (id: string) => void;
  onReplyAdded: () => void;
}

export default function CommentThread({
  comment,
  currentUserId,
  workAuthorId,
  workId,
  chapterId = null,
  onDelete,
  onReplyAdded,
}: CommentThreadProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const isCommentAuthor = currentUserId === comment.authorId;
  const isWorkAuthor = currentUserId === workAuthorId;
  const canDelete = isCommentAuthor || isWorkAuthor;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId,
          chapterId,
          content: replyContent.trim(),
          parentId: comment.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to send reply.");

      toast.success("Reply sent!");
      setReplyContent("");
      setReplyOpen(false);
      onReplyAdded();
    } catch (err) {
      toast.error("Failed to send reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/comments?commentId=${comment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete comment.");

      toast.success("Comment deleted.");
      onDelete(comment.id);
    } catch (err) {
      toast.error("Failed to delete comment.");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      const response = await fetch(`/api/comments?commentId=${replyId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete reply.");

      toast.success("Reply deleted.");
      onReplyAdded(); // Re-fetch all to refresh the thread
    } catch (err) {
      toast.error("Failed to delete reply.");
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-slate-900/10 border border-indigo-500/30 rounded-none shadow-sm">
      {/* Parent Comment */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {comment.author.avatarUrl ? (
              <img
                src={comment.author.avatarUrl}
                alt={comment.author.username}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                {comment.author.username.substring(0, 2)}
              </div>
            )}
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {comment.author.username}
              </span>
              {comment.authorId === workAuthorId && (
                <span className="text-[11px] font-bold tracking-widest text-purple-650 bg-purple-500/10 px-1.5 py-0.5 rounded-none border border-indigo-500/30 ml-2">
                  AUTHOR
                </span>
              )}
              <span className="text-xs text-slate-455 ml-2 font-semibold" suppressHydrationWarning>
                {new Date(comment.createdAt).toLocaleDateString("en-US")}
              </span>
            </div>
          </div>

          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="text-slate-400 hover:text-red-500 p-1 rounded-none transition"
              title="Delete Comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 pl-9 whitespace-pre-line leading-relaxed">
          {comment.content}
        </p>

        {/* Action Row */}
        {currentUserId && (
          <div className="mt-3 pl-9 flex items-center gap-4 text-xs font-semibold text-slate-455">
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex items-center gap-1.5 hover:text-purple-650 dark:hover:text-purple-400 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        )}
      </div>

      {/* Reply Input Form */}
      {replyOpen && (
        <form onSubmit={handleReplySubmit} className="pl-9 space-y-2 animate-in slide-in-from-top-1 duration-150">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Write a reply to ${comment.author.username}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-indigo-500/30 rounded-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              required
              disabled={submittingReply}
            />
            <button
              type="submit"
              disabled={submittingReply || !replyContent.trim()}
              className="p-2.5 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white rounded-none disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setReplyOpen(false);
                setReplyContent("");
              }}
              className="p-2.5 border border-indigo-500/30 text-slate-500 rounded-none hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 sm:pl-9 border-l border-slate-150 dark:border-slate-800/80 space-y-4 pt-2">
          {comment.replies.map((reply) => {
            const isReplyAuthor = currentUserId === reply.authorId;
            const canDeleteReply = isReplyAuthor || isWorkAuthor;

            return (
              <div key={reply.id} className="relative group/reply">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {reply.author.avatarUrl ? (
                      <img
                        src={reply.author.avatarUrl}
                        alt={reply.author.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                        {reply.author.username.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {reply.author.username}
                      </span>
                      {reply.authorId === workAuthorId && (
                        <span className="text-[11px] font-bold tracking-widest text-purple-650 bg-purple-500/10 px-1.5 py-0.5 rounded-none border border-indigo-500/30 ml-2">
                          AUTHOR
                        </span>
                      )}
                      <span className="text-xs text-slate-455 ml-2 font-semibold" suppressHydrationWarning>
                        {new Date(reply.createdAt).toLocaleDateString("en-US")}
                      </span>
                    </div>
                  </div>

                  {canDeleteReply && (
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-none transition"
                      title="Delete Reply"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-350 mt-1.5 pl-6 whitespace-pre-line leading-relaxed">
                  {reply.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
