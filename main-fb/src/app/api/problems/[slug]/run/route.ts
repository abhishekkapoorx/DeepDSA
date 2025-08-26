import { NextRequest, NextResponse } from 'next/server';
import { FullBoilerplateGenerator, mergeBoilerplateCode } from '@/utils/CodeGenerator/generate-full-boilerplate';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';
import connectToDB from '@/lib/mongoose';
import { Problem, TestCase } from '@/models';

export const dynamic = 'force-dynamic';

// Judge0 configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('=== RUN API CALLED ===');
    console.log('Slug:', slug);
    console.log('JUDGE0_API_URL:', JUDGE0_API_URL);

    await connectToDB();

    const body = await request.json();
    const { code, language } = body as { code?: string; language?: Language };
    console.log('Request body:', { code: code?.substring(0, 100) + '...', language });

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const validLanguages: Language[] = ['cpp', 'java', 'python', 'javascript'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported languages: cpp, java, python, javascript' },
        { status: 400 }
      );
    }

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

    const fullGenerator = new FullBoilerplateGenerator(
      problem.inputVariables,
      problem.outputVariable,
      problem.functionName
    );

    const fullBoilerplate = fullGenerator.generateAll()[language];
    console.log('Full boilerplate generated for', language, ':', fullBoilerplate.substring(0, 200) + '...');

    const completeCode = mergeBoilerplateCode(fullBoilerplate, code);
    console.log('Complete code length:', completeCode.length);
    console.log('Complete code preview:', completeCode.substring(0, 300) + '...');

    const submissions = testCases.map((testCase: any) => ({
      source_code: completeCode,
      language_id: (LANGUAGE_IDS as any)[language],
      stdin: testCase.input,
      expected_output: testCase.output,
      cpu_time_limit: 5,
      memory_limit: 512000,
      enable_network: false,
    }));
    console.log('Judge0 submissions prepared:', submissions.length);
    console.log('First submission:', {
      language_id: submissions[0]?.language_id,
      stdin: submissions[0]?.stdin,
      expected_output: submissions[0]?.expected_output
    });

    // Retry helper to handle Judge0 startup delays
    const fetchWithRetry = async (url: string, init: RequestInit, retries = 3, delayMs = 500) => {
      let lastError: any;
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Attempt ${i + 1}: Calling Judge0 at ${url}`);
          const res = await fetch(url, init);
          if (res.ok) return res;
          lastError = new Error(`HTTP ${res.status}`);
        } catch (e) {
          console.log(`Attempt ${i + 1} failed:`, e);
          lastError = e;
        }
        if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
      }
      throw lastError;
    };

    // Use individual submissions instead of batch for now
    console.log('Using individual submissions approach...');
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`Processing test case ${i + 1}:`, { input: testCase.input, output: testCase.output });
      
      // Create individual submission
      const submissionData = {
        source_code: completeCode,
        language_id: (LANGUAGE_IDS as any)[language],
        stdin: testCase.input,
        expected_output: testCase.output,
        cpu_time_limit: 5,
        memory_limit: 512000,
        enable_network: false,
      };
      
      console.log(`Submitting test case ${i + 1} to Judge0:`, submissionData);
      
      const submissionResponse = await fetchWithRetry(`${JUDGE0_API_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(JUDGE0_API_KEY && { 'X-RapidAPI-Key': JUDGE0_API_KEY }),
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!submissionResponse.ok) {
        const errorText = await submissionResponse.text();
        console.error(`Judge0 submission ${i + 1} failed:`, errorText);
        throw new Error(`Judge0 submission failed: ${errorText}`);
      }
      
      const submission = await submissionResponse.json();
      console.log(`Submission ${i + 1} created:`, submission);
      
      // Wait for result
      let result;
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 30 seconds
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${submission.token}`);
        if (resultResponse.ok) {
          result = await resultResponse.json();
          console.log(`Result ${i + 1} attempt ${attempts + 1}:`, result.status?.description);
          
          if (result.status?.id >= 3) { // 3 = Accepted, 4 = Wrong Answer, etc.
            break;
          }
        }
        attempts++;
      }
      
      if (!result) {
        throw new Error(`Timeout waiting for result for test case ${i + 1}`);
      }
      
      const passed = result.status?.id === 3 && result.stdout?.trim() === testCase.output?.trim();
      results.push({
        testCaseId: testCase._id,
        testCaseNumber: i + 1,
        status: result.status?.description || 'Unknown',
        time: result.time,
        memory: result.memory,
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        expectedOutput: testCase.output,
        actualOutput: result.stdout,
        passed,
      });
      
      console.log(`Test case ${i + 1} result:`, { passed, status: result.status?.description });
    }

    const passedCount = results.filter((r: any) => r.passed).length;
    const totalCount = results.length;
    console.log('Results processed:', { passedCount, totalCount });

    return NextResponse.json({
      success: true,
      data: {
        problemSlug: slug,
        language,
        results,
        summary: {
          passed: passedCount,
          total: totalCount,
          successRate: (passedCount / totalCount) * 100,
        },
      },
    });
  } catch (error) {
    console.error('Error running code:', error);
    console.error('Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


