"use client";

import { useState, useEffect } from "react";
import { 
  Users, BookOpen, MessageSquare, Tag, ShieldAlert, ShieldCheck, 
  Trash2, Plus, RefreshCw, Search, Calendar, ChevronRight, FileText,
  Edit2, Key, X, Info
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardClientProps {
  currentUserId: string;
}

export default function AdminDashboardClient({ currentUserId }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "content" | "tags">("stats");
  const [loading, setLoading] = useState(true);

  // Stats Data
  const [stats, setStats] = useState<any>({
    counts: { users: 0, works: 0, comments: 0, chapters: 0 },
    recentUsers: [],
    recentWorks: []
  });

  // Users Data
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // Content Moderation Data
  const [works, setWorks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [contentSearch, setContentSearch] = useState("");

  // Tags Data
  const [tags, setTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState<string>("ADDITIONAL");

  // God Mode Edit Modals State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userEditData, setUserEditData] = useState({ username: "", email: "", bio: "", resetPassword: false });

  const [editingWork, setEditingWork] = useState<any | null>(null);
  const [workEditData, setWorkEditData] = useState({ title: "", summary: "", rating: "GENERAL", status: "IN_PROGRESS" });

  const [editingComment, setEditingComment] = useState<any | null>(null);
  const [commentEditData, setCommentEditData] = useState({ content: "" });

  // Load Data based on active tab
  useEffect(() => {
    loadTabInit();
  }, [activeTab]);

  const loadTabInit = async () => {
    setLoading(true);
    try {
      if (activeTab === "stats") {
        await fetchStats();
      } else if (activeTab === "users") {
        await fetchUsers();
      } else if (activeTab === "content") {
        await Promise.all([fetchWorks(), fetchComments()]);
      } else if (activeTab === "tags") {
        await fetchTags();
      }
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  };

  const fetchUsers = async (query = "") => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const fetchWorks = async (query = "") => {
    const res = await fetch(`/api/admin/works?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setWorks(data);
    }
  };

  const fetchComments = async () => {
    const res = await fetch("/api/admin/comments");
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  };

  const fetchTags = async () => {
    const res = await fetch("/api/admin/tags");
    if (res.ok) {
      const data = await res.json();
      setTags(data);
    }
  };

  // Toggle user roles (Admin <-> User)
  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot change your own account role!");
      return;
    }

    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const confirmChange = confirm(
      `Are you sure you want to change this user's role to ${newRole}?`
    );
    if (!confirmChange) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        toast.success("User role successfully updated!");
        fetchUsers(userSearch);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update user role");
      }
    } catch (e) {
      toast.error("Failed to update user role");
    }
  };

  // Wipe User (Cascading delete) - GOD MODE
  const handleWipeUser = async (userId: string, username: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot delete your own account!");
      return;
    }

    const confirmWipe = confirm(
      `⚠️ GOD MODE WARNING: Are you sure you want to delete the account "${username}" permanently?\n\nThis action cannot be undone and will immediately delete all stories, chapters, comments, bookmarks, kudos, and follower relationships owned by this user.`
    );
    if (!confirmWipe) return;

    const doubleCheck = prompt(`To confirm deletion, type the username "${username}" below:`);
    if (doubleCheck !== username) {
      toast.error("Incorrect username confirmation. Deletion canceled.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Account "${username}" and all related data have been completely deleted!`);
        fetchUsers(userSearch);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete user account");
      }
    } catch (e) {
      toast.error("Failed to delete user account");
    } finally {
      setLoading(false);
    }
  };

  // Submit User Profile Edit & Password Reset - GOD MODE
  const handleUserEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          username: userEditData.username,
          email: userEditData.email,
          bio: userEditData.bio,
          resetPassword: userEditData.resetPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "User profile successfully updated!");
        setEditingUser(null);
        fetchUsers(userSearch);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  // Submit Work Metadata Edit - GOD MODE
  const handleWorkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork) return;

    try {
      const res = await fetch("/api/admin/works", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: editingWork.id,
          title: workEditData.title,
          summary: workEditData.summary,
          rating: workEditData.rating,
          status: workEditData.status,
        }),
      });

      if (res.ok) {
        toast.success("Story metadata successfully updated!");
        setEditingWork(null);
        fetchWorks(contentSearch);
      } else {
        toast.error("Failed to update story");
      }
    } catch (err) {
      toast.error("Failed to update story");
    }
  };

  // Submit Comment Content Edit - GOD MODE
  const handleCommentEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;

    try {
      const res = await fetch("/api/admin/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: editingComment.id,
          content: commentEditData.content,
        }),
      });

      if (res.ok) {
        toast.success("Comment content updated successfully!");
        setEditingComment(null);
        fetchComments();
      } else {
        toast.error("Failed to update comment");
      }
    } catch (err) {
      toast.error("Failed to update comment");
    }
  };

  // Delete Work
  const handleDeleteWork = async (workId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this story, including all its chapters and comments, permanently?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/works?workId=${workId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Story successfully deleted!");
        fetchWorks(contentSearch);
      } else {
        toast.error("Failed to delete story");
      }
    } catch (e) {
      toast.error("Failed to delete story");
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Comment successfully deleted!");
        fetchComments();
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  };

  // Create Tag
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName, type: newTagType }),
      });

      if (res.ok) {
        toast.success("New tag successfully added!");
        setNewTagName("");
        fetchTags();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add tag");
      }
    } catch (e) {
      toast.error("Failed to add tag");
    }
  };

  // Delete Tag
  const handleDeleteTag = async (tagId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this tag? It will be removed from all stories using it."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/tags?tagId=${tagId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Tag successfully deleted!");
        fetchTags();
      } else {
        toast.error("Failed to delete tag");
      }
    } catch (e) {
      toast.error("Failed to delete tag");
    }
  };

  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(userSearch);
  };

  const handleContentSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorks(contentSearch);
  };

  const openUserEditModal = (user: any) => {
    setEditingUser(user);
    setUserEditData({
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      resetPassword: false
    });
  };

  const openWorkEditModal = (work: any) => {
    setEditingWork(work);
    setWorkEditData({
      title: work.title,
      summary: work.summary,
      rating: work.rating,
      status: work.status
    });
  };

  const openCommentEditModal = (comment: any) => {
    setEditingComment(comment);
    setCommentEditData({
      content: comment.content
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif font-extrabold tracking-tight text-purple-655 dark:text-purple-400">
              Admin Moderation Dashboard
            </h1>
            <span className="px-2.5 py-0.5 bg-red-500/5 text-red-500 border border-red-500/35 text-[11px] font-bold uppercase tracking-wider rounded-none flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>God Mode Active</span>
            </span>
          </div>
          <p className="text-slate-555 dark:text-slate-400 text-sm font-sans mt-1">
            Use global administrator controls to track statistics, moderate stories, edit comments, change roles, and delete user accounts.
          </p>
        </div>
        <button 
          onClick={loadTabInit}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-indigo-500/35 hover:border-indigo-500 rounded-none bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 font-semibold text-xs transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-2 border-b border-indigo-500/20 pb-2">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-none font-bold text-xs transition duration-200 border ${
            activeTab === "stats"
              ? "bg-purple-600 border-indigo-500/40 text-white"
              : "border-transparent text-slate-500 hover:bg-slate-150/50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Overview (Stats)</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-none font-bold text-xs transition duration-200 border ${
            activeTab === "users"
              ? "bg-purple-600 border-indigo-500/40 text-white"
              : "border-transparent text-slate-500 hover:bg-slate-150/50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Manage Users</span>
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-none font-bold text-xs transition duration-200 border ${
            activeTab === "content"
              ? "bg-purple-600 border-indigo-500/40 text-white"
              : "border-transparent text-slate-500 hover:bg-slate-150/50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Content Moderation</span>
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-none font-bold text-xs transition duration-200 border ${
            activeTab === "tags"
              ? "bg-purple-600 border-indigo-500/40 text-white"
              : "border-transparent text-slate-500 hover:bg-slate-150/50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Manage Tags</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Processing data...</span>
          </div>
        ) : (
          <>
            {/* TAB: STATS OVERVIEW */}
            {activeTab === "stats" && (
              <div className="space-y-8">
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card: Users */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-indigo-500/35 p-6 rounded-none flex items-center gap-4">
                    <div className="p-3 border border-indigo-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400 rounded-none">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-extrabold text-purple-655 dark:text-purple-400">{stats.counts.users}</p>
                      <p className="text-xs font-bold tracking-widest text-slate-555 dark:text-slate-400 uppercase mt-1">Total Users</p>
                    </div>
                  </div>
                  {/* Card: Works */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-indigo-500/35 p-6 rounded-none flex items-center gap-4">
                    <div className="p-3 border border-indigo-500/20 bg-indigo-500/5 text-indigo-650 dark:text-indigo-400 rounded-none">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-extrabold text-purple-655 dark:text-purple-400">{stats.counts.works}</p>
                      <p className="text-xs font-bold tracking-widest text-slate-555 dark:text-slate-400 uppercase mt-1">Total Stories</p>
                    </div>
                  </div>
                  {/* Card: Chapters */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-indigo-500/35 p-6 rounded-none flex items-center gap-4">
                    <div className="p-3 border border-indigo-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-none">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-extrabold text-purple-655 dark:text-purple-400">{stats.counts.chapters}</p>
                      <p className="text-xs font-bold tracking-widest text-slate-555 dark:text-slate-400 uppercase mt-1">Total Chapters</p>
                    </div>
                  </div>
                  {/* Card: Comments */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-indigo-500/35 p-6 rounded-none flex items-center gap-4">
                    <div className="p-3 border border-indigo-500/20 bg-amber-500/5 text-amber-655 dark:text-amber-450 rounded-none">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-extrabold text-purple-655 dark:text-purple-400">{stats.counts.comments}</p>
                      <p className="text-xs font-bold tracking-widest text-slate-555 dark:text-slate-400 uppercase mt-1">Total Comments</p>
                    </div>
                  </div>
                </div>

                {/* Lists Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent registrations */}
                  <div className="border border-indigo-500/35 p-6 rounded-none bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                    <h2 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400 border-b border-indigo-500/20 pb-2.5 uppercase tracking-wider">
                      Recent User Registrations
                    </h2>
                    {stats.recentUsers.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 italic">No users registered yet.</p>
                    ) : (
                      <ul className="divide-y divide-indigo-500/20">
                        {stats.recentUsers.map((u: any) => (
                          <li key={u.id} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-serif font-bold text-slate-800 dark:text-slate-200">{u.username}</p>
                              <p className="text-slate-550 dark:text-slate-400 mt-0.5">{u.email}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-0.5 font-bold rounded-none ${
                                u.role === "ADMIN" 
                                  ? "bg-red-500/5 text-red-500 border border-red-500/35" 
                                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-indigo-500/20"
                              }`}>
                                {u.role}
                              </span>
                              <p className="text-xs text-slate-455 mt-1 flex items-center gap-1 justify-end">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{new Date(u.createdAt).toLocaleDateString("en-US")}</span>
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Recent stories */}
                  <div className="border border-indigo-500/35 p-6 rounded-none bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                    <h2 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400 border-b border-indigo-500/20 pb-2.5 uppercase tracking-wider">
                      Recent Stories
                    </h2>
                    {stats.recentWorks.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 italic">No stories created yet.</p>
                    ) : (
                      <ul className="divide-y divide-indigo-500/20">
                        {stats.recentWorks.map((w: any) => (
                          <li key={w.id} className="py-3 flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-4">
                              <p className="font-serif font-bold text-purple-655 dark:text-purple-400 truncate capitalize">{w.title}</p>
                              <p className="text-slate-550 dark:text-slate-400 mt-0.5 font-serif italic">by {w.author?.username}</p>
                            </div>
                            <span className="shrink-0 text-xs text-slate-550 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 border border-indigo-500/20 rounded-none">
                              {new Date(w.createdAt).toLocaleDateString("en-US")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USER MANAGEMENT */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Search Bar */}
                <form onSubmit={handleUserSearchSubmit} className="relative max-w-md w-full">
                  <input
                    type="text"
                    placeholder="Search username or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-20 py-2 bg-slate-50/50 dark:bg-slate-950/50 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                  <button 
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-600 hover:bg-purple-555 text-white rounded-none border border-indigo-500 text-xs font-bold transition"
                  >
                    Search
                  </button>
                </form>

                {/* Users Table / Cards */}
                <div className="border border-indigo-500/35 rounded-none overflow-hidden bg-slate-50/50 dark:bg-slate-900/10">
                  {users.length === 0 ? (
                    <div className="text-center p-12 text-slate-555 text-sm">
                      No users match the search criteria.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-950 border-b border-indigo-500/20 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Stats</th>
                            <th className="px-6 py-4">Date Joined</th>
                            <th className="px-6 py-4 text-right">Actions (God Mode)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-500/25 font-medium">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-150/40 dark:hover:bg-slate-900/40 transition-colors">
                              <td className="px-6 py-4 font-serif font-bold text-sm text-purple-655 dark:text-purple-400">{u.username}</td>
                              <td className="px-6 py-4 text-slate-555 dark:text-slate-355">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-bold rounded-none border ${
                                  u.role === "ADMIN" 
                                    ? "bg-red-500/5 text-red-500 border-red-500/35" 
                                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-indigo-500/25"
                                }`}>
                                  {u.role === "ADMIN" ? (
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <Users className="w-3.5 h-3.5" />
                                  )}
                                  <span>{u.role}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-555 dark:text-slate-350">
                                <span>{u._count.works} Stories</span>
                                <span className="mx-1.5">•</span>
                                <span>{u._count.comments} Comments</span>
                              </td>
                              <td className="px-6 py-4 text-slate-455">{new Date(u.createdAt).toLocaleDateString("en-US")}</td>
                              <td className="px-6 py-4 text-right">
                                {u.id === currentUserId ? (
                                  <span className="text-xs text-slate-455 italic">Your Account</span>
                                ) : (
                                  <div className="flex justify-end items-center gap-2">
                                    {/* Role toggle button */}
                                    <button
                                      onClick={() => handleToggleRole(u.id, u.role)}
                                      className={`px-3 py-1.5 rounded-none border font-bold text-xs tracking-wider uppercase transition active:scale-95 ${
                                        u.role === "ADMIN"
                                          ? "border-red-500/35 hover:bg-red-500/5 text-red-500"
                                          : "border-indigo-500/45 hover:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400"
                                      }`}
                                    >
                                      Role
                                    </button>
                                    
                                    {/* Edit Profile button */}
                                    <button
                                      onClick={() => openUserEditModal(u)}
                                      className="p-1.5 border border-indigo-500/35 hover:bg-indigo-500/10 rounded-none text-slate-600 dark:text-slate-400 transition active:scale-95"
                                      title="Edit profile / reset password"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
 
                                    {/* Wipe user account */}
                                    <button
                                      onClick={() => handleWipeUser(u.id, u.username)}
                                      className="p-1.5 border border-red-500/35 hover:bg-red-500/10 rounded-none text-red-500 transition active:scale-95"
                                      title="Wipe account (Delete permanently)"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CONTENT MODERATION */}
            {activeTab === "content" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Moderation: Works */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                    <h2 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400">Stories List</h2>
                    <form onSubmit={handleContentSearchSubmit} className="relative w-48">
                      <input
                        type="text"
                        placeholder="Filter stories..."
                        value={contentSearch}
                        onChange={(e) => setContentSearch(e.target.value)}
                        className="w-full pl-8 pr-2 py-1 bg-slate-50/50 dark:bg-slate-950/50 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                      />
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500" />
                    </form>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {works.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 italic text-center">No stories found.</p>
                    ) : (
                      works.map((w) => (
                        <div key={w.id} className="border border-indigo-500/25 p-4 rounded-none bg-slate-50/50 dark:bg-slate-900/10 flex items-start gap-4 justify-between hover:border-indigo-500/50 transition-colors">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif font-bold text-sm text-purple-655 dark:text-purple-400 truncate capitalize">{w.title}</h3>
                              <span className={`px-1.5 py-0.5 text-[8px] font-bold border border-indigo-500/35 text-indigo-650 dark:text-indigo-400 rounded-none`}>
                                {w.rating}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 font-serif italic">Author: {w.author?.username} ({w.author?.email})</p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500 font-semibold">
                              <span>{w._count.chapters} Chapters</span>
                              <span>{w._count.kudos} Kudos</span>
                              <span>{w._count.comments} Comments</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => openWorkEditModal(w)}
                              className="p-2 border border-indigo-500/35 hover:bg-indigo-500/10 text-slate-600 dark:text-slate-455 rounded-none transition active:scale-95 shrink-0"
                              title="Edit story metadata"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWork(w.id)}
                              className="p-2 border border-red-500/35 hover:bg-red-500/10 text-red-500 rounded-none transition active:scale-95 shrink-0"
                              title="Delete story"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Moderation: Comments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2 h-[34px]">
                    <h2 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400">Recent Comments</h2>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 italic text-center">No comments found.</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="border border-indigo-500/25 p-4 rounded-none bg-slate-50/50 dark:bg-slate-900/10 flex items-start gap-4 justify-between hover:border-indigo-500/50 transition-colors">
                          <div className="min-w-0 space-y-1.5 w-full pr-2">
                            <div className="text-xs text-slate-550 dark:text-slate-455">
                              <span className="font-serif font-bold text-slate-800 dark:text-slate-200">{c.author?.username}</span>
                              <span className="mx-1">on story</span>
                              <span className="font-bold text-purple-655 dark:text-purple-400 capitalize">{c.work?.title}</span>
                            </div>
                            <p className="font-body-serif text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100/50 dark:bg-slate-950/40 p-2.5 rounded-none border border-indigo-500/15">
                              {c.content}
                            </p>
                            <span className="inline-block text-[11px] text-slate-455">
                              {new Date(c.createdAt).toLocaleString("en-US")}
                            </span>
                          </div>
                          
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => openCommentEditModal(c)}
                              className="p-2 border border-indigo-500/35 hover:bg-indigo-500/10 text-slate-600 dark:text-slate-455 rounded-none transition active:scale-95"
                              title="Edit comment text"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="p-2 border border-red-500/35 hover:bg-red-500/10 text-red-500 rounded-none transition active:scale-95"
                              title="Delete comment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TAGS MANAGEMENT */}
            {activeTab === "tags" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Add Tag */}
                <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-indigo-500/35 p-6 rounded-none h-fit space-y-4">
                  <h3 className="font-serif font-bold text-sm text-purple-655 dark:text-purple-400 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-500" />
                    <span>Add New Tag</span>
                  </h3>
                  <form onSubmit={handleCreateTag} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Tag Name</label>
                      <input
                        type="text"
                        placeholder="Enter tag name..."
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-indigo-500/35 rounded-none text-slate-850 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Tag Type</label>
                      <select
                        value={newTagType}
                        onChange={(e) => setNewTagType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-indigo-500/35 rounded-none text-slate-850 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="FANDOM">Fandom (Harry Potter, etc.)</option>
                        <option value="CHARACTER">Character (Arthur, Voldemort, etc.)</option>
                        <option value="RELATIONSHIP">Relationship (A/B, C/D, etc.)</option>
                        <option value="GENRE">Genre (Fantasy, Romance, etc.)</option>
                        <option value="WARNING">Warning (Violence, etc.)</option>
                        <option value="ADDITIONAL">Additional (Fluff, Angst, etc.)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-purple-600 hover:bg-purple-555 text-white border border-indigo-500 font-bold rounded-none text-xs transition active:scale-95 shadow-sm"
                    >
                      Create Tag
                    </button>
                  </form>
                </div>

                {/* List Tags */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400 border-b border-indigo-500/20 pb-2">
                    System Tags List ({tags.length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                    {tags.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 col-span-2 text-center">No tags created yet.</p>
                    ) : (
                      tags.map((t) => (
                        <div 
                          key={t.id}
                          className="p-3 border border-indigo-500/25 bg-slate-50/50 dark:bg-slate-900/10 rounded-none flex items-center justify-between text-xs hover:border-indigo-500/55 transition-colors"
                        >
                          <div>
                            <span className="font-serif font-bold text-purple-655 dark:text-purple-400 capitalize">{t.name}</span>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[11px] bg-slate-100 dark:bg-slate-950 border border-indigo-500/20 px-1.5 py-0.5 rounded-none font-bold text-slate-555 dark:text-slate-400">
                                {t.type}
                              </span>
                              <span className="text-[11px] text-slate-455 font-semibold">
                                Used in {t._count.works} Stories
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTag(t.id)}
                            className="p-2 border border-transparent hover:border-red-500/35 hover:bg-red-500/5 text-slate-455 hover:text-red-500 rounded-none transition active:scale-95"
                            title="Delete Tag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* GOD MODE MODAL 1: EDIT USER PROFILE & RESET PASSWORD */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-indigo-500 p-6 max-w-md w-full rounded-none shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <h3 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Edit Profile: {editingUser.username}</span>
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 hover:bg-slate-150/50 dark:hover:bg-slate-900 rounded-none text-slate-450 border border-transparent hover:border-indigo-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUserEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-555 uppercase">Username</label>
                <input
                  type="text"
                  required
                  value={userEditData.username}
                  onChange={(e) => setUserEditData({ ...userEditData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-555 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={userEditData.email}
                  onChange={(e) => setUserEditData({ ...userEditData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-205 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-555 uppercase">Short Bio</label>
                <textarea
                  rows={3}
                  value={userEditData.bio}
                  onChange={(e) => setUserEditData({ ...userEditData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-205 text-xs focus:outline-none resize-none focus:border-indigo-500"
                />
              </div>

              {/* Password reset checkbox */}
              <div className="flex items-center gap-2.5 p-3 bg-red-500/5 border border-red-500/25 rounded-none">
                <input
                  type="checkbox"
                  id="reset-password-check"
                  checked={userEditData.resetPassword}
                  onChange={(e) => setUserEditData({ ...userEditData, resetPassword: e.target.checked })}
                  className="w-4 h-4 text-red-655 border-red-500/35 rounded-none focus:ring-red-500"
                />
                <label htmlFor="reset-password-check" className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 cursor-pointer">
                  <Key className="w-3.5 h-3.5" />
                  <span>Reset password to &quot;123456&quot;</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-indigo-500/20">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-indigo-500/35 hover:bg-slate-150 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-none text-xs font-bold transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-650 hover:bg-purple-555 text-white rounded-none border border-indigo-500 text-xs font-bold transition active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOD MODE MODAL 2: EDIT WORK METADATA */}
      {editingWork && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-indigo-500 p-6 max-w-md w-full rounded-none shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <h3 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Edit Story: {editingWork.title}</span>
              </h3>
              <button 
                onClick={() => setEditingWork(null)}
                className="p-1 hover:bg-slate-150/50 dark:hover:bg-slate-900 rounded-none text-slate-455 border border-transparent hover:border-indigo-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWorkEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-555 uppercase">Story Title</label>
                <input
                  type="text"
                  required
                  value={workEditData.title}
                  onChange={(e) => setWorkEditData({ ...workEditData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none capitalize focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-555 uppercase">Summary</label>
                <textarea
                  rows={4}
                  required
                  value={workEditData.summary}
                  onChange={(e) => setWorkEditData({ ...workEditData, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none resize-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-555 uppercase">Content Rating</label>
                  <select
                    value={workEditData.rating}
                    onChange={(e) => setWorkEditData({ ...workEditData, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none font-bold focus:border-indigo-500"
                  >
                    <option value="GENERAL">General Audience</option>
                    <option value="TEEN">Teen & Up</option>
                    <option value="MATURE">Mature Content</option>
                    <option value="EXPLICIT">Explicit Content</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-555 uppercase">Story Status</label>
                  <select
                    value={workEditData.status}
                    onChange={(e) => setWorkEditData({ ...workEditData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none font-bold focus:border-indigo-500"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="HIATUS">Hiatus</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-indigo-500/20">
                <button
                  type="button"
                  onClick={() => setEditingWork(null)}
                  className="px-4 py-2 border border-indigo-500/35 hover:bg-slate-150 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-none text-xs font-bold transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-650 hover:bg-purple-555 text-white rounded-none border border-indigo-500 text-xs font-bold transition active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOD MODE MODAL 3: EDIT COMMENT TEXT */}
      {editingComment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-indigo-500 p-6 max-w-md w-full rounded-none shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <h3 className="font-serif font-bold text-base text-purple-655 dark:text-purple-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Edit Comment Text</span>
              </h3>
              <button 
                onClick={() => setEditingComment(null)}
                className="p-1 hover:bg-slate-150/50 dark:hover:bg-slate-900 rounded-none text-slate-455 border border-transparent hover:border-indigo-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCommentEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-indigo-500/20 rounded-none text-xs text-slate-550 font-semibold mb-2 flex gap-1.5 items-start">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>As an admin, you are editing this comment&apos;s content globally. Edits will immediately reflect in the associated story.</span>
                </div>
                <label className="text-xs font-bold text-slate-555 uppercase">Comment Content</label>
                <textarea
                  rows={5}
                  required
                  value={commentEditData.content}
                  onChange={(e) => setCommentEditData({ content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-indigo-500/35 rounded-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none resize-none font-medium leading-relaxed focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-indigo-500/20">
                <button
                  type="button"
                  onClick={() => setEditingComment(null)}
                  className="px-4 py-2 border border-indigo-500/35 hover:bg-slate-150 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-none text-xs font-bold transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-650 hover:bg-purple-555 text-white rounded-none border border-indigo-500 text-xs font-bold transition active:scale-95"
                >
                  Save Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
