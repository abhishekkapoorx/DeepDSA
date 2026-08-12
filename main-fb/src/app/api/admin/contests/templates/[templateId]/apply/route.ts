import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { ContestTemplate, Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// POST /api/admin/contests/templates/[templateId]/apply - Apply template to create contest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { templateId } = await params;

    const template = await ContestTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user can access this template
    if (!template.isPublic && template.createdBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      startTime,
      endTime,
      maxParticipants
    } = body;

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Create contest from template
    const contest = new Contest({
      title,
      description,
      slug,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: template.duration,
      maxParticipants: maxParticipants || template.maxParticipants,
      problems: template.problems.map((problem: { problemSlug: string; points: number; order: number }) => ({
        problemId: null, // Will be populated when problems are added
        problemSlug: problem.problemSlug,
        points: problem.points,
        order: problem.order
      })),
      rules: template.rules,
      prizes: template.prizes,
      difficulty: template.difficulty,
      tags: template.tags,
      isActive: true,
      isPublished: false
    });

    await contest.save();

    // Increment template usage count
    template.usageCount += 1;
    await template.save();

    return NextResponse.json({
      message: 'Contest created from template successfully',
      contest
    }, { status: 201 });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    );
  }
}
