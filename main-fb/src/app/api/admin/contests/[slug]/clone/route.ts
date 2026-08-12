import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// POST /api/admin/contests/[slug]/clone - Clone contest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { slug } = await params;

    const originalContest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!originalContest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      startTime,
      endTime,
      maxParticipants
    } = body;

    // Generate new slug from title
    const newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingContest = await Contest.findOne({ slug: newSlug });
    if (existingContest) {
      return NextResponse.json({ error: 'A contest with this title already exists' }, { status: 400 });
    }

    // Create cloned contest
    const clonedContest = new Contest({
      title,
      description,
      slug: newSlug,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: originalContest.duration,
      maxParticipants: maxParticipants || originalContest.maxParticipants,
      problems: originalContest.problems.map((problem: { problemSlug: string; points: number; order: number }) => ({
        problemId: null, // Will be populated when problems are added
        problemSlug: problem.problemSlug,
        points: problem.points,
        order: problem.order
      })),
      rules: [...originalContest.rules],
      prizes: [...(originalContest.prizes || [])],
      difficulty: originalContest.difficulty,
      tags: [...originalContest.tags],
      isActive: true,
      isPublished: false,
      registrations: [] // Start with no registrations
    });

    await clonedContest.save();

    return NextResponse.json({
      message: 'Contest cloned successfully',
      contest: clonedContest
    }, { status: 201 });
  } catch (error) {
    console.error('Error cloning contest:', error);
    return NextResponse.json(
      { error: 'Failed to clone contest' },
      { status: 500 }
    );
  }
}
