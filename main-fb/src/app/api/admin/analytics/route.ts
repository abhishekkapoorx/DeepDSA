import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Problem, User, TestCase } from '@/models'
import { auth } from '@clerk/nextjs/server'

/**
 * GET /api/admin/analytics - Fetch platform analytics for admin dashboard
 * Returns overview stats (total problems, users, test cases), difficulty breakdown,
 * recent activity, trends, and popular tags. Requires admin authentication.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Check if user has admin privileges
    const user = await User.findOne({ clerkId: userId })
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
      Problem.countDocuments(),
      User.countDocuments(),
      TestCase.countDocuments(),
      
      // Problems by difficulty
      Problem.aggregate([
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent activity
      Problem.find()
        .select('title difficulty createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      User.find()
        .select('firstName lastName email createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      // Time-based analytics
      Problem.countDocuments({
        createdAt: { $gte: startOfWeek }
      }),
      
      Problem.countDocuments({
        createdAt: { $gte: startOfMonth }
      })
    ])

    // Calculate growth rates (mock data for now - you can implement proper historical tracking)
    const weeklyGrowth = problemsCreatedThisWeek
    const monthlyGrowth = problemsCreatedThisMonth

    // Format difficulty stats
    const difficultyStats = problemsByDifficulty.reduce((acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count
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