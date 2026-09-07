/**
 * Utility for tracking and computing genuine student daily activity streak.
 *
 * Grace day rule:
 *   - One consecutive missing day is forgiven during the backward count.
 *   - Two or more consecutive missing days break the streak.
 *   - The grace is consumed — only ONE gap is allowed per streak run.
 */

export function recordActivity(userId) {
  try {
    if (typeof localStorage === "undefined") return;
    const key = `focusnest_activity_${userId || "guest"}`;
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(key);
    let dates = saved ? JSON.parse(saved) : [];
    if (!dates.includes(today)) {
      dates.push(today);
      localStorage.setItem(key, JSON.stringify(dates));
    }
  } catch (e) {
    console.error("Failed to record activity", e);
  }
}

export function calculateStreak(tasks = [], userId = null) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeDateStrings = new Set();

    // 1. Collect dates from local activity record
    if (typeof localStorage !== "undefined") {
      const key = `focusnest_activity_${userId || "guest"}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const dates = JSON.parse(saved);
        dates.forEach((d) => activeDateStrings.add(d));
      }
    }

    // 2. Collect dates from completed tasks — use TODAY's date when they were
    //    marked done, not the task's due date.
    //    We fall back to due_date only if no activity record exists for context.
    if (Array.isArray(tasks)) {
      tasks.forEach((t) => {
        if (t.status === "Done") {
          const d = t.date ? new Date(t.date) : t.due_date ? new Date(t.due_date) : null;
          if (d && !isNaN(d.getTime())) {
            const dateStr = d.toISOString().split("T")[0];
            activeDateStrings.add(dateStr);
          }
        }
      });
    }

    if (activeDateStrings.size === 0) return 0;

    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Determine anchor — where to start counting back from.
    // Start from today if active, otherwise from yesterday (using the grace day).
    // If neither today nor yesterday is active, streak is 0.
    let checkDate;
    if (activeDateStrings.has(todayStr)) {
      checkDate = new Date(today);
    } else if (activeDateStrings.has(yesterdayStr)) {
      // Today is inactive but yesterday was — still alive via grace
      checkDate = new Date(yesterday);
    } else {
      return 0;
    }

    // Walk backwards counting the streak.
    // One grace day (a single missing day) is allowed per run.
    let streak = 0;
    let graceUsed = false;

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];

      if (activeDateStrings.has(dateStr)) {
        // Active day — count it, reset grace availability
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (!graceUsed) {
        // First missing day — apply grace, skip over it, keep counting
        graceUsed = true;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Second consecutive missing day — streak broken
        break;
      }
    }

    return streak;
  } catch (e) {
    console.error("Error calculating streak", e);
    return 0;
  }
}
