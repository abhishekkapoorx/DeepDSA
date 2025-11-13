import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Problem, TestCase, User, Submission, TestResult } from '@/models'
import { auth } from '@clerk/nextjs/server'

/**
 * POST /api/admin/problems/bulk-delete - Delete multiple problems at once (admin only)
 * Accepts array of problem slugs and performs cascading deletion of all
 * associated data (test cases, submissions, test results). Requires admin authentication.
 */
export async function POST(req: NextRequest) {
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

    const { slugs } = await req.json()

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: 'Invalid request: slugs array is required' }, { status: 400 })
    }

    // Find all problems to be deleted
    const problems = await Problem.find({ slug: { $in: slugs } })
    
    if (problems.length === 0) {
      return NextResponse.json({ error: 'No problems found to delete' }, { status: 404 })
    }

    const problemIds = problems.map(p => p._id)

    // TODO: Implement transaction-based deletion for data consistency
    // Delete all test results for test cases of these problems
    const testCaseIds = await TestCase.find({ problemId: { $in: problemIds } }, '_id').lean()
    if (testCaseIds.length > 0) {
      await TestResult.deleteMany({ 
        testCaseId: { $in: testCaseIds.map(tc => tc._id) } 
      })
    }
    
    // Delete all submissions for these problems
    await Submission.deleteMany({ problemId: { $in: problemIds } })
    
    // Delete all test cases for these problems
    await TestCase.deleteMany({ problemId: { $in: problemIds } })
    
    // Delete all problems
    await Problem.deleteMany({ _id: { $in: problemIds } })

    return NextResponse.json({ 
      message: `Successfully deleted ${problems.length} problem(s) and all associated data`,
      deletedCount: problems.length
    })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 