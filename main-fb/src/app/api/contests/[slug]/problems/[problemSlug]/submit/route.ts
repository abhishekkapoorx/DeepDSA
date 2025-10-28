import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Contest, Problem, Submission, TestResult } from '@/models'
import { auth } from '@clerk/nextjs/server'

export async function POST(
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

    // Check if contest is running
    const now = new Date()
    if (now < contest.startTime || now > contest.endTime) {
      return NextResponse.json({ error: 'Contest is not currently running' }, { status: 400 })
    }

    // Check if user is registered
    const registration = contest.registrations.find((reg: any) => reg.clerkId === userId)
    if (!registration) {
      return NextResponse.json({ error: 'You must be registered for this contest' }, { status: 403 })
    }

    // Get problem details
    const problem = await Problem.findOne({ slug: problemSlug })
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Find contest problem to get points
    const contestProblem = contest.problems.find((p: any) => p.problemSlug === problemSlug)
    if (!contestProblem) {
      return NextResponse.json({ error: 'Problem not in contest' }, { status: 404 })
    }

    const body = await request.json()
    const { code, language } = body

    // Forward to the standard problem submit API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/problems/${problemSlug}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    })

    const submitData = await response.json()
    
    // Create submission record for contest
    const submission = new Submission({
      problemId: problem._id,
      userId: userId,
      code,
      language,
      status: submitData.data?.passed ? 'accepted' : 'wrong_answer',
      passed: submitData.data?.passed || false,
      createdAt: new Date()
    })
    await submission.save()

    // Calculate score based on test cases passed
    const totalTests = (problem as any).testcases?.length || 0
    const passedTests = submitData.data?.results?.filter((r: any) => r.passed).length || 0
    const score = totalTests > 0 ? Math.floor((passedTests / totalTests) * contestProblem.points) : 0

    // Update registration with score
    if (registration.score === undefined) registration.score = 0
    if (registration.problemsSolved === undefined) registration.problemsSolved = 0
    
    // Only increase score if this is a better submission
    if (score > (registration.score || 0)) {
      registration.score = score
    }
    
    // Mark problem as solved if all tests passed
    if (submitData.data?.passed) {
      registration.problemsSolved = (registration.problemsSolved || 0) + 1
    }

    await contest.save()
    
    return NextResponse.json({
      ...submitData,
      score,
      points: contestProblem.points,
      passedTests,
      totalTests
    })
  } catch (error) {
    console.error('Error submitting contest problem:', error)
    return NextResponse.json(
      { error: 'Failed to submit solution' },
      { status: 500 }
    )
  }
}

