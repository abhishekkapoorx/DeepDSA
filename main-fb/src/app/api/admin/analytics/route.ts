import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
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

    // Get current date ranges
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Basic counts
    const [
      totalProblems,
      totalUsers,
      totalTestCases,
      problemsByDifficulty,
      recentProblems,
      recentUsers,
      problemsCreatedThisWeek,
      problemsCreatedThisMonth
    ] = await Promise.all([
      // Total counts
      prisma.problem.count(),
      prisma.user.count(),
      prisma.testCase.count(),
      
      // Problems by difficulty
      prisma.problem.groupBy({
        by: ['difficulty'],
        _count: { difficulty: true }
      }),
      
      // Recent activity
      prisma.problem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          difficulty: true,
          createdAt: true
        }
      }),
      
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true
        }
      }),
      
      // Time-based analytics
      prisma.problem.count({
        where: {
          createdAt: { gte: startOfWeek }
        }
      }),
      
      prisma.problem.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      })
    ])

    // Calculate growth rates (mock data for now - you can implement proper historical tracking)
    const weeklyGrowth = problemsCreatedThisWeek
    const monthlyGrowth = problemsCreatedThisMonth

    // Format difficulty stats
    const difficultyStats = problemsByDifficulty.reduce((acc: Record<string, number>, item: any) => {
      acc[item.difficulty] = item._count.difficulty
      return acc
    }, {} as Record<string, number>)

    // Popular tags (mock data - you'd need to implement tag tracking)
    const popularTags = [
      { name: 'Array', count: Math.floor(totalProblems * 0.4) },
      { name: 'Dynamic Programming', count: Math.floor(totalProblems * 0.3) },
      { name: 'Tree', count: Math.floor(totalProblems * 0.25) },
      { name: 'Graph', count: Math.floor(totalProblems * 0.2) },
      { name: 'String', count: Math.floor(totalProblems * 0.35) }
    ]

    const analytics = {
      overview: {
        totalProblems,
        totalUsers,
        totalTestCases,
        weeklyGrowth,
        monthlyGrowth
      },
      difficulty: {
        EASY: difficultyStats.EASY || 0,
        MEDIUM: difficultyStats.MEDIUM || 0,
        HARD: difficultyStats.HARD || 0
      },
      recent: {
        problems: recentProblems,
        users: recentUsers
      },
      trends: {
        problemsThisWeek: problemsCreatedThisWeek,
        problemsThisMonth: problemsCreatedThisMonth
      },
      popularTags
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}