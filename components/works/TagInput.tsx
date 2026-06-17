"use client";

import { useState, useEffect, useRef } from "react";
import { TagType } from "@prisma/client";
import { Plus, X, Search } from "lucide-react";

interface Tag {
  id?: string;
  name: string;
  type: TagType;
}

interface TagInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
}

const TAG_TYPE_LABELS: Record<TagType, { label: string; color: string; bg: string; border: string }> = {
  FANDOM: { label: "Fandom", color: "text-red-650 dark:text-red-400", bg: "bg-red-500/10 dark:bg-red-955/20", border: "border-red-500/30" },
  CHARACTER: { label: "Character", color: "text-blue-655 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-955/20", border: "border-blue-500/30" },
  RELATIONSHIP: { label: "Relationship", color: "text-purple-655 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-955/20", border: "border-purple-500/30" },
  GENRE: { label: "Genre", color: "text-teal-655 dark:text-teal-400", bg: "bg-teal-500/10 dark:bg-teal-955/20", border: "border-teal-500/30" },
  WARNING: { label: "Warning", color: "text-amber-655 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-955/20", border: "border-amber-500/30" },
  ADDITIONAL: { label: "Additional Tag", color: "text-slate-655 dark:text-slate-400", bg: "bg-slate-150 dark:bg-slate-800/35", border: "border-indigo-500/30" },
};

export default function TagInput({ value, onChange }: TagInputProps) {
  const [currentType, setCurrentType] = useState<TagType>("ADDITIONAL");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`/api/tags?q=${encodeURIComponent(input.trim())}`);
        if (response.ok) {
          const data: Tag[] = await response.json();
          // Filter out tags already added
          const filtered = data.filter(
            (t) => !value.some((vt) => vt.name.toLowerCase() === t.name.toLowerCase())
          );
          setSuggestions(filtered);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [input, value]);

  const addTag = (tag: Tag) => {
    const normalizedName = tag.name.trim().toLowerCase();
    if (!normalizedName) return;

    // Prevent duplicate name check
    if (value.some((t) => t.name.toLowerCase() === normalizedName)) {
      setInput("");
      setShowSuggestions(false);
      return;
    }

    onChange([...value, { name: normalizedName, type: tag.type }]);
    setInput("");
    setShowSuggestions(false);
  };

  const createAndAddTag = () => {
    const name = input.trim().toLowerCase();
    if (!name) return;
    addTag({ name, type: currentType });
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createAndAddTag();
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Tags Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-100/50 dark:bg-slate-900/20 border border-indigo-500/30 rounded-none">
          {value.map((tag, idx) => {
            const config = TAG_TYPE_LABELS[tag.type];
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-semibold border ${config.bg} ${config.color} ${config.border}`}
              >
                <span className="text-xs uppercase font-bold tracking-wider opacity-60">
                  {config.label}:
                </span>
                <span className="capitalize">{tag.name}</span>
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="hover:bg-slate-200 dark:hover:bg-slate-800 rounded-none p-0.5 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Selector and Input Container */}
      <div className="bg-slate-100/30 dark:bg-slate-900/10 border border-indigo-500/30 p-4 rounded-none relative" ref={dropdownRef}>
        {/* Type Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3 border-b border-indigo-500/10 pb-3">
          {Object.entries(TAG_TYPE_LABELS).map(([type, { label, color, bg, border }]) => {
            const isActive = currentType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setCurrentType(type as TagType)}
                className={`px-3 py-1 text-xs font-semibold rounded-none border transition ${
                  isActive
                    ? `${bg} ${color} ${border} ring-1 ring-purple-500/10`
                    : "bg-transparent text-slate-450 dark:text-slate-400 border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/30"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 dark:text-slate-500" />
            <input
              type="text"
              placeholder={`Enter tag name for ${TAG_TYPE_LABELS[currentType].label.toLowerCase()}... (Enter to add)`}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm"
            />
          </div>

          <button
            type="button"
            onClick={createAndAddTag}
            disabled={!input.trim()}
            className="p-2.5 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white rounded-none transition disabled:opacity-50"
            title="Add Tag"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && (input.trim().length > 0 || suggestions.length > 0) && (
          <div className="absolute left-4 right-4 mt-1 bg-white dark:bg-slate-900 border border-indigo-500 rounded-none shadow-2xl z-20 max-h-60 overflow-y-auto py-1 divide-y divide-indigo-500/10">
            {suggestions.map((suggestion) => {
              const config = TAG_TYPE_LABELS[suggestion.type];
              return (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-left text-sm transition"
                >
                  <span className="capitalize text-slate-700 dark:text-slate-200 font-medium">{suggestion.name}</span>
                  <span className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-none ${config.bg} ${config.color} ${config.border}`}>
                    {config.label}
                  </span>
                </button>
              );
            })}

            {/* Create option */}
            {input.trim() && !suggestions.some((s) => s.name.toLowerCase() === input.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={createAndAddTag}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-850 text-left text-xs font-semibold text-purple-655 dark:text-purple-400 transition"
              >
                <span>Create new tag: &ldquo;{input.trim()}&rdquo;</span>
                <span className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-none ${TAG_TYPE_LABELS[currentType].bg} ${TAG_TYPE_LABELS[currentType].color} ${TAG_TYPE_LABELS[currentType].border}`}>
                  {TAG_TYPE_LABELS[currentType].label}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
