import { GoogleGenerativeAI } from "@google/generative-ai";
// import OpenAI from "openai"; // Uncomment if switching to OpenAI

type Provider = "gemini" | "openai";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIScoringResult {
  score: number; // 0..10
  breakdown: {
    correctness: number;
    approach: number;
    clarity: number;
    efficiency: number;
    communication: number;
  };
  suggestions: string[];
  improvements: string[];
  mistakes: string[];
  summary: string;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
// const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // Example

function buildSystemPrompt(problemTitle?: string, problemStatement?: string) {
  const compactGuidelines = [
    "Act as a strict technical interviewer for DSA/algorithms.",
    "Ask concise, incremental questions. Avoid long replies.",
    "Prefer bullet points and short sentences to save tokens.",
    "Probe on approach, complexity, edge cases, and trade-offs.",
    "Correct misconceptions briefly; ask user to reflect.",
    "Do not reveal full solution; guide with hints.",
  ].join(" ");

  const context = problemTitle
    ? `Problem: ${problemTitle}. Keep context short.`
    : "General interview about current problem.";

  return `${compactGuidelines} ${context} Keep responses under 80-120 words.`;
}

export function buildScoringPrompt(userTranscript: string) {
  return `You are grading a technical interview answer. Analyze the user's transcript and produce a JSON object with fields: score (0-10), breakdown {correctness, approach, clarity, efficiency, communication each 0-10}, suggestions (3 short items), improvements (3 short items), mistakes (up to 5 concise items), summary (<=80 words). Be strict.
TRANSCRIPT:\n${userTranscript}`;
}

export async function aiChat(
  provider: Provider,
  messages: AIMessage[],
  options?: { problemTitle?: string; problemStatement?: string }
) {
  if (provider === "gemini") {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      
      // Gemini doesn't support system role, so we prepend context to the first message
      let finalMessages = [...messages];
      if (options?.problemTitle || options?.problemStatement) {
        const contextPrompt = buildSystemPrompt(options.problemTitle, options.problemStatement);
        if (finalMessages.length > 0) {
          // Prepend context to first user message
          finalMessages[0] = {
            ...finalMessages[0],
            content: `${contextPrompt}\n\n${finalMessages[0].content}`
          };
        } else {
          // If no messages, create a context message
          finalMessages = [{ role: 'user', content: contextPrompt }];
        }
      }
      
      const content = finalMessages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));
      const res = await model.generateContent({ contents: content as any });
      const text = res.response.text();
      return text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // OpenAI version (commented for now)
  // const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const res = await client.chat.completions.create({
  //   model: OPENAI_MODEL,
  //   messages: finalMessages as any,
  //   temperature: 0.3,
  //   max_tokens: 220,
  // });
  // return res.choices[0]?.message?.content || "";

  throw new Error("Unsupported provider");
}

export async function aiScore(provider: Provider, prompt: string): Promise<AIScoringResult> {
  if (provider === "gemini") {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      // Attempt to parse JSON; fallback to minimal defaults
      try {
        const json = JSON.parse(text);
        return json as AIScoringResult;
      } catch {
        return {
          score: 5,
          breakdown: { correctness: 5, approach: 5, clarity: 5, efficiency: 5, communication: 5 },
          suggestions: [],
          improvements: [],
          mistakes: [],
          summary: text.slice(0, 400),
        };
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // OpenAI version (commented)
  // const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const res = await client.chat.completions.create({
  //   model: OPENAI_MODEL,
  //   messages: [{ role: "system", content: "Return ONLY valid JSON" }, { role: "user", content: prompt }],
  //   temperature: 0.2,
  //   max_tokens: 300,
  // });
  // const text = res.choices[0]?.message?.content || "{}";
  // return JSON.parse(text);

  throw new Error("Unsupported provider");
}
