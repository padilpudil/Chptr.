export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";
import WorkCard from "@/components/works/WorkCard";
import { Bookmark, Lock, EyeOff, FileText, Frown } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookmarks - Chptr",
  description: "The collection of stories you have bookmarked on Chptr.",
};

export default async function BookmarksPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/bookmarks");
  }

  let bookmarks: any[] = [];
  try {
    bookmarks = await db.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        work: {
          include: {
            author: {
              select: { username: true, avatarUrl: true },
            },
            tags: {
              include: { tag: true },
            },
            ratings: {
              select: { value: true },
            },
            _count: {
              select: { chapters: true, kudos: true, comments: true, bookmarks: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (dbError) {
    console.warn("Bookmarks DB error.", dbError);
    bookmarks = [];
  }

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <section className="mb-12 border-b border-indigo-500/10 pb-6 flex items-center gap-4">
        <div className="p-3 bg-purple-655/10 border border-indigo-500/30 text-purple-655 dark:text-purple-400 rounded-none shrink-0">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-purple-655 dark:text-purple-400 font-extrabold">
            My Bookmarks
          </h1>
          <p className="font-body-serif italic text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interesting stories you have bookmarked and saved.
          </p>
        </div>
      </section>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/10 border border-indigo-500/30 rounded-none flex flex-col items-center justify-center p-6">
          <Frown className="w-12 h-12 text-indigo-500/30 mb-4" />
          <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
            No bookmarks saved yet
          </h3>
          <p className="font-body-serif italic text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Explore interesting stories on Chptr and bookmark your favorites.
          </p>
          <Link
            href="/works"
            className="mt-6 px-6 py-2.5 bg-purple-650 hover:bg-purple-550 border border-indigo-500 text-white text-xs font-bold rounded-none uppercase tracking-widest transition shadow"
          >
            Explore Stories
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-white dark:bg-slate-900/10 border border-indigo-500/30 rounded-none overflow-hidden shadow-sm hover:border-indigo-500/60 transition"
            >
              {/* Bookmark Info Bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-indigo-500/15">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400" suppressHydrationWarning>
                    Saved on {new Date(bm.createdAt).toLocaleDateString("en-US")}
                  </span>
                  {bm.isPrivate && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-amber-955/20 border border-amber-500/25 text-amber-500 px-1.5 py-0.5 rounded-none uppercase">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Private</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Story Card */}
              <div className="p-4 sm:p-5">
                <WorkCard work={bm.work} />

                {/* Personal Notes */}
                {bm.notes && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/60 border border-indigo-500/15 rounded-none">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Your Personal Notes</span>
                    </h4>
                    <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed italic whitespace-pre-line font-body-serif">
                      &ldquo;{bm.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
