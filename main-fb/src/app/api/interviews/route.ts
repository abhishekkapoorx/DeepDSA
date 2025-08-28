import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Interview, Problem, User } from '@/models'
import { auth } from '@clerk/nextjs/server'

// POST /api/interviews -> start new interview (enforce 3/day)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()

    const user = await User.findOne({ clerkId: userId })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { problemSlug, provider } = await req.json()

    // Count user interviews today
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999)
    const todayCount = await Interview.countDocuments({ clerkId: userId, startedAt: { $gte: startOfDay, $lte: endOfDay } })
    if (todayCount >= 3) { // ✅ Changed from 10 to 3 to match the requirement
      return NextResponse.json({ error: 'Daily interview limit reached (3 interviews per day)' }, { status: 429 })
    }

    let problem = null as any
    if (problemSlug) {
      problem = await Problem.findOne({ slug: problemSlug }).select('_id slug title')
    }

    const interview = new Interview({
      userId: user._id,
      clerkId: userId,
      problemId: problem?._id,
      problemSlug: problem?.slug,
      provider: provider === 'openai' ? 'openai' : 'gemini',
      dailySequence: todayCount + 1,
      messages: [
        {
          role: 'assistant',
          content: `Hello! Let's start the interview${problem?.title ? ` for: ${problem.title}` : ''}. Briefly explain your approach.`,
          timestamp: new Date(),
        },
      ],
    })
    await interview.save()

    return NextResponse.json({ id: interview._id, message: interview.messages[0] }, { status: 201 })
  } catch (e) {
    console.error('Error starting interview', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/interviews -> list user interviews (paginated)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Interview.find({ clerkId: userId })
        .select('startedAt endedAt problemSlug score dailySequence createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Interview.countDocuments({ clerkId: userId })
    ])

    return NextResponse.json({
      interviews: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (e) {
    console.error('Error listing interviews', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


