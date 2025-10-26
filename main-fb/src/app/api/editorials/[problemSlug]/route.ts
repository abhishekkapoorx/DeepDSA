import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Editorial, Problem } from '@/models'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> }
) {
  try {
    await dbConnect()

    const { problemSlug } = await params

    // Find the problem by slug
    const problem = await Problem.findOne({ slug: problemSlug })
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Find the published editorial for this problem
    const editorial = await Editorial.findOne({ 
      problemId: problem._id,
      isPublished: true 
    }).lean()

    if (!editorial) {
      return NextResponse.json({ error: 'Editorial not found' }, { status: 404 })
    }

    return NextResponse.json({
      editorial,
      problem: {
        title: problem.title,
        slug: problem.slug,
        questionNumber: problem.questionNumber,
        difficulty: problem.difficulty,
        tags: problem.tags
      }
    })
  } catch (error) {
    console.error('Error fetching editorial:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
