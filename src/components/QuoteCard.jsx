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
    author: ""
  });

  // Fetch quote from API
  const fetchQuote = async () => {
    try {
      const res = await fetch("https://dummyjson.com/quotes/random");

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setQuote({
        text: data.quote,
        author: data.author
      });

    } catch (error) {

      // fallback to local quote
      const randomIndex = Math.floor(Math.random() * localQuotes.length);
      setQuote(localQuotes[randomIndex]);
    }
  };

  // Runs automatically on refresh
  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div
      className="
      rounded-xl
      border
      border-gray-200 dark:border-gray-700
      border-l-8 border-l-blue-600
      bg-white dark:bg-gray-900
      shadow-sm
      hover:shadow-md
      transition-all
      p-5 sm:p-8
      "
    >

      {/* Heading */}
      <h3 className="
        font-bold 
        text-xl sm:text-2xl md:text-3xl 
        mb-3
        text-blue-700 dark:text-blue-400
      ">
        Daily Motivation
      </h3>

      {/* Quote */}
      <p className="
        max-w-3xl
        text-lg sm:text-xl md:text-2xl
        font-semibold
        italic
        leading-relaxed
        text-gray-800 dark:text-gray-200
      ">
        "{quote.text}"
      </p>

      {/* Author */}
      <p className="
        mt-3
        text-sm sm:text-base
        text-gray-500 dark:text-gray-400
      ">
        — {quote.author}
      </p>

      {/* Button */}
      <button
        onClick={fetchQuote}
        className="
          mt-5
          rounded-lg
          bg-blue-600
          px-4 py-2
          text-white
          font-medium
          hover:bg-blue-700
          active:scale-95
          transition
        "
      >
        New Quote
      </button>

    </div>
  );
}
