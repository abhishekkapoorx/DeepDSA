import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Debug endpoint - no auth required
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        imageUrl: true,
        role: true,
        createdAt: true,
      }
    })

    const total = await prisma.user.count()

    console.log('🐛 Debug - All users in DB:', { users: users.length, total })

    return NextResponse.json({
      users,
      total,
      message: 'Debug endpoint - showing all users'
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 