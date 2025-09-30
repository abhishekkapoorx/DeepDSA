import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Editorial, Problem } from '@/models'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const { User } = await import('@/models')
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { problemId, title, overview, approaches, followUpQuestions, relatedProblems, isPublished } = body

    // Validate required fields
    if (!problemId || !title || !overview || !approaches || !Array.isArray(approaches) || approaches.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId)
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Check if editorial already exists for this problem
    const existingEditorial = await Editorial.findOne({ problemId })
    if (existingEditorial) {
      return NextResponse.json({ error: 'Editorial already exists for this problem' }, { status: 409 })
    }

    // Create editorial
    const editorial = new Editorial({
      problemId,
      title,
      overview,
      approaches,
      followUpQuestions: followUpQuestions || [],
      relatedProblems: relatedProblems || [],
      isPublished: isPublished || false,
    })

    await editorial.save()

    return NextResponse.json(editorial, { status: 201 })
  } catch (error) {
    console.error('Error creating editorial:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const { User } = await import('@/models')
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const problemId = searchParams.get('problemId')

    const skip = (page - 1) * limit

    // Build query filter
    const filter: any = {}
    if (problemId) {
      filter.problemId = problemId
    }

    const [editorials, total] = await Promise.all([
      Editorial.find(filter)
        .populate('problemId', 'title slug questionNumber difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Editorial.countDocuments(filter)
    ])

    return NextResponse.json({
      editorials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching editorials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
