import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Problem, TestCase } from '@/models';
import { FullBoilerplateGenerator, mergeBoilerplateCode } from '@/utils/CodeGenerator/generate-full-boilerplate';

// Judge0 configuration (self-hosted default: http://localhost:2358)
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // RapidAPI key (optional)
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN; // Self-hosted Judge0 auth token (optional)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await params;
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Find problem by slug
    const problem = await Problem.findOne({ slug }).lean();
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Get test cases for this problem
    const testCases = await TestCase.find({ problemId: problem._id }).lean();
    if (!testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: 'No test cases found for this problem' },
        { status: 404 }
      );
    }

    // Language ID mapping for Judge0
    const LANGUAGE_IDS = {
      cpp: 54,
      java: 62,
      python: 71,
      javascript: 63
    } as const;

    if (!Object.keys(LANGUAGE_IDS).includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported languages: cpp, java, python, javascript' },
        { status: 400 }
      );
    }

    const languageId = (LANGUAGE_IDS as any)[language];

    // Generate full boilerplate and merge with user code (same as submit route)
    const fullGenerator = new FullBoilerplateGenerator(
      problem.inputVariables,
      problem.outputVariable,
      problem.functionName
    );
    const fullBoilerplate = fullGenerator.generateAll()[language];
    const completeCode = mergeBoilerplateCode(fullBoilerplate, code);

    // Encode merged code as base64 to avoid syntax and space issues
    const encodedCode = Buffer.from(completeCode, 'utf-8').toString('base64');

    console.log('Processing run request for problem:', slug);
    console.log('Language:', language, 'Language ID:', languageId);
    console.log('Code length:', completeCode.length, 'Encoded length:', encodedCode.length);

    // Create batch submission with all test cases (base64 for source/stdin/expected)
    const batchSubmissions = testCases.map((testCase, index) => ({
      source_code: encodedCode,
      language_id: languageId,
      stdin: Buffer.from(String(testCase.input ?? ''), 'utf-8').toString('base64'),
      expected_output: Buffer.from(String(testCase.output ?? ''), 'utf-8').toString('base64'),
      cpu_time_limit: 5,
      memory_limit: 128000,
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
      console.error('Judge0 batch submission failed:', batchResponse.status);
      const errorText = await batchResponse.text();
      console.error('Error details:', errorText);
      return NextResponse.json(
        { error: 'Failed to submit code to Judge0' },
        { status: 500 }
      );
    }

    const batchData = await batchResponse.json();
    const tokens = batchData.map((submission: any) => submission.token);
    
    console.log('Batch submission successful. Tokens:', tokens);

    // Poll for results with exponential backoff (LeetCode-style)
    const results = [];
    let passedTests = 0;
    const maxWaitTime = 30000; // 30 seconds max
    const startTime = Date.now();

    while (results.length < testCases.length && (Date.now() - startTime) < maxWaitTime) {
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
        if (results[i]) continue;

        // Check if processing is complete (status_id > 2 means completed)
        if (submission.status_id && submission.status_id > 2) {
          // Determine if test passed
          const judgeStatus = submission.status?.description || submission.status;
          const passed = judgeStatus === 'Accepted' && 
                        submission.stdout?.trim() === testCase.output?.trim();

          if (passed) {
            passedTests++;
          }

          // Normalize to UI-friendly status tokens
          const status = passed ? 'passed' : 'failed';

          results[i] = {
            testCaseId: testCase._id.toString(),
            testCaseNumber: i + 1,
            status: status,
            time: submission.time ? parseFloat(submission.time) : null,
            memory: submission.memory ? parseFloat(submission.memory) : null,
            stdout: submission.stdout,
            stderr: submission.stderr,
            compile_output: submission.compile_output,
            expectedOutput: testCase.output,
            actualOutput: submission.stdout,
            passed: passed
          };

          console.log(`Test case ${i + 1} completed with status:`, status, 'Passed:', passed);
        }
      }

      // If all tests are complete, break
      if (results.length === testCases.length) {
        break;
      }

      // Exponential backoff: wait longer as time progresses
      const elapsed = Date.now() - startTime;
      const waitTime = Math.min(1000 + Math.floor(elapsed / 1000) * 500, 3000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Handle any incomplete results
    for (let i = 0; i < testCases.length; i++) {
      if (!results[i]) {
        results[i] = {
          testCaseId: testCases[i]._id.toString(),
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

    const successRate = testCases.length > 0 ? (passedTests / testCases.length) * 100 : 0;

    console.log('Run completed. Results:', {
      totalTests: testCases.length,
      passedTests: passedTests,
      successRate: successRate.toFixed(2) + '%'
    });

    return NextResponse.json({
      success: true,
      data: {
        problemSlug: slug,
        language: language,
        results: results,
        summary: {
          passed: passedTests,
          total: testCases.length,
          successRate: Math.round(successRate)
        }
      }
    });

  } catch (error) {
    console.error('Error in run route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

