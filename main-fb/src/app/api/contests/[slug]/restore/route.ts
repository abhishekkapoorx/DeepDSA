import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Contest } from '@/models'
import { auth } from '@clerk/nextjs/server'

/**
 * POST /api/contests/[slug]/restore - Restore soft-deleted contest
 * Restores a previously soft-deleted contest by setting isDeleted to false.
 * Requires authentication (admin check should be added).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectToDB()

    const { slug } = await params;
    const contest = await Contest.findOneAndUpdate(
      { slug: slug, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    )

    if (!contest) return NextResponse.json({ error: 'Contest not found or not deleted' }, { status: 404 })

    return NextResponse.json({ message: 'Contest restored' })
  } catch (error) {
    console.error('Error restoring contest:', error)
    return NextResponse.json({ error: 'Failed to restore contest' }, { status: 500 })
  }
}


