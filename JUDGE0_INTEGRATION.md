# 🔧 Judge0 Integration Guide

This guide shows how to integrate Judge0 for code execution in your LeetCode-style platform.

## 📋 Judge0 Language IDs

Here are the most common programming languages supported by Judge0:

```typescript
export const JUDGE0_LANGUAGES = {
  // Popular Languages
  JAVASCRIPT: { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  PYTHON: { id: 71, name: 'Python (3.8.1)' },
  JAVA: { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  CPP: { id: 54, name: 'C++ (GCC 9.2.0)' },
 
} as const;
```

## 🚀 API Service Implementation

Create `main-fb/src/lib/judge0.ts`:

```typescript
interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

interface Judge0Response {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
}

export class Judge0Service {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY;
  }

  async submitCode(submission: Judge0Submission): Promise<string> {
    const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.apiKey || '',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify(submission)
    });

    if (!response.ok) {
      throw new Error(`Judge0 submission failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.token;
  }

  async getSubmissionResult(token: string): Promise<Judge0Response> {
    const response = await fetch(`${this.baseUrl}/submissions/${token}?base64_encoded=false`, {
      headers: {
        'X-RapidAPI-Key': this.apiKey || '',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Judge0 result fetch failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async executeTestCase(
    code: string, 
    languageId: number, 
    input: string, 
    expectedOutput: string
  ): Promise<{
    passed: boolean;
    actualOutput?: string;
    runtime?: number;
    memory?: number;
    error?: string;
  }> {
    try {
      // Submit code to Judge0
      const token = await this.submitCode({
        source_code: code,
        language_id: languageId,
        stdin: input,
        expected_output: expectedOutput
      });

      // Poll for result (with timeout)
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const result = await this.getSubmissionResult(token);
        
        // Status codes: 1-2 = In Queue/Processing, 3 = Accepted, 4+ = Various errors
        if (result.status.id > 2) {
          const passed = result.status.id === 3; // Status 3 = Accepted
          
          return {
            passed,
            actualOutput: result.stdout?.trim(),
            runtime: result.time ? parseFloat(result.time) * 1000 : undefined, // Convert to ms
            memory: result.memory,
            error: result.stderr || result.compile_output || undefined
          };
        }
        
        attempts++;
      }
      
      throw new Error('Judge0 execution timeout');
    } catch (error) {
      return {
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }
  }
}

export const judge0 = new Judge0Service();
```

## 🔗 API Route Integration

Create `main-fb/src/app/api/submissions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { judge0, JUDGE0_LANGUAGES } from '@/lib/judge0';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemId, code, language } = await req.json();

    // Validate language
    const languageConfig = Object.values(JUDGE0_LANGUAGES).find(
      lang => lang.name.toLowerCase().includes(language.toLowerCase())
    );

    if (!languageConfig) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    // Get user and problem
    const [user, problem] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId } }),
      prisma.problem.findUnique({ 
        where: { id: problemId },
        include: { testCases: true }
      })
    ]);

    if (!user || !problem) {
      return NextResponse.json({ error: 'User or problem not found' }, { status: 404 });
    }

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId,
        code,
        language,
        languageId: languageConfig.id,
        status: 'PENDING',
        totalTests: problem.testCases.length
      }
    });

    // Execute test cases
    let testsPassed = 0;
    const testResults = [];

    for (const testCase of problem.testCases) {
      const result = await judge0.executeTestCase(
        code,
        languageConfig.id,
        testCase.input,
        testCase.output
      );

      if (result.passed) testsPassed++;

      // Save test result
      const testResult = await prisma.testResult.create({
        data: {
          submissionId: submission.id,
          testCaseId: testCase.id,
          passed: result.passed,
          actualOutput: result.actualOutput,
          runtime: result.runtime,
          memory: result.memory
        }
      });

      testResults.push(testResult);
    }

    // Update submission with final results
    const finalStatus = testsPassed === problem.testCases.length ? 'ACCEPTED' : 'WRONG_ANSWER';
    const avgRuntime = testResults.reduce((sum, r) => sum + (r.runtime || 0), 0) / testResults.length;
    const maxMemory = Math.max(...testResults.map(r => r.memory || 0));

    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: finalStatus,
        testsPassed,
        runtime: Math.round(avgRuntime),
        memory: maxMemory
      },
      include: {
        results: true
      }
    });

    return NextResponse.json({
      submission: updatedSubmission,
      testResults
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
```

## 🎯 Frontend Integration

Add to your problem page component:

```typescript
// In your problem solving component
const handleRunCode = async () => {
  setIsRunning(true);
  
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        code: userCode,
        language: selectedLanguage
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      setSubmissionResult(result);
      // Show results to user
    } else {
      setError(result.error);
    }
  } catch (error) {
    setError('Failed to submit code');
  } finally {
    setIsRunning(false);
  }
};
```

## 🔐 Environment Variables

Add to your `.env` file:

```env
# Judge0 Configuration
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
```

## 📊 Status Codes Reference

Judge0 status codes for your reference:

```typescript
export const JUDGE0_STATUS_CODES = {
  1: 'In Queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error'
};
```

## 🏗️ Next Steps

1. **Set up Judge0**: Get API key from RapidAPI or deploy your own instance
2. **Add environment variables**: Configure Judge0 API URL and key
3. **Create the service**: Implement the Judge0Service class
4. **Build submission API**: Create the submission endpoint
5. **Frontend integration**: Add code execution to your problem page
6. **Error handling**: Implement proper error handling and user feedback

This integration will give you a robust code execution system for your LeetCode-style platform! 🚀