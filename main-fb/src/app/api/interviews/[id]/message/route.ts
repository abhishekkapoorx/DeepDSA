import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDB } from '@/lib/mongoose';
import Interview from '@/models/interview.model';
import { aiChat, type AIMessage } from '@/lib/ai';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params; // ✅ Await params first
    await connectToDB()
    const interview = await Interview.findById(id)
    if (!interview || interview.clerkId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (interview.endedAt) {
      return NextResponse.json({ error: 'Interview already ended' }, { status: 400 })
    }

    const body = await req.json()
    const content: string = (body?.content || '').toString().slice(0, 4000)
    if (!content) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    interview.messages.push({ role: 'user', content, timestamp: new Date() })

    const history: AIMessage[] = interview.messages.map((m: any) => ({ role: m.role, content: m.content }))
    
    // Fetch problem data if we have a problem slug for better AI context
    let problemContext = {};
    if (interview.problemSlug) {
      try {
        const problemRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/problems/${interview.problemSlug}`);
        if (problemRes.ok) {
          const problemData = await problemRes.json();
          problemContext = {
            problemTitle: problemData.title,
            problemStatement: problemData.description
          };
        }
      } catch (error) {
        console.warn('Failed to fetch problem context:', error);
        // Fallback to slug-based context
        problemContext = {
          problemTitle: interview.problemSlug,
          problemStatement: interview.problemSlug
        };
      }
    }
    
    const assistantReply = await aiChat(interview.provider, history, problemContext)
    interview.messages.push({ role: 'assistant', content: assistantReply, timestamp: new Date() })
    await interview.save()

    return NextResponse.json({ message: { content: assistantReply, timestamp: new Date() } })
  } catch (e) {
    console.error('Error sending message', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

