// AI-Powered Lead Scoring
// Analyzes customer messages and behavior to assign hot/warm/cold

const URGENCY_WORDS = [
  "urgent", "asap", "today", "tomorrow", "this week", "ready to buy", "ready to purchase",
  "cash", "have the money", "have the cash", "wire transfer", "deposit", "reserve",
  "looking to buy", "want to buy", "need this", "waiting", "immediately", "now"
];

const HIGH_INTENT_WORDS = [
  "test drive", "viewing", "appointment", "meet", "visit", "showroom",
  "best price", "negotiate", "lower", "discount", "logbook", "registration",
  "financing", "loan", "instalment", "down payment"
];

const COLD_WORDS = [
  "just looking", "browsing", "curious", "maybe", "someday", "thinking about",
  "future", "next year", "long term", "later"
];

export interface LeadScoreResult {
  score: number; // 0-100
  level: "hot" | "warm" | "cold";
  reasons: string[];
}

export function scoreLead(input: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  carPrice?: number | null;
  hasCarSelected?: boolean;
  loanAmount?: number | null;
  preferredDate?: string | null;
}): LeadScoreResult {
  let score = 30; // baseline
  const reasons: string[] = [];

  const msg = (input.message || "").toLowerCase();

  // Contact completeness
  if (input.phone && input.phone.length >= 10) { score += 8; reasons.push("Valid phone"); }
  if (input.email && input.email.includes("@")) { score += 5; reasons.push("Email provided"); }
  if (input.name && input.name.length >= 2) { score += 3; }

  // Car-specific interest
  if (input.hasCarSelected) { score += 12; reasons.push("Selected specific vehicle"); }

  // Vehicle price (higher value = warmer lead because effort is higher)
  if (input.carPrice && input.carPrice > 0) {
    if (input.carPrice >= 50000) { score += 10; reasons.push("High-value vehicle interest"); }
    else if (input.carPrice >= 20000) { score += 5; reasons.push("Mid-range vehicle interest"); }
  }

  // Booking has preferred date = warmer
  if (input.preferredDate) { score += 8; reasons.push("Booked specific date"); }

  // Financing with concrete loan amount = warmer
  if (input.loanAmount && input.loanAmount > 0) { score += 7; reasons.push("Concrete loan request"); }

  // Message intent analysis
  const urgencyMatches = URGENCY_WORDS.filter(w => msg.includes(w));
  if (urgencyMatches.length > 0) {
    score += Math.min(20, urgencyMatches.length * 8);
    reasons.push(`Urgency keywords: ${urgencyMatches.slice(0, 3).join(", ")}`);
  }

  const intentMatches = HIGH_INTENT_WORDS.filter(w => msg.includes(w));
  if (intentMatches.length > 0) {
    score += Math.min(15, intentMatches.length * 5);
    reasons.push(`Buy-intent keywords: ${intentMatches.slice(0, 3).join(", ")}`);
  }

  const coldMatches = COLD_WORDS.filter(w => msg.includes(w));
  if (coldMatches.length > 0) {
    score -= Math.min(20, coldMatches.length * 8);
    reasons.push(`Browse-only signals: ${coldMatches.slice(0, 3).join(", ")}`);
  }

  // Message length signals seriousness (long thoughtful message > 1-liner)
  if (msg.length > 200) { score += 5; reasons.push("Detailed inquiry"); }
  else if (msg.length > 0 && msg.length < 20) { score -= 3; }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  let level: "hot" | "warm" | "cold";
  if (score >= 70) level = "hot";
  else if (score >= 40) level = "warm";
  else level = "cold";

  return { score, level, reasons };
}
