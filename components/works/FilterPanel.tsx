"use client";

import { useState, useEffect, useRef } from "react";
import { Rating, WorkStatus, WorkFormat } from "@prisma/client";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";

export interface FilterState {
  includeTags: string[];
  excludeTags: string[];
  ratings: Rating[];
  statuses: WorkStatus[];
  formats: WorkFormat[];
  language: string;
  minWords: string;
  sortBy: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function FilterPanel({ filters, onChange, onApply, onReset }: FilterPanelProps) {
  const [incInput, setIncInput] = useState("");
  const [excInput, setExcInput] = useState("");
  const [incSuggestions, setIncSuggestions] = useState<string[]>([]);
  const [excSuggestions, setExcSuggestions] = useState<string[]>([]);
  const [showIncDropdown, setShowIncDropdown] = useState(false);
  const [showExcDropdown, setShowExcDropdown] = useState(false);
  const [defaultTags, setDefaultTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchDefaultTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data: any[] = await res.json();
          setDefaultTags(data.map((t) => t.name));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDefaultTags();
  }, []);

  const incRef = useRef<HTMLDivElement>(null);
  const excRef = useRef<HTMLDivElement>(null);

  // Suggestions fetching
  useEffect(() => {
    const fetchSuggestions = async (q: string, type: "inc" | "exc") => {
      if (!q.trim()) return;
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data: any[] = await res.json();
          const list = data.map((t) => t.name);
          if (type === "inc") {
            setIncSuggestions(list.filter((n) => !filters.includeTags.includes(n)));
          } else {
            setExcSuggestions(list.filter((n) => !filters.excludeTags.includes(n)));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    const delayInc = setTimeout(() => fetchSuggestions(incInput, "inc"), 200);
    return () => clearTimeout(delayInc);
  }, [incInput, filters.includeTags]);

  useEffect(() => {
    const fetchSuggestions = async (q: string, type: "inc" | "exc") => {
      if (!q.trim()) return;
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data: any[] = await res.json();
          const list = data.map((t) => t.name);
          if (type === "inc") {
            setIncSuggestions(list.filter((n) => !filters.includeTags.includes(n)));
          } else {
            setExcSuggestions(list.filter((n) => !filters.excludeTags.includes(n)));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    const delayExc = setTimeout(() => fetchSuggestions(excInput, "exc"), 200);
    return () => clearTimeout(delayExc);
  }, [excInput, filters.excludeTags]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (incRef.current && !incRef.current.contains(e.target as Node)) setShowIncDropdown(false);
      if (excRef.current && !excRef.current.contains(e.target as Node)) setShowExcDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addIncludeTag = (tag: string) => {
    const name = tag.trim().toLowerCase();
    if (name && !filters.includeTags.includes(name)) {
      onChange({ ...filters, includeTags: [...filters.includeTags, name] });
    }
    setIncInput("");
    setShowIncDropdown(false);
  };

  const addExcludeTag = (tag: string) => {
    const name = tag.trim().toLowerCase();
    if (name && !filters.excludeTags.includes(name)) {
      onChange({ ...filters, excludeTags: [...filters.excludeTags, name] });
    }
    setExcInput("");
    setShowExcDropdown(false);
  };

  const removeIncludeTag = (tag: string) => {
    onChange({ ...filters, includeTags: filters.includeTags.filter((t) => t !== tag) });
  };

  const removeExcludeTag = (tag: string) => {
    onChange({ ...filters, excludeTags: filters.excludeTags.filter((t) => t !== tag) });
  };

  const toggleRating = (r: Rating) => {
    const current = [...filters.ratings];
    if (current.includes(r)) {
      onChange({ ...filters, ratings: current.filter((x) => x !== r) });
    } else {
      onChange({ ...filters, ratings: [...current, r] });
    }
  };

  const toggleStatus = (s: WorkStatus) => {
    const current = [...filters.statuses];
    if (current.includes(s)) {
      onChange({ ...filters, statuses: current.filter((x) => x !== s) });
    } else {
      onChange({ ...filters, statuses: [...current, s] });
    }
  };

  const toggleFormat = (f: WorkFormat) => {
    const current = [...filters.formats];
    if (current.includes(f)) {
      onChange({ ...filters, formats: current.filter((x) => x !== f) });
    } else {
      onChange({ ...filters, formats: [...current, f] });
    }
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-indigo-500/40 p-5 rounded-none space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <h3 className="font-serif text-sm font-extrabold text-purple-655 dark:text-purple-400 uppercase tracking-widest flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span>Archive Curation</span>
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-bold text-slate-455 hover:text-indigo-500 transition flex items-center gap-1 uppercase tracking-wider"
          type="button"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sorting */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="w-full bg-transparent border-0 border-b border-indigo-500/45 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 focus:border-indigo-500 cursor-pointer"
        >
          <option value="updatedAt">Recently Updated</option>
          <option value="kudos">Most Kudos</option>
          <option value="comments">Most Comments</option>
          <option value="wordCountDesc">Word Count (Desc)</option>
          <option value="wordCountAsc">Word Count (Asc)</option>
          <option value="publishedAt">Date Published</option>
        </select>
      </div>

      {/* Include Tags */}
      <div ref={incRef} className="relative">
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
          Require Tags (Include)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search tags..."
            value={incInput}
            onChange={(e) => {
              setIncInput(e.target.value);
              setShowIncDropdown(true);
            }}
            onFocus={() => setShowIncDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (incInput.trim()) addIncludeTag(incInput);
              }
            }}
            className="w-full pl-0 pr-8 py-2 bg-transparent border-0 border-b border-indigo-500/45 text-xs sm:text-sm text-slate-800 dark:text-slate-250 placeholder-slate-400/60 focus:outline-none focus:ring-0 focus:border-indigo-500"
          />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
        </div>

        {/* Suggestion Dropdown */}
        {showIncDropdown && (
          <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-none shadow-2xl z-20 max-h-40 overflow-y-auto py-1 divide-y divide-slate-800/40 text-xs">
            {(incInput.trim() ? incSuggestions : defaultTags.filter((t) => !filters.includeTags.includes(t))).map((s) => (
              <button
                key={s}
                onClick={() => addIncludeTag(s)}
                className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-800 capitalize"
                type="button"
              >
                {s}
              </button>
            ))}
            {incInput.trim() && !incSuggestions.includes(incInput.trim().toLowerCase()) && (
              <button
                onClick={() => addIncludeTag(incInput)}
                className="w-full text-left px-4 py-2 text-indigo-400 font-bold hover:bg-slate-800"
                type="button"
              >
                Add: &ldquo;{incInput.trim()}&rdquo;
              </button>
            )}
            {!incInput.trim() && defaultTags.filter((t) => !filters.includeTags.includes(t)).length === 0 && (
              <div className="px-4 py-2 text-slate-400 italic text-center">No tags available</div>
            )}
          </div>
        )}

        {/* Active Tag list */}
        {filters.includeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {filters.includeTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-indigo-500/35 text-indigo-600 dark:text-indigo-400 text-xs font-bold capitalize"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeIncludeTag(t)}
                  className="hover:bg-slate-200/50 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Exclude Tags */}
      <div ref={excRef} className="relative">
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
          Exclude Tags
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search tags..."
            value={excInput}
            onChange={(e) => {
              setExcInput(e.target.value);
              setShowExcDropdown(true);
            }}
            onFocus={() => setShowExcDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (excInput.trim()) addExcludeTag(excInput);
              }
            }}
            className="w-full pl-0 pr-8 py-2 bg-transparent border-0 border-b border-indigo-500/45 text-xs sm:text-sm text-slate-800 dark:text-slate-250 placeholder-slate-400/60 focus:outline-none focus:ring-0 focus:border-indigo-500"
          />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
        </div>

        {/* Suggestion Dropdown */}
        {showExcDropdown && (
          <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-none shadow-2xl z-20 max-h-40 overflow-y-auto py-1 divide-y divide-slate-800/40 text-xs">
            {(excInput.trim() ? excSuggestions : defaultTags.filter((t) => !filters.excludeTags.includes(t))).map((s) => (
              <button
                key={s}
                onClick={() => addExcludeTag(s)}
                className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-800 capitalize"
                type="button"
              >
                {s}
              </button>
            ))}
            {excInput.trim() && !excSuggestions.includes(excInput.trim().toLowerCase()) && (
              <button
                onClick={() => addExcludeTag(excInput)}
                className="w-full text-left px-4 py-2 text-red-400 font-bold hover:bg-slate-800"
                type="button"
              >
                Exclude: &ldquo;{excInput.trim()}&rdquo;
              </button>
            )}
            {!excInput.trim() && defaultTags.filter((t) => !filters.excludeTags.includes(t)).length === 0 && (
              <div className="px-4 py-2 text-slate-400 italic text-center">No tags available</div>
            )}
          </div>
        )}

        {/* Active Tag list */}
        {filters.excludeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {filters.excludeTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-red-500/35 text-red-650 dark:text-red-400 text-xs font-bold capitalize"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeExcludeTag(t)}
                  className="hover:bg-slate-200/50 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ratings */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2.5">
          Story Ratings
        </label>
        <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          {[
            { value: Rating.GENERAL, label: "General Audience" },
            { value: Rating.TEEN, label: "Teen & Young Adult" },
            { value: Rating.MATURE, label: "Mature" },
            { value: Rating.EXPLICIT, label: "Explicit" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.ratings.includes(opt.value)}
                onChange={() => toggleRating(opt.value)}
                className="w-3.5 h-3.5 rounded-none text-purple-655 border-indigo-500/40 focus:ring-0 bg-transparent"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2.5">
          Story Status
        </label>
        <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          {[
            { value: WorkStatus.IN_PROGRESS, label: "In Progress" },
            { value: WorkStatus.COMPLETED, label: "Completed" },
            { value: WorkStatus.HIATUS, label: "Hiatus" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.statuses.includes(opt.value)}
                onChange={() => toggleStatus(opt.value)}
                className="w-3.5 h-3.5 rounded-none text-purple-655 border-indigo-500/40 focus:ring-0 bg-transparent"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Formats */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2.5">
          Work Format
        </label>
        <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          {[
            { value: WorkFormat.NOVEL, label: "Novel" },
            { value: WorkFormat.SHORT_STORY, label: "Short Story (Cerpen)" },
            { value: WorkFormat.POETRY, label: "Poetry (Puisi)" },
            { value: WorkFormat.PANTUN, label: "Pantun" },
            { value: WorkFormat.ESSAY, label: "Essay / Non-fiction" },
            { value: WorkFormat.DRAMA, label: "Drama Script" },
            { value: WorkFormat.APHORISM, label: "Aphorisms / Quotes" },
            { value: WorkFormat.HAIKU, label: "Haiku" },
            { value: WorkFormat.SONG_LYRICS, label: "Lyrics" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.formats.includes(opt.value)}
                onChange={() => toggleFormat(opt.value)}
                className="w-3.5 h-3.5 rounded-none text-purple-655 border-indigo-500/40 focus:ring-0 bg-transparent"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
          Language
        </label>
        <select
          value={filters.language}
          onChange={(e) => onChange({ ...filters, language: e.target.value })}
          className="w-full bg-transparent border-0 border-b border-indigo-500/45 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Languages</option>
          <option value="id">Indonesian</option>
          <option value="en">English</option>
          <option value="jp">日本語</option>
        </select>
      </div>

      {/* Minimum Word Count */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
          Minimum Word Count
        </label>
        <input
          type="number"
          placeholder="0"
          value={filters.minWords}
          onChange={(e) => onChange({ ...filters, minWords: e.target.value })}
          className="w-full bg-transparent border-0 border-b border-indigo-500/45 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 focus:border-indigo-500"
          min={0}
        />
      </div>

      {/* Apply Filter Button */}
      <button
        type="button"
        onClick={onApply}
        className="w-full py-3 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white font-bold rounded-none text-xs sm:text-sm shadow-md transition duration-300 uppercase tracking-widest"
      >
        Apply Filters
      </button>
    </div>
  );
}
