import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Problem, TestCase, User } from '@/models'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const problem = await Problem.findById(params.id)
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    const testCases = await TestCase.find({ problemId: params.id })

    return NextResponse.json({
      ...problem.toObject(),
      testCases
    })
  } catch (error) {
    console.error('Error fetching problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      description,
      difficulty,
      tags,
      starterCode,
      functionName,
      inputVariables,
      outputVariable,
      hints,
      testCases
    } = body

    // Process tags
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : tags

    // Delete existing test cases
    await TestCase.deleteMany({ problemId: params.id })

    // Update the problem
    const updatedProblem = await Problem.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        difficulty,
        tags: tagsArray,
        starterCode,
        functionName,
        inputVariables,
        outputVariable,
        hints: hints || [],
      },
      { new: true }
    )

    if (!updatedProblem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Create new test cases if provided
    if (testCases && testCases.length > 0) {
      const testCaseDocs = testCases.map((testCase: any) => ({
        input: testCase.input,
        output: testCase.output,
        isHidden: testCase.isHidden || false,
        problemId: params.id
      }))
      
      await TestCase.insertMany(testCaseDocs)
    }

    // Fetch updated problem with test cases
    const finalTestCases = await TestCase.find({ problemId: params.id })

    return NextResponse.json({
      ...updatedProblem.toObject(),
      testCases: finalTestCases
    })
  } catch (error) {
    console.error('Error updating problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Delete test cases first
    await TestCase.deleteMany({ problemId: params.id })

    // Delete the problem
    const deletedProblem = await Problem.findByIdAndDelete(params.id)
    
    if (!deletedProblem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Problem deleted successfully' })
  } catch (error) {
    console.error('Error deleting problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}