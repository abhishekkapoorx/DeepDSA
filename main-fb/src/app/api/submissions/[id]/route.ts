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
      .populate('testCaseId', 'input output')
      .lean();

    return NextResponse.json({
      submission,
      results,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


