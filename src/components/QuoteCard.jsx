import React, { useState, useEffect } from "react";

export default function QuoteCard() {
  // Backup quotes (used only if API fails)
  const localQuotes = [
    { text: "Success is the sum of small efforts repeated daily.", author: "Robert Collier" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Push yourself because no one else will do it for you.", author: "Unknown" },
  ];

  const [quote, setQuote] = useState({
    text: "Loading motivational quote...",
    author: "",
  });

  // Fetch quote from API
  const fetchQuote = async () => {
    try {
      const res = await fetch("https://dummyjson.com/quotes/random");

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setQuote({
        text: data.quote,
        author: data.author,
      });
    } catch (error) {
      console.error("Failed to fetch quote:", error);
      const randomIndex = Math.floor(Math.random() * localQuotes.length);
      setQuote(localQuotes[randomIndex]);
    }
  };

  // Runs automatically on refresh
  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="rounded-xl border border-l-8 border-gray-200 border-l-blue-600 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900 sm:p-8">
      {/* Quote */}
      <p className="max-w-3xl text-sm font-normal italic leading-relaxed text-gray-800 dark:text-gray-200 md:text-xl">
        "{quote.text}"
      </p>

      {/* Author */}
      <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-400 md:text-sm">
        — {quote.author}
      </p>
    </div>
  );
}
