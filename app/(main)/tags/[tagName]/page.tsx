export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import WorkCard from "@/components/works/WorkCard";
import { Tag, Frown, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

interface TagPageProps {
  params: {
    tagName: string;
  };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const decodedTagName = decodeURIComponent(params.tagName);
  return {
    title: `Stories with Tag: ${decodedTagName} - Chptr`,
    description: `Discover and read stories tagged with ${decodedTagName} on Chptr.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const decodedTagName = decodeURIComponent(params.tagName).toLowerCase().trim();

  let tagRecord = null;
  let works: any[] = [];

  try {
    tagRecord = await db.tag.findUnique({
      where: { name: decodedTagName },
    });

    if (tagRecord) {
      works = await db.work.findMany({
        where: {
          tags: {
            some: {
              tagId: tagRecord.id,
            },
          },
        },
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
        orderBy: {
          updatedAt: "desc",
        },
      });
    }
  } catch (dbError) {
    console.warn("Tag page DB error.", dbError);
  }

  if (!tagRecord) {
    return (
      <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Frown className="w-12 h-12 text-indigo-500/30 mx-auto mb-4" />
        <h2 className="font-serif text-xl font-bold text-purple-655 dark:text-purple-400">Tag not found</h2>
        <p className="font-body-serif italic text-sm text-slate-500 mt-1">No works have been tagged with &ldquo;{decodedTagName}&rdquo; yet.</p>
        <Link href="/works" className="mt-6 inline-flex py-2.5 px-5 bg-purple-650 hover:bg-purple-550 border border-indigo-500 text-white rounded-none text-xs font-bold uppercase tracking-widest shadow transition">
          Explore Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between gap-4 mb-8 border-b border-indigo-500/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/works"
            className="p-2 border border-indigo-500/30 text-slate-500 rounded-none hover:bg-slate-100 dark:hover:bg-slate-900 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
              Viewing Tag
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-extrabold text-purple-655 dark:text-purple-400 capitalize mt-0.5">
              Tag: {tagRecord.name}
            </h1>
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {works.length} {works.length === 1 ? "Story" : "Stories"} found
        </span>
      </div>

      {works.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/10 border border-indigo-500/30 rounded-none p-6">
          <Frown className="w-12 h-12 text-indigo-500/30 mx-auto mb-4" />
          <h3 className="font-serif text-base font-bold text-slate-800 dark:text-slate-250">
            No works with this tag yet
          </h3>
          <p className="font-body-serif italic text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No stories have used the tag &ldquo;{tagRecord.name}&rdquo; yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
