import OpenAI from "openai";

// Prefer Replit's managed OpenAI integration when available,
// otherwise fall back to the standard OPENAI_API_KEY (works on any host).
const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined;

if (!apiKey) {
  // Lazily warn instead of crashing the whole server at boot — AI features
  // simply won't work, but the rest of the site (cars, blog, admin) will.
  console.warn(
    "[openai] No OPENAI_API_KEY (or AI_INTEGRATIONS_OPENAI_API_KEY) is set. " +
      "AI features (chatbot, visual search, negotiation) will be disabled.",
  );
}

export const openai = new OpenAI({
  apiKey: apiKey || "missing-key",
  ...(baseURL ? { baseURL } : {}),
});
