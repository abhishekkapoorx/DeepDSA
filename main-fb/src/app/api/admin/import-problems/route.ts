import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Problem, { Difficulty, generateSlug } from '@/models/problem.model';
import TestCase from '@/models/testCase.model';
import { connectToDB } from '@/lib/mongoose';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Basic auth check (you can add admin check if needed)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the uploaded file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const jsonData = await file.text();
    const problems = JSON.parse(jsonData);

    if (!Array.isArray(problems)) {
      return NextResponse.json({ error: 'JSON must be an array of problems' }, { status: 400 });
    }

    // Connect to database
    await connectToDB();

    const results = [];

    // Process each problem
    for (const [index, problemData] of problems.entries()) {
      try {
        // Validate required fields
        if (!problemData.title || !problemData.description || !problemData.difficulty) {
          throw new Error('Missing required fields');
        }

        // Generate slug
        const slug = generateSlug(problemData.title);

        // Check if problem already exists
        const existingProblem = await Problem.findOne({ slug });
        if (existingProblem) {
          results.push({
            title: problemData.title,
            status: 'skipped',
            reason: 'Already exists'
          });
          continue;
        }

        // Get next question number if not provided
        let questionNumber = problemData.questionNumber;
        if (!questionNumber) {
          questionNumber = await (Problem as any).getNextQuestionNumber();
        }

        // Create problem
        const problem = new Problem({
          title: problemData.title,
          slug,
          description: problemData.description,
          difficulty: problemData.difficulty as Difficulty,
          tags: problemData.tags || [],
          starterCode: problemData.starterCode,
          functionName: problemData.functionName,
          hints: problemData.hints || [],
          inputVariables: problemData.inputVariables,
          outputVariable: problemData.outputVariable,
          companyTags: problemData.companyTags || [],
          questionNumber,
        });

        await problem.save();

        // Add test cases
        let testCasesCount = 0;
        if (problemData.testCases && problemData.testCases.length > 0) {
          for (const testCaseData of problemData.testCases) {
            const testCase = new TestCase({
              name: testCaseData.name || 'Test Case',
              description: testCaseData.description,
              input: testCaseData.input,
              output: testCaseData.output,
              isHidden: testCaseData.isHidden ?? false,
              isExample: testCaseData.isExample ?? false,
              problemId: problem._id,
            });
            await testCase.save();
            testCasesCount++;
          }
        }

        results.push({
          title: problemData.title,
          status: 'success',
          questionNumber,
          testCasesAdded: testCasesCount
        });

      } catch (error) {
        results.push({
          title: problemData.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: problems.length,
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import problems', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

