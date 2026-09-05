# DeepDSA

DeepDSA is a Next.js platform for practicing data structures and algorithms. It combines problem solving, code execution, contests, discussions, editorials, AI interview practice, and code visualization in one application.

## Features

- LeetCode-style problem workspace with a Monaco editor, language switching, test cases, submissions, editorials, solutions, and discussion tabs.
- Code execution and judging through Judge0 for C, C++, Java, JavaScript, and Python.
- Problem, testcase, editorial, solution, contest, discussion, submission, interview, and user-progress management.
- Clerk authentication with user and admin areas.
- AI interview practice and code-aware coaching.
- Python Tutor-style code visualization for supported code paths.
- Responsive dark/light UI built with Tailwind CSS, Radix UI, Lucide, and FlexLayout.

## Architecture

The application is a single Next.js service in `main-fb/`. Its App Router API routes handle application data and integrate with MongoDB, Clerk, Cloudinary, Gemini/OpenAI-compatible AI providers, and Judge0.

Development Docker Compose also provides:

| Service | Port | Purpose |
| --- | ---: | --- |
| Next.js | 3000 | Web application and API routes |
| MongoDB | 27017 | Application data |
| Mongo Express | 8081 | Optional database browser |
| Judge0 | 2358 | Code execution API |
| Judge0 PostgreSQL | internal | Judge0 persistence |
| Judge0 Redis | 6379 | Judge0 queue/cache |
| Ngrok | 4040 | Optional tunnel dashboard |

## Project Structure

```text
DeepDSA/
├── main-fb/
│   ├── src/app/             # Pages and App Router API routes
│   ├── src/components/      # Reusable UI and feature components
│   ├── src/models/          # Mongoose models
│   ├── src/lib/             # Integrations and shared server utilities
│   ├── src/utils/           # Code generation and other helpers
│   ├── prisma/              # Prisma schema and generated database types
│   └── script/              # Data-import scripts and sample data
├── docker-compose.dev.yml   # Development stack with local services
├── docker-compose.yml       # Production-oriented stack
├── docker-compose.dev.cloud.yml # Development stack with Ngrok
├── judge0.conf              # Judge0 database and queue configuration
├── ngrok.yml                # Tunnel configuration
└── README.md
```

## Quick Start

### Local development

```bash
cd main-fb
npm install
cp .env.sample .env
npm run dev
```

Open <http://localhost:3000>. Configure MongoDB, Clerk, and Judge0 values in `main-fb/.env` before using the corresponding features.

### Docker development

From the repository root:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Run in the background:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Stop containers:

```bash
docker compose -f docker-compose.dev.yml down
```

To remove persisted development data as well:

```bash
docker compose -f docker-compose.dev.yml down -v
```

### Ngrok

Set `NGROK_AUTHTOKEN` in the root `.env`, then run:

```bash
docker compose -f docker-compose.dev.cloud.yml --profile tunnel up --build
```

The Ngrok dashboard is available at <http://localhost:4040>.

## Configuration

Copy `main-fb/.env.sample` to `main-fb/.env` and set the values needed for your environment. Important variables include:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
MONGO_URI=mongodb://localhost:27017/deepdsa
DATABASE_URL=mongodb://localhost:27017/deepdsa
JUDGE0_API_URL=http://localhost:2358
JUDGE0_API_KEY=
GEMINI_API_KEY=
```

For Docker, the development Compose file supplies the container hostnames for MongoDB and Judge0. Keep credentials and API keys out of version control.

## Useful Commands

Run these from `main-fb/`:

```bash
npm run dev       # Start Next.js with Turbopack
npm run build     # Create a production build
npm run start     # Serve the production build
npm run lint      # Run ESLint
npm run add-question -- script/sample-questions.json  # Import problems from JSON
```

View Docker logs or open a shell in a running service:

```bash
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml exec frontend sh
```

## Importing Problems

`main-fb/script/addQuestion.ts` imports problems and test cases from JSON using the existing TypeScript MongoDB models. The input format and sample are documented by `main-fb/script/newQues.json` and `main-fb/script/sample-questions.json`.

```bash
cd main-fb
npm run add-question -- script/sample-questions.json
```

Each problem needs a title, description, difficulty, tags, starter code, function name, input/output definitions, and test cases. Slugs are generated automatically, duplicates are skipped, and question numbers fill available gaps before continuing sequentially.

## Application Areas

The main routes include:

- `/problems` — browse and solve problems.
- `/contests` — participate in contests.
- `/discuss` — community discussions and replies.
- `/interview` and `/interviews` — interview practice.
- `/profile` — user progress and activity.
- `/admin` — administration for problems, contests, users, editorials, interviews, and analytics.

Application API routes live under `main-fb/src/app/api/`. MongoDB models are in `main-fb/src/models/`, and code-generation helpers are in `main-fb/src/utils/CodeGenerator/`.

## Troubleshooting

- If port `3000`, `27017`, `2358`, `6379`, `8081`, or `4040` is already in use, stop the conflicting process or change the Compose port mapping.
- If code execution fails, verify `JUDGE0_API_URL`, `JUDGE0_API_KEY`, and the Judge0 containers/logs.
- If database requests fail locally, verify MongoDB is running and that `MONGO_URI` points to the correct host.
- If the frontend appears stale in Docker, rebuild the frontend image with `docker compose -f docker-compose.dev.yml build --no-cache frontend`.
