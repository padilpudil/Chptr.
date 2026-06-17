"use client";

import { useState, useEffect } from "react";
import ReaderSettings, { ReaderConfig } from "./ReaderSettings";
import ChapterNav from "./ChapterNav";
import Link from "next/link";
import { ArrowLeft, BookOpen, X, Languages, Loader2 } from "lucide-react";
import CommentSection from "@/components/community/CommentSection";
import { useTheme } from "next-themes";

interface Chapter {
  id: string;
  title: string;
  content: string;
  number: number;
  wordCount: number;
}

interface ChapterSummary {
  id: string;
  title: string;
  number: number;
}

interface ReaderViewProps {
  workId: string;
  workTitle: string;
  workAuthorId: string;
  currentChapter: Chapter;
  chapters: ChapterSummary[];
  preface?: string;
  afterword?: string;
  customCss?: string;
  format?: string;
}

const DEFAULT_CONFIG: ReaderConfig = {
  fontSize: 20,
  fontFamily: "serif",
  lineHeight: "normal",
  contentWidth: "medium",
  theme: "cream",
};

const SCHOLARLY_ANNOTATIONS = [
  "Stylistic Analysis: The author utilizes a melancholic yet visionary style, blending natural metaphors with the inner reflections of young intellectuals.",
  "Historical Note: The city's intellectual centers during this era served as critical meeting points for educated youth driving a cultural renaissance.",
  "Character Review: The contrast between the rational, pragmatic protagonist and the romantic, emotional counterpart represents the struggle of early modernist ideas.",
  "Stylistic Device: The use of classical dialogue conventions reflects formal societal values transitioning toward modern expressions.",
  "Conceptual Map: The author subtly critiques material progress that is not balanced by the intellectual liberation of the population."
];

const LANGUAGES = [
  { code: "original", name: "Original Text" },
  { code: "en", name: "English" },
  { code: "id", name: "Indonesian" },
  { code: "jv", name: "Javanese" },
  { code: "su", name: "Sundanese" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "zh-CN", name: "Chinese" },
  { code: "nl", name: "Dutch" },
  { code: "de", name: "German" }
];

function extractHtmlTextNodes(htmlString: string): string[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlString}</div>`, "text/html");
  const container = doc.body.firstChild as HTMLElement;

  if (!container) return [];

  const texts: string[] = [];
  const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walk.nextNode())) {
    const parent = node.parentNode as HTMLElement;
    if (parent && ["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) {
      continue;
    }
    const val = node.textContent;
    if (val && val.trim().length > 0) {
      texts.push(val.trim());
    }
  }

  return texts;
}

function translateHtmlContent(htmlString: string, translatedTexts: string[]): string {
  if (typeof window === "undefined") return htmlString;
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlString}</div>`, "text/html");
  const container = doc.body.firstChild as HTMLElement;

  if (!container) return htmlString;

  const textNodes: Text[] = [];
  const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walk.nextNode())) {
    const parent = node.parentNode as HTMLElement;
    if (parent && ["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) {
      continue;
    }
    const val = node.textContent;
    if (val && val.trim().length > 0) {
      textNodes.push(node as Text);
    }
  }

  let index = 0;
  for (const tNode of textNodes) {
    if (index < translatedTexts.length) {
      const orig = tNode.textContent || "";
      const leadingWhitespace = orig.match(/^\s*/)?.[0] || "";
      const trailingWhitespace = orig.match(/\s*$/)?.[0] || "";
      tNode.textContent = leadingWhitespace + translatedTexts[index] + trailingWhitespace;
      index++;
    }
  }

  return container.innerHTML;
}

