import { NextRequest, NextResponse } from 'next/server';
import { FullBoilerplateGenerator, mergeBoilerplateCode } from '@/utils/CodeGenerator/generate-full-boilerplate';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';
import Problem from '@/models/problem.model';
import TestCase from '@/models/testCase.model';
import connectToDB from '@/lib/mongoose';

// Judge0 configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  cpp: 54,    // C++ (GCC 9.2.0)
  java: 62,   // Java (OpenJDK 13.0.1)
  python: 71, // Python (3.8.1)
  javascript: 63 // JavaScript (Node.js 12.14.0)
};

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Connect to database
    await connectToDB();
    
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Validate language
    const validLanguages: Language[] = ['cpp', 'java', 'python', 'javascript'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported languages: cpp, java, python, javascript' },
        { status: 400 }
      );
    }

    // Find problem by slug
    const problem = await Problem.findOne({ slug: params.slug });
    
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Get test cases for this problem
    const testCases = await TestCase.find({ problemId: problem._id });
    
    if (!testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: 'No test cases found for this problem' },
        { status: 404 }
      );
    }

    // Generate full boilerplate
    const fullGenerator = new FullBoilerplateGenerator(
      problem.inputVariables,
      problem.outputVariable,
      problem.functionName
    );

    const fullBoilerplate = fullGenerator.generateAll()[language];

    // Merge user code with full boilerplate
    const completeCode = mergeBoilerplateCode(fullBoilerplate, code);

    // Prepare submissions for Judge0 batch API
    const submissions = testCases.map((testCase, index) => ({
      source_code: completeCode,
      language_id: LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS],
      stdin: testCase.input,
      expected_output: testCase.output,
      cpu_time_limit: 5, // 5 seconds
      memory_limit: 512000, // 512MB
      enable_network: false
    }));

    // Submit to Judge0 batch API
    const judge0Response = await fetch(`${JUDGE0_API_URL}/submissions/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(JUDGE0_API_KEY && { 'X-RapidAPI-Key': JUDGE0_API_KEY })
      },
      body: JSON.stringify({
        submissions
      })
    });

    if (!judge0Response.ok) {
      console.error('Judge0 API error:', await judge0Response.text());
      return NextResponse.json(
        { error: 'Failed to submit to Judge0' },
        { status: 500 }
      );
    }

    const judge0Result = await judge0Response.json();

    // Process results
    const results = judge0Result.submissions.map((submission: any, index: number) => {
      const testCase = testCases[index];
      return {
        testCaseId: testCase._id,
        testCaseNumber: index + 1,
        status: submission.status?.description || 'Unknown',
        time: submission.time,
        memory: submission.memory,
        stdout: submission.stdout,
        stderr: submission.stderr,
        compile_output: submission.compile_output,
              expectedOutput: testCase.output,
      actualOutput: submission.stdout,
      passed: submission.status?.id === 3 && submission.stdout?.trim() === testCase.output?.trim()
      };
    });

    const passedCount = results.filter((r: any) => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;

    return NextResponse.json({
      success: true,
      data: {
        problemSlug: params.slug,
        language,
        results,
        summary: {
          passed: passedCount,
          total: totalCount,
          allPassed,
          successRate: (passedCount / totalCount) * 100
        }
      }
    });

  } catch (error) {
    console.error('Error submitting code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 