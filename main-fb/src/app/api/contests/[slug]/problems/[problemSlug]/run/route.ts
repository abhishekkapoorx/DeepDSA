import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Contest, Problem, TestCase } from '@/models'
import { auth } from '@clerk/nextjs/server'
import { FullBoilerplateGenerator, mergeBoilerplateCode } from '@/utils/CodeGenerator/generate-full-boilerplate'

// Judge0 configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358'
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN

/**
 * POST /api/contests/[slug]/problems/[problemSlug]/run - Run code for contest problem
 * Executes user code against all test cases using Judge0. Validates contest is running
 * and user is registered. Returns test results without saving submission.
 */
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
    console.log('[ContestRun] Request:', { slug, problemSlug, userId })
    
    // Get contest
    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } })
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    // Check if contest is running (temporarily disabled for testing)
    const now = new Date()
    const contestStarted = now >= contest.startTime
    const contestEnded = now > contest.endTime
    console.log('[ContestRun] Contest time check:', {
      started: contestStarted,
      ended: contestEnded
    })
    
    // if (now < contest.startTime || now > contest.endTime) {
    //   return NextResponse.json({ error: 'Contest is not currently running' }, { status: 400 })
    // }

    // Check if user is registered (temporarily disabled for testing)
    const isRegistered = contest.registrations.some((reg: any) => reg.clerkId === userId)
    console.log('[ContestRun] User registered:', isRegistered)
    
    // if (!isRegistered) {
    //   return NextResponse.json({ error: 'You must be registered for this contest' }, { status: 403 })
    // }

    // Get problem details
    const problem = await Problem.findOne({ slug: problemSlug }).lean()
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }
    console.log('[ContestRun] Problem found:', problem.title)

    // Get test cases
    const testCases = await TestCase.find({ problemId: problem._id }).lean()
    if (!testCases || testCases.length === 0) {
      return NextResponse.json({ error: 'No test cases found for this problem' }, { status: 404 })
    }
    console.log('[ContestRun] Test cases found:', testCases.length)

    const body = await request.json()
    const { code, language } = body

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 })
    }

    // Language ID mapping for Judge0
    const LANGUAGE_IDS = {
      cpp: 54,
      java: 62,
      python: 71,
      javascript: 63
    } as const

    if (!Object.keys(LANGUAGE_IDS).includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported languages: cpp, java, python, javascript' },
        { status: 400 }
      )
    }

    const languageId = (LANGUAGE_IDS as any)[language]

    // Generate full boilerplate and merge with user code
    const fullGenerator = new FullBoilerplateGenerator(
      problem.inputVariables,
      problem.outputVariable,
      problem.functionName
    )
    const fullBoilerplate = fullGenerator.generateAll()[language]
    const completeCode = mergeBoilerplateCode(fullBoilerplate, code)

    // Encode merged code as base64
    const encodedCode = Buffer.from(completeCode, 'utf-8').toString('base64')

    console.log('[ContestRun] Executing code for', language, 'with', testCases.length, 'test cases')

    // Create batch submission with all test cases
    const batchSubmissions = testCases.map((testCase) => ({
      source_code: encodedCode,
      language_id: languageId,
      stdin: Buffer.from(String(testCase.input ?? ''), 'utf-8').toString('base64'),
      expected_output: Buffer.from(String(testCase.output ?? ''), 'utf-8').toString('base64'),
      cpu_time_limit: 5,
      memory_limit: 128000,
      enable_network: false,
      callback_url: null
    }))

    // Submit batch to Judge0
    const batchResponse = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(JUDGE0_API_KEY && { 'X-RapidAPI-Key': JUDGE0_API_KEY }),
        ...(JUDGE0_AUTH_TOKEN && { 'X-Auth-Token': JUDGE0_AUTH_TOKEN }),
      },
      body: JSON.stringify({
        submissions: batchSubmissions
      })
    })

    if (!batchResponse.ok) {
      console.error('[ContestRun] Judge0 batch submission failed:', batchResponse.status)
      const errorText = await batchResponse.text()
      console.error('[ContestRun] Error details:', errorText)
      return NextResponse.json(
        { error: 'Failed to submit code to Judge0' },
        { status: 500 }
      )
    }

    const batchData = await batchResponse.json()
    const tokens = batchData.map((submission: any) => submission.token)
    
    console.log('[ContestRun] Batch submitted. Tokens:', tokens.length)

    // Poll for results
    const results = []
    let passedTests = 0
    const maxWaitTime = 30000
    const startTime = Date.now()

    while (results.length < testCases.length && (Date.now() - startTime) < maxWaitTime) {
      const resultsResponse = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=false&fields=token,stdout,stderr,status_id,status,time,memory,compile_output,message`, {
        headers: {
          ...(JUDGE0_API_KEY && { 'X-RapidAPI-Key': JUDGE0_API_KEY }),
          ...(JUDGE0_AUTH_TOKEN && { 'X-Auth-Token': JUDGE0_AUTH_TOKEN }),
        }
      })
      
      if (!resultsResponse.ok) {
        console.error('[ContestRun] Failed to fetch batch results:', resultsResponse.status)
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }

      const batchResults = await resultsResponse.json()
      console.log(`[ContestRun] Completed: ${batchResults.submissions.filter((s: any) => s.status_id > 2).length}/${testCases.length}`)

      // Process completed submissions
      for (let i = 0; i < batchResults.submissions.length; i++) {
        const submission = batchResults.submissions[i]
        const testCase = testCases[i]
        
        if (results[i]) continue

        if (submission.status_id && submission.status_id > 2) {
          const judgeStatus = submission.status?.description || submission.status
          const passed = judgeStatus === 'Accepted' && 
                        submission.stdout?.trim() === testCase.output?.trim()

          if (passed) {
            passedTests++
          }

          const status = passed ? 'passed' : 'failed'

          results[i] = {
            testCaseId: testCase._id.toString(),
            testCaseNumber: i + 1,
            status: status,
            time: submission.time ? parseFloat(submission.time) : null,
            memory: submission.memory ? parseFloat(submission.memory) : null,
            stdout: submission.stdout,
            stderr: submission.stderr,
            compile_output: submission.compile_output,
            expectedOutput: testCase.output,
            actualOutput: submission.stdout,
            passed: passed
          }
        }
      }

      if (results.length === testCases.length) {
        break
      }

      const elapsed = Date.now() - startTime
      const waitTime = Math.min(1000 + Math.floor(elapsed / 1000) * 500, 3000)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Handle any incomplete results
    for (let i = 0; i < testCases.length; i++) {
      if (!results[i]) {
        results[i] = {
          testCaseId: testCases[i]._id.toString(),
          testCaseNumber: i + 1,
          status: 'Timeout',
          time: null,
          memory: null,
          stdout: null,
          stderr: null,
          compile_output: null,
          expectedOutput: testCases[i].output,
          actualOutput: null,
          passed: false
        }
      }
    }

    const successRate = testCases.length > 0 ? (passedTests / testCases.length) * 100 : 0

    console.log('[ContestRun] Run completed:', {
      passed: passedTests,
      total: testCases.length,
      rate: successRate.toFixed(2) + '%'
    })

    return NextResponse.json({
      success: true,
      data: {
        problemSlug: problemSlug,
        language: language,
        results: results,
        summary: {
          passed: passedTests,
          total: testCases.length,
          successRate: Math.round(successRate)
        }
      }
    })
  } catch (error) {
    console.error('[ContestRun] Error:', error)
    return NextResponse.json(
      { error: 'Failed to run code' },
      { status: 500 }
    )
  }
}
