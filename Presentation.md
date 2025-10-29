## DeepDSA — Project Presentation Outline

### 1) Title Slide
- Project: DeepDSA – AI‑assisted DSA practice platform
- Team: Your Name(s)
- Timeline: Start → Today

### 2) Problem & Motivation
- Why learners struggle: feedback quality, consistency, and motivation
- Gaps in existing platforms: limited interview simulation, poor analytics
- Our goal: fast iteration loop (practice → feedback → improve)

### 3) Solution Overview
- Web app for practicing problems, AI mock‑interviews, and automatic scoring
- Admin imports problems + test cases; users code, run, visualize, and learn
- Tech: Next.js (App Router), MongoDB, Judge0, Gemini/OpenAI

### 4) Core Features (User)
- Browse problems (difficulty, tags)
- Editor + run against hidden/public tests
- AI Interview (chat, contextual prompts)
- Auto scoring (correctness, approach, clarity, efficiency, communication)
- Analytics: history, breakdown, suggestions, mistakes, summary

### 5) Core Features (Admin)
- Import problems via JSON (UI upload)
- Manage problems, edit, delete, bulk ops
- Auto question numbering, slugging; test case linking

### 6) Architecture
- Next.js app (server actions + API routes)
- MongoDB for problems, test cases, interviews, submissions
- Judge0 container for code execution
- AI provider abstraction (`src/lib/ai.ts`) with role mapping

### 7) Key Technical Decisions
- Role mapping for Gemini (user/model) and system‑prompt injection
- Robust JSON parsing for AI scoring (strip code blocks, enforce JSON‑only)
- Boilerplate codegen with cross‑language type mapping
- Admin import endpoint with form‑data + validation

### 8) Notable Challenges & Fixes
- Gemini model/role errors → mapped assistant→model; system→user
- AI JSON returned in ```json blocks → stripped then parsed
- Java input parsing issues → switched to JSON array parsing
- Type mismatches (`number[][]` vs `List<List<Integer>>`) → unified mappings
- Output normalization (Java list spacing) → custom formatter

### 9) Demo Flow (Live)
- Admin: Problems → Import button → upload sample JSON → results
- User: Open a problem → view statement → run boilerplate
- AI Interview: start, send message, see guided Q&A
- Finalize interview → see score, breakdown, suggestions, summary
- History page: inspect analytics card

### 10) Data Model (Brief)
- Problem: title, slug, number, difficulty, tags, variables, starterCode
- TestCase: input, output, flags (example/hidden), problemId
- Interview: messages, provider, score+breakdown, suggestions, mistakes, summary

### 11) Code Highlights
- `src/lib/ai.ts`: aiChat/aiScore, prompt building, JSON sanitation
- `src/utils/CodeGenerator/*`: dtype mapping, half/full boilerplate
- `src/app/api/admin/import-problems/route.ts`: admin import
- `src/app/interviews/page.tsx`: legacy summary parsing + UI

### 12) Security & Reliability
- Clerk auth guards on admin/user routes
- Rate limiting & error handling (backend middlewares)
- Safe JSON parsing + fallbacks for AI

### 13) Performance Considerations
- Compact prompts; capped tokens
- Mongo indexes on slugs/createdAt

### 14) Roadmap
- More languages & richer boilerplates
- Deeper analytics (topic mastery, spaced repetition)
- Multi‑file problems; custom validators
- Hints marketplace; collaborative sessions

### 15) Learnings
- Prompt engineering and model drift handling
- Input/output normalization across languages
- Admin UX for bulk data ops

### 16) Risks & Mitigations
- Provider API changes → adapter abstraction, env‑driven models
- Malformed JSON → strict validators, sanitizers
- Execution sandbox limits → Judge0 config, time/memory caps

### 17) Ask / Next Steps
- Feedback on interview rubric
- Problem set contributions
- Beta users for analytics module

### 18) Q&A (seed prompts)
- How would you handle multi‑file submissions?
- What metrics most helped you improve in mocks?
- Any topics to prioritize for problem imports?

---

## Presenter Notes (cheat‑sheet)
- Keep live demo under 5–7 minutes; rehearse import → solve → interview → analytics
- If AI call fails, show recorded flow or screenshots
- Mention 2–3 concrete fixes (roles, JSON blocks, Java input) to show rigor
- Close with 1 clear ask (feedback/trials/contributions)

