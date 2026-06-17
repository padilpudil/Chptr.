import { Lock, Eye, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Chptr.",
  description: "Learn how we handle your account credentials and reading statistics.",
};

export default function PrivacyPage() {
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
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-purple-655 dark:text-purple-400">
              Privacy Policy
            </h1>
            <div className="w-16 h-0.5 bg-indigo-500 mx-auto mt-3 mb-4"></div>
            <p className="font-body-serif italic text-sm text-slate-500 dark:text-slate-300 max-w-xl mx-auto">
              &quot;Your trust is essential to us. Here is how we collect, store, and protect your data.&quot;
            </p>
          </div>

          {/* Privacy Content */}
          <div className="space-y-8 font-serif text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                Chptr. collects minimal user information strictly necessary to run the platform services:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm font-sans text-slate-500 dark:text-slate-300">
                <li><strong>Account Credentials</strong>: Username, email address, and encrypted password hash (via bcrypt) when registering an account.</li>
                <li><strong>Reading History & Badges</strong>: For guest users, reading time and unlocked milestone achievements are saved directly in your browser&apos;s local storage (`localStorage`). No tracking files are transmitted in guest mode. For authenticated users, data is linked securely to your profile.</li>
                <li><strong>Social Login Info</strong>: If you sign in via Google, we retrieve your profile information (username/avatar) and email as verified by Google OAuth.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                2. Data Safety & Security
              </h2>
              <p>
                We do not sell, trade, or rent user data to third-party ad networks or data Brokers. All database details are safely isolated, and authentication protocols are managed securely by standard OAuth2 providers and NextAuth frameworks.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                3. Cookies & Local Browser Storage
              </h2>
              <p>
                Cookies are only set for persistent user session tokens (NextAuth session keys). You can control cookies and browser cache storage through your browser settings. Wiping your browser&apos;s cache will delete your offline guest reading progress, so we recommend registering an account to sync achievements.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-widest text-purple-655 dark:text-purple-400 border-b border-indigo-500/10 pb-2 mb-4">
                4. Policy Updates
              </h2>
              <p>
                We may periodically update this page to reflect feature upgrades or security revisions. We recommend checking back regularly to review any changes.
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
