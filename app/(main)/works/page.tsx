"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import FilterPanel, { FilterState } from "@/components/works/FilterPanel";
import WorkCard from "@/components/works/WorkCard";
import { RefreshCw, Search, Frown } from "lucide-react";

function BrowseWorksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load initial filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    includeTags: searchParams.get("tag") ? [searchParams.get("tag")!.toLowerCase()] : [],
    excludeTags: [],
    ratings: [],
    statuses: [],
    formats: [],
    language: "",
    minWords: "",
    sortBy: "updatedAt",
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [works, setWorks] = useState<any[]>([]);
  const [matchingAuthors, setMatchingAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Parse URL search parameters on load
  useEffect(() => {
    const searchVal = searchParams.get("search") || "";
    setSearch(searchVal);

    const tagVal = searchParams.get("tag") || "";
    if (tagVal) {
      setFilters((prev) => ({
        ...prev,
        includeTags: [tagVal.toLowerCase()],
      }));
    }
  }, [searchParams]);

  // Fetch stories
  const fetchWorks = async (cursorVal?: string) => {
    if (cursorVal) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (filters.language) queryParams.set("languages", filters.language);
      if (filters.ratings.length > 0) queryParams.set("ratings", filters.ratings.join(","));
      if (filters.statuses.length > 0) queryParams.set("statuses", filters.statuses.join(","));
      if (filters.formats && filters.formats.length > 0) queryParams.set("formats", filters.formats.join(","));
      if (filters.minWords) queryParams.set("minWords", filters.minWords);
      if (filters.includeTags.length > 0) queryParams.set("includeTags", filters.includeTags.join(","));
      if (filters.excludeTags.length > 0) queryParams.set("excludeTags", filters.excludeTags.join(","));
      if (filters.sortBy) queryParams.set("sortBy", filters.sortBy);
      if (cursorVal) queryParams.set("cursor", cursorVal);
      queryParams.set("limit", "10");

      const response = await fetch(`/api/works?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to load stories");
      
      const data = await response.json();
      
      if (cursorVal) {
        setWorks((prev) => [...prev, ...data.works]);
      } else {
        setWorks(data.works);
        setMatchingAuthors(data.authors || []);
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
    fetchWorks();
  }, [search]); // re-fetch if global search in Navbar fires

  const handleApplyFilters = () => {
    fetchWorks();
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      includeTags: [],
      excludeTags: [],
      ratings: [],
      statuses: [],
      formats: [],
      language: "",
      minWords: "",
      sortBy: "updatedAt",
    };
    setFilters(defaultFilters);
    setSearch("");
    setMatchingAuthors([]);
    // Clear URL query parameters
    router.push("/works");
    
    // Trigger fetch directly since state update might not flush immediately
    setTimeout(() => {
      fetchWorks();
    }, 50);
  };

  const loadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchWorks(nextCursor);
    }
  };

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <section className="mb-12 border-b border-indigo-500/10 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-purple-655 dark:text-purple-400 font-extrabold">
          Work Collection
        </h1>
        <div className="w-24 h-0.5 bg-indigo-500 mt-3"></div>
        <p className="mt-6 font-body-serif text-base md:text-lg text-slate-550 dark:text-slate-400 max-w-2xl italic">
          Explore a universe of multi-genre fiction, fanfiction, and poetry curated for a premium reading experience.
        </p>
      </section>

      {/* Search Header if a search query is active */}
      {search && (
        <div className="mb-8 flex items-center gap-2.5 text-xs sm:text-sm text-slate-550 dark:text-slate-455 bg-slate-100/50 dark:bg-slate-900/20 p-4 border border-indigo-500/40 rounded-none">
          <Search className="w-4 h-4 text-indigo-500" />
          <span>
            Showing search results for: &ldquo;<strong className="font-serif italic text-purple-655 dark:text-purple-400">{search}</strong>&rdquo;
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter Panel */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Stories Listing */}
        <div className="lg:col-span-3 space-y-6">
          {/* Authors Found Section */}
          {search && matchingAuthors.length > 0 && (
            <section className="border border-indigo-500 bg-slate-50/50 dark:bg-slate-900/10 p-6 mb-8 transition hover:border-indigo-500/80">
              <h3 className="font-serif text-lg text-purple-655 dark:text-purple-400 font-extrabold mb-4 italic">
                Authors Found ({matchingAuthors.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchingAuthors.map((author) => (
                  <div key={author.id} className="flex items-center justify-between p-3.5 border border-indigo-500/15 bg-white dark:bg-slate-950/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 border border-indigo-500/30 bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden shrink-0">
                        {author.avatarUrl ? (
                          <img src={author.avatarUrl} alt={author.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif font-bold text-xs text-[#C5A059]">
                            {author.username.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {author.username}
                        </h4>
                        <p className="font-sans text-xs text-slate-400/85">
                          {author._count?.followers ?? 0} Followers
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/users/${author.username}`}
                      className="px-3 py-1.5 border border-indigo-500 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-slate-950 transition-all shrink-0"
                    >
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-between items-end border-b border-indigo-500/15 pb-3 mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              SHOWING {works.length} STORIES
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-full h-44 bg-slate-100/40 dark:bg-slate-900/10 border border-indigo-500/20 rounded-none animate-pulse"
                />
              ))}
            </div>
          ) : works.length === 0 ? (
            <div className="text-center py-20 bg-slate-100/30 dark:bg-slate-900/10 border border-indigo-500/35 rounded-none flex flex-col items-center justify-center p-6">
              <Frown className="w-12 h-12 text-indigo-500/60 mb-4" />
              <h3 className="font-serif text-lg text-purple-655 dark:text-purple-400 font-bold mb-2">
                No stories found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Try adjusting your filter options, clearing some include/exclude tags, or entering another search query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white text-xs font-bold rounded-none uppercase tracking-widest transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {works.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>

              {/* Load More Button */}
              {nextCursor && (
                <div className="text-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 py-3 px-8 border border-indigo-500 text-purple-655 dark:text-purple-400 hover:bg-indigo-500 hover:text-slate-950 font-bold text-xs uppercase tracking-widest rounded-none transition disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Show More</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowseWorksPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[94%] mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading stories...</p>
      </div>
    }>
      <BrowseWorksContent />
    </Suspense>
  );
}
