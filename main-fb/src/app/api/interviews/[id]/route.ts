import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Interview } from '@/models'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params; // ✅ Await params first
    await dbConnect()
    const interview = await Interview.findById(id).lean()
    if (!interview || interview.clerkId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(interview)
  } catch (e) {
    console.error('Error fetching interview', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

