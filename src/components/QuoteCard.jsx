import React from "react";

export default function QuoteCard() {
  return (
    <div className="rounded-lg border border-l-8 border-l-blue-600 p-5 sm:p-8">
      <p className="max-w-3xl text-lg font-semibold italic text-[#1a2b4d] sm:text-xl md:text-2xl">
        "Concentrate all your thoughts upon the work in hand."
      </p>
      <p className="mt-2 px-4 text-sm text-[#7d8fb3] sm:px-10 sm:text-base">— Tim Ferriss</p>
    </div>
  );
}
