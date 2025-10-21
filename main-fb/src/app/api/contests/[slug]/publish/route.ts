import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Contest } from '@/models'
import { auth } from '@clerk/nextjs/server'

// POST /api/contests/[slug]/publish - toggle publish state
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectToDB()
    const body = await request.json()
    const { isPublished } = body as { isPublished: boolean }

    const { slug } = await params;
    const contest = await Contest.findOneAndUpdate(
      { slug: slug, isDeleted: { $ne: true } },
      { isPublished: !!isPublished },
      { new: true }
    )

    if (!contest) return NextResponse.json({ error: 'Contest not found' }, { status: 404 })

    return NextResponse.json({ message: 'Publish state updated', isPublished: contest.isPublished })
  } catch (error) {
    console.error('Error updating publish state:', error)
    return NextResponse.json({ error: 'Failed to update publish state' }, { status: 500 })
  }
}


