import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Problem, TestCase, User, generateSlug } from '@/models'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect()

    const problem = await Problem.findOne({ slug: params.slug })
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    const testCases = await TestCase.find({ problemId: problem._id })

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
  { params }: { params: { slug: string } }
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

    // Find the problem first
    const existingProblem = await Problem.findOne({ slug: params.slug })
    if (!existingProblem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Generate new slug if title changed
    let newSlug = params.slug
    if (title && title !== existingProblem.title) {
      newSlug = generateSlug(title)
      
      // Check if new slug already exists (excluding current problem)
      let counter = 1
      let originalSlug = newSlug
      while (await Problem.findOne({ slug: newSlug, _id: { $ne: existingProblem._id } })) {
        newSlug = `${originalSlug}-${counter}`
        counter++
      }
    }

    // Process tags
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : tags

    // Delete existing test cases
    await TestCase.deleteMany({ problemId: existingProblem._id })

    // Update the problem
    const updatedProblem = await Problem.findByIdAndUpdate(
      existingProblem._id,
      {
        title,
        slug: newSlug,
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
        problemId: existingProblem._id
      }))
      
      await TestCase.insertMany(testCaseDocs)
    }

    // Fetch updated problem with test cases
    const finalTestCases = await TestCase.find({ problemId: existingProblem._id })

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
  { params }: { params: { slug: string } }
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

    // Find the problem first
    const problem = await Problem.findOne({ slug: params.slug })
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Delete test cases first
    await TestCase.deleteMany({ problemId: problem._id })

    // Delete the problem
    await Problem.findByIdAndDelete(problem._id)

    return NextResponse.json({ message: 'Problem deleted successfully' })
  } catch (error) {
    console.error('Error deleting problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 