import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Problem } from '@/models';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/admin/problems/search - Search problems for contest addition
 * Searches problems by title, slug, or tags. Returns paginated results
 * with basic problem info for selecting problems to add to contests.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    let filter: any = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { slug: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    const problems = await Problem.find(filter)
      .select('title slug difficulty tags description')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Problem.countDocuments(filter);

    return NextResponse.json({
      problems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching problems:', error);
    return NextResponse.json(
      { error: 'Failed to search problems' },
      { status: 500 }
    );
  }
}
