"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, List } from "lucide-react";

interface ChapterSummary {
  id: string;
  title: string;
  number: number;
}

interface ChapterNavProps {
  workId: string;
  currentChapterNumber: number;
  chapters: ChapterSummary[];
}

export default function ChapterNav({
  workId,
  currentChapterNumber,
  chapters,
}: ChapterNavProps) {
  const router = useRouter();

  const prevChapter = chapters.find((ch) => ch.number === currentChapterNumber - 1);
  const nextChapter = chapters.find((ch) => ch.number === currentChapterNumber + 1);

  const handleSelectChapter = (chId: string) => {
    if (chId) {
      router.replace(`/works/${workId}/chapters/${chId}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-y border-slate-200 dark:border-slate-850">
      {/* Previous Button */}
      <button
        onClick={() => prevChapter && router.replace(`/works/${workId}/chapters/${prevChapter.id}`)}
        disabled={!prevChapter}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 border border-indigo-500/30 hover:bg-indigo-500/5 text-purple-655 dark:text-purple-400 disabled:opacity-40 disabled:hover:bg-transparent rounded-none text-xs sm:text-sm font-bold uppercase tracking-widest transition shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Previous Chapter</span>
      </button>

      {/* Chapter Dropdown */}
      <div className="relative w-full sm:w-64">
        <select
          value={chapters.find((ch) => ch.number === currentChapterNumber)?.id || ""}
          onChange={(e) => handleSelectChapter(e.target.value)}
          className="w-full pl-3 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-xs sm:text-sm font-bold text-slate-750 dark:text-slate-250 focus:outline-none appearance-none"
        >
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>
              Chapter {ch.number}: {ch.title}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <List className="w-4 h-4" />
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={() => nextChapter && router.replace(`/works/${workId}/chapters/${nextChapter.id}`)}
        disabled={!nextChapter}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-purple-655 rounded-none text-xs sm:text-sm font-bold uppercase tracking-widest transition shrink-0"
      >
        <span>Next Chapter</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
