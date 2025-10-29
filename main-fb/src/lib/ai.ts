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

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
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
  return `You are grading a technical interview answer. Analyze the user's transcript and produce ONLY a valid JSON object (no markdown code blocks, no extra text). 

Expected JSON format:
{
  "score": 7,
  "breakdown": {
    "correctness": 8,
    "approach": 7,
    "clarity": 6,
    "efficiency": 8,
    "communication": 7
  },
  "suggestions": [
    "Consider explaining the approach before coding",
    "Think about edge cases first",
    "Clarify assumptions made"
  ],
  "improvements": [
    "Improve time complexity analysis",
    "Add more examples of the solution",
    "Discuss trade-offs between approaches"
  ],
  "mistakes": [
    "Forgot to handle the base case",
    "Incorrect time complexity stated",
    "Missed an edge case"
  ],
  "summary": "Candidate demonstrated good problem-solving skills with a clear approach. However, missed some edge cases and could improve verbal communication of the thought process."
}

Return ONLY the JSON object with these exact fields. Be strict in grading.
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
      
      // Convert roles to Gemini-compatible format: "assistant" -> "model", "system" -> "user"
      const content = finalMessages.map((m) => {
        let geminiRole: 'user' | 'model' = 'user';
        if (m.role === 'assistant') geminiRole = 'model';
        if (m.role === 'user') geminiRole = 'user';
        if (m.role === 'system') geminiRole = 'user';
        
        return { role: geminiRole, parts: [{ text: m.content }] };
      });
      
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
      const res = await model.generateContent(
        prompt,
        {
          temperature: 0.1,
          topP: 0.95,
          maxOutputTokens: 2000,
        }
      );
      let text = res.response.text();
      
      // Extract JSON from markdown code blocks if present
      text = text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Attempt to parse JSON; fallback to minimal defaults
      try {
        const json = JSON.parse(text);
        console.log('Parsed AI score result:', json);
        return json as AIScoringResult;
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', e);
        console.error('Response text:', text);
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
