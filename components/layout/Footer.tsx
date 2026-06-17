import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-indigo-500/20 bg-slate-100/60 dark:bg-slate-950/60 text-slate-550 dark:text-slate-400 py-12 transition-colors duration-300">
      <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-logo text-2xl text-purple-655 dark:text-purple-400 normal-case tracking-normal font-normal">
              Chptr.
            </span>
            <p className="text-xs text-slate-400 font-semibold tracking-wider">
              READ, WRITE, AND CONNECT
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest">
            <Link href="/works" className="hover:text-indigo-500 transition">
              Archive
            </Link>
            <Link href="/works/new" className="hover:text-indigo-500 transition">
              Write
            </Link>
            <Link href="/about" className="hover:text-indigo-500 transition">
              About Us
            </Link>
            <Link href="/editorial-guidelines" className="hover:text-indigo-500 transition">
              Editorial Guidelines
            </Link>
            <Link href="/privacy" className="hover:text-indigo-500 transition">
              Privacy
            </Link>
          </div>

          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            &copy; {new Date().getFullYear()} Chptr.
          </p>
        </div>

        {/* Fleurons ornament divider */}
        <div className="w-full py-4 border-t border-indigo-500/10 flex justify-center items-center gap-4">
          <div className="hairline-separator w-24 sm:w-32"></div>
          <div className="fleuron"></div>
          <div className="hairline-separator w-24 sm:w-32"></div>
        </div>
      </div>
    </footer>
  );
}