export default function ReaderView({
  workId,
  workTitle,
  workAuthorId,
  currentChapter,
  chapters,
  preface,
  afterword,
  customCss,
  format,
}: ReaderViewProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [config, setConfig] = useState<ReaderConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState(0);
  const [popover, setPopover] = useState<{ show: boolean; top: number; left: number; text: string } | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);

  // Translation state
  const [activeLanguage, setActiveLanguage] = useState<string>("original");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationsCache, setTranslationsCache] = useState<Record<string, {
    title: string;
    preface?: string;
    content: string;
    afterword?: string;
  }>>({});

  // Reset translation language and clear cache when chapter changes
  useEffect(() => {
    setActiveLanguage("original");
    setTranslationsCache({});
  }, [currentChapter.id]);

  const handleTranslate = async (lang: string) => {
    if (lang === "original") {
      setActiveLanguage("original");
      return;
    }

    if (translationsCache[lang]) {
      setActiveLanguage(lang);
      return;
    }

    setIsTranslating(true);
    try {
      const textsToTranslate: string[] = [];

      // 1. Chapter Title
      textsToTranslate.push(currentChapter.title);

      // 2. Preface
      let prefaceIndex = -1;
      if (preface) {
        textsToTranslate.push(preface);
        prefaceIndex = textsToTranslate.length - 1;
      }

      // 3. Content
      const contentTexts = extractHtmlTextNodes(currentChapter.content);
      const contentStartIndex = textsToTranslate.length;
      textsToTranslate.push(...contentTexts);

      // 4. Afterword
      let afterwordIndex = -1;
      if (afterword) {
        textsToTranslate.push(afterword);
        afterwordIndex = textsToTranslate.length - 1;
      }

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts: textsToTranslate,
          target: lang,
        }),
      });

      if (!res.ok) {
        throw new Error("Translation failed");
      }

      const { translated } = await res.json();
      if (!translated || !Array.isArray(translated) || translated.length === 0) {
        throw new Error("No translated text received");
      }

      const translatedTitle = translated[0];
      const translatedPreface = prefaceIndex !== -1 ? translated[prefaceIndex] : undefined;
      const translatedContentTexts = translated.slice(contentStartIndex, contentStartIndex + contentTexts.length);
      const translatedContent = translateHtmlContent(currentChapter.content, translatedContentTexts);
      const translatedAfterword = afterwordIndex !== -1 ? translated[afterwordIndex] : undefined;

      const newTranslation = {
        title: translatedTitle,
        preface: translatedPreface,
        content: translatedContent,
        afterword: translatedAfterword,
      };

      setTranslationsCache(prev => ({
        ...prev,
        [lang]: newTranslation
      }));
      setActiveLanguage(lang);
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Translation failed. Please try again later.");
    } finally {
      setIsTranslating(false);
    }
  };

  const showTranslated = activeLanguage !== "original" && translationsCache[activeLanguage];
  const displayTitle = showTranslated ? translationsCache[activeLanguage].title : currentChapter.title;
  const displayPreface = showTranslated ? translationsCache[activeLanguage].preface : preface;
  const displayContent = showTranslated ? translationsCache[activeLanguage].content : currentChapter.content;
  const displayAfterword = showTranslated ? translationsCache[activeLanguage].afterword : afterword;

  // 1. Load reader config preferences and sync with global theme
  useEffect(() => {
    const saved = localStorage.getItem("reader_config");
    let initialConfig = DEFAULT_CONFIG;
    if (saved) {
      try {
        initialConfig = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse reader config", e);
      }
    }

    if (resolvedTheme) {
      const activeReaderTheme = resolvedTheme === "dark" 
        ? "dark" 
        : (initialConfig.theme === "dark" ? "cream" : initialConfig.theme);
      
      setConfig({
        ...initialConfig,
        theme: activeReaderTheme
      });
    }
  }, [resolvedTheme]);

  const handleConfigChange = (newConfig: ReaderConfig) => {
    setConfig(newConfig);
    localStorage.setItem("reader_config", JSON.stringify(newConfig));
    setTheme(newConfig.theme === "dark" ? "dark" : "light");
  };

  // 2. Track scroll position, save to localStorage, update progress bar & header visibility
  useEffect(() => {
    localStorage.setItem(`reading_last_ch_${workId}`, currentChapter.id);
    window.scrollTo(0, 0);

    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      localStorage.setItem(`reading_pos_${currentChapter.id}`, String(scrollY));

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
      setProgress(pct);

      // Header hide on scroll down, show on scroll up
      if (scrollY <= 0) {
        setHeaderVisible(true);
      } else if (scrollY > lastScroll) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScroll = scrollY;
    };

    const savedPos = localStorage.getItem(`reading_pos_${currentChapter.id}`);
    if (savedPos) {
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: Number(savedPos),
          behavior: "instant" as any,
        });
      }, 150);
      window.addEventListener("scroll", handleScroll);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("scroll", handleScroll);
      };
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentChapter.id]);

  // 3. Gamification Tracking: Track works read and reading duration
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Track unique work IDs
    try {
      const readWorks = JSON.parse(localStorage.getItem("sastra_read_works") || "[]");
      if (!readWorks.includes(workId)) {
        readWorks.push(workId);
        localStorage.setItem("sastra_read_works", JSON.stringify(readWorks));
      }
    } catch (e) {
      console.error("Failed to update read works", e);
    }

    // Track reading time (accumulated every 10 seconds spent on reader)
    const interval = setInterval(() => {
      try {
        const time = parseInt(localStorage.getItem("sastra_reading_time") || "0");
        localStorage.setItem("sastra_reading_time", String(time + 10));
      } catch (e) {
        console.error("Failed to update reading time", e);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [workId]);

  // 3. Handle paragraph clicks to show inline comment popover
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const p = target.closest("p");
    if (p && p.textContent && p.textContent.trim().length > 10) {
      const rect = p.getBoundingClientRect();
      const top = rect.top + window.scrollY - 160;
      const left = rect.left + rect.width / 2 - 128; // Center popover (w-64 = 256px)
      
      const hash = Math.abs(p.textContent.length) % SCHOLARLY_ANNOTATIONS.length;
      const annotation = SCHOLARLY_ANNOTATIONS[hash];

      setPopover({
        show: true,
        top,
        left,
        text: annotation,
      });
    } else {
      setPopover(null);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClose = () => {
      setPopover(null);
    };
    if (popover?.show) {
      window.addEventListener("mousedown", handleClose);
    }
    return () => window.removeEventListener("mousedown", handleClose);
  }, [popover]);

  // 4. Styles mapping
  const themeClasses = {
    cream: "bg-[#fdfbf7] text-[#1a1a1a]",
    sepia: "bg-[#f4ecd8] text-[#433422]",
    dark: "bg-[#0b0f19] text-[#f9f0eb] dark:bg-[#0b0f19] dark:text-[#e9dcd3]",
  }[config.theme];

  const headerThemeClasses = {
    cream: "bg-[#fdfbf7]/80 border-indigo-500/25 text-[#1a1a1a]",
    sepia: "bg-[#f4ecd8]/80 border-[#d3c2a3]/60 text-[#433422]",
    dark: "bg-[#0b0f19]/80 border-indigo-500/20 text-[#f9f0eb]",
  }[config.theme];

  const fontClass = config.fontFamily === "serif" ? "font-body-serif" : "font-sans";

  const sizeClass = {
    16: "text-sm sm:text-base",
    20: "text-base sm:text-lg md:text-xl",
    24: "text-lg sm:text-xl md:text-2xl",
  }[config.fontSize] || "text-lg";

  const leadingClass = {
    compact: "leading-snug space-y-5",
    normal: "leading-[1.8] space-y-6",
    relaxed: "leading-loose space-y-8",
  }[config.lineHeight];

  const widthClass = {
    narrow: "max-w-[580px]",
    medium: "max-w-[720px]",
    wide: "max-w-[850px]",
  }[config.contentWidth];

  const isPoetic = ["POETRY", "PANTUN", "HAIKU", "SONG_LYRICS"].includes(format || "");
  const isAphorism = format === "APHORISM";
  const isDrama = format === "DRAMA";

  const customWidthClass = isPoetic 
    ? "max-w-[480px]" 
    : (isAphorism ? "max-w-[600px]" : widthClass);

  const customAlignClass = isPoetic 
    ? "text-center whitespace-pre-wrap font-serif" 
    : (isAphorism ? "text-center font-serif italic text-xl" : "text-left");

  const customFontClass = isDrama 
    ? "font-mono" 
    : (isAphorism || isPoetic ? "font-body-serif" : fontClass);

  return (
    <div className={`relative min-h-screen pb-20 transition-colors duration-300 ${themeClasses}`}>
      {customCss && (
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      )}
      {/* Top Reading Progress Bar (Fixed) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200/50 dark:bg-slate-900/40 z-50">
        <div
          className="reading-progress-bar h-full bg-indigo-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Reader Control Header */}
      <header
        className={`fixed top-1 left-0 right-0 z-40 backdrop-blur-md border-b py-3 transition-all duration-300 ${headerThemeClasses} ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link
            href={`/works/${workId}`}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest hover:text-indigo-500 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="text-center truncate max-w-[50%]">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-65 truncate">
              {workTitle}
            </h2>
            <h3 className="font-serif text-xs font-bold italic truncate capitalize mt-0.5">
              Chapter {currentChapter.number}: {displayTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Translation Dropdown */}
            <div className="relative inline-block text-left">
              {isTranslating ? (
                <div className="flex items-center gap-1.5 py-2 px-3 border border-indigo-500/30 text-slate-400 rounded-none text-xs font-bold uppercase tracking-widest bg-transparent">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span className="hidden xs:inline text-[10px]">Translating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-transparent border border-indigo-500 py-1.5 px-2.5 text-purple-655 dark:text-purple-400 hover:bg-slate-200/50 rounded-none transition shadow-sm">
                  <Languages className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <select
                    value={activeLanguage}
                    onChange={(e) => handleTranslate(e.target.value)}
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none border-none cursor-pointer pr-1 py-0.5 text-purple-655 dark:text-purple-400"
                    style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none" }}
                  >
                    {LANGUAGES.map((lang) => (
                      <option
                        key={lang.code}
                        value={lang.code}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 uppercase font-sans font-normal"
                      >
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <ReaderSettings config={config} onChange={handleConfigChange} />
          </div>
        </div>
      </header>

      {/* Reading Canvas */}
      <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <article className="mx-auto">
          {/* Header */}
          <header className="text-center mb-16 space-y-4">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="h-[1px] w-12 bg-indigo-500/20"></div>
              <span className="fleuron text-xl">❦</span>
              <div className="h-[1px] w-12 bg-indigo-500/20"></div>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-purple-655 dark:text-purple-400 font-extrabold leading-tight">
              {displayTitle}
            </h1>
            <p className="text-xs sm:text-xs font-bold uppercase tracking-widest text-slate-400">
              Chapter {currentChapter.number} &bull; {currentChapter.wordCount} Words
            </p>
          </header>

          {/* Preface Section */}
          {displayPreface && currentChapter.number === 1 && (
            <div className={`mx-auto mb-10 p-5 border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-900/40 rounded-none shadow-sm ${widthClass}`}>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Author&apos;s Preface</p>
              <div className="font-body-serif text-sm italic text-slate-655 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                {displayPreface}
              </div>
            </div>
          )}

          {/* Story Content */}
          <div className="relative">
            {isAphorism && (
              <div className="text-center text-4xl text-indigo-500/35 font-serif mb-6">“</div>
            )}
            
            <div
              onClick={handleContentClick}
              className={`story-body mx-auto cursor-pointer reading-content border-b border-indigo-500/10 pb-16 prose prose-slate dark:prose-invert ${customWidthClass} ${customFontClass} ${customAlignClass} ${sizeClass} ${leadingClass} ${isAphorism ? "pt-2 pb-6 text-slate-800 dark:text-slate-200" : ""}`}
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />

            {isAphorism && (
              <div className="text-center text-4xl text-indigo-500/35 font-serif mt-6">”</div>
            )}
          </div>

          {/* Afterword Section */}
          {displayAfterword && (chapters.length === 0 || currentChapter.id === chapters[chapters.length - 1]?.id) && (
            <div className={`mx-auto mt-10 p-5 border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-900/40 rounded-none shadow-sm ${widthClass}`}>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Author&apos;s Afterword</p>
              <div className="font-body-serif text-sm italic text-slate-655 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                {displayAfterword}
              </div>
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="mt-12">
            <ChapterNav
              workId={workId}
              currentChapterNumber={currentChapter.number}
              chapters={chapters}
            />
          </div>

          {/* Chapter Comments Section */}
          <div className="mt-16 border-t border-indigo-500/20 pt-10">
            <CommentSection
              workId={workId}
              chapterId={currentChapter.id}
              workAuthorId={workAuthorId}
            />
          </div>
        </article>
      </main>

      {/* Inline Comment / Annotation Popover */}
      {popover && (
        <div
          style={{ top: `${popover.top}px`, left: `${popover.left}px` }}
          className="absolute z-50 w-64 bg-slate-50 dark:bg-slate-900 border border-indigo-500 p-4 shadow-xl transition-opacity duration-200"
          onMouseDown={(e) => e.stopPropagation()} // Prevent close on self click
        >
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">
              CURATORIAL ANNOTATION
            </span>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={() => setPopover(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed">
            &ldquo;{popover.text}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
