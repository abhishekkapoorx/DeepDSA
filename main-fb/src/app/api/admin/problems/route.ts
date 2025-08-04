import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
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

    // Validate input variables
    if (!Array.isArray(inputVariables) || inputVariables.length === 0) {
      return NextResponse.json({ error: 'At least one input variable is required' }, { status: 400 })
    }

    for (const inputVar of inputVariables) {
      if (!inputVar.name || !inputVar.type) {
        return NextResponse.json({ error: 'Input variables must have name and type' }, { status: 400 })
      }
    }

    // Validate output variable
    if (!outputVariable.type) {
      return NextResponse.json({ error: 'Output variable type is required' }, { status: 400 })
    }

    // Validate test cases
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json({ error: 'At least one test case is required' }, { status: 400 })
    }

    for (const testCase of testCases) {
      if (!testCase.input || !testCase.output) {
        return NextResponse.json({ error: 'Test cases must have both input and output' }, { status: 400 })
      }
      
      // Validate that input is not empty and is a string
      if (typeof testCase.input !== 'string' || testCase.input.trim() === '') {
        return NextResponse.json({ error: `Invalid input format in test case: ${testCase.name || 'unnamed'}` }, { status: 400 })
      }
      
      // Validate that output is not empty and is a string
      if (typeof testCase.output !== 'string' || testCase.output.trim() === '') {
        return NextResponse.json({ error: `Invalid output format in test case: ${testCase.name || 'unnamed'}` }, { status: 400 })
      }
    }

    // Process tags
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

        // Convert inputVariables and outputVariable to JSON strings
    const inputVariablesString = Array.isArray(inputVariables) 
      ? JSON.stringify(inputVariables.map((inputVar: any) => ({
          name: inputVar.name,
          type: inputVar.type,
          description: inputVar.description || null
        })))
      : typeof inputVariables === 'string' 
        ? inputVariables 
        : JSON.stringify(inputVariables);

    const outputVariableString = typeof outputVariable === 'object' && outputVariable !== null
      ? JSON.stringify({
          type: outputVariable.type,
          description: outputVariable.description || null
        })
      : typeof outputVariable === 'string'
        ? outputVariable
        : JSON.stringify(outputVariable);

    // Create problem with test cases
    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags: tagsArray,
        starterCode,
        functionName,
        hints: hints || [],
        inputVariables: inputVariablesString,
        outputVariable: outputVariableString,
        testCases: {
          create: testCases?.map((testCase: any) => ({
            input: testCase.input,
            output: testCase.output,
            isHidden: testCase.isHidden || false
          })) || []
        }
      },
      include: {
        testCases: true
      }
    })

    return NextResponse.json(problem, { status: 201 })
  } catch (error) {
    console.error('Error creating problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          testCases: {
            select: {
              id: true,
              isHidden: true
            }
          }
        }
      }),
      prisma.problem.count({ where })
    ])

    return NextResponse.json({
      problems,
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