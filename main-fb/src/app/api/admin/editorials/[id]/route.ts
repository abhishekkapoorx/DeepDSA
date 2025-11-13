import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Editorial } from '@/models'
import { auth } from '@clerk/nextjs/server'

/**
 * GET /api/admin/editorials/[id] - Fetch a specific editorial by ID (admin only)
 * Returns editorial details with populated problem information.
 * Requires admin authentication.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const { User } = await import('@/models')
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const editorial = await Editorial.findById(id)
      .populate('problemId', 'title slug questionNumber difficulty')
      .lean()

    if (!editorial) {
      return NextResponse.json({ error: 'Editorial not found' }, { status: 404 })
    }

    return NextResponse.json(editorial)
  } catch (error) {
    console.error('Error fetching editorial:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/editorials/[id] - Update an existing editorial (admin only)
 * Updates editorial content including approaches, follow-up questions, and publish status.
 * Validates required fields and requires admin authentication.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const { User } = await import('@/models')
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { title, overview, approaches, followUpQuestions, relatedProblems, isPublished } = body

    // Validate required fields
    if (!title || !overview || !approaches || !Array.isArray(approaches) || approaches.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { id } = await params
    const editorial = await Editorial.findByIdAndUpdate(
      id,
      {
        title,
        overview,
        approaches,
        followUpQuestions: followUpQuestions || [],
        relatedProblems: relatedProblems || [],
        isPublished: isPublished || false,
      },
      { new: true, runValidators: true }
    ).populate('problemId', 'title slug questionNumber difficulty')

    if (!editorial) {
      return NextResponse.json({ error: 'Editorial not found' }, { status: 404 })
    }

    return NextResponse.json(editorial)
  } catch (error) {
    console.error('Error updating editorial:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/editorials/[id] - Delete an editorial (admin only)
 * Permanently deletes the editorial from the database.
 * Requires admin authentication.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const { User } = await import('@/models')
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const editorial = await Editorial.findByIdAndDelete(id)

    if (!editorial) {
      return NextResponse.json({ error: 'Editorial not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Editorial deleted successfully' })
  } catch (error) {
    console.error('Error deleting editorial:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
