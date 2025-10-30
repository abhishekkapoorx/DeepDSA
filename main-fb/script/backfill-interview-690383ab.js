/**
 * Backfill Script for Interview 690383ab5ee6350f285a02be
 * This interview was ended but not properly scored by AI
 */

const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepdsa';

// Interview Schema (simplified)
const interviewSchema = new mongoose.Schema({
  messages: [{ role: String, content: String, timestamp: Date }],
  score: Number,
  scoreBreakdown: Object,
  suggestions: [String],
  improvements: [String],
  mistakes: [String],
  summary: String,
  provider: String,
  endedAt: Date,
  startedAt: Date
}, { collection: 'interviews' });

const Interview = mongoose.model('Interview', interviewSchema);

// AI Scoring Function
function buildScoringPrompt(transcript) {
  return `You are an expert technical interviewer. Score this coding interview transcript.

TRANSCRIPT:
${transcript}

Provide your evaluation as ONLY a valid JSON object (no markdown, no code blocks):
{
  "score": <number 0-10>,
  "breakdown": {
    "correctness": <number 0-10>,
    "approach": <number 0-10>,
    "clarity": <number 0-10>,
    "efficiency": <number 0-10>,
    "communication": <number 0-10>
  },
  "suggestions": ["<string>", ...],
  "improvements": ["<string>", ...],
  "mistakes": ["<string>", ...],
  "summary": "<string>"
}`;
}

async function aiScore(provider, prompt) {
  if (provider !== 'gemini') {
    throw new Error('Only Gemini provider supported in this script');
  }
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: "application/json"
    }
  });
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Strip markdown code blocks
  let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  return JSON.parse(cleanText);
}

async function backfillInterview() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');
    
    const interviewId = '690383ab5ee6350f285a02be';
    console.log(`\nFetching interview ${interviewId}...`);
    
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.error('Interview not found!');
      process.exit(1);
    }
    
    console.log(`Found interview:`);
    console.log(`  - Started: ${interview.startedAt}`);
    console.log(`  - Ended: ${interview.endedAt}`);
    console.log(`  - Messages: ${interview.messages.length}`);
    console.log(`  - Current Score: ${interview.score || 'NOT SET'}`);
    
    // Check if already scored
    if (interview.score && interview.suggestions?.length > 0) {
      console.log('\n⚠️  Interview already has a score. Skipping.');
      process.exit(0);
    }
    
    // Build transcript
    const userMessages = interview.messages.filter(m => m.role === 'user');
    const transcript = userMessages
      .map((m, idx) => `${idx + 1}. ${m.content}`)
      .join('\n')
      .slice(0, 6000);
    
    console.log(`\nBuilt transcript from ${userMessages.length} user messages`);
    console.log('\nCalling AI for scoring...');
    
    const prompt = buildScoringPrompt(transcript);
    const result = await aiScore(interview.provider || 'gemini', prompt);
    
    console.log('\nAI Scoring Results:');
    console.log(`  - Score: ${result.score}`);
    console.log(`  - Suggestions: ${result.suggestions?.length || 0}`);
    console.log(`  - Improvements: ${result.improvements?.length || 0}`);
    console.log(`  - Mistakes: ${result.mistakes?.length || 0}`);
    
    // Update interview
    interview.score = Math.max(0, Math.min(10, Math.round(result.score)));
    interview.scoreBreakdown = result.breakdown;
    interview.suggestions = result.suggestions?.slice(0, 5) || [];
    interview.improvements = result.improvements?.slice(0, 5) || [];
    interview.mistakes = result.mistakes?.slice(0, 5) || [];
    interview.summary = result.summary || '';
    
    await interview.save();
    
    console.log('\n✅ Interview updated successfully!');
    console.log(`Final Score: ${interview.score}/10`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the backfill
backfillInterview();

