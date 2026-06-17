export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import { auth } from "@/auth";
import WorkCard from "@/components/works/WorkCard";
import ProfileActions from "@/components/works/ProfileActions";
import { BookOpen, Users, Calendar, PenTool, User as UserIcon, Frown } from "lucide-react";
import { Metadata } from "next";

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  return {
    title: `Author Profile: ${params.username} - Chptr`,
    description: `View the bio, writing stats, and stories of ${params.username} on Chptr.`,
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = params;
  const session = await auth();

  let user = null;
  let works: any[] = [];
  let isFollowing = false;

  try {
    user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            works: true,
          },
        },
      },
    });

    if (user) {
      works = await db.work.findMany({
        where: {
          authorId: user.id,
        },
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

      if (session?.user?.id) {
        const followRecord = await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
        });
        isFollowing = !!followRecord;
      }
    }
  } catch (dbError) {
    console.warn("User profile DB error.", dbError);
  }

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.username === username;

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 sm:p-8 rounded-none shadow-md flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden mb-10 text-center md:text-left">
        {/* Profile Avatar */}
        <div className="w-24 h-24 rounded-none border border-indigo-500 bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden shadow">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-12 h-12 text-slate-300 dark:text-slate-700" />
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-grow space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-extrabold text-purple-655 dark:text-purple-400 flex items-center gap-2">
                <span>{user.username}</span>
                {isOwnProfile && (
                  <span className="text-xs font-bold uppercase bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-none border border-indigo-500/30">
                    Me
                  </span>
                )}
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>Joined {new Date(user.createdAt).toLocaleDateString("en-US")}</span>
              </p>
            </div>

            {/* Client Side Follow / Edit Actions */}
            <ProfileActions
              username={user.username}
              userId={user.id}
              initialIsFollowing={isFollowing}
              isOwnProfile={isOwnProfile}
              initialBio={user.bio}
              initialAvatarUrl={user.avatarUrl}
            />
          </div>

          {/* Bio text */}
          <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-indigo-500/20 rounded-none max-w-3xl">
            <p className="font-body-serif text-sm text-slate-655 dark:text-slate-350 leading-relaxed italic">
              {user.bio || "This author has not written a bio yet."}
            </p>
          </div>

          {/* Profile Stats */}
          <div className="flex justify-center md:justify-start gap-6 pt-2 text-xs font-bold text-slate-600 dark:text-slate-350 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-indigo-500" />
              <span>
                <strong className="text-[#C5A059]">{user._count.works}</strong> {user._count.works === 1 ? "Story" : "Stories"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>
                <strong className="text-[#C5A059]">{user._count.followers}</strong> {user._count.followers === 1 ? "Follower" : "Followers"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-indigo-500" />
              <span>
                Following <strong className="text-[#C5A059]">{user._count.following}</strong>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Author Stories Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-indigo-500/10 pb-3">
          <span className="h-[1px] w-12 bg-indigo-500"></span>
          <h2 className="font-serif text-xl text-purple-655 dark:text-purple-400 font-extrabold uppercase tracking-wide">
            Author&apos;s Stories ({works.length})
          </h2>
        </div>

        {works.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/10 border border-indigo-500/30 rounded-none p-6">
            <Frown className="w-12 h-12 text-indigo-500/30 mx-auto mb-4" />
            <h3 className="font-serif text-base font-bold text-slate-800 dark:text-slate-200">
              No stories published yet
            </h3>
            <p className="font-body-serif italic text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {isOwnProfile
                ? "You haven't published any stories yet. Start writing your first story now!"
                : `${username} hasn't published any stories yet.`}
            </p>
            {isOwnProfile && (
              <Link
                href="/works/new"
                className="mt-5 inline-flex py-2 px-5 bg-purple-650 hover:bg-purple-550 border border-indigo-500 text-white text-xs font-bold rounded-none uppercase tracking-widest transition shadow"
              >
                Start Writing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
