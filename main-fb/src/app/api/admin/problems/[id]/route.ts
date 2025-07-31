import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      include: {
        testCases: true
      }
    })

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    return NextResponse.json(problem)
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

    // Process tags
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : tags

    // Delete existing test cases and create new ones
    await prisma.testCase.deleteMany({
      where: { problemId: params.id }
    })

    const problem = await prisma.problem.update({
      where: { id: params.id },
      data: {
        title,
        description,
        difficulty,
        tags: tagsArray,
        starterCode,
        functionName,
        inputVariables,
        outputVariable,
        hints: hints || [],
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

    return NextResponse.json(problem)
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

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Delete test cases first (due to foreign key constraint)
    await prisma.testCase.deleteMany({
      where: { problemId: params.id }
    })

    // Delete the problem
    await prisma.problem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Problem deleted successfully' })
  } catch (error) {
    console.error('Error deleting problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}