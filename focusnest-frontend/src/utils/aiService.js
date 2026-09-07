/**
 * AI Service for FocusNest
 *
 * All Gemini API calls are now routed through the backend.
 * This file is kept for any shared utility functions.
 */

export function extractJson(text) {
  if (!text) throw new Error("Empty AI response");

  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        console.error("Failed to parse extracted JSON block", match[0]);
      }
    }
    throw new Error(`Could not parse JSON from AI response: ${cleaned.slice(0, 120)}...`);
  }
}
