'use client'

import React, { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import MarkdownEditor from '@/components/ui/MarkdownEditor'

interface TestCase {
  id: string
  name: string
  description: string
  input: string
  output: string
  isHidden: boolean
  isExample: boolean
}

interface InputVariable {
  id: string
  name: string
  type: string
  description: string
}

interface OutputVariable {
  type: string
  description: string
}

const CreateProblemPage = () => {
  const [formData, setFormData] = useState({
    title: 'Sum of Three Numbers',
    description: `### Problem Description

Write a function that takes **three integers** as input and returns their **sum**.

This is a basic implementation problem designed for beginners to get familiar with function inputs and return values.

### Constraints
- -10⁹ ≤ a, b, c ≤ 10⁹

### Example
#### Input
\`\`\`json
{
  "a": 5,
  "b": 10,
  "c": 15
}
\`\`\`

#### Output
\`\`\`json
30
\`\`\``,
    difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
    tags: 'math, basic, integers',
    starterCode: `function sumOfThree(a, b, c) {
    // Your code here
    // Return the sum of a, b, and c
    return 0;
}`,
    functionName: 'sumOfThree',
    hints: [
      'Just return a + b + c.',
      'Make sure you are returning an integer.'
    ]
  })
  
  const [inputVariables, setInputVariables] = useState<InputVariable[]>([
    { id: '1', name: 'a', type: 'number', description: 'First integer' },
    { id: '2', name: 'b', type: 'number', description: 'Second integer' },
    { id: '3', name: 'c', type: 'number', description: 'Third integer' }
  ])
  
  const [outputVariable, setOutputVariable] = useState<OutputVariable>({
    type: 'number',
    description: 'Sum of the three integers'
  })
  
  const [testCases, setTestCases] = useState<TestCase[]>([
    { 
      id: '1', 
      name: 'Example Test Case 1',
      description: 'Basic example with small numbers',
      input: '5 10 15', 
      output: '30', 
      isHidden: false,
      isExample: true
    },
    { 
      id: '2', 
      name: 'Test Case 2',
      description: 'Another example with different numbers',
      input: '1 2 3', 
      output: '6', 
      isHidden: false,
      isExample: false
    },
    { 
      id: '3', 
      name: 'Test Case 3',
      description: 'Test with negative numbers',
      input: '-5 10 -3', 
      output: '2', 
      isHidden: false,
      isExample: false
    }
  ])

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      name: `Test Case ${testCases.length + 1}`,
      description: '',
      input: '',
      output: '',
      isHidden: false,
      isExample: false
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

  const addInputVariable = () => {
    const newInputVar: InputVariable = {
      id: Date.now().toString(),
      name: '',
      type: '',
      description: ''
    }
    setInputVariables([...inputVariables, newInputVar])
  }

  const removeInputVariable = (id: string) => {
    if (inputVariables.length > 1) {
      setInputVariables(inputVariables.filter(iv => iv.id !== id))
    }
  }

  const updateInputVariable = (id: string, field: keyof InputVariable, value: string) => {
    setInputVariables(inputVariables.map(iv => 
      iv.id === id ? { ...iv, [field]: value } : iv
    ))
  }

  const updateOutputVariable = (field: keyof OutputVariable, value: string) => {
    setOutputVariable({
      ...outputVariable,
      [field]: value
    })
  }

  const addExampleTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      name: 'Example Test Case',
      description: 'Example test case for demonstration',
      input: '',
      output: '',
      isHidden: false,
      isExample: true
    }
    setTestCases([...testCases, newTestCase])
  }

  const getTestCaseExamples = () => {
    return {
      sumOfThree: {
        name: 'Sum of Three Numbers',
        description: 'Add three integers together',
        input: '5 10 15',
        output: '30'
      },
      twoSum: {
        name: 'Two Sum Example',
        description: 'Find two numbers that add up to target',
        input: '[2,7,11,15] 9',
        output: '[0,1]'
      },
      palindrome: {
        name: 'Palindrome Example',
        description: 'Check if string is palindrome',
        input: 'racecar',
        output: 'true'
      },
      arraySum: {
        name: 'Array Sum Example',
        description: 'Calculate sum of array elements',
        input: '[1,2,3,4,5]',
        output: '15'
      }
    }
  }

  const loadTestCaseExample = (exampleKey: string) => {
    const examples = getTestCaseExamples()
    const example = examples[exampleKey as keyof typeof examples]
    if (example) {
      const newTestCase: TestCase = {
        id: Date.now().toString(),
        name: example.name,
        description: example.description,
        input: example.input,
        output: example.output,
        isHidden: false,
        isExample: true
      }
      setTestCases([...testCases, newTestCase])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          inputVariables: inputVariables.map(iv => ({
            name: iv.name,
            type: iv.type,
            description: iv.description
          })),
          outputVariable: {
            type: outputVariable.type,
            description: outputVariable.description
          },
          testCases: testCases.map(tc => ({
            name: tc.name,
            description: tc.description,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden,
            isExample: tc.isExample
          }))
        }),
      })

      if (response.ok) {
        const problem = await response.json()
        alert('Problem created successfully!')
        // Redirect to problems list or dashboard
        window.location.href = '/admin/problems'
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating problem:', error)
      alert('Failed to create problem. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Problem</h1>
          <p className="text-muted-foreground mt-2">Add a new coding problem to your platform</p>
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
            <p className="text-sm text-muted-foreground mb-4">
              Write your problem description with examples, constraints, and explanations. Use Markdown for formatting.
            </p>
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder={`# Problem Title

## Description
Write a clear problem description here...

## Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`}
              rows={16}
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
            </div>
          </div>

          {/* Input Variables */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Input Variables</h2>
              <button
                type="button"
                onClick={addInputVariable}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Input Variable
              </button>
            </div>
            
            <div className="space-y-4">
              {inputVariables.map((inputVar, index) => (
                <div key={inputVar.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">Input Variable {index + 1}</h3>
                    {inputVariables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInputVariable(inputVar.id)}
                        className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Variable Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={inputVar.name}
                        onChange={(e) => updateInputVariable(inputVar.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        placeholder="e.g., nums"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Type *
                      </label>
                      <input
                        type="text"
                        required
                        value={inputVar.type}
                        onChange={(e) => updateInputVariable(inputVar.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        placeholder="e.g., number[]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={inputVar.description}
                        onChange={(e) => updateInputVariable(inputVar.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Array of integers"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Output Variable */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Output Variable</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type *
                </label>
                <input
                  type="text"
                  required
                  value={outputVariable.type}
                  onChange={(e) => updateOutputVariable('type', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="e.g., number[]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={outputVariable.description}
                  onChange={(e) => updateOutputVariable('description', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Array of two indices"
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addExampleTestCase}
                  className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Example
                </button>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Test Case
                </button>
              </div>
            </div>

            {/* Test Case Examples */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-3">Quick Examples</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadTestCaseExample('sumOfThree')}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  Sum of Three
                </button>
                <button
                  type="button"
                  onClick={() => loadTestCaseExample('twoSum')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Two Sum
                </button>
                <button
                  type="button"
                  onClick={() => loadTestCaseExample('palindrome')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
                >
                  Palindrome
                </button>
                <button
                  type="button"
                  onClick={() => loadTestCaseExample('arraySum')}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
                >
                  Array Sum
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 <strong>Input Format:</strong> Pass values directly (e.g., "5 10 15" or "[1,2,3] 6"). <strong>Output Format:</strong> Expected return value (e.g., "30" or "[0,1]").
              </p>
            </div>
            
            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={testCase.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{testCase.name}</h3>
                      {testCase.isExample && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                          Example
                        </span>
                      )}
                    </div>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Test Case Name
                      </label>
                      <input
                        type="text"
                        value={testCase.name}
                        onChange={(e) => updateTestCase(testCase.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Basic Test Case"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={testCase.description}
                        onChange={(e) => updateTestCase(testCase.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Tests basic functionality"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Input (Values for Judge0)
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(testCase.id, 'input', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        placeholder='5 10 15 or [2,7,11,15] 9'
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Pass values directly as they would be passed to your function
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Expected Output
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => updateTestCase(testCase.id, 'output', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        placeholder="30 or [0,1] or true"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The expected return value from your function
                      </p>
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
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Create Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProblemPage