"use client";

import { useState, useEffect } from "react";
import { Quote, Shuffle } from "lucide-react";

interface QuoteType {
  text: string;
  author: string;
}

const LITERARY_QUOTES: QuoteType[] = [
  {
    text: "Literature is humanity's effort to record its soul, so that it does not vanish in the depths of time.",
    author: "Chptr Editorial Board"
  },
  {
    text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.",
    author: "Toni Morrison"
  },
  {
    text: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou"
  },
  {
    text: "If you don't like to read, you haven't found the right book.",
    author: "J.K. Rowling"
  },
  {
    text: "Description begins in the writer’s imagination, but should finish in the reader’s.",
    author: "Stephen King"
  },
  {
    text: "We read to know we are not alone.",
    author: "C.S. Lewis"
  },
  {
    text: "Fiction is the lie through which we tell the truth.",
    author: "Albert Camus"
  },
  {
    text: "No need to hurry. No need to sparkle. No need to be anybody but oneself.",
    author: "Virginia Woolf"
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway"
  },
  {
    text: "You can never be overdressed or overeducated.",
    author: "Oscar Wilde"
  }
];

export default function DynamicQuoteSection() {
  const [quote, setQuote] = useState<QuoteType>(LITERARY_QUOTES[0]);
  const [fade, setFade] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // Pick a random quote on client mount
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * LITERARY_QUOTES.length);
    setQuote(LITERARY_QUOTES[randomIdx]);
  }, []);

  const handleShuffle = () => {
    if (isRotating) return;
    setIsRotating(true);
    setFade(false);

    setTimeout(() => {
      let nextQuote = quote;
      while (nextQuote.text === quote.text) {
        const randomIdx = Math.floor(Math.random() * LITERARY_QUOTES.length);
        nextQuote = LITERARY_QUOTES[randomIdx];
      }
      setQuote(nextQuote);
      setFade(true);
      setIsRotating(false);
    }, 300); // matches fade duration
  };

  return (
    <section className="py-20 bg-purple-655 text-slate-50 border-y border-indigo-500/30 text-center relative">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
        <Quote className="w-10 h-10 text-indigo-500/50 mb-6 animate-pulse" />
        
        {/* Quote Content with Transition */}
        <div 
          className={`transition-opacity duration-300 min-h-[140px] sm:min-h-[100px] flex flex-col justify-center ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          <blockquote className="font-serif text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto italic mb-6 font-light leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <cite className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] not-italic">
            — {quote.author}
          </cite>
        </div>

        {/* Shuffle Action button */}
        <button
          onClick={handleShuffle}
          className="mt-8 flex items-center gap-2 text-[11px] font-bold text-indigo-500/60 hover:text-indigo-500 uppercase tracking-[0.15em] border border-indigo-500/20 px-3.5 py-2 hover:bg-indigo-500/5 transition-all duration-300"
          title="Shuffle Literary Quote"
        >
          <Shuffle className={`w-3.5 h-3.5 transition-transform duration-500 ${isRotating ? "rotate-180" : ""}`} />
          Shuffle Quote
        </button>
      </div>
    </section>
  );
}
