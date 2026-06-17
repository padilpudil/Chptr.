"use client";

import Link from "next/link";
import { Rating, WorkStatus, TagType } from "@prisma/client";
import { Book, MessageSquare, Heart, Bookmark, Calendar, Languages, Star } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  type: TagType;
}

interface WorkCardProps {
  work: {
    id: string;
    title: string;
    summary: string;
    rating: Rating;
    status: WorkStatus;
    language: string;
    coverUrl: string | null;
    wordCount: number;
    updatedAt: Date | string;
    author: {
      username: string;
      avatarUrl: string | null;
    };
    tags: Array<{ tag: Tag }>;
    ratings?: Array<{ value: number }>;
    _count: {
      chapters: number;
      kudos: number;
      comments: number;
      bookmarks: number;
    };
  };
}

const RATING_LABELS: Record<Rating, string> = {
  GENERAL: "General",
  TEEN: "Teen",
  MATURE: "Mature",
  EXPLICIT: "Explicit",
};

export default function WorkCard({ work }: WorkCardProps) {
  // Extract and flat tags
  const tags = work.tags.map(t => t.tag);

  // Calculate dynamic rating details
  const totalRatings = work.ratings?.length || 0;
  const ratingSum = work.ratings?.reduce((sum, r) => sum + r.value, 0) || 0;
  const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
  const starsCount = Math.round(averageRating);

  return (
    <article className="group bg-slate-50/50 dark:bg-slate-900/10 border border-indigo-500/40 hover:border-indigo-500 rounded-none p-5 transition duration-500 flex flex-col sm:flex-row gap-5">
      {/* Cover image (book layout) */}
      <div className="w-full sm:w-28 h-36 bg-slate-100 dark:bg-slate-950 border border-indigo-500/30 rounded-none overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
        {work.coverUrl ? (
          <img
            src={work.coverUrl}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 desaturate-[0.2] group-hover:desaturate-0"
            loading="lazy"
          />
        ) : (
          <Book className="w-10 h-10 text-indigo-500/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0 flex flex-col justify-between">
        <div>
          {/* Title and Rating */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <h3 className="font-serif text-lg font-extrabold text-purple-655 dark:text-purple-400 capitalize hover:text-indigo-500 transition leading-tight pr-2">
              <Link href={`/works/${work.id}`}>{work.title}</Link>
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 border border-indigo-500/35 text-indigo-600 dark:text-indigo-400">
              {RATING_LABELS[work.rating]}
            </span>
          </div>

          {/* Author */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            By{" "}
            <Link
              href={`/users/${work.author.username}`}
              className="font-serif italic font-bold hover:text-indigo-500 transition"
            >
              {work.author.username}
            </Link>
          </p>

          {/* 5-Star Rating representation */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < starsCount ? "text-[#C5A059] fill-[#C5A059]/10" : "text-slate-200 dark:text-slate-800"
                  }`}
                />
              ))}
            </div>
            {totalRatings > 0 ? (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 italic">
                No ratings
              </span>
            )}
          </div>

          {/* Summary */}
          <p className="font-body-serif text-xs sm:text-sm text-slate-655 dark:text-slate-350 mt-3 line-clamp-2 leading-relaxed">
            {work.summary}
          </p>

          {/* Custom Literary Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 max-h-16 overflow-hidden">
              {tags.slice(0, 5).map((tag) => (
                <Link
                   key={tag.id}
                  href={`/works?tag=${encodeURIComponent(tag.name)}`}
                  className="text-xs font-serif italic text-indigo-600 dark:text-indigo-400 hover:text-purple-655 chip-underline capitalize transition"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-indigo-500/10 text-xs sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <Book className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {work.wordCount.toLocaleString("en-US")} Words &bull; {work._count.chapters} Chapters
            </span>
          </span>

          <span className="flex items-center gap-0.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>{work._count.kudos} Kudos</span>
          </span>

          <span className="flex items-center gap-0.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>{work._count.comments} Comments</span>
          </span>

          <span className="flex items-center gap-0.5">
            <Bookmark className="w-3.5 h-3.5 text-teal-500" />
            <span>{work._count.bookmarks} Bookmarks</span>
          </span>

          <span className="flex items-center gap-0.5 sm:ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>Updated: {new Date(work.updatedAt).toLocaleDateString("en-US")}</span>
          </span>

          <span className="flex items-center gap-0.5">
            <Languages className="w-3.5 h-3.5" />
            <span className="uppercase">{work.language}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
