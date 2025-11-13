import { NextRequest, NextResponse } from 'next/server';
import { FullBoilerplateGenerator, mergeBoilerplateCode } from '@/utils/CodeGenerator/generate-full-boilerplate';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';
import connectToDB from '@/lib/mongoose';
import { Problem, TestCase, Submission, SubmissionStatus, TestResult, User } from '@/models';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// Judge0 configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // RapidAPI key (optional)
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN; // Self-hosted Judge0 auth token (optional)

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  cpp: 54,    // C++ (GCC 9.2.0)
  java: 62,   // Java (OpenJDK 13.0.1)
  python: 71, // Python (3.8.1)
  javascript: 63 // JavaScript (Node.js 12.14.0)
};

/**
 * POST /api/problems/[slug]/submit - Submit solution for evaluation
 * Executes code against all test cases, creates submission record, and saves test results.
 * Updates user progress. Requires authentication and returns detailed submission results.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('=== SUBMIT API CALLED ===');
    console.log('Slug:', slug);
    console.log('JUDGE0_API_URL:', JUDGE0_API_URL);

    // Auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('User authenticated:', userId);

    // Connect to database
    await connectToDB();
    
    const body = await request.json();
    const { code, language } = body;
    console.log('Request body:', { code: code?.substring(0, 100) + '...', language });

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

    // Resolve app user
    const appUser = await User.findOne({ clerkId: userId });
    if (!appUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('App user found:', appUser._id);

    // Find problem by slug
    const problem = await Problem.findOne({ slug });
    
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }
    console.log('Problem found:', {
      title: problem.title,
      functionName: problem.functionName,
      inputVariables: problem.inputVariables,
      outputVariable: problem.outputVariable
    });

    // Get test cases for this problem
    const testCases = await TestCase.find({ problemId: problem._id });
    
    if (!testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: 'No test cases found for this problem' },
        { status: 404 }
      );
    }
    console.log('Test cases found:', testCases.length);
    console.log('First test case:', {
      input: testCases[0]?.input,
      output: testCases[0]?.output
    });

    // Generate full boilerplate
    const fullGenerator = new FullBoilerplateGenerator(
      problem.inputVariables,
      problem.outputVariable,
      problem.functionName
    );

    const fullBoilerplate = fullGenerator.generateAll()[language];
    console.log('Full boilerplate generated for', language, ':', fullBoilerplate.substring(0, 200) + '...');

    // Merge user code with full boilerplate
    const completeCode = mergeBoilerplateCode(fullBoilerplate, code);
    console.log('Complete code length:', completeCode.length);
    console.log('Complete code preview:', completeCode.substring(0, 300) + '...');

    // Encode code as base64 to avoid syntax and space issues
    const encodedCode = Buffer.from(completeCode, 'utf-8').toString('base64');
    console.log('Code encoded as base64. Original length:', completeCode.length, 'Encoded length:', encodedCode.length);

    // Submit to Judge0 using batch submissions (LeetCode-style)
    console.log('Using batch submissions approach...');
    const processedResults = [];
    const languageId = (LANGUAGE_IDS as any)[language];

    // Create batch submission with all test cases (base64 for source/stdin/expected)
    const batchSubmissions = testCases.map((testCase, index) => ({
      source_code: encodedCode,
      language_id: LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS],
      stdin: Buffer.from(String(testCase.input ?? ''), 'utf-8').toString('base64'),
      expected_output: Buffer.from(String(testCase.output ?? ''), 'utf-8').toString('base64'),
      cpu_time_limit: 5,
      memory_limit: 512000,
      enable_network: false,
      callback_url: null
    }));

    console.log(`Submitting batch of ${batchSubmissions.length} test cases to Judge0`);

    // Submit batch to Judge0 with base64_encoded=true since we're sending base64 code
    const batchResponse = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(JUDGE0_API_KEY && { 'X-RapidAPI-Key': JUDGE0_API_KEY }),
        ...(JUDGE0_AUTH_TOKEN && { 'X-Auth-Token': JUDGE0_AUTH_TOKEN }),
      },
      body: JSON.stringify({
        submissions: batchSubmissions
      })
    });

    if (!batchResponse.ok) {
      const errorText = await batchResponse.text();
      console.error('Judge0 batch submission failed:', errorText);
      throw new Error(`Judge0 batch submission failed: ${errorText}`);
    }

    const batchData = await batchResponse.json();
    const tokens = batchData.map((submission: any) => submission.token);
    
    console.log('Batch submission successful. Tokens:', tokens);

    // Poll for results with exponential backoff (LeetCode-style)
    const maxWaitTime = 30000; // 30 seconds max
    const startTime = Date.now();

    while (processedResults.length < testCases.length && (Date.now() - startTime) < maxWaitTime) {
      // Get batch results with base64_encoded=false to get readable output
      const resultsResponse = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=false&fields=token,stdout,stderr,status_id,status,time,memory,compile_output,message`, {
        headers: {
          ...(JUDGE0_API_KEY && { 'X-RapidAPI-Key': JUDGE0_API_KEY }),
          ...(JUDGE0_AUTH_TOKEN && { 'X-Auth-Token': JUDGE0_AUTH_TOKEN }),
        }
      });
      
      if (!resultsResponse.ok) {
        console.error('Failed to fetch batch results:', resultsResponse.status);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const batchResults = await resultsResponse.json();
      console.log(`Fetched batch results. Completed: ${batchResults.submissions.filter((s: any) => s.status_id > 2).length}/${testCases.length}`);

      // Process completed submissions
      for (let i = 0; i < batchResults.submissions.length; i++) {
        const submission = batchResults.submissions[i];
        const testCase = testCases[i];
        
        // Skip if already processed
        if (processedResults[i]) continue;

        // Check if processing is complete (status_id > 2 means completed)
        if (submission.status_id && submission.status_id > 2) {
          const judgeStatus = submission.status?.description || submission.status;
          const passed = judgeStatus === 'Accepted' && submission.stdout?.trim() === testCase.output?.trim();
          
          processedResults[i] = {
            testCaseId: testCase._id,
            testCaseNumber: i + 1,
            status: passed ? 'passed' : 'failed',
            time: submission.time,
            memory: submission.memory,
            stdout: submission.stdout,
            stderr: submission.stderr,
            compile_output: submission.compile_output,
            expectedOutput: testCase.output,
            actualOutput: submission.stdout,
            passed,
          };
          
          console.log(`Test case ${i + 1} result:`, { passed, status: judgeStatus });
        }
      }

      // If all tests are complete, break
      if (processedResults.length === testCases.length) {
        break;
      }

      // Exponential backoff: wait longer as time progresses
      const elapsed = Date.now() - startTime;
      const waitTime = Math.min(1000 + Math.floor(elapsed / 1000) * 500, 3000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Handle any incomplete results
    for (let i = 0; i < testCases.length; i++) {
      if (!processedResults[i]) {
        processedResults[i] = {
          testCaseId: testCases[i]._id,
          testCaseNumber: i + 1,
          status: 'Timeout',
          time: null,
          memory: null,
          stdout: null,
          stderr: null,
          compile_output: null,
          expectedOutput: testCases[i].output,
          actualOutput: null,
          passed: false
        };
      }
    }

    const passedCount = processedResults.filter((r: any) => r.passed).length;
    const totalCount = processedResults.length;
    const allPassed = passedCount === totalCount;
    console.log('Results processed:', { passedCount, totalCount, allPassed });

    // Create submission document
    const submissionDoc = await Submission.create({
      userId: appUser._id,
      problemId: problem._id,
      code,
      language,
      languageId,
      status: allPassed ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER,
      testsPassed: passedCount,
      totalTests: totalCount,
      runtime: processedResults.reduce((acc: number, r: any) => acc + (Number(r.time) || 0), 0) / Math.max(totalCount, 1),
      memory: processedResults.reduce((acc: number, r: any) => acc + (Number(r.memory) || 0), 0) / Math.max(totalCount, 1),
    });
    console.log('Submission created:', submissionDoc._id);

    // Persist per-test results
    await TestResult.insertMany(
      processedResults.map((r: any, idx: number) => ({
        submissionId: submissionDoc._id,
        testCaseId: r.testCaseId,
        passed: r.passed,
        actualOutput: r.actualOutput,
        runtime: Number(r.time) || undefined,
        memory: Number(r.memory) || undefined,
      }))
    );
    console.log('Test results persisted');

    return NextResponse.json({
      success: true,
      data: {
        submissionId: submissionDoc._id,
        problemSlug: slug,
        language,
        results: processedResults,
        summary: {
          passed: passedCount,
          total: totalCount,
          allPassed,
          successRate: (passedCount / totalCount) * 100,
        },
      },
    });

  } catch (error) {
    console.error('Error submitting code:', error);
    console.error('Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 