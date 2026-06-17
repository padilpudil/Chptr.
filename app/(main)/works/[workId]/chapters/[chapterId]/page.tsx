export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import ReaderView from "@/components/reader/ReaderView";
import { Metadata } from "next";

interface ReaderPageProps {
  params: {
    workId: string;
    chapterId: string;
  };
}

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  try {
    const chapter = await db.chapter.findUnique({
      where: { id: params.chapterId },
      select: {
        title: true,
        number: true,
        work: {
          select: {
            title: true,
            author: {
              select: { username: true },
            },
          },
        },
      },
    });

    if (!chapter) {
      return {
        title: "Chapter Not Found - Chptr.",
      };
    }

    const title = `Chapter ${chapter.number}: ${chapter.title} - ${chapter.work.title} by ${chapter.work.author.username}`;
    const description = `Read Chapter ${chapter.number} of "${chapter.work.title}" by ${chapter.work.author.username} on Chptr.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
      },
    };
  } catch (e) {
    return { title: "Read Story - Chptr." };
  }
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { workId, chapterId } = params;

  let work = null;
  let currentChapter = null;
  let chapters: any[] = [];

  try {
    work = await db.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        authorId: true,
        preface: true,
        afterword: true,
        customCss: true,
        format: true,
      },
    });

    if (work) {
      currentChapter = await db.chapter.findUnique({
        where: { id: chapterId },
      });

      if (currentChapter && currentChapter.workId === workId && !currentChapter.isDraft) {
        chapters = await db.chapter.findMany({
          where: {
            workId,
            isDraft: false,
          },
          orderBy: {
            number: "asc",
          },
          select: {
            id: true,
            title: true,
            number: true,
          },
        });
      } else {
        currentChapter = null;
      }
    }
  } catch (dbError) {
    console.warn("Reader page DB error.", dbError);
  }

  if (!work || !currentChapter) {
    notFound();
  }

  return (
    <ReaderView
      workId={work.id}
      workTitle={work.title}
      workAuthorId={work.authorId}
      preface={work.preface || undefined}
      afterword={work.afterword || undefined}
      customCss={work.customCss || undefined}
      format={work.format || undefined}
      currentChapter={{
        id: currentChapter.id,
        title: currentChapter.title,
        content: currentChapter.content,
        number: currentChapter.number,
        wordCount: currentChapter.wordCount,
      }}
      chapters={chapters}
    />
  );
}
