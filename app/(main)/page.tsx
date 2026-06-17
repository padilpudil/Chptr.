import Link from "next/link";
import db from "@/lib/db";
import WorkCard from "@/components/works/WorkCard";
import { BookOpen, Sparkles, TrendingUp, PenTool, BookMarked, ArrowRight, Tag, Search, Quote } from "lucide-react";
import ReadingProfileWidget from "@/components/widgets/ReadingProfileWidget";
import DynamicQuoteSection from "@/components/widgets/DynamicQuoteSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recentWorks: any[] = [];
  let topKudos: any[] = [];
  let popularTags: any[] = [];

  try {
    // 1. Fetch 10 recently updated works
    recentWorks = await db.work.findMany({
      take: 10,
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

    // 2. Fetch top 5 works with most kudos
    topKudos = await db.work.findMany({
      take: 5,
      include: {
        author: {
          select: { username: true },
        },
        _count: {
          select: { kudos: true },
        },
      },
      orderBy: {
        kudos: {
          _count: "desc",
        },
      },
    });

    // 3. Fetch top 10 popular tags (ordered by count of works)
    popularTags = await db.tag.findMany({
      take: 10,
      include: {
        _count: {
          select: { works: true },
        },
      },
      orderBy: {
        works: {
          _count: "desc",
        },
      },
    });
  } catch (dbError) {
    console.warn("Database connection failed.", dbError);
    recentWorks = [];
    topKudos = [];
    popularTags = [];
  }

  const bentoWorks = [...recentWorks];

  const largeWork = bentoWorks[0];
  const smallWork1 = bentoWorks[1];
  const smallWork2 = bentoWorks[2];
  const mediumWork = bentoWorks[3];
  
  // The rest of the stories go to the secondary feed
  const remainingWorks = recentWorks.length > 4 ? recentWorks.slice(4) : [];

  return (
    <div className="relative overflow-hidden min-h-screen pb-20 bg-slate-50 dark:bg-slate-950/20">
      {/* Hero Section */}
      <header className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden border-b border-indigo-500/10">
        <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-[0.3em] mb-4 block">
            Fiction Collective & Story Curation
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-purple-655 dark:text-purple-400 mb-6 max-w-4xl mx-auto italic leading-tight font-extrabold">
            Where Stories Unfold
          </h1>
          <p className="font-body-serif text-sm sm:text-base md:text-lg text-slate-550 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A premium multi-genre story curation platform. A space for writers to express ideas, share fanfiction, prose, and their best original works with the world.
          </p>
          
          {/* Minimalist Search Bar */}
          <div className="max-w-xl mx-auto">
            <form id="hero-search-form" action="/works" method="GET" className="relative group">
              <input
                type="text"
                name="search"
                className="w-full bg-transparent border-0 border-b border-indigo-500/50 py-3.5 px-2 font-body-serif italic text-sm sm:text-base focus:ring-0 focus:border-purple-655 focus:border-b-2 transition-all duration-300 placeholder:text-slate-400/50 text-slate-800 dark:text-slate-100"
                placeholder="Search for works, authors, or story tags..."
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-purple-655 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Hero Background Illustration Pattern (desaturated & opacity overlay) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.02] flex justify-center items-center">
          <img
            className="w-full h-full object-cover filter sepia grayscale"
            src="https://www.transparenttextures.com/patterns/paper-fibers.png"
            alt="Parchment overlay"
          />
        </div>
      </header>

      {/* Popular Genres / Quick Filters Section */}
      <section className="py-8 bg-slate-100/30 dark:bg-slate-900/10 border-b border-indigo-500/10">
        <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
              Trending Topics:
            </span>
            {popularTags.slice(0, 5).map((tag) => (
              <Link
                key={tag.id}
                href={`/works?tag=${encodeURIComponent(tag.name)}`}
                className="font-serif italic text-base sm:text-lg text-slate-800 dark:text-slate-200 chip-underline hover:text-indigo-500 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Featured Section */}
      <main className="py-16 max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed Column (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-indigo-500/10 pb-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-purple-655 dark:text-purple-400 font-extrabold">
                  Featured Works
                </h2>
                <div className="w-16 h-0.5 bg-indigo-500 mt-2"></div>
              </div>
              <Link
                href="/works"
                className="text-xs font-bold text-indigo-500 hover:text-purple-655 tracking-widest uppercase transition-colors"
              >
                View All Stories →
              </Link>
            </div>

            {recentWorks.length === 0 ? (
              <div className="border border-dashed border-indigo-500/30 p-12 text-center bg-slate-50 dark:bg-slate-900/10">
                <BookOpen className="w-12 h-12 text-indigo-500/30 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Archive is Empty
                </h3>
                <p className="font-body-serif text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  No stories have been published to the Chptr archive yet. Be the first to publish yours!
                </p>
                <Link
                  href="/works/new"
                  className="inline-block border border-indigo-500 px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-indigo-500 hover:text-slate-950 transition-all"
                >
                  Write the First Work
                </Link>
              </div>
            ) : (
              <>
                {/* Bento-style Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Large Featured Card (Col-span-12) */}
                  {largeWork && (
                    <div className="md:col-span-12 group relative overflow-hidden bg-slate-100/50 dark:bg-slate-900/20 border border-indigo-500 flex flex-col justify-between p-1">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-200 dark:bg-slate-950">
                        {largeWork.coverUrl ? (
                          <img
                            src={largeWork.coverUrl}
                            alt={largeWork.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-900">
                            <BookOpen className="w-16 h-16 text-indigo-500/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-6 md:p-10">
                          <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">
                            Editor&apos;s Choice
                          </span>
                          <h3 className="font-serif text-2xl sm:text-3xl text-white font-extrabold mb-3 leading-tight">
                            {largeWork.title}
                          </h3>
                          <p className="font-body-serif text-xs sm:text-sm text-slate-200/90 max-w-lg mb-6 line-clamp-2">
                            {largeWork.summary}
                          </p>
                          <Link
                            href={`/works/${largeWork.id}`}
                            className="w-fit border border-indigo-500 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-slate-950 transition-all"
                          >
                            Read Work
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Small Card 1 (Col-span-6) */}
                  {smallWork1 && (
                    <div className="md:col-span-6 group flex flex-col border border-indigo-500 bg-slate-50 dark:bg-slate-900/10 p-6 justify-between transition hover:border-indigo-500/80">
                      <div>
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 block">
                          Poetry & Elegy
                        </span>
                        <h3 className="font-serif text-xl text-purple-655 dark:text-purple-400 font-extrabold mb-4 italic leading-snug">
                          {smallWork1.title}
                        </h3>
                        <p className="font-body-serif text-xs sm:text-sm text-slate-550 dark:text-slate-355 mb-6 line-clamp-6 italic leading-relaxed whitespace-pre-line">
                          {smallWork1.summary}
                        </p>
                      </div>
                      <div className="border-t border-indigo-500/20 pt-4 flex justify-between items-center text-xs">
                        <span className="font-serif italic text-slate-700 dark:text-slate-300">
                          — {smallWork1.author.username}
                        </span>
                        <Link href={`/works/${smallWork1.id}`} className="text-indigo-500 hover:text-purple-655">
                          <BookOpen className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Small Card 2 (Col-span-6) */}
                  {smallWork2 && (
                    <div className="md:col-span-6 group border border-indigo-500 bg-slate-50 dark:bg-slate-900/10 overflow-hidden flex flex-col justify-between transition hover:border-indigo-500/80">
                      <div className="h-44 w-full bg-slate-200 dark:bg-slate-950 relative overflow-hidden">
                        {smallWork2.coverUrl ? (
                          <img
                            src={smallWork2.coverUrl}
                            alt={smallWork2.title}
                            className="w-full h-full object-cover filter grayscale group-hover:sepia transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-indigo-500/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block">
                            Selected Prose
                          </span>
                          <h3 className="font-serif text-lg text-purple-655 dark:text-purple-400 font-extrabold mb-2 leading-tight">
                            {smallWork2.title}
                          </h3>
                          <p className="font-body-serif text-xs text-slate-550 dark:text-slate-350 line-clamp-3 mb-4">
                            {smallWork2.summary}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-indigo-500/10 pt-3 mt-2">
                          <span className="text-slate-500">By {smallWork2.author.username}</span>
                          <Link href={`/works/${smallWork2.id}`} className="text-xs font-bold text-indigo-500 uppercase tracking-wider hover:underline">
                            Read
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Medium Recommendation Card (Col-span-12) */}
                  {mediumWork && (
                    <div className="md:col-span-12 border border-indigo-500 bg-slate-50 dark:bg-slate-900/10 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center justify-between transition hover:border-indigo-500/80">
                      <div className="w-32 sm:w-40 aspect-[3/4] border border-indigo-500 shadow-md overflow-hidden bg-slate-200 dark:bg-slate-950 shrink-0">
                        {mediumWork.coverUrl ? (
                          <img
                            src={mediumWork.coverUrl}
                            alt={mediumWork.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-indigo-500/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full">
                        <div>
                          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 block">
                            Curator&apos;s Recommendation
                          </span>
                          <h3 className="font-serif text-2xl text-purple-655 dark:text-purple-400 font-extrabold mb-3 leading-tight">
                            {mediumWork.title}
                          </h3>
                          <p className="font-body-serif text-xs sm:text-sm text-slate-550 dark:text-slate-350 mb-6 line-clamp-4 leading-relaxed italic">
                            {mediumWork.summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 border-t border-indigo-500/10 pt-4">
                          <span className="font-serif font-bold text-slate-800 dark:text-slate-200">
                            {mediumWork.author.username}
                          </span>
                          <div className="flex-grow hairline-separator"></div>
                          <Link
                            href={`/works/${mediumWork.id}`}
                            className="font-bold text-xs text-purple-655 dark:text-purple-400 hover:text-indigo-500 uppercase tracking-widest shrink-0 transition"
                          >
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary feed section: Karya Terbaru Lainnya */}
                {remainingWorks.length > 0 && (
                  <section className="mt-10">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="h-[1px] w-12 bg-indigo-500"></span>
                      <h3 className="font-serif text-xl text-purple-655 dark:text-purple-400 font-extrabold uppercase tracking-wide">
                        Recent Archives
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {remainingWorks.map((work) => (
                        <WorkCard key={work.id} work={work} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Sidebar Column (Right) */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* Widget 1: Reading Gamification (Reading Profile & Badges) */}
            <ReadingProfileWidget />

            {/* Widget 2: Trending Reads / Top Kudos */}
            {topKudos.length > 0 && (
              <div className="border border-indigo-500 bg-slate-50 dark:bg-slate-900/10 p-6 flex flex-col justify-between transition hover:border-indigo-500/80">
                <div>
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 block">
                    Trending Reads
                  </span>
                  <h3 className="font-serif text-lg text-purple-655 dark:text-purple-400 font-extrabold mb-3 leading-tight italic">
                    Most Appreciated
                  </h3>
                  <div className="flex flex-col gap-4 mt-2">
                    {topKudos.map((work, idx) => (
                      <Link
                        key={work.id}
                        href={`/works/${work.id}`}
                        className="group flex gap-4 items-start border-b border-indigo-500/10 pb-3 hover:text-indigo-500 transition-colors last:border-0 last:pb-0"
                      >
                        <span className="font-serif text-2xl font-extrabold text-[#C5A059] tracking-tighter w-8 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-serif text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:underline leading-tight line-clamp-1">
                            {work.title}
                          </h4>
                          <p className="font-sans text-[11px] text-slate-400 mt-1">
                            By {work.author.username} • {work._count?.kudos ?? 0} Kudos
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
          
        </div>
      </main>

      {/* Redaction Quote Section */}
      <DynamicQuoteSection />
    </div>
  );
}
