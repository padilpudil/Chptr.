export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import { auth } from "@/auth";
import { Rating, WorkStatus, TagType } from "@prisma/client";
import KudosButton from "@/components/community/KudosButton";
import BookmarkButton from "@/components/community/BookmarkButton";
import RatingWidget from "@/components/community/RatingWidget";
import ContinueReadingButton from "@/components/works/ContinueReadingButton";
import CommentSection from "@/components/community/CommentSection";
import { Book, Calendar, Edit3, MessageSquare, Eye, Heart, Bookmark as BookmarkIcon, Globe, Languages, FileText, Shield } from "lucide-react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { createHash } from "crypto";

interface WorkDetailPageProps {
  params: {
    workId: string;
  };
}

const RATING_LABELS: Record<Rating, string> = {
  GENERAL: "General Audience (All Ages)",
  TEEN: "Teen & Young Adult (Teen)",
  MATURE: "Mature (Mature)",
  EXPLICIT: "Explicit (Explicit)",
};

const RATING_COLORS: Record<Rating, { text: string; bg: string; border: string }> = {
  GENERAL: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800/40" },
  TEEN: { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800/40" },
  MATURE: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800/40" },
  EXPLICIT: { text: "text-rose-650 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/20", border: "border-rose-200 dark:border-rose-800/40" },
};

const TAG_TYPE_LABELS: Record<TagType, { label: string; color: string; bg: string; border: string }> = {
  WARNING: { label: "Content Warning", color: "text-amber-655 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800/30" },
  FANDOM: { label: "Fandom", color: "text-red-655 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800/30" },
  RELATIONSHIP: { label: "Relationship / Dynamics", color: "text-purple-655 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-200 dark:border-purple-800/30" },
  CHARACTER: { label: "Character", color: "text-blue-655 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800/30" },
  GENRE: { label: "Genre", color: "text-teal-655 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/20", border: "border-teal-200 dark:border-teal-800/30" },
  ADDITIONAL: { label: "Additional Tags", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-900/40", border: "border-slate-200/60 dark:border-slate-800/45" },
};

const LICENSE_LABELS: Record<string, string> = {
  ALL_RIGHTS_RESERVED: "© All Rights Reserved. No parts of this story may be reproduced without author permission.",
  PUBLIC_DOMAIN: "CC0 / Public Domain. This work has been dedicated to the public domain.",
  CC_BY: "CC BY: Creative Commons Attribution. Others can share and adapt with attribution.",
  CC_BY_NC: "CC BY-NC: Creative Commons Non-Commercial. Attribution required, no commercial usage.",
  CC_BY_ND: "CC BY-ND: Creative Commons No-Derivatives. Attribution required, no adaptations permitted.",
  CC_BY_SA: "CC BY-SA: Creative Commons Share-Alike. Attribution required, adaptations must be shared alike.",
};

const FORMAT_LABELS: Record<string, string> = {
  NOVEL: "Novel",
  SHORT_STORY: "Short Story",
  POETRY: "Poetry",
  PANTUN: "Pantun",
  ESSAY: "Essay",
  DRAMA: "Drama Script",
  APHORISM: "Aphorisms",
  HAIKU: "Haiku",
  SONG_LYRICS: "Lyrics",
};

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  try {
    const work = await db.work.findUnique({
      where: { id: params.workId },
      select: {
        title: true,
        summary: true,
        author: {
          select: { username: true },
        },
      },
    });

    if (!work) {
      return {
        title: "Story Not Found - Chptr",
      };
    }

    const title = `"${work.title}" by ${work.author.username} - Chptr`;
    const description = work.summary.length > 155 ? `${work.summary.substring(0, 152)}...` : work.summary;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "book",
      },
    };
  } catch (e) {
    return {
      title: "Chptr",
    };
  }
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { workId } = params;
  const session = await auth();

  let work = null;
  try {
    work = await db.work.findUnique({
      where: { id: workId },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
        tags: {
          include: { tag: true },
        },
        chapters: {
          where: { isDraft: false },
          orderBy: { number: "asc" },
        },
        _count: {
          select: { kudos: true, comments: true, bookmarks: true },
        },
      },
    });
  } catch (dbError) {
    console.warn("Work details DB error.", dbError);
  }

  if (!work) {
    notFound();
  }

  // Preload Bookmark, Kudos, and Rating States on the server
  let initialBookmarked = false;
  let initialNotes = "";
  let initialIsPrivate = false;

  if (session?.user?.id) {
    const userBookmark = await db.bookmark.findUnique({
      where: {
        userId_workId: {
          userId: session.user.id,
          workId,
        },
      },
    });
    if (userBookmark) {
      initialBookmarked = true;
      initialNotes = userBookmark.notes || "";
      initialIsPrivate = userBookmark.isPrivate;
    }
  }

  let ipHash = "";
  if (!session?.user?.id) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    ipHash = createHash("sha256").update(ip).digest("hex");
  }

  let hasKudosed = false;
  if (session?.user?.id) {
    const userKudos = await db.kudos.findUnique({
      where: {
        workId_userId: {
          workId,
          userId: session.user.id,
        },
      },
    });
    hasKudosed = !!userKudos;
  } else {
    const guestKudos = await db.kudos.findUnique({
      where: {
        workId_ipHash: {
          workId,
          ipHash,
        },
      },
    });
    hasKudosed = !!guestKudos;
  }

  const ratingAggregate = await db.workRating.aggregate({
    _avg: {
      value: true,
    },
    _count: {
      id: true,
    },
    where: { workId },
  });
  const averageRating = ratingAggregate._avg.value ? parseFloat(ratingAggregate._avg.value.toFixed(1)) : 0;
  const ratingCount = ratingAggregate._count.id;

  let userRating: number | null = null;
  if (session?.user?.id) {
    const rating = await db.workRating.findUnique({
      where: {
        workId_userId: {
          workId,
          userId: session.user.id,
        },
      },
    });
    userRating = rating ? rating.value : null;
  } else {
    const rating = await db.workRating.findUnique({
      where: {
        workId_ipHash: {
          workId,
          ipHash,
        },
      },
    });
    userRating = rating ? rating.value : null;
  }

  const isAuthor = session?.user?.id === work.authorId;
  const ratingConfig = RATING_COLORS[work.rating as Rating] || RATING_COLORS.GENERAL;
  const firstChapterId = work.chapters.length > 0 ? work.chapters[0].id : null;

  // Group tags by type
  const tagsByType = (work.tags || []).reduce((acc: any, { tag }: any) => {
    if (!acc[tag.type]) acc[tag.type] = [];
    acc[tag.type].push(tag);
    return acc;
  }, {} as Record<TagType, Array<{ id: string; name: string }>>);

  const tagOrder: TagType[] = ["WARNING", "FANDOM", "RELATIONSHIP", "CHARACTER", "GENRE", "ADDITIONAL"];

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Banner Content */}
      <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 sm:p-8 rounded-none shadow-md flex flex-col md:flex-row gap-8 relative overflow-hidden mb-10">
        {/* Cover Image Block */}
        <div className="w-full md:w-40 h-56 bg-slate-100 dark:bg-slate-950 border border-indigo-500/40 rounded-none overflow-hidden shrink-0 flex items-center justify-center relative shadow">
          {work.coverUrl ? (
            <img src={work.coverUrl} alt={work.title} className="w-full h-full object-cover" />
          ) : (
            <Book className="w-16 h-16 text-indigo-500/20" />
          )}
        </div>

        {/* Text Metadata */}
        <div className="flex-grow min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-none border ${ratingConfig.bg} ${ratingConfig.text} ${ratingConfig.border}`}>
                {RATING_LABELS[work.rating as Rating] || RATING_LABELS.GENERAL}
              </span>
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-none bg-slate-100 dark:bg-slate-900 border border-indigo-500/20 text-slate-655 dark:text-slate-350">
                {work.status === "IN_PROGRESS" ? "In Progress" : work.status === "COMPLETED" ? "Completed" : "Hiatus"}
              </span>
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-none bg-[#C5A059]/10 border border-[#C5A059]/40 text-[#C5A059] dark:text-[#E8C280]">
                {FORMAT_LABELS[work.format] || work.format || "Novel"}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-purple-655 dark:text-purple-400 capitalize mt-3">
              {work.title}
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Written by{" "}
              <Link
                href={`/users/${work.author.username}`}
                className="font-extrabold text-indigo-500 hover:underline"
              >
                {work.author.username}
              </Link>
              {work.coAuthorsText && (
                <>
                  {" "}
                  &amp;{" "}
                  <span className="font-extrabold text-indigo-500">
                    {work.coAuthorsText}
                  </span>
                </>
              )}
            </p>

            <div className="mt-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Summary</h2>
              <p className="font-body-serif text-sm text-slate-655 dark:text-slate-200 leading-relaxed italic whitespace-pre-line max-w-3xl">
                {work.summary}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 mt-8 pt-5 border-t border-indigo-500/15">
            {firstChapterId ? (
              <ContinueReadingButton workId={workId} firstChapterId={firstChapterId} />
            ) : (
              <span className="font-body-serif text-xs text-slate-455 italic">No chapters published yet.</span>
            )}
            
            <BookmarkButton
              workId={workId}
              isAuthenticated={!!session}
              initialBookmarked={initialBookmarked}
              initialNotes={initialNotes}
              initialIsPrivate={initialIsPrivate}
            />
            <KudosButton
              workId={workId}
              initialCount={work._count.kudos}
              initialHasKudosed={hasKudosed}
            />
            <RatingWidget
              workId={workId}
              isAuthor={isAuthor}
              initialAverageRating={averageRating}
              initialRatingCount={ratingCount}
              initialUserRating={userRating}
            />

            {isAuthor && (
              <Link
                href={`/works/${workId}/edit`}
                className="inline-flex items-center gap-2 py-2.5 px-5 border border-indigo-500/30 hover:bg-indigo-500/5 text-purple-655 dark:text-purple-400 rounded-none font-bold text-xs uppercase tracking-widest transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit &amp; Manage Story</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {work.isRestricted && !session ? (
        <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-8 text-center rounded-none shadow-md max-w-2xl mx-auto mt-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
          <Shield className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-purple-655 dark:text-purple-400 font-extrabold mb-2">
            Restricted Work
          </h2>
          <p className="font-body-serif text-sm text-slate-655 dark:text-slate-200 leading-relaxed italic mb-6">
            This work is restricted to registered members of Chptr. Please sign in or create an account to access the full story content, tags, and chapter list.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="py-2.5 px-6 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white rounded-none font-bold text-xs uppercase tracking-widest transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="py-2.5 px-6 border border-indigo-500 hover:bg-indigo-500/5 text-purple-655 dark:text-purple-400 rounded-none font-bold text-xs uppercase tracking-widest transition"
            >
              Register
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side: Stats and Tag blocks */}
          <div className="lg:col-span-3 space-y-8">
            {/* Preface Section */}
            {work.preface && (
              <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 rounded-none shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <h3 className="font-serif font-extrabold text-xs text-purple-655 dark:text-purple-400 uppercase tracking-widest border-b border-indigo-500/15 pb-2 mb-3">
                  Author&apos;s Preface
                </h3>
                <p className="font-body-serif text-sm text-slate-655 dark:text-slate-200 leading-relaxed italic whitespace-pre-line">
                  {work.preface}
                </p>
              </div>
            )}

            {/* Tag Blocks Section */}
            <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 rounded-none space-y-5 shadow-sm">
              <h2 className="font-serif font-extrabold text-xs text-purple-655 dark:text-purple-400 uppercase tracking-widest border-b border-indigo-500/15 pb-2">
                Tags &amp; Classifications
              </h2>
              
              <div className="space-y-4">
                {tagOrder.map((type) => {
                  const list = tagsByType[type];
                  if (!list || list.length === 0) return null;
                  const config = TAG_TYPE_LABELS[type];

                  return (
                    <div key={type} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 text-xs">
                      <span className="sm:w-36 font-bold text-slate-455 uppercase tracking-wider py-1 shrink-0 text-xs">
                        {config.label}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((tag: any) => (
                          <Link
                            key={tag.id}
                            href={`/tags/${encodeURIComponent(tag.name)}`}
                            className={`px-3 py-1 rounded-none border font-medium capitalize transition ${config.bg} ${config.color} ${config.border} hover:bg-slate-200/50 dark:hover:bg-slate-800/40`}
                          >
                            {tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chapter Index Section */}
            <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 rounded-none shadow-sm">
              <h2 className="font-serif font-extrabold text-xs text-purple-655 dark:text-purple-400 uppercase tracking-widest border-b border-indigo-500/15 pb-3 mb-4 flex items-center gap-2">
                <Book className="w-4 h-4 text-indigo-500" />
                <span>Chapter List ({work.chapters.length})</span>
              </h2>

              {work.chapters.length === 0 ? (
                <p className="font-body-serif text-sm text-slate-455 italic p-4 text-center">
                  The author has not published any chapters for this work yet.
                </p>
              ) : (
                <div className="divide-y divide-indigo-500/10 max-h-96 overflow-y-auto pr-2">
                  {work.chapters.map((ch: any) => (
                    <div key={ch.id} className="py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-none transition">
                      <Link
                        href={`/works/${workId}/chapters/${ch.id}`}
                        className="font-serif font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-500 capitalize transition"
                      >
                        Chapter {ch.number}: {ch.title}
                      </Link>
                      <span className="text-xs text-slate-455 dark:text-slate-400 shrink-0" suppressHydrationWarning>
                        {ch.wordCount} Words &bull;{" "}
                        {ch.publishedAt ? new Date(ch.publishedAt).toLocaleDateString("en-US") : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Section */}
            {work.allowComments !== false ? (
              <div id="comments" className="border-t border-indigo-500/15 pt-8">
                <CommentSection workId={work.id} workAuthorId={work.authorId} />
              </div>
            ) : (
              <div id="comments" className="border-t border-indigo-500/15 pt-8 text-center py-6 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-indigo-500/15">
                <p className="font-body-serif text-xs text-slate-455 italic">
                  Comments have been disabled for this work.
                </p>
              </div>
            )}
          </div>

          {/* Right Side: Sidebar Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-5 rounded-none shadow-sm text-xs space-y-4">
              <h3 className="font-serif font-extrabold text-purple-655 dark:text-purple-400 uppercase tracking-widest border-b border-indigo-500/15 pb-2 text-xs">
                Work Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-none border border-indigo-500/20">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Words</p>
                  <p className="text-sm font-bold text-[#C5A059] mt-0.5">
                    {work.wordCount.toLocaleString("en-US")}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-none border border-indigo-500/20">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Chapters</p>
                  <p className="text-sm font-bold text-[#C5A059] mt-0.5">
                    {work.chapters.length}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-none border border-indigo-500/20">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Kudos</p>
                  <p className="text-sm font-bold text-[#C5A059] mt-0.5">
                    {work._count.kudos}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-none border border-indigo-500/20">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Comments</p>
                  <p className="text-sm font-bold text-[#C5A059] mt-0.5">
                    {work._count.comments}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-indigo-500/15 font-medium text-slate-655 dark:text-slate-200 font-sans">
                <div className="flex justify-between">
                  <span>Bookmarks:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{work._count.bookmarks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{work.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Published:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200" suppressHydrationWarning>
                    {work.createdAt.toLocaleDateString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200" suppressHydrationWarning>
                    {work.updatedAt.toLocaleDateString("en-US")}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-500/15 space-y-1">
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Copyright License</p>
                <p className="text-xs leading-relaxed text-slate-550 dark:text-slate-200 font-serif italic">
                  {LICENSE_LABELS[work.license] || LICENSE_LABELS.ALL_RIGHTS_RESERVED}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
