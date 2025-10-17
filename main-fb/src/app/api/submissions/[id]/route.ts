import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import { Submission, TestResult } from '@/models';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid submission id' }, { status: 400 });
    }

    const submission = await Submission.findById(params.id)
      .populate('problemId', 'title slug difficulty')
      .lean();

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const results = await TestResult.find({ submissionId: params.id })
      .populate('testCaseId', 'input output index order')
      .lean();

    // Normalize results for UI consumption
    const normalizedResults = results.map((r: any, i: number) => ({
      testCaseId: String(r.testCaseId?._id || r.testCaseId),
      testCaseNumber: (r.testCaseId?.index ?? r.testCaseId?.order ?? i) + 1,
      status: r.passed ? 'passed' : 'failed',
      time: r.runtime,
      memory: r.memory,
      stdout: r.stdout,
      stderr: r.stderr,
      compile_output: r.compile_output,
      expectedOutput: r.testCaseId?.output ?? '',
      actualOutput: r.actualOutput ?? r.stdout ?? '',
      passed: !!r.passed,
    }));

    return NextResponse.json({
      submission,
      results: normalizedResults,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

