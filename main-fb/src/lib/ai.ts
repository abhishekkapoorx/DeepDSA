import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

export type Provider = "gemini" | "openai";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIScoringResult {
  score: number;
  breakdown: { correctness: number; approach: number; clarity: number; efficiency: number; communication: number };
  suggestions: string[];
  improvements: string[];
  mistakes: string[];
  summary: string;
}

const DEFAULT_PROVIDER: Provider = "openai";

export function getAIProvider(): Provider {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (!provider) return DEFAULT_PROVIDER;
  if (provider === "openai" || provider === "gemini") return provider;
  throw new Error(`Unsupported AI_PROVIDER: ${provider}. Use "openai" or "gemini".`);
}

function getChatModel(provider: Provider, scoring = false) {
  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is missing");
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini"
    });
  }
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
  });
}

function buildSystemPrompt(problemTitle?: string, problemStatement?: string) {
  const guidelines = [
    "Act as a strict technical interviewer for DSA/algorithms.",
    "Ask concise, incremental questions. Avoid long replies.",
    "Prefer bullet points and short sentences to save tokens.",
    "Probe on approach, complexity, edge cases, and trade-offs.",
    "Correct misconceptions briefly; ask the user to reflect.",
    "Do not reveal the full solution; guide with hints.",
  ].join(" ");
  const context = problemTitle
    ? `Problem: ${problemTitle}. ${problemStatement ? `Statement: ${problemStatement.slice(0, 1200)}` : ""}`
    : "General interview about the current problem.";
  return `${guidelines} ${context} Keep responses under 80-120 words.`;
}

export function buildScoringPrompt(userTranscript: string) {
  return `You are grading a technical interview answer. Analyze the user's transcript and produce ONLY a valid JSON object (no markdown code blocks, no extra text).

Expected JSON format:
{
  "score": 7,
  "breakdown": { "correctness": 8, "approach": 7, "clarity": 6, "efficiency": 8, "communication": 7 },
  "suggestions": ["Consider explaining the approach before coding"],
  "improvements": ["Improve time complexity analysis"],
  "mistakes": ["Missed an edge case"],
  "summary": "Brief summary of the candidate's performance."
}

Return ONLY the JSON object with these exact fields. Score every breakdown field from 0 to 10.
TRANSCRIPT:\n${userTranscript}`;
}

function responseText(response: any) {
  const content = response?.content ?? response?.contentBlocks ?? response?.text ?? response?.output_text;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((part: any) => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      return "";
    }).join("").trim();
  }
  if (content && typeof content === "object") {
    return responseText(content);
  }
  return "";
}

function fallbackScore(summary: string): AIScoringResult {
  return {
    score: 5,
    breakdown: { correctness: 5, approach: 5, clarity: 5, efficiency: 5, communication: 5 },
    suggestions: [], improvements: [], mistakes: [], summary: summary.slice(0, 400),
  };
}

export async function aiChat(messages: AIMessage[], options?: { problemTitle?: string; problemStatement?: string }) {
  const provider = getAIProvider();
  const model = getChatModel(provider);
  const promptMessages = [
    { role: "system", content: buildSystemPrompt(options?.problemTitle, options?.problemStatement) },
    ...messages,
  ];
  try {
    const response = await model.invoke(promptMessages as any);
    const text = responseText(response);
    if (!text) throw new Error("AI provider returned an empty response");
    return text;
  } catch (error) {
    console.error(`${provider} interview chat error:`, error);
    throw new Error(`${provider} interview chat error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function aiScore(prompt: string): Promise<AIScoringResult> {
  const provider = getAIProvider();
  const model = getChatModel(provider, true);
  try {
    const response = await model.invoke([
      { role: "system", content: "Return only valid JSON. Do not use markdown code fences." },
      { role: "user", content: prompt },
    ] as any);
    const text = responseText(response).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try { return JSON.parse(text) as AIScoringResult; }
    catch { return fallbackScore(text); }
  } catch (error) {
    console.error(`${provider} interview scoring error:`, error);
    throw new Error(`${provider} interview scoring error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
