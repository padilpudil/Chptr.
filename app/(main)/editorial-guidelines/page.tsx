import { Shield, BookOpen, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Editorial Guidelines | Chptr.",
  description: "Standard guidelines and rules for publishing literary works on Chptr.",
};

export default function EditorialGuidelinesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 transition-colors duration-300">
      {/* Parchment Overlay Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.01] flex justify-center items-center z-0">
        <img
          className="w-full h-full object-cover filter sepia grayscale"
          src="https://www.transparenttextures.com/patterns/paper-fibers.png"
          alt="Parchment overlay"
        />
      </div>

      <div className="relative z-10 max-w-[94%] md:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-indigo-500 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-none shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-purple-650/10 border border-indigo-500/30 text-purple-655 dark:text-purple-400 rounded-none mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-purple-655 dark:text-purple-400">
              Editorial Guidelines
            </h1>
            <div className="w-16 h-0.5 bg-indigo-500 mx-auto mt-3 mb-4"></div>
            <p className="font-body-serif italic text-sm text-slate-500 dark:text-slate-300 max-w-xl mx-auto">
              &quot;Ensuring a high standard of creative writing and community appreciation.&quot;
            </p>
          </div>

          {/* Guidelines Sections */}
          <div className="space-y-8 font-serif text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                1. Originality & Ownership
              </h2>
              <p className="mb-4">
                We celebrate the unique voice of every writer. You must own the rights to all content that you publish on Chptr. Plagiarism, uncredited reproduction of copyrighted works, or uploading AI-generated text presented as your own human work is strictly prohibited.
              </p>
              <div className="border-l-2 border-indigo-500 pl-4 py-1.5 italic text-slate-500 dark:text-slate-300 text-xs sm:text-sm my-4">
                &quot;Literature is the effort of the human soul to speak its truth. Respect the copyright and intellectual labor of others.&quot;
              </div>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                2. Formatting Excellence
              </h2>
              <p className="mb-3">
                To maintain a premium, readable archive, please adhere to clean layout practices:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm font-sans text-slate-500 dark:text-slate-300">
                <li>Choose the appropriate **Work Format** (e.g. Poetry, Short Story, Haiku) to ensure the reader view renders your layout optimally.</li>
                <li>Avoid excessive capitalize, bold, or italic stylings unless they have explicit artistic relevance.</li>
                <li>Ensure punctuation, paragraph spacing, and line breaks are formatted properly using our TipTap editor tools.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                3. Appropriate Ratings & Content Flags
              </h2>
              <p className="mb-3">
                We believe in creative freedom, but ask that you accurately tag your stories. Utilize the content ratings properly to classify your works:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm font-sans text-slate-500 dark:text-slate-300">
                <li><strong>General (All Ages)</strong>: Suitable for all audiences. No explicit references or language.</li>
                <li><strong>Teen</strong>: Contains mild violence, moderate language, or complex thematic elements.</li>
                <li><strong>Mature / Explicit</strong>: Requires precise rating tagging to notify younger readers before access.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                4. Moderation & Community
              </h2>
              <p>
                Spam stories, advertising listings, harassment comments, and low-effort posts designed to clutter searches will be flagged and reviewed by moderators. Chptr. reserves the right to unpublish works that fail to comply with these guidelines.
              </p>
            </div>
          </div>

          {/* Footer Fleurons Ornament */}
          <div className="w-full pt-10 border-t border-indigo-500/10 flex justify-center items-center gap-4 mt-12">
            <div className="hairline-separator w-20"></div>
            <div className="fleuron"></div>
            <div className="hairline-separator w-20"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
