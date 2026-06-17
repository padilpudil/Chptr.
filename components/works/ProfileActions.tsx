"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus, Edit2, X, Check, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ProfileActionsProps {
  username: string;
  userId: string;
  initialIsFollowing: boolean;
  isOwnProfile: boolean;
  initialBio: string | null;
  initialAvatarUrl: string | null;
}

export default function ProfileActions({
  username,
  userId,
  initialIsFollowing,
  isOwnProfile,
  initialBio,
  initialAvatarUrl,
}: ProfileActionsProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Follow State
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Edit Profile State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bio, setBio] = useState(initialBio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [updating, setUpdating] = useState(false);
  const [avatarMode, setAvatarMode] = useState<"upload" | "url">(
    initialAvatarUrl && initialAvatarUrl.startsWith("http") ? "url" : "upload"
  );

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        toast.error("Profile picture size must be less than 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Follow Toggle
  const handleFollowToggle = async () => {
    if (status !== "authenticated") {
      toast.error("Please log in to follow authors.");
      router.push(`/login?callbackUrl=/users/${username}`);
      return;
    }

    setLoadingFollow(true);
    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to follow/unfollow");
      const data = await response.json();

      setIsFollowing(data.isFollowing);
      if (data.isFollowing) {
        toast.success(`Followed ${username}`);
      } else {
        toast.success(`Unfollowed ${username}`);
      }
      router.refresh(); // refresh stats in parent
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoadingFollow(false);
    }
  };

  // Handle Update Profile
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch(`/api/users/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, avatarUrl }),
      });

      if (!response.ok) throw new Error("Failed to update profile.");

      toast.success("Profile updated successfully!");
      setEditModalOpen(false);
      
      // Update NextAuth session dynamically so the avatar changes in navbar
      // Bypass NextAuth session cookie update for avatarUrl to prevent cookie overflow.
      // Instead, Navbar and pages will fetch avatarUrl directly from the DB API.
      window.location.reload();
    } catch (err) {
      toast.error("Failed to save changes.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isOwnProfile ? (
        <button
          onClick={() => setEditModalOpen(true)}
          className="inline-flex items-center gap-1.5 py-2 px-4 border border-indigo-500/35 hover:bg-indigo-500/5 hover:border-indigo-500 text-slate-700 dark:text-slate-350 rounded-none font-bold text-xs sm:text-sm shadow-sm transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      ) : (
        <button
          onClick={handleFollowToggle}
          disabled={loadingFollow}
          className={`inline-flex items-center gap-1.5 py-2 px-5 rounded-none font-bold text-xs sm:text-sm shadow transition duration-300 ${
            isFollowing
              ? "bg-slate-100 hover:bg-slate-205 border border-indigo-500/35 text-slate-750 dark:bg-slate-900 dark:text-slate-300"
              : "bg-purple-650 hover:bg-purple-550 border border-indigo-500 text-white"
          }`}
        >
          {isFollowing ? (
            <>
              <UserMinus className="w-4 h-4" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Follow Author</span>
            </>
          )}
        </button>
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <>
          {/* Backdrop Overlay */}
          <div className="fixed inset-0 bg-slate-950/45 dark:bg-slate-950/65 backdrop-blur-sm z-40" onClick={() => setEditModalOpen(false)}></div>

          {/* Modal Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 border border-indigo-500 p-6 rounded-none shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-180">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 mb-4">
              <h3 className="font-serif text-sm font-extrabold text-purple-655 dark:text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Edit My Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-655"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Avatar Image Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-indigo-650 dark:text-indigo-400 mb-2">
                  Profile Picture
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAvatarMode("upload")}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition ${
                      avatarMode === "upload"
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-500"
                        : "border-indigo-500/20 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode("url")}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition ${
                      avatarMode === "url"
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-500"
                        : "border-indigo-500/20 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205"
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {avatarMode === "upload" ? (
                  <div className="border border-dashed border-indigo-500/30 p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-8 h-8 text-indigo-500/50 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Choose an image file
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-body-serif italic">
                      Max size: 800KB (JPG, PNG, WEBP)
                    </p>
                    {avatarUrl && avatarUrl.startsWith("data:") && (
                      <div className="mt-2 text-[10px] font-mono text-emerald-500 truncate max-w-[280px] mx-auto">
                        ✓ Selected: {avatarUrl.substring(0, 30)}...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={avatarUrl && avatarUrl.startsWith("data:") ? "" : avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-indigo-500/30 rounded-none text-sm text-slate-850 dark:text-slate-205 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
                
                {avatarUrl && (
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-widest"
                    >
                      Clear Avatar
                    </button>
                    {avatarUrl.startsWith("data:") ? (
                      <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Local Image Selected</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Remote URL Selected</span>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-indigo-650 dark:text-indigo-400 mb-2">
                  Short Biography (Bio)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short bio or introduce yourself..."
                    className="w-full h-24 pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950/60 border border-indigo-500/30 rounded-none text-sm text-slate-850 dark:text-slate-205 placeholder-slate-505 focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                    maxLength={300}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {bio.length}/300 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-indigo-500/20">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="py-2 px-4 border border-indigo-500/35 text-slate-655 dark:text-slate-350 hover:bg-indigo-500/5 font-semibold text-xs rounded-none transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="py-2 px-4 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white font-bold text-xs rounded-none transition shadow flex items-center gap-1.5 uppercase tracking-widest"
                >
                  <span>Save</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
