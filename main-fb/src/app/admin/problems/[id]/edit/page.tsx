'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import MarkdownEditor from '@/components/ui/MarkdownEditor'

interface TestCase {
  id: string
  input: string
  output: string
  isHidden: boolean
}

interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  starterCode: string
  functionName: string
  inputVariables: string
  outputVariable: string
  hints: string[]
  testCases: TestCase[]
}

const EditProblemPage = () => {
  const params = useParams()
  const router = useRouter()
  const problemId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
    tags: '',
    starterCode: '',
    functionName: '',
    inputVariables: '',
    outputVariable: '',
    hints: ['']
  })
  
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', input: '', output: '', isHidden: false }
  ])

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`/api/admin/problems/${problemId}`)
        if (response.ok) {
          const problemData = await response.json()
          setProblem(problemData)
          
          // Populate form data
          setFormData({
            title: problemData.title,
            description: problemData.description,
            difficulty: problemData.difficulty,
            tags: problemData.tags.join(', '),
            starterCode: problemData.starterCode,
            functionName: problemData.functionName,
            inputVariables: problemData.inputVariables,
            outputVariable: problemData.outputVariable,
            hints: problemData.hints.length ? problemData.hints : ['']
          })
          
          setTestCases(problemData.testCases.length ? problemData.testCases : [
            { id: '1', input: '', output: '', isHidden: false }
          ])
        } else {
          alert('Problem not found')
          router.push('/admin/problems')
        }
      } catch (error) {
        console.error('Error fetching problem:', error)
        alert('Error loading problem')
      } finally {
        setLoading(false)
      }
    }

    if (problemId) {
      fetchProblem()
    }
  }, [problemId, router])

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: '',
      output: '',
      isHidden: false
    }
    setTestCases([...testCases, newTestCase])
  }

  const removeTestCase = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter(tc => tc.id !== id))
    }
  }

  const updateTestCase = (id: string, field: keyof TestCase, value: string | boolean) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ))
  }

  const addHint = () => {
    setFormData({
      ...formData,
      hints: [...formData.hints, '']
    })
  }

  const removeHint = (index: number) => {
    if (formData.hints.length > 1) {
      setFormData({
        ...formData,
        hints: formData.hints.filter((_, i) => i !== index)
      })
    }
  }

  const updateHint = (index: number, value: string) => {
    const newHints = [...formData.hints]
    newHints[index] = value
    setFormData({
      ...formData,
      hints: newHints
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          testCases: testCases.map(tc => ({
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden
          }))
        }),
      })

      if (response.ok) {
        alert('Problem updated successfully!')
        router.push('/admin/problems')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating problem:', error)
      alert('Failed to update problem. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/problems" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Edit Problem</h1>
          <p className="text-muted-foreground mt-2">Update the coding problem details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Two Sum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., array, hash-table, two-pointers"
                />
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Problem Description</h2>
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Write your problem description in Markdown format..."
              rows={12}
            />
          </div>

          {/* Function Details */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Function Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Function Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.functionName}
                  onChange={(e) => setFormData({...formData, functionName: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="e.g., twoSum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Input Variables *
                </label>
                <input
                  type="text"
                  required
                  value={formData.inputVariables}
                  onChange={(e) => setFormData({...formData, inputVariables: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="e.g., nums: number[], target: number"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Output Variable *
                </label>
                <input
                  type="text"
                  required
                  value={formData.outputVariable}
                  onChange={(e) => setFormData({...formData, outputVariable: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="e.g., number[]"
                />
              </div>
            </div>
          </div>

          {/* Starter Code */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Starter Code</h2>
            <textarea
              required
              value={formData.starterCode}
              onChange={(e) => setFormData({...formData, starterCode: e.target.value})}
              rows={8}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder={`function twoSum(nums, target) {
    // Your code here
}`}
            />
          </div>

          {/* Hints */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Hints</h2>
              <button
                type="button"
                onClick={addHint}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Hint
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.hints.map((hint, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Hint ${index + 1}`}
                  />
                  {formData.hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Test Cases</h2>
              <button
                type="button"
                onClick={addTestCase}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Test Case
              </button>
            </div>
            
            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={testCase.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">Test Case {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateTestCase(testCase.id, 'isHidden', !testCase.isHidden)}
                        className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                          testCase.isHidden 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {testCase.isHidden ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                        {testCase.isHidden ? 'Hidden' : 'Public'}
                      </button>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(testCase.id)}
                          className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Input
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(testCase.id, 'input', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        placeholder="Enter input as JSON..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Expected Output
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => updateTestCase(testCase.id, 'output', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        placeholder="Enter expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/problems">
              <button
                type="button"
                className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Problem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProblemPage