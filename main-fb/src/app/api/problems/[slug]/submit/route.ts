import { NextRequest, NextResponse } from 'next/server';
import { FullBoilerplateGenerator, mergeBoilerplateCode } from '@/utils/CodeGenerator/generate-full-boilerplate';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';
import connectToDB from '@/lib/mongoose';
import { Problem, TestCase, Submission, SubmissionStatus, TestResult, User } from '@/models';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

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

    // Submit to Judge0 using individual submissions
    console.log('Using individual submissions approach...');
    const processedResults = [];
    const languageId = (LANGUAGE_IDS as any)[language];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`Processing test case ${i + 1}:`, { input: testCase.input, output: testCase.output });
      
      // Create individual submission
      const submissionData = {
        source_code: completeCode,
        language_id: LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS],
        stdin: testCase.input,
        expected_output: testCase.output,
        cpu_time_limit: 5,
        memory_limit: 512000,
        enable_network: false,
      };
      
      console.log(`Submitting test case ${i + 1} to Judge0:`, submissionData);
      
      const submissionResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
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
      processedResults.push({
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