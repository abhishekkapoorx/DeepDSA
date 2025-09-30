import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Interview } from '@/models'
import { auth } from '@clerk/nextjs/server'
import { aiScore, buildScoringPrompt } from '@/lib/ai'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params; // ✅ Await params first
    await dbConnect();
    const interview = await Interview.findOne({ _id: id, clerkId: userId });
    if (!interview) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (interview.endedAt) {
      return NextResponse.json({ error: 'Already finalized' }, { status: 400 })
    }

    // Build transcript from user messages only (token efficient)
    const transcript = interview.messages
      .filter((m: any) => m.role === 'user')
      .map((m: any, idx: number) => `${idx + 1}. ${m.content}`)
      .join('\n')
      .slice(0, 6000)

    const prompt = buildScoringPrompt(transcript)
    const result = await aiScore(interview.provider, prompt)

    interview.score = Math.max(0, Math.min(10, Math.round(result.score)))
    interview.scoreBreakdown = result.breakdown as any
    interview.suggestions = result.suggestions?.slice(0, 5) || []
    interview.improvements = result.improvements?.slice(0, 5) || []
    interview.mistakes = result.mistakes?.slice(0, 5) || []
    interview.summary = result.summary || ''
    interview.endedAt = new Date()
    await interview.save()

    return NextResponse.json({
      score: interview.score,
      breakdown: interview.scoreBreakdown,
      suggestions: interview.suggestions,
      improvements: interview.improvements,
      mistakes: interview.mistakes,
      summary: interview.summary,
    })
  } catch (e) {
    console.error('Error finalizing interview', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


