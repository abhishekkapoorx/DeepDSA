# 🏗️ Complete Prisma Schema for LeetCode-Style Platform

This document contains all the additional models needed to create a comprehensive coding interview platform similar to LeetCode.

## 📋 Table of Contents

1. [Submission & Code Execution](#submission--code-execution)
2. [Collections & Problem Organization](#collections--problem-organization)
3. [User Progress & Achievements](#user-progress--achievements)
4. [Discussion & Community](#discussion--community)
5. [Analytics & Tracking](#analytics--tracking)
6. [Company & Contest Features](#company--contest-features)
7. [Notifications & System](#notifications--system)
8. [Updated Relations](#updated-relations-for-existing-models)

---

## 🏃‍♂️ Submission & Code Execution

```prisma
model Submission {
  id          String        @id @default(auto()) @map("_id") @db.ObjectId
  userId      String        @db.ObjectId
  problemId   String        @db.ObjectId
  code        String        // User's submitted code
  language    String        // Programming language (javascript, python, java, etc.)
  status      SubmissionStatus
  runtime     Int?          // Execution time in milliseconds
  memory      Int?          // Memory usage in KB
  testsPassed Int           @default(0)
  totalTests  Int           @default(0)
  errorMessage String?      // Compilation or runtime errors
  createdAt   DateTime      @default(now())
  
  user        User          @relation(fields: [userId], references: [id])
  problem     Problem       @relation(fields: [problemId], references: [id])
  results     TestResult[]
}

enum SubmissionStatus {
  PENDING
  RUNNING
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT_EXCEEDED
  MEMORY_LIMIT_EXCEEDED
  RUNTIME_ERROR
  COMPILATION_ERROR
}

model TestResult {
  id           String     @id @default(auto()) @map("_id") @db.ObjectId
  submissionId String     @db.ObjectId
  testCaseId   String     @db.ObjectId
  passed       Boolean
  actualOutput String?
  runtime      Int?       // Time for this specific test
  memory       Int?       // Memory for this specific test
  
  submission   Submission @relation(fields: [submissionId], references: [id])
  testCase     TestCase   @relation(fields: [testCaseId], references: [id])
}
```

---

## 📚 Collections & Problem Organization

```prisma
model Collection {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  isPublic    Boolean   @default(true)
  createdBy   String    @db.ObjectId
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  creator     User      @relation(fields: [createdBy], references: [id])
  problems    CollectionProblem[]
}

model CollectionProblem {
  id           String     @id @default(auto()) @map("_id") @db.ObjectId
  collectionId String     @db.ObjectId
  problemId    String     @db.ObjectId
  order        Int        @default(0)
  
  collection   Collection @relation(fields: [collectionId], references: [id])
  problem      Problem    @relation(fields: [problemId], references: [id])
  
  @@unique([collectionId, problemId])
}

model Topic {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String    @unique
  description String?
  problems    TopicProblem[]
}

model TopicProblem {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  topicId   String  @db.ObjectId
  problemId String  @db.ObjectId
  
  topic     Topic   @relation(fields: [topicId], references: [id])
  problem   Problem @relation(fields: [problemId], references: [id])
  
  @@unique([topicId, problemId])
}
```

---

## 🏆 User Progress & Achievements

```prisma
model UserProgress {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  userId            String   @db.ObjectId @unique
  totalSolved       Int      @default(0)
  easySolved        Int      @default(0)
  mediumSolved      Int      @default(0)
  hardSolved        Int      @default(0)
  totalSubmissions  Int      @default(0)
  acceptanceRate    Float    @default(0.0)
  currentStreak     Int      @default(0)
  maxStreak         Int      @default(0)
  lastSolvedAt      DateTime?
  ranking           Int?
  
  user              User     @relation(fields: [userId], references: [id])
}

model UserProblemStatus {
  id        String       @id @default(auto()) @map("_id") @db.ObjectId
  userId    String       @db.ObjectId
  problemId String       @db.ObjectId
  status    ProblemStatus
  attempts  Int          @default(0)
  bestTime  Int?         // Best runtime in milliseconds
  firstSolvedAt DateTime?
  lastAttemptAt DateTime @default(now())
  
  user      User         @relation(fields: [userId], references: [id])
  problem   Problem      @relation(fields: [problemId], references: [id])
  
  @@unique([userId, problemId])
}

enum ProblemStatus {
  NOT_ATTEMPTED
  ATTEMPTED
  SOLVED
}

model Achievement {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String    @unique
  description String
  icon        String?
  badgeUrl    String?
  type        AchievementType
  requirement Int       // Number needed (e.g., 10 problems, 5 easy problems)
  
  userAchievements UserAchievement[]
}

enum AchievementType {
  TOTAL_SOLVED
  EASY_SOLVED
  MEDIUM_SOLVED
  HARD_SOLVED
  STREAK
  SPEED
  CONSISTENCY
}

model UserAchievement {
  id            String      @id @default(auto()) @map("_id") @db.ObjectId
  userId        String      @db.ObjectId
  achievementId String      @db.ObjectId
  unlockedAt    DateTime    @default(now())
  
  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  
  @@unique([userId, achievementId])
}
```

---

## 💬 Discussion & Community

```prisma
model Discussion {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  problemId String    @db.ObjectId
  userId    String    @db.ObjectId
  title     String
  content   String
  upvotes   Int       @default(0)
  downvotes Int       @default(0)
  views     Int       @default(0)
  isPinned  Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  problem   Problem   @relation(fields: [problemId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
  comments  Comment[]
  votes     DiscussionVote[]
}

model Comment {
  id           String    @id @default(auto()) @map("_id") @db.ObjectId
  discussionId String    @db.ObjectId
  userId       String    @db.ObjectId
  content      String
  upvotes      Int       @default(0)
  downvotes    Int       @default(0)
  parentId     String?   @db.ObjectId // For nested comments
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  discussion   Discussion @relation(fields: [discussionId], references: [id])
  user         User      @relation(fields: [userId], references: [id])
  parent       Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies      Comment[] @relation("CommentReplies")
  votes        CommentVote[]
}

model DiscussionVote {
  id           String     @id @default(auto()) @map("_id") @db.ObjectId
  userId       String     @db.ObjectId
  discussionId String     @db.ObjectId
  isUpvote     Boolean    // true for upvote, false for downvote
  
  user         User       @relation(fields: [userId], references: [id])
  discussion   Discussion @relation(fields: [discussionId], references: [id])
  
  @@unique([userId, discussionId])
}

model CommentVote {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  userId    String  @db.ObjectId
  commentId String  @db.ObjectId
  isUpvote  Boolean
  
  user      User    @relation(fields: [userId], references: [id])
  comment   Comment @relation(fields: [commentId], references: [id])
  
  @@unique([userId, commentId])
}
```

---

## 📊 Analytics & Tracking

```prisma
model UserSession {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  startTime DateTime @default(now())
  endTime   DateTime?
  duration  Int?     // in minutes
  problemsSolved Int @default(0)
  
  user      User     @relation(fields: [userId], references: [id])
}

model ProblemView {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String?  @db.ObjectId // null for anonymous users
  problemId String   @db.ObjectId
  viewedAt  DateTime @default(now())
  ipAddress String?
  userAgent String?
  
  user      User?    @relation(fields: [userId], references: [id])
  problem   Problem  @relation(fields: [problemId], references: [id])
}

model DailyStats {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  date            DateTime @unique
  totalUsers      Int      @default(0)
  activeUsers     Int      @default(0)
  newUsers        Int      @default(0)
  totalSubmissions Int     @default(0)
  successfulSubmissions Int @default(0)
  problemsCreated Int      @default(0)
}
```

---

## 🏢 Company & Contest Features

```prisma
model Company {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String    @unique
  description String?
  logoUrl     String?
  website     String?
  
  problems    CompanyProblem[]
}

model CompanyProblem {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  companyId String  @db.ObjectId
  problemId String  @db.ObjectId
  frequency Int     @default(1) // How often this problem appears in interviews
  
  company   Company @relation(fields: [companyId], references: [id])
  problem   Problem @relation(fields: [problemId], references: [id])
  
  @@unique([companyId, problemId])
}

model Contest {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  duration    Int        // in minutes
  isPublic    Boolean    @default(true)
  createdBy   String     @db.ObjectId
  
  creator     User       @relation(fields: [createdBy], references: [id])
  problems    ContestProblem[]
  participants ContestParticipant[]
}

model ContestProblem {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  contestId String  @db.ObjectId
  problemId String  @db.ObjectId
  points    Int     @default(100)
  order     Int
  
  contest   Contest @relation(fields: [contestId], references: [id])
  problem   Problem @relation(fields: [problemId], references: [id])
}

model ContestParticipant {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  contestId String   @db.ObjectId
  userId    String   @db.ObjectId
  score     Int      @default(0)
  rank      Int?
  joinedAt  DateTime @default(now())
  
  contest   Contest  @relation(fields: [contestId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([contestId, userId])
}
```

---

## 🔔 Notifications & System

```prisma
model Notification {
  id        String           @id @default(auto()) @map("_id") @db.ObjectId
  userId    String           @db.ObjectId
  type      NotificationType
  title     String
  message   String
  data      String?          // JSON string for additional data
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  
  user      User             @relation(fields: [userId], references: [id])
}

enum NotificationType {
  ACHIEVEMENT_UNLOCKED
  CONTEST_REMINDER
  NEW_PROBLEM
  DISCUSSION_REPLY
  SYSTEM_ANNOUNCEMENT
}

model SystemSettings {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  key   String @unique
  value String
}
```

---

## 🔗 Updated Relations for Existing Models

### User Model Relations
Add these relations to your existing `User` model:

```prisma
model User {
  // ... existing fields (id, clerkId, email, etc.)
  
  // Progress & Status
  progress         UserProgress?
  problemStatuses  UserProblemStatus[]
  achievements     UserAchievement[]
  
  // Code Execution
  submissions      Submission[]
  
  // Community
  discussions      Discussion[]
  comments         Comment[]
  discussionVotes  DiscussionVote[]
  commentVotes     CommentVote[]
  
  // Analytics
  sessions         UserSession[]
  views            ProblemView[]
  
  // Organization
  collections      Collection[]
  
  // Contests
  contests         Contest[]
  participations   ContestParticipant[]
  
  // System
  notifications    Notification[]
}
```

### Problem Model Relations
Add these relations to your existing `Problem` model:

```prisma
model Problem {
  // ... existing fields (id, title, description, etc.)
  
  // Code Execution
  submissions      Submission[]
  
  // Organization
  collections      CollectionProblem[]
  topics           TopicProblem[]
  
  // User Progress
  userStatuses     UserProblemStatus[]
  
  // Community
  discussions      Discussion[]
  
  // Analytics
  views            ProblemView[]
  
  // Company & Contests
  companies        CompanyProblem[]
  contests         ContestProblem[]
}
```

### TestCase Model Relations
Add this relation to your existing `TestCase` model:

```prisma
model TestCase {
  // ... existing fields (id, input, output, etc.)
  
  // Code Execution
  results          TestResult[]
}
```

---

## 🚀 Implementation Priority

When implementing these models, consider this order:

### Phase 1: Core Functionality
1. **Submission & TestResult** - Enable code execution
2. **UserProgress & UserProblemStatus** - Track user progress
3. **ProblemView** - Basic analytics

### Phase 2: Community Features
4. **Discussion & Comment** - Enable community discussions
5. **DiscussionVote & CommentVote** - Voting system
6. **Collection & Topic** - Problem organization

### Phase 3: Advanced Features
7. **Achievement & UserAchievement** - Gamification
8. **Company & Contest** - Professional features
9. **Notification** - User engagement
10. **Analytics models** - Advanced tracking

### Phase 4: System Features
11. **SystemSettings** - Configuration
12. **DailyStats** - Advanced analytics
13. **UserSession** - Detailed tracking

---

## 📝 Notes

- All models use MongoDB ObjectId for primary keys
- Unique constraints prevent duplicate relationships
- Optional fields use `?` for nullable values
- Default values are set for counters and booleans
- Enums provide type safety for status values
- Relations enable efficient queries across models

This schema provides a solid foundation for a production-ready LeetCode-style platform with all the features users expect from modern coding interview platforms.