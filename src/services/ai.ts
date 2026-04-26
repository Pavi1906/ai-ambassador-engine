// src/services/ai.ts

// ==============================
// TYPES
// ==============================

export type BehaviorStats = {
  posts: number;
  referrals: number;
  events: number;
  daysInactive: number;
};

// ==============================
// API BASE URL
// ==============================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ==============================
// SCORE API (example logic)
// ==============================

export async function getScore(data: {
  tasks: number;
  referrals: number;
}) {
  try {
    const res = await fetch(`${API_URL}/api/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Score API failed");

    return await res.json();
  } catch (error) {
    console.error("Score API error:", error);
    return { score: 0 };
  }
}

// ==============================
// AI INSIGHT API (Gemini via backend)
// ==============================

export async function getMotivationInsight(
  stats: BehaviorStats,
  score: number,
  expectedScore: number
): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/insight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stats,
        score,
        expectedScore,
      }),
    });

    if (!res.ok) throw new Error("Insight API failed");

    const data = await res.json();

    return data.insight || "No insight available.";
  } catch (error) {
    console.error("Insight API error:", error);
    return "AI insight unavailable. Please try again.";
  }
}
