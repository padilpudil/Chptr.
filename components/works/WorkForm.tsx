"use client";

import { useState } from "react";
import { Rating, WorkStatus, TagType, WorkFormat } from "@prisma/client";
import TagInput from "./TagInput";
import ChapterEditor from "./ChapterEditor";
import { toast } from "sonner";
import { 
  AlertCircle, FileText, Image as ImageIcon, Check, 
  Settings, Tags, BookOpen, Shield, ChevronRight, ChevronLeft, Info
} from "lucide-react";

interface Tag {
  id?: string;
  name: string;
  type: TagType;
}

interface WorkFormValues {
  title: string;
  summary: string;
  rating: Rating;
  status: WorkStatus;
  language: string;
  coverUrl: string;
  tags: Tag[];
  preface?: string;
  afterword?: string;
  license?: string;
  isRestricted?: boolean;
  allowComments?: boolean;
  customCss?: string;
  coAuthorsText?: string;
  firstChapter?: { title: string; content: string } | null;
  format?: WorkFormat;
}

interface WorkFormProps {
  initialValues?: Partial<WorkFormValues>;
  onSubmit: (values: WorkFormValues) => Promise<void>;
  loading: boolean;
  buttonText?: string;
}

const RATING_OPTIONS = [
  { value: Rating.GENERAL, label: "General Audience (All Ages)" },
  { value: Rating.TEEN, label: "Teen & Young Adult (Teen)" },
  { value: Rating.MATURE, label: "Mature Content (Mature)" },
  { value: Rating.EXPLICIT, label: "Explicit Content (Explicit)" },
];

const STATUS_OPTIONS = [
  { value: WorkStatus.IN_PROGRESS, label: "In Progress" },
  { value: WorkStatus.COMPLETED, label: "Completed" },
  { value: WorkStatus.HIATUS, label: "Hiatus" },
];

const LICENSE_OPTIONS = [
  { value: "ALL_RIGHTS_RESERVED", label: "All Rights Reserved (Default)" },
  { value: "PUBLIC_DOMAIN", label: "Public Domain (No copyright reserved)" },
  { value: "CC_BY", label: "Creative Commons Attribution (CC BY)" },
  { value: "CC_BY_NC", label: "Creative Commons Non-Commercial (CC BY-NC)" },
  { value: "CC_BY_ND", label: "Creative Commons No-Derivatives (CC BY-ND)" },
  { value: "CC_BY_SA", label: "Creative Commons Share-Alike (CC BY-SA)" },
];

const FORMAT_OPTIONS = [
  { value: WorkFormat.NOVEL, label: "Novel (Multi-chapter narrative)" },
  { value: WorkFormat.SHORT_STORY, label: "Short Story (Cerpen - Single chapter)" },
  { value: WorkFormat.POETRY, label: "Poetry (Puisi - Styled verse)" },
  { value: WorkFormat.PANTUN, label: "Pantun (Traditional 4-line rhyme)" },
  { value: WorkFormat.ESSAY, label: "Essay / Article / Non-fiction" },
  { value: WorkFormat.DRAMA, label: "Drama / Script / Screenplay" },
  { value: WorkFormat.APHORISM, label: "Aphorisms & Quotes (Kata Mutiara)" },
  { value: WorkFormat.HAIKU, label: "Haiku (Japanese 5-7-5 structure)" },
  { value: WorkFormat.SONG_LYRICS, label: "Song Lyrics" },
];

const TABS = [
  { id: "details", label: "Core Details", icon: Settings },
  { id: "tags", label: "Tags & Ratings", icon: Tags },
  { id: "notes", label: "Preface & Style", icon: BookOpen },
  { id: "privacy", label: "Access & Rights", icon: Shield },
  { id: "first_chapter", label: "First Chapter", icon: FileText, conditionalOnly: true },
];

