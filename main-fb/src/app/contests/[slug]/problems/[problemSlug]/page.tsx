"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, Play, Send } from 'lucide-react'
import MonacoEditor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import type { Problem } from '@/components/problems'

const ContestProblemPage = () => {
  const params = useParams()
  const slug = params.slug as string
  const problemSlug = params.problemSlug as string
  
  const [contest, setContest] = useState<any>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(new Date())
  const [contestProblem, setContestProblem] = useState<any>(null)
  
  // Code editor state
  const [code, setCode] = useState<string>('')
  const [language, setLanguage] = useState<string>('java')
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])
  const editorRef = useRef<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch contest details
        const contestResponse = await fetch(`/api/contests/${slug}`)
        if (!contestResponse.ok) throw new Error('Failed to fetch contest')
        const contestData = await contestResponse.json()
        setContest(contestData)
        
        // Find the problem in contest
        const cp = contestData.problems.find((p: any) => p.problemSlug === problemSlug)
        if (!cp) throw new Error('Problem not found in contest')
        setContestProblem(cp)
        
        // Fetch problem details
        const problemResponse = await fetch(`/api/problems/${problemSlug}`)
        if (!problemResponse.ok) throw new Error('Failed to fetch problem')
        const problemData = await problemResponse.json()
        setProblem(problemData)
        
        // Load boilerplate code
        const boilerplateResponse = await fetch(`/api/problems/${problemSlug}/boilerplate?language=${language}`)
        if (boilerplateResponse.ok) {
          const boilerplateData = await boilerplateResponse.json()
          setCode(boilerplateData.data.boilerplate || '')
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problem')
      } finally {
        setLoading(false)
      }
    }

    if (slug && problemSlug) {
      fetchData()
    }
  }, [slug, problemSlug])

  // Fetch boilerplate when language changes
  useEffect(() => {
    const fetchBoilerplate = async () => {
      if (!problemSlug || !language) return
      
      try {
        const response = await fetch(`/api/problems/${problemSlug}/boilerplate?language=${language}`)
        if (response.ok) {
          const data = await response.json()
          setCode(data.data.boilerplate || '')
        }
      } catch (err) {
        console.error('Error fetching boilerplate:', err)
      }
    }

    fetchBoilerplate()
  }, [language, problemSlug])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getTimeRemaining = () => {
    if (!contest) return { hours: 0, minutes: 0, seconds: 0 }
    const end = new Date(contest.endTime)
    const remaining = Math.max(0, end.getTime() - now.getTime())
    
    const hours = Math.floor(remaining / 3600000)
    const minutes = Math.floor((remaining % 3600000) / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    
    return { hours, minutes, seconds }
  }

  const pad = (n: number) => n.toString().padStart(2, '0')

  const handleRun = async () => {
    setIsRunning(true)
    setResults(null)
    setTestResults([])
    try {
      const response = await fetch(`/api/contests/${slug}/problems/${problemSlug}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        // Extract test results from response
        if (data.results && Array.isArray(data.results)) {
          setTestResults(data.results)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to run code')
      }
    } catch (err) {
      alert('Failed to run code')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Submit solution? This will count towards your contest score.')) return
    
    setIsSubmitting(true)
    setResults(null)
    try {
      const response = await fetch(`/api/contests/${slug}/problems/${problemSlug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        alert(`Submitted! Score: ${data.score || 0}/${contestProblem.points} points`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to submit')
      }
    } catch (err) {
      alert('Failed to submit solution')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading problem...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !problem || !contest) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-500">{error || 'Problem not found'}</p>
            <a href={`/contests/${slug}/test`} className="mt-4 inline-block text-primary hover:underline">
              Back to Contest
            </a>
          </div>
        </div>
      </div>
    )
  }

  const { hours, minutes, seconds } = getTimeRemaining()
  const isExpired = hours === 0 && minutes === 0 && seconds === 0

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header Bar */}
        <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href={`/contests/${slug}/test`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </a>
            <h1 className="text-xl font-bold text-foreground">{problem.title}</h1>
            <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
              {contestProblem.points} pts
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {isExpired ? (
                <span className="text-lg font-bold text-red-600">Time's Up!</span>
              ) : (
                <span className="text-lg font-bold text-primary">
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
          {/* Left: Problem Description */}
          <div className="bg-card border border-border rounded-lg overflow-y-auto">
            <div className="p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Middle: Test Cases */}
          <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Test Cases</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {problem.testcases && problem.testcases.length > 0 ? (
                <div className="space-y-3">
                  {problem.testcases.map((testcase: any, index: number) => {
                    const result = testResults[index]
                    const passed = result?.passed || false
                    const status = result ? (passed ? 'passed' : 'failed') : 'pending'
                    
                    return (
                      <div key={index} className="border border-border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            Test Case {index + 1}
                          </span>
                          {result && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              passed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {passed ? '✓ Passed' : '✗ Failed'}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground mb-1">Input:</div>
                            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                              {testcase.input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Output:</div>
                            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                              {testcase.output}
                            </pre>
                          </div>
                        </div>
                        {result && !passed && result.actualOutput && (
                          <div className="mt-2">
                            <div className="text-muted-foreground mb-1 text-xs">Your Output:</div>
                            <pre className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs overflow-x-auto">
                              {result.actualOutput}
                            </pre>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No test cases available
                </div>
              )}
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="bg-card border border-border rounded-lg flex flex-col overflow-hidden">
            {/* Editor Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Solution</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <MonacoEditor
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-border flex gap-3">
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            {/* Results Summary */}
            {results && (
              <div className="p-4 border-t border-border bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm">Summary</h3>
                  {results.passed !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      results.passed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {results.passed ? 'All Tests Passed!' : 'Some Tests Failed'}
                    </span>
                  )}
                </div>
                {results.results && (
                  <div className="text-xs text-muted-foreground">
                    {results.results.filter((r: any) => r.passed).length} / {results.results.length} test cases passed
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestProblemPage

