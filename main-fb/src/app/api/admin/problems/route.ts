import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Problem, TestCase, User } from '@/models'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
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

    // Validate required fields
    if (!title || !description || !difficulty || !starterCode || !functionName || !inputVariables || !outputVariable) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Process tags
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

    // Create problem
    const problem = new Problem({
      title,
      description,
      difficulty,
      tags: tagsArray,
      starterCode,
      functionName,
      inputVariables,
      outputVariable,
      hints: hints || [],
    })
    
    await problem.save()

    // Create test cases if provided
    if (testCases && testCases.length > 0) {
      const testCaseDocs = testCases.map((testCase: any) => ({
        input: testCase.input,
        output: testCase.output,
        isHidden: testCase.isHidden || false,
        problemId: problem._id
      }))
      
      await TestCase.insertMany(testCaseDocs)
    }

    // Fetch the created problem with test cases
    const createdProblem = await Problem.findById(problem._id)
    const problemTestCases = await TestCase.find({ problemId: problem._id })

    if (!createdProblem) {
      return NextResponse.json({ error: 'Failed to create problem' }, { status: 500 })
    }

    return NextResponse.json({
      ...createdProblem.toObject(),
      testCases: problemTestCases
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build query filter
    const filter: any = {}
    
    if (difficulty && difficulty !== 'ALL') {
      filter.difficulty = difficulty
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } }
      ]
    }

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Problem.countDocuments(filter)
    ])

    // Get test case counts for each problem
    const problemsWithTestCases = await Promise.all(
      problems.map(async (problem) => {
        const testCases = await TestCase.find({ problemId: problem._id })
        return {
          ...problem,
          testCases: testCases.map(tc => ({ id: tc._id, isHidden: tc.isHidden }))
        }
      })
    )

    return NextResponse.json({
      problems: problemsWithTestCases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching problems:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}