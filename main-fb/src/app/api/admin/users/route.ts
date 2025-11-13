import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User, Role } from '@/models'
import { auth } from '@clerk/nextjs/server'

/**
 * GET /api/admin/users - Fetch paginated list of users (admin only)
 * Supports filtering by role and search query. Returns user list with
 * pagination information. Requires admin authentication.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    console.log('🔍 Auth userId:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const user = await User.findOne({ clerkId: userId })
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      console.log('❌ Access denied - User role:', user?.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build query filter
    const filter: any = {}
    
    if (role && role !== 'ALL') {
      filter.role = role
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('clerkId email firstName lastName username imageUrl role createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}