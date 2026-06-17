"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WorkForm from "@/components/works/WorkForm";
import ChapterEditor from "@/components/works/ChapterEditor";
import { toast } from "sonner";
import { Settings, BookOpen, Plus, Trash2, Edit2, Check, ArrowLeft, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  content: string;
  number: number;
  wordCount: number;
  isDraft: boolean;
  publishedAt: string | null;
}

export default function EditWorkPage({ params }: { params: { workId: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { workId } = params;

  const [activeTab, setActiveTab] = useState<"details" | "chapters">("details");
  const [work, setWork] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingWork, setLoadingWork] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);
  
  // Chapter form state
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number | "">("");
  const [chapterIsDraft, setChapterIsDraft] = useState(true);
  const [savingChapter, setSavingChapter] = useState(false);

  // Fetch Work Details
  const fetchWorkDetails = async () => {
    try {
      const response = await fetch(`/api/works/${workId}`);
      if (!response.ok) throw new Error("Failed to fetch story details");
      const data = await response.json();
      setWork(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load story");
    } finally {
      setLoadingWork(false);
    }
  };

  // Fetch Chapters (include drafts)
  const fetchChapters = async () => {
    setLoadingChapters(true);
    try {
      const response = await fetch(`/api/works/${workId}/chapters?drafts=true`);
      if (!response.ok) throw new Error("Failed to fetch chapter list");
      const data = await response.json();
      setChapters(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load chapters");
    } finally {
      setLoadingChapters(false);
    }
  };

  useEffect(() => {
    fetchWorkDetails();
    fetchChapters();
  }, [workId]);

  // Protect client side
  useEffect(() => {
    if (!loadingWork && work && session?.user?.id !== work.authorId) {
      toast.error("You do not have access to edit this story.");
      router.push("/");
    }
  }, [work, session, loadingWork]);

  // Update Work Details
  const handleUpdateWork = async (values: any) => {
    try {
      const response = await fetch(`/api/works/${workId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update story");
      }

      toast.success("Story details successfully updated!");
      fetchWorkDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to update story");
      throw err;
    }
  };

  // Delete Work
  const handleDeleteWork = async () => {
    if (!confirm("Are you sure you want to permanently delete this story? This action cannot be undone and will delete all chapters, comments, bookmarks, and kudos associated with it.")) {
      return;
    }

    try {
      const response = await fetch(`/api/works/${workId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete story");
      }

      toast.success("Story successfully deleted!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete story");
    }
  };

  // Handle Chapter Submit (Create / Edit)
  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim() || !chapterContent.trim()) {
      toast.error("Chapter title and content are required.");
      return;
    }

    setSavingChapter(true);
    try {
      const url = `/api/works/${workId}/chapters`;
      const method = editingChapterId ? "PUT" : "POST";
      const payload = {
        chapterId: editingChapterId,
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
        number: chapterNumber !== "" ? Number(chapterNumber) : undefined,
        isDraft: chapterIsDraft,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to save chapter");
      }

      toast.success(editingChapterId ? "Chapter successfully updated!" : "Chapter successfully added!");
      resetChapterForm();
      fetchChapters();
    } catch (err: any) {
      toast.error(err.message || "Failed to save chapter");
    } finally {
      setSavingChapter(false);
    }
  };

  const handleEditChapterClick = (ch: Chapter) => {
    setEditingChapterId(ch.id);
    setChapterTitle(ch.title);
    setChapterContent(ch.content);
    setChapterNumber(ch.number);
    setChapterIsDraft(ch.isDraft);
    setIsEditingChapter(true);
  };

  const handleDeleteChapter = async (chId: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;

    try {
      const response = await fetch(`/api/works/${workId}/chapters?chapterId=${chId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete chapter");
      }

      toast.success("Chapter successfully deleted.");
      fetchChapters();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete chapter");
    }
  };

  const resetChapterForm = () => {
    setIsEditingChapter(false);
    setEditingChapterId(null);
    setChapterTitle("");
    setChapterContent("");
    setChapterNumber("");
    setChapterIsDraft(true);
  };

  if (loadingWork) {
    return (
      <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
        <span>Loading story data...</span>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-red-500">Story not found.</p>
        <Link href="/" className="text-indigo-500 underline mt-4 block">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href={`/works/${workId}`}
            className="p-2 border border-indigo-500/30 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-none transition text-slate-500 dark:text-slate-400 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-extrabold text-purple-655 dark:text-purple-400 capitalize">
              Dashboard: {work.title}
            </h1>
            <p className="font-body-serif italic text-xs text-slate-450 dark:text-slate-400 mt-0.5">
              Manage your story details, genre, tags, and chapters.
            </p>
          </div>
        </div>

        <Link
          href={`/works/${workId}`}
          className="inline-flex items-center justify-center gap-2 py-2 px-4 border border-indigo-500/30 hover:bg-indigo-500/5 text-purple-655 dark:text-purple-400 rounded-none transition font-bold text-xs uppercase tracking-widest self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>View Story Page</span>
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-indigo-500/15 mb-8">
        <button
          onClick={() => {
            setActiveTab("details");
            resetChapterForm();
          }}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-widest border-b-2 transition flex items-center gap-2 ${
            activeTab === "details"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Story Details</span>
        </button>
        <button
          onClick={() => setActiveTab("chapters")}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-widest border-b-2 transition flex items-center gap-2 ${
            activeTab === "chapters"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Chapters ({chapters.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "details" ? (
        <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 sm:p-8 rounded-none shadow-md">
          <h2 className="font-serif text-lg font-bold text-purple-655 dark:text-purple-400 mb-6">
            Edit Story Details &amp; Tags
          </h2>
          <WorkForm
            initialValues={{
              title: work.title,
              summary: work.summary,
              rating: work.rating,
              status: work.status,
              language: work.language,
              coverUrl: work.coverUrl || "",
              tags: work.tags.map((t: any) => t.tag),
            }}
            onSubmit={handleUpdateWork}
            loading={false}
            buttonText="Save Changes"
          />

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-red-500/20">
            <h3 className="font-serif text-base font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-body-serif italic leading-relaxed">
              Once you delete a story, there is no going back. All chapters, comments, bookmarks, and kudos associated with this story will be permanently removed.
            </p>
            <button
              type="button"
              onClick={handleDeleteWork}
              className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-none border border-red-500 transition shadow"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Delete Story Permanently</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chapter Form Toggle Area */}
          {isEditingChapter ? (
            <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 sm:p-8 rounded-none shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-lg font-bold text-purple-655 dark:text-purple-400">
                  {editingChapterId ? "Edit Chapter" : "Write New Chapter"}
                </h2>
                <button
                  type="button"
                  onClick={resetChapterForm}
                  className="text-xs font-bold uppercase tracking-widest text-slate-450 dark:text-slate-400 hover:text-indigo-500 transition"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleChapterSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Chapter Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      placeholder="e.g. Chapter 1: First Meeting"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:border-indigo-500 transition text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                        Chapter Number
                      </label>
                      <input
                        type="number"
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="Auto"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-950/30 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:border-indigo-500 transition text-sm"
                        min={1}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                        Publication Status
                      </label>
                      <select
                        value={chapterIsDraft ? "true" : "false"}
                        onChange={(e) => setChapterIsDraft(e.target.value === "true")}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-none text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      >
                        <option value="true">Save Draft</option>
                        <option value="false">Publish</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Chapter Content <span className="text-red-500">*</span>
                  </label>
                  <ChapterEditor value={chapterContent} onChange={setChapterContent} />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-indigo-500/15">
                  <button
                    type="button"
                    onClick={resetChapterForm}
                    className="px-5 py-2.5 border border-indigo-500/30 text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-xs uppercase tracking-widest rounded-none transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingChapter}
                    className="px-5 py-2.5 bg-purple-650 hover:bg-purple-550 border border-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-none transition shadow flex items-center gap-1.5"
                  >
                    {savingChapter ? "Saving..." : "Save Chapter"}
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Chapter Action Bar */}
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-base font-bold text-purple-655 dark:text-purple-400">
                  Chapter List
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingChapter(true)}
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-purple-650 hover:bg-purple-550 border border-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-none transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Chapter</span>
                </button>
              </div>

              {/* Chapters List */}
              {loadingChapters ? (
                <div className="text-center p-12 text-slate-450 dark:text-slate-400 bg-slate-900/10 border border-indigo-500/30 rounded-none">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                  <span>Loading chapter list...</span>
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-slate-900/10 border border-indigo-500/30 rounded-none">
                  <p className="font-body-serif italic text-sm text-slate-455 dark:text-slate-400">
                    This story does not have any chapters yet. Please add your first chapter to publish your work.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditingChapter(true)}
                    className="mt-4 inline-flex items-center gap-1.5 py-2 px-4 bg-purple-550 hover:bg-purple-500 border border-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-none transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write First Chapter</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/10 border border-indigo-500/30 rounded-none overflow-hidden divide-y divide-indigo-500/10">
                  {chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 px-2 py-0.5 rounded-none border border-indigo-500/20">
                            Chapter {ch.number}
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate capitalize">
                            {ch.title}
                          </span>
                          {ch.isDraft && (
                            <span className="text-xs font-extrabold bg-amber-955/20 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-none">
                              DRAFT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                          {ch.wordCount} Words &bull;{" "}
                          {ch.publishedAt
                            ? `Published on ${new Date(ch.publishedAt).toLocaleDateString("en-US")}`
                            : "Not published yet"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditChapterClick(ch)}
                          className="p-2 border border-indigo-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-none transition"
                          title="Edit Chapter"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(ch.id)}
                          className="p-2 border border-indigo-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-none transition"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
