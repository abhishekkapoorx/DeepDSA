import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Contest, Submission } from '@/models'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; problemSlug: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { slug, problemSlug } = await params
    
    // Get contest
    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } })
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    // Check if user is registered
    const isRegistered = contest.registrations.some((reg: any) => reg.clerkId === userId)
    if (!isRegistered) {
      return NextResponse.json({ error: 'You must be registered for this contest' }, { status: 403 })
    }

    // Find problem in contest
    const contestProblem = contest.problems.find((p: any) => p.problemSlug === problemSlug)
    if (!contestProblem) {
      return NextResponse.json({ error: 'Problem not found in contest' }, { status: 404 })
    }

    // Get submissions for this problem by this user during contest time
    const submissions = await Submission.find({
      problemId: contestProblem.problemId,
      $or: [
        { clerkId: userId }, // Prefer clerkId for new submissions
        { userId: userId }   // Fallback to userId for legacy submissions
      ],
      createdAt: {
        $gte: contest.startTime,
        $lte: contest.endTime
      }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

