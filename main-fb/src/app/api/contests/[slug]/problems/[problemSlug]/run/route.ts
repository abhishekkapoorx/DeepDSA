import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Contest, Problem } from '@/models'
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
    const isRegistered = contest.registrations.some((reg: any) => reg.clerkId === userId)
    if (!isRegistered) {
      return NextResponse.json({ error: 'You must be registered for this contest' }, { status: 403 })
    }

    // Get problem details
    const problem = await Problem.findOne({ slug: problemSlug })
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    const body = await request.json()
    const { code, language } = body

    // Forward to the standard problem run API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/problems/${problemSlug}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    })

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error running contest problem:', error)
    return NextResponse.json(
      { error: 'Failed to run code' },
      { status: 500 }
    )
  }
}