export default function WorkForm({
  initialValues,
  onSubmit,
  loading,
  buttonText = "Save Story",
}: WorkFormProps) {
  const isEdit = !!initialValues?.title;

  const [activeTab, setActiveTab] = useState<string>("details");
  const [title, setTitle] = useState(initialValues?.title || "");
  const [summary, setSummary] = useState(initialValues?.summary || "");
  const [rating, setRating] = useState<Rating>(initialValues?.rating || Rating.GENERAL);
  const [status, setStatus] = useState<WorkStatus>(initialValues?.status || WorkStatus.IN_PROGRESS);
  const [language, setLanguage] = useState(initialValues?.language || "en");
  const [coverUrl, setCoverUrl] = useState(initialValues?.coverUrl || "");
  const [tags, setTags] = useState<Tag[]>(initialValues?.tags || []);
  const [error, setError] = useState("");
  const [coverMode, setCoverMode] = useState<"upload" | "url">(
    initialValues?.coverUrl && initialValues.coverUrl.startsWith("http") ? "url" : "upload"
  );

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        toast.error("Cover image size must be less than 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Advanced fields
  const [preface, setPreface] = useState(initialValues?.preface || "");
  const [afterword, setAfterword] = useState(initialValues?.afterword || "");
  const [license, setLicense] = useState(initialValues?.license || "ALL_RIGHTS_RESERVED");
  const [isRestricted, setIsRestricted] = useState(initialValues?.isRestricted || false);
  const [allowComments, setAllowComments] = useState(initialValues?.allowComments !== false);
  const [customCss, setCustomCss] = useState(initialValues?.customCss || "");
  const [coAuthorsText, setCoAuthorsText] = useState(initialValues?.coAuthorsText || "");
  const [format, setFormat] = useState<WorkFormat>(initialValues?.format || WorkFormat.NOVEL);

  // Optional first chapter (only when creating a new work)
  const [includeFirstChapter, setIncludeFirstChapter] = useState(false);
  const [firstChapterTitle, setFirstChapterTitle] = useState("");
  const [firstChapterContent, setFirstChapterContent] = useState("");

  const filteredTabs = TABS.filter(tab => !tab.conditionalOnly || (!isEdit && tab.id === "first_chapter"));

  const handleNextTab = () => {
    const currentIndex = filteredTabs.findIndex(t => t.id === activeTab);
    if (currentIndex < filteredTabs.length - 1) {
      setActiveTab(filteredTabs[currentIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = filteredTabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(filteredTabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Story title is required.");
      setActiveTab("details");
      return;
    }
    if (!summary.trim()) {
      setError("Story summary is required.");
      setActiveTab("details");
      return;
    }
    if (summary.length > 1000) {
      setError("Story summary must be at most 1000 characters.");
      setActiveTab("details");
      return;
    }

    if (includeFirstChapter && !isEdit) {
      if (!firstChapterTitle.trim()) {
        setError("First chapter title is required if you compose the first chapter.");
        setActiveTab("first_chapter");
        return;
      }
      if (!firstChapterContent.trim()) {
        setError("First chapter content is required if you compose the first chapter.");
        setActiveTab("first_chapter");
        return;
      }
    }

    try {
      await onSubmit({
        title: title.trim(),
        summary: summary.trim(),
        rating,
        status,
        language,
        coverUrl: coverUrl.trim(),
        tags,
        preface: preface.trim() || undefined,
        afterword: afterword.trim() || undefined,
        license,
        isRestricted,
        allowComments,
        customCss: customCss.trim() || undefined,
        coAuthorsText: coAuthorsText.trim() || undefined,
        format,
        firstChapter: includeFirstChapter && !isEdit
          ? { title: firstChapterTitle.trim(), content: firstChapterContent }
          : null,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save story.");
      toast.error("An error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-955/35 border border-red-500/30 text-red-400 text-sm rounded-none">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Advanced Wizard Tab Bar */}
      <div className="flex flex-wrap border-b border-indigo-500/15">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 font-bold text-xs uppercase tracking-widest border-b-2 transition flex items-center gap-2 ${
                isActive
                  ? "border-indigo-500 text-indigo-500 bg-indigo-500/5"
                  : "border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* TAB 1: DETAILS */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Left Column: Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                  Story Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter story title..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                  Summary <span className="text-rose-500">*</span>
                  <span className="text-xs font-normal text-slate-400 normal-case ml-2">
                    ({summary.length}/1000 characters)
                  </span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide a short summary of your story..."
                  className="w-full h-32 px-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm resize-none font-medium leading-relaxed"
                  maxLength={1000}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                  >
                    <option value="en">English</option>
                    <option value="id">Indonesian</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                    Work Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as WorkFormat)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                  >
                    {FORMAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-2 uppercase tracking-widest">
                  Cover Image
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setCoverMode("upload")}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition ${
                      coverMode === "upload"
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-500"
                        : "border-indigo-500/20 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode("url")}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition ${
                      coverMode === "url"
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-500"
                        : "border-indigo-500/20 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205"
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {coverMode === "upload" ? (
                  <div className="border border-dashed border-indigo-500/30 p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-8 h-8 text-indigo-500/50 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Choose an image file
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-body-serif italic">
                      Max size: 800KB (JPG, PNG, WEBP)
                    </p>
                    {coverUrl && coverUrl.startsWith("data:") && (
                      <div className="mt-2 text-[10px] font-mono text-emerald-500 truncate max-w-[250px] mx-auto">
                        ✓ Selected: {coverUrl.substring(0, 30)}...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={coverUrl && coverUrl.startsWith("data:") ? "" : coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm font-medium"
                    />
                  </div>
                )}

                {coverUrl && (
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setCoverUrl("")}
                      className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-widest"
                    >
                      Clear Cover
                    </button>
                    {coverUrl.startsWith("data:") ? (
                      <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Local Image Selected</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Remote URL Selected</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Book Preview Card */}
            <div className="flex flex-col justify-between h-full bg-slate-50/50 dark:bg-slate-950/20 border border-indigo-500/10 p-5">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Real-time Showcase Preview</h4>
                <div className="border border-indigo-500/20 bg-white dark:bg-slate-900/40 p-4 rounded-none flex gap-4">
                  <div className="w-24 h-36 bg-slate-100 dark:bg-slate-950 border border-indigo-500/20 rounded-none flex items-center justify-center overflow-hidden shrink-0 relative">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-2 min-w-0 flex-grow">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[8px] font-bold tracking-widest bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-none border border-indigo-500/20">
                        {rating}
                      </span>
                      <span className="text-[8px] font-bold tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 px-2 py-0.5 rounded-none border border-indigo-500/10">
                        {format}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-extrabold text-purple-655 dark:text-purple-400 truncate capitalize">
                      {title || "Untitled Story"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      by <span className="font-semibold text-slate-700 dark:text-slate-350">{coAuthorsText ? `Primary Author & Co-Authors` : `You`}</span>
                    </p>
                    <p className="text-xs text-slate-455 dark:text-slate-400 line-clamp-3 font-body-serif italic">
                      {summary || "Your story summary will be showcased here. Fill in the form fields to update this showcase live."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-indigo-500/20 bg-white dark:bg-slate-900/30 p-3 flex items-center gap-3 mt-4">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body-serif italic">
                  Provide a high-quality external image link (JPG/PNG) for the book cover to attract readers. Leave blank for default cover.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAGS & WARNINGS */}
        {activeTab === "tags" && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                Content Maturity Rating
              </label>
              <p className="text-xs text-slate-455 dark:text-slate-400 mb-3 font-body-serif italic">
                Choose an appropriate content rating so readers know what to expect regarding language, themes, and maturity.
              </p>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value as Rating)}
                className="w-full max-w-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-medium"
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                Story Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkStatus)}
                className="w-full max-w-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-medium"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                Tagging System
              </label>
              <p className="text-xs text-slate-455 dark:text-slate-400 mb-3 font-body-serif italic">
                Tag your work to help readers locate it. Search for existing system tags or type custom terms and hit Enter to add them to warnings, characters, fandoms, relationships, or additional tags.
              </p>
              <TagInput value={tags} onChange={setTags} />
            </div>
          </div>
        )}

        {/* TAB 3: PREFACE & STYLE */}
        {activeTab === "notes" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                  Author Notes (Preface)
                </label>
                <p className="text-xs text-slate-455 dark:text-slate-400 mb-3 font-body-serif italic">
                  Notes displayed at the very beginning of the work (e.g., dedications, trigger warnings, or inspirations).
                </p>
                <textarea
                  value={preface}
                  onChange={(e) => setPreface(e.target.value)}
                  placeholder="Write notes to display before your story begins..."
                  className="w-full h-44 px-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm resize-none font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                  Author Notes (Afterword)
                </label>
                <p className="text-xs text-slate-455 dark:text-slate-400 mb-3 font-body-serif italic">
                  Notes displayed at the end of the work (e.g., acknowledgments, requests for feedback, or links).
                </p>
                <textarea
                  value={afterword}
                  onChange={(e) => setAfterword(e.target.value)}
                  placeholder="Write notes to display after your story ends..."
                  className="w-full h-44 px-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm resize-none font-medium leading-relaxed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                Custom Styling (Work Skin CSS)
              </label>
              <p className="text-xs text-slate-455 dark:text-slate-400 mb-3 font-body-serif italic">
                Advanced styling options. Write raw CSS selectors targeted at `.reader-content` to style typography, indentation, letter spacing, or alignments.
              </p>
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder="e.g. .reader-content p { text-indent: 2em; line-height: 2; }"
                className="w-full h-28 px-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* TAB 4: ACCESS & RIGHTS */}
        {activeTab === "privacy" && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                Co-Author(s)
              </label>
              <p className="text-xs text-slate-455 dark:text-slate-400 mb-3 font-body-serif italic">
                Add other authors who worked on this story. Write their names separated by commas (e.g. Alice, Bob).
              </p>
              <input
                type="text"
                value={coAuthorsText}
                onChange={(e) => setCoAuthorsText(e.target.value)}
                placeholder="e.g. Alice, Bob"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/60 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                Copyright License
              </label>
              <p className="text-xs text-slate-455 dark:text-slate-400 mb-3 font-body-serif italic">
                Set a legal license policy for copy protection and derivatives of your story.
              </p>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-medium"
              >
                {LICENSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-indigo-500/10">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="restricted-toggle"
                  checked={isRestricted}
                  onChange={(e) => setIsRestricted(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-indigo-500/30 rounded-none focus:ring-indigo-500 mt-0.5"
                />
                <div className="min-w-0">
                  <label htmlFor="restricted-toggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide cursor-pointer">
                    Restrict Access (Registered Users Only)
                  </label>
                  <p className="text-[11px] text-slate-455 dark:text-slate-400 font-body-serif italic">
                    If enabled, anonymous visitors cannot read your story. They will see an authentication gateway prompting them to sign in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="comments-toggle"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-indigo-500/30 rounded-none focus:ring-indigo-500 mt-0.5"
                />
                <div className="min-w-0">
                  <label htmlFor="comments-toggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide cursor-pointer">
                    Enable Comments
                  </label>
                  <p className="text-[11px] text-slate-455 dark:text-slate-400 font-body-serif italic">
                    If disabled, the comment sections on all chapters of this story will be completely hidden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WRITE FIRST CHAPTER */}
        {activeTab === "first_chapter" && !isEdit && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/25 rounded-none max-w-2xl">
              <input
                type="checkbox"
                id="first-chapter-toggle"
                checked={includeFirstChapter}
                onChange={(e) => setIncludeFirstChapter(e.target.checked)}
                className="w-5 h-5 text-purple-600 border-indigo-500/30 rounded-none focus:ring-indigo-500 mt-0.5"
              />
              <div className="min-w-0">
                <label htmlFor="first-chapter-toggle" className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider cursor-pointer">
                  Compose the first chapter now
                </label>
                <p className="text-[11px] text-slate-455 dark:text-slate-400 font-body-serif italic mt-0.5">
                  Check this box if you want to write and publish your first chapter together with the story metadata immediately.
                </p>
              </div>
            </div>

            {includeFirstChapter && (
              <div className="space-y-5 animate-in slide-in-from-top duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                    Chapter Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstChapterTitle}
                    onChange={(e) => setFirstChapterTitle(e.target.value)}
                    placeholder="e.g. Chapter 1: The Beginning"
                    className="w-full max-w-xl px-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-sm font-medium"
                    required={includeFirstChapter}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-widest">
                    Chapter Content <span className="text-rose-500">*</span>
                  </label>
                  <ChapterEditor value={firstChapterContent} onChange={setFirstChapterContent} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="pt-4 border-t border-indigo-500/10 flex justify-between items-center">
        <div>
          {filteredTabs.findIndex(t => t.id === activeTab) > 0 && (
            <button
              type="button"
              onClick={handlePrevTab}
              className="px-5 py-2.5 border border-indigo-500/35 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-350 font-bold text-xs uppercase tracking-widest rounded-none transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {filteredTabs.findIndex(t => t.id === activeTab) < filteredTabs.length - 1 ? (
            <button
              type="button"
              onClick={handleNextTab}
              className="px-5 py-2.5 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500 text-purple-655 dark:text-purple-400 font-bold text-xs uppercase tracking-widest rounded-none transition flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-655 hover:bg-purple-550 border border-indigo-500 disabled:opacity-50 text-white font-bold rounded-none shadow-lg transition flex items-center gap-2 uppercase tracking-widest text-xs"
            >
              {loading ? "Processing..." : buttonText}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
