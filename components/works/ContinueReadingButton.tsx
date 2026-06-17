"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

interface ContinueReadingButtonProps {
  workId: string;
  firstChapterId: string | null;
}

export default function ContinueReadingButton({
  workId,
  firstChapterId,
}: ContinueReadingButtonProps) {
  const router = useRouter();
  const [targetId, setTargetId] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Find all localStorage items to see if there is a saved reading position for chapters of this work
      // To keep it clean, let's look for a key format `reading_pos_{chapterId}` or save `reading_last_ch_{workId}`
      // Let's implement storing `reading_last_ch_{workId}` in the ReaderView component too!
      // Wait, let's update ReaderView.tsx to save `reading_last_ch_{workId}` in localStorage.
      // Let's check if there's any saved chapter for this work.
      const savedCh = localStorage.getItem(`reading_last_ch_${workId}`);
      if (savedCh) {
        setTargetId(savedCh);
        setHasHistory(true);
      } else {
        setTargetId(firstChapterId);
      }
    }
  }, [workId, firstChapterId]);

  // Handle click
  const handleClick = () => {
    if (targetId) {
      router.push(`/works/${workId}/chapters/${targetId}`);
    }
  };

  if (!firstChapterId) return null;

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-purple-650 hover:bg-purple-550 text-white font-bold text-xs rounded-none uppercase tracking-widest border border-indigo-500 transition shadow hover:shadow-lg"
    >
      <BookOpen className="w-4 h-4" />
      <span>{hasHistory ? "Continue Reading" : "Start Reading"}</span>
    </button>
  );
}
