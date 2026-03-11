import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function QuoteCard() {
  const localQuotes = [
    { text: "Success is the sum of small efforts repeated daily.", author: "Robert Collier" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Push yourself because no one else will do it for you.", author: "Unknown" },
  ];

  const [quote, setQuote] = useState({ text: "Loading motivational quote...", author: "" });

  const fetchQuote = async () => {
    try {
      const data = await api.getQuote();
      setQuote({ text: data.text, author: data.author });
    } catch (error) {
      console.error("Failed to fetch quote:", error);
      const randomIndex = Math.floor(Math.random() * localQuotes.length);
      setQuote(localQuotes[randomIndex]);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="rounded-xl border border-l-8 border-gray-200 border-l-blue-600 bg-white p-5 shadow-sm transition-all hover:shadow-md sm:p-8">
      <p className="max-w-3xl text-sm font-normal italic leading-relaxed text-gray-800 md:text-xl">
        "{quote.text}"
      </p>
      <p className="mt-3 text-[12px] text-gray-500 md:text-sm">
        — {quote.author}
      </p>
    </div>
  );
}