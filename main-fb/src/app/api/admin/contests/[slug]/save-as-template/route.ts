import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { ContestTemplate, Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// POST /api/admin/contests/[slug]/save-as-template - Save contest as template
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

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      difficulty,
      isPublic,
      tags
    } = body;

    // Create template from contest
    const template = new ContestTemplate({
      name: name || `${contest.title} Template`,
      description: description || contest.description,
      category: category || 'custom',
      difficulty: difficulty || contest.difficulty,
      duration: contest.duration,
      maxParticipants: contest.maxParticipants,
      problems: contest.problems.map(problem => ({
        problemSlug: problem.problemSlug,
        points: problem.points,
        order: problem.order
      })),
      rules: contest.rules,
      prizes: contest.prizes,
      tags: tags || contest.tags,
      createdBy: userId,
      isPublic: isPublic || false,
      usageCount: 0
    });

    await template.save();

    return NextResponse.json({
      message: 'Template created successfully',
      template
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving contest as template:', error);
    return NextResponse.json(
      { error: 'Failed to save contest as template' },
      { status: 500 }
    );
  }
}
