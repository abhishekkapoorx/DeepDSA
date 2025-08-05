import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Problem, TestCase } from '@/models'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect()

    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Find problem by slug
    const problem = await Problem.findOne({ slug }).lean()

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Get test cases for this problem
    const testCases = await TestCase.find({ problemId: problem._id }).lean()

    // Format test cases for frontend
    const formattedTestCases = testCases.map(tc => ({
      input: tc.input,
      output: tc.output,
      isHidden: tc.isHidden,
      isExample: tc.isExample || false
    }))

    return NextResponse.json({
      ...problem,
      testcases: formattedTestCases
    })
  } catch (error) {
    console.error('Error fetching problem by slug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 