import { BookOpen, Sparkles, Feather } from "lucide-react";

export const metadata = {
  title: "About Us | Chptr.",
  description: "A sanctuary for creative writing, poetry, novels, and digital literature.",
};

export default function AboutPage() {
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
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-purple-655 dark:text-purple-400">
              About Chptr.
            </h1>
            <div className="w-16 h-0.5 bg-indigo-500 mx-auto mt-3 mb-4"></div>
            <p className="font-body-serif italic text-sm text-slate-500 dark:text-slate-300 max-w-xl mx-auto">
              &quot;A digital sanctuary for creative expression, designed for writers who treasure their words and readers who appreciate the art of focus.&quot;
            </p>
          </div>

          {/* Body Narrative */}
          <div className="space-y-8 font-serif text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                Our Philosophy
              </h2>
              <p className="mb-4">
                In an era dominated by rapid consumption, clickbait feeds, and brief micro-updates, <strong>Chptr.</strong> serves as a modern refuge of letters. We believe that stories deserve a slow, dignified reading experience. We believe that prose, poetry, lyrics, and novels should not be crowded by flashy distractions or generic social media clutter.
              </p>
              <p>
                Every formatting detail, typography choice, and color accent in Chptr. is hand-tailored to replicate the timeless feel of vintage ink-on-paper literature, adapted elegantly for the digital screen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="border border-indigo-500/15 p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-none">
                <div className="flex items-center gap-3 mb-3 text-indigo-500">
                  <Feather className="w-5 h-5" />
                  <h3 className="font-serif text-xs font-bold uppercase tracking-widest">
                    For The Writers
                  </h3>
                </div>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                  Format your drafts perfectly using structured canvas controls. Organize your creations into chapters, customize tags, and display your portfolios in a minimal, high-end, classic grid.
                </p>
              </div>

              <div className="border border-indigo-500/15 p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-none">
                <div className="flex items-center gap-3 mb-3 text-indigo-500">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-serif text-xs font-bold uppercase tracking-widest">
                    For The Readers
                  </h3>
                </div>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                  Immerse yourself in clean reading screens, customizable dark modes, and dynamic visual canvases optimized specifically for each literary format (Poetry, Drama, Novels, etc.).
                </p>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                The Heritage Styling
              </h2>
              <p>
                Our design takes inspiration from high-end heritage publishers, featuring sharp corners, gold/indigo accents, and muted, curated color palettes. It is built to celebrate the historical lineage of creative prose and Indonesian-international literary masterpieces.
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
