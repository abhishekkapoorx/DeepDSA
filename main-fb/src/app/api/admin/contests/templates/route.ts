import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { ContestTemplate, Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/contests/templates - Get contest templates
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isPublic = searchParams.get('isPublic');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const filter: any = {};

    // Filter by category
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    // Filter by public/private
    if (isPublic === 'true') {
      filter.isPublic = true;
    } else if (isPublic === 'false') {
      filter.$or = [
        { isPublic: false, createdBy: userId },
        { isPublic: true }
      ];
    }

    // Search by name, description, or tags
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const templates = await ContestTemplate.find(filter)
      .populate('problems.problemSlug', 'title difficulty')
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await ContestTemplate.countDocuments(filter);

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contest templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest templates' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contests/templates - Create contest template
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const body = await request.json();
    const {
      name,
      description,
      category,
      difficulty,
      duration,
      maxParticipants,
      problems,
      rules,
      prizes,
      tags,
      isPublic
    } = body;

    const template = new ContestTemplate({
      name,
      description,
      category: category || 'custom',
      difficulty: difficulty || 'mixed',
      duration,
      maxParticipants,
      problems: problems || [],
      rules: rules || [],
      prizes: prizes || [],
      tags: tags || [],
      createdBy: userId,
      isPublic: isPublic || false,
      usageCount: 0
    });

    await template.save();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating contest template:', error);
    return NextResponse.json(
      { error: 'Failed to create contest template' },
      { status: 500 }
    );
  }
}
