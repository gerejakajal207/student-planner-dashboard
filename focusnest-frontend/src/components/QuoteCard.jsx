import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { RefreshCw } from "lucide-react";

// Key is unique per page load — changes on every hard refresh/reload
// but stays the same during React in-page navigation
const SESSION_KEY = `focusnest_quote_${Math.floor(performance.timeOrigin)}`;

const LOCAL_QUOTES = [
  { text: "Success is the sum of small efforts repeated daily.", author: "Robert Collier" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Push yourself because no one else will do it for you.", author: "Unknown" },
  { text: "Focus is a muscle. The more you practice, the stronger it gets.", author: "Anonymous" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
];

function getCachedQuote() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedQuote(quote) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(quote));
  } catch {
    // ignore storage errors
  }
}

export default function QuoteCard() {
  const cached = getCachedQuote();

  const [quote, setQuote] = useState(
    cached ?? { text: "Loading motivational quote...", author: "" }
  );
  const [loading, setLoading] = useState(false);

  // Guard so the effect only fires once per mount (prevents React StrictMode double-invoke
  // from sending two real network requests)
  const hasFetched = useRef(false);

  useEffect(() => {
    // If we already have a cached quote from this session, do nothing
    if (getCachedQuote()) return;
    // Prevent double-fetch (React StrictMode mounts twice in dev)
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchQuote() {
    setLoading(true);
    try {
      const data = await api.getQuote();
      const q = { text: data.text, author: data.author };
      setQuote(q);
      setCachedQuote(q);
    } catch {
      const q = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
      setQuote(q);
      setCachedQuote(q);
    } finally {
      setLoading(false);
    }
  }

  // Manual refresh: bypass cache, fetch fresh quote
  async function handleRefresh() {
    if (loading) return;
    setLoading(true);
    try {
      const data = await api.getQuote();
      const q = { text: data.text, author: data.author };
      setQuote(q);
      setCachedQuote(q);
    } catch {
      const q = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
      setQuote(q);
      setCachedQuote(q);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-l-4 border-indigo-600 bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm sm:text-base font-normal italic leading-relaxed text-slate-700 dark:text-[#e2e8f0]">
            "{quote.text}"
          </p>
          <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            — {quote.author || "FocusNest Inspiration"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-slate-600 dark:hover:text-[#e2e8f0] transition-colors disabled:opacity-50"
          title="Get new quote"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
