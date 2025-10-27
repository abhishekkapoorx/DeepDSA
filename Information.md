# DeepDSA - Complete Project Information

## 🎯 Project Overview

DeepDSA is a comprehensive online coding platform for learning Data Structures and Algorithms (DSA). It provides an interactive coding environment with features similar to LeetCode, Codeforces, and Python Tutor.

**Key Features:**
- **Code Visualization**: Step-by-step code execution visualizer (Python Tutor style)
- **AI Interview**: AI-powered coding interviews with Gemini/OpenAI
- **Contests**: Competitive programming contests with leaderboards
- **Problem Solving**: Curated DSA problems with test cases
- **Editorials**: Detailed solutions and explanations
- **Code Execution**: Real-time code execution with Judge0
- **Community**: Discussions, solutions, and peer learning

---

## 🛠️ Technology Stack

### Frontend (main-fb/)
- **Framework**: Next.js 15.5.2 (React 19.1.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide Icons
- **Code Editor**: Monaco Editor
- **Layout**: FlexLayout
- **Theme**: Custom dark/light mode
- **State Management**: React Context API
- **Forms**: Custom form components with validation

### Backend (backend/)
- **Runtime**: Node.js with Express 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: MongoDB with Mongoose 8.16.5
- **Authentication**: Clerk
- **File Storage**: Cloudinary
- **Cache**: Redis, IORedis
- **Code Execution**: Judge0 integration
- **Email**: Nodemailer

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Code Execution**: Judge0 1.13.1
- **Database**: MongoDB 8, PostgreSQL 16.2 (Judge0)
- **Cache**: Redis 7.2.4
- **Tunneling**: Ngrok
- **Dev Tools**: MongoDB Express, Nodemon

---

## 🏗️ Architecture

### Container Services

#### 1. **deepdsa-frontend-dev** (Port 3000)
- Next.js development server with Turbopack
- Hot reload enabled
- Serves the main UI

#### 2. **deepdsa-mongo-dev** (Port 27017)
- MongoDB 8 database
- Stores problems, users, solutions, submissions
- Persistent volume: `mongo_data_dev`

#### 3. **deepdsa-mongo-express-dev** (Port 8081)
- MongoDB management UI
- Credentials: admin/admin123
- Access at http://localhost:8081

#### 4. **deepdsa-ngrok** (Port 4040)
- Public HTTPS tunnels for development
- Access all tunnels at http://localhost:4040
- Requires NGROK_AUTHTOKEN environment variable

#### 5. **deepdsa-judge0-server-dev** (Port 2358)
- Judge0 API server for code execution
- Supports: Python, Java, JavaScript, C++, C

#### 6. **deepdsa-judge0-workers-dev**
- Background workers for code execution
- Processes submissions asynchronously

#### 7. **deepdsa-redis-dev** (Port 6379)
- Redis cache for Judge0
- Session management
- Rate limiting

#### 8. **deepdsa-judge0-db-dev**
- PostgreSQL database for Judge0
- Stores execution tokens and results

---

## 🚀 Getting Started

### Prerequisites
- Docker Desktop installed
- Git
- Ngrok account (optional, for tunneling)

### Development Setup



#### 1. Access Services
- **Frontend**: http://localhost:3000
- **MongoDB Express**: http://localhost:8081 (admin/admin123)
- **Judge0 API**: http://localhost:2358
- **Ngrok Dashboard**: http://localhost:4040 (if tunnel profile enabled)

#### 3. Stop Services
```bash
docker compose down
```

---

## 📁 Project Structure

```
DeepDSA/
├── main-fb/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── problems/         # Problem pages
│   │   │   ├── contests/         # Contest pages
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── api/             # API routes
│   │   │   └── ...
│   │   ├── components/           # React components
│   │   │   ├── problems/        # Problem-related components
│   │   │   ├── ui/              # UI components
│   │   │   └── ...
│   │   ├── contexts/            # React contexts
│   │   ├── lib/                 # Utilities
│   │   ├── models/              # MongoDB models
│   │   ├── utils/               # Helper functions
│   │   └── types/               # TypeScript types
│   ├── prisma/                  # Prisma schema
│   ├── public/                  # Static assets
│   └── Dockerfile.dev           # Development Dockerfile
│
├── backend/                      # Express.js Backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Custom middleware
│   │   ├── models/              # Mongoose models
│   │   └── routes/              # API routes
│   └── Dockerfile.dev           # Development Dockerfile
│
├── docker-compose.dev.yml        # Development containers
├── docker-compose.yml            # Production containers
├── ngrok.yml                     # Ngrok configuration
├── judge0.conf                   # Judge0 configuration
└── README.md                     # Project documentation
```

---

## 🔑 Key Features

### 1. Code Visualization (Python Tutor Style)
- **Location**: `main-fb/src/components/problems/PythonTutorVisualization.tsx`
- **Purpose**: Visual step-by-step code execution
- **Features**:
  - Line-by-line execution tracking
  - Frame stack visualization (local variables per function)
  - Heap visualization (objects and their properties)
  - Pointer/arrow connections
  - Step navigation (forward/backward)
  - Play/pause animation
  - Output console
  - Test case integration

### 2. AI Interview
- **Location**: `main-fb/src/components/problems/AIInterview.tsx`
- **Purpose**: AI-powered coding interviews
- **Features**:
  - Real-time AI conversation
  - Code context integration
  - 10-minute timer
  - Voice input support
  - Interview scoring
  - Provider selection (Gemini/OpenAI)

### 3. Code Execution
- **Integration**: Judge0 API
- **Supported Languages**: Python, Java, JavaScript, C++, C
- **Features**:
  - Run code with custom inputs
  - Submit code for evaluation
  - Test case validation
  - Real-time results
  - Execution time tracking

### 4. Problems
- **Model**: `main-fb/src/models/problem.model.ts`
- **Features**:
  - Multiple difficulty levels
  - Tag categorization
  - Starter code templates
  - Test cases (example & hidden)
  - Custom input/output variables
  - Editorial integration
  - Discussion threads

### 5. Contests
- **Model**: `main-fb/src/models/contest.model.ts`
- **Features**:
  - Scheduled contests
  - Leaderboard
  - Problem assignment
  - Participant management
  - Contest analytics
  - Bulk participant operations

---

## 🔧 Configuration

### Environment Variables

#### Frontend (.env in main-fb/)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NODE_ENV=development
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
CLERK_WEBHOOK_SECRET=
MONGO_URI=mongodb://mongo:27017/deepdsa
DATABASE_URL=mongodb://mongo:27017/deepdsa
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
GEMINI_API_KEY=
OPENAI_API_KEY=
JUDGE0_API_URL=http://localhost:2358
JUDGE0_API_KEY=YOUR_JUDGE0_API_KEY_HERE
```

#### Backend (.env in backend/)
```env
MONGO_URI=mongodb://mongo:27017/deepdsa
PORT=5373
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secret_here
```

#### Root (.env for Docker)
```env
NGROK_AUTHTOKEN=your_ngrok_token_here
```

---

## 🎨 UI Components

### Key Components
- **CodeEditor**: Monaco editor with syntax highlighting
- **ProblemDescription**: Markdown-based problem descriptions
- **TestcasePanel**: Test case display and results
- **PythonTutorVisualization**: Step-by-step code visualization
- **AIInterview**: AI interview interface
- **ContestAnalytics**: Contest performance analytics
- **BulkParticipantManager**: Contest participant management

### UI Library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Framer Motion**: Animation library
- **FlexLayout**: Resizable layout system

---

## 📊 Database Models

### Core Models (MongoDB via Mongoose)
- **User**: User accounts, profiles, progress
- **Problem**: Coding problems with metadata
- **TestCase**: Input/output test cases
- **Submission**: User code submissions
- **Contest**: Contest information
- **Solution**: User-submitted solutions
- **Discussion**: Problem discussions
- **Comment**: Comments on discussions
- **Vote**: Upvote/downvote system
- **UserProgress**: User learning progress

### Additional Models
- **Editorial**: Problem solutions
- **Interview**: AI interview sessions
- **ContestTemplate**: Reusable contest templates
- **TestResult**: Code execution results

---

## 🔐 Authentication

- **Provider**: Clerk
- **Features**:
  - Email/password authentication
  - Social login (Google, GitHub, etc.)
  - User management
  - Role-based access control
  - Protected routes

---

## 🌐 API Routes

### Frontend API (Next.js API routes)
- `/api/problems/*` - Problem management
- `/api/contests/*` - Contest management
- `/api/admin/*` - Admin operations
- `/api/interviews/*` - AI interviews
- `/api/submissions/*` - Code submissions
- `/api/editorials/*` - Editorial content

### Backend API (Express)
- `/api/v1/` - Version 1 API
- `/api/v1/initial` - Initial routes
- Rate limiting enabled
- CORS configured
- Error handling middleware

---

## 🧪 Testing

### Test Cases
- Example test cases (visible to users)
- Hidden test cases (for validation)
- Custom input/output formats
- Judge0 integration for execution

### Execution Flow
1. User writes code in Monaco editor
2. Code sent to Judge0 API
3. Judge0 executes with test cases
4. Results returned and displayed
5. Visualization updated automatically

---

## 📝 Development Workflow

### Hot Reloading
- **Backend**: File changes sync to container automatically
- **Frontend**: Next.js Turbopack enables instant updates
- **Watch Mode**: Docker Compose monitors file changes

### Code Quality
- **TypeScript**: Type safety throughout
- **ESLint**: Code linting
- **Formatting**: Prettier (recommended)

---

## 📚 Documentation

### Documentation Files
- `README.md` - Main project documentation
- `JUDGE0_INTEGRATION.md` - Judge0 integration guide
- `TODOs.md` - Development TODOs
- `Commands.md` - Useful commands

---


