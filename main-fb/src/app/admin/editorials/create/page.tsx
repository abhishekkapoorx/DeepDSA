'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import { ApproachType } from '@/types/editorial'

interface CodeSolution {
  language: string
  code: string
  explanation?: string
}

interface Approach {
  type: ApproachType
  title: string
  description: string
  algorithm: string
  codeSolutions: CodeSolution[]
  timeComplexity: string
  spaceComplexity: string
  pros: string[]
  cons: string[]
}

interface Problem {
  _id: string
  title: string
  questionNumber: number
  slug: string
  difficulty: string
}

const CreateEditorialPage = () => {
  const supportedLanguages = [
    { label: 'C++', value: 'C++' },
    { label: 'Java', value: 'Java' },
    { label: 'Python', value: 'Python' },
    { label: 'JavaScript', value: 'JavaScript' },
  ]
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedProblemId, setSelectedProblemId] = useState('')
  const [problemSearch, setProblemSearch] = useState('')
  const [isProblemOpen, setIsProblemOpen] = useState(false)
  const [activeProblemIndex, setActiveProblemIndex] = useState(0)
  const [formData, setFormData] = useState({
    title: 'Two Sum - Multiple Approaches Explained',
    overview: 'This problem asks us to find two numbers in an array that add up to a specific target value. We\'ll explore multiple approaches from brute force to optimized solutions, analyzing their time and space complexities.',
    isPublished: false
  })
  const [approaches, setApproaches] = useState<Approach[]>([
    {
      type: ApproachType.BRUTE_FORCE,
      title: 'Brute Force Approach',
      description: '',
      algorithm: '',
      codeSolutions: [{ language: 'JavaScript', code: '', explanation: '' }],
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      pros: ['Simple to understand', 'Easy to implement'],
      cons: ['Inefficient for large inputs']
    }
  ])
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([''])
  const [relatedProblems, setRelatedProblems] = useState<string[]>([''])
  const [showPreview, setShowPreview] = useState(false)

  // Fetch available problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/admin/problems?limit=1000')
        if (response.ok) {
          const data = await response.json()
          setProblems(data.problems || [])
        }
      } catch (error) {
        console.error('Error fetching problems:', error)
      }
    }
    fetchProblems()
  }, [])

  const addApproach = () => {
    const newApproach: Approach = {
      type: ApproachType.OPTIMIZED,
      title: 'Optimized Approach',
      description: '',
      algorithm: '',
      codeSolutions: [{ language: 'JavaScript', code: '', explanation: '' }],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      pros: ['Efficient', 'Scalable'],
      cons: ['More complex logic']
    }
    setApproaches([...approaches, newApproach])
  }

  const loadTemplate = (templateType: string) => {
    switch (templateType) {
      case 'two-sum':
        setFormData({
          title: 'Two Sum - Multiple Approaches Explained',
          overview: 'This problem asks us to find two numbers in an array that add up to a specific target value. We\'ll explore multiple approaches from brute force to optimized solutions, analyzing their time and space complexities.',
          isPublished: false
        })
        setApproaches([
          {
            type: ApproachType.BRUTE_FORCE,
            title: 'Brute Force Approach',
            description: 'The simplest approach that tries all possible combinations to find the solution.',
            algorithm: '1. Generate all possible combinations\n2. Check each combination for validity\n3. Return the first valid solution found',
            codeSolutions: [{ language: 'JavaScript', code: 'function bruteForce(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) {\n        return [i, j];\n      }\n    }\n  }\n  return [];\n}', explanation: 'Two nested loops check all pairs of numbers.' }],
            timeComplexity: 'O(n²)',
            spaceComplexity: 'O(1)',
            pros: ['Simple to understand', 'Easy to implement'],
            cons: ['Inefficient for large inputs', 'Not scalable']
          },
          {
            type: ApproachType.OPTIMIZED,
            title: 'Hash Map Approach',
            description: 'Use a hash map to store complements, achieving O(n) time complexity.',
            algorithm: '1. Create a hash map to store numbers and their indices\n2. For each number, check if its complement exists\n3. If found, return the indices\n4. Store current number and its index',
            codeSolutions: [{ language: 'JavaScript', code: 'function hashMap(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}', explanation: 'Hash map provides O(1) lookup time for complements.' }],
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            pros: ['Efficient', 'Scalable', 'Single pass through array'],
            cons: ['Uses extra space', 'More complex than brute force']
          }
        ])
        setFollowUpQuestions([
          'What if the array contains duplicate elements?',
          'How would you handle negative numbers?',
          'Can you solve this in O(n) time complexity?'
        ])
        setRelatedProblems([
          'Three Sum',
          'Four Sum',
          'Two Sum II - Input Array Is Sorted'
        ])
        break
      
      case 'binary-search':
        setFormData({
          title: 'Binary Search - Efficient Search Algorithm',
          overview: 'Binary search is a fundamental algorithm that efficiently finds elements in sorted arrays. We\'ll explore both iterative and recursive implementations.',
          isPublished: false
        })
        setApproaches([
          {
            type: ApproachType.BINARY_SEARCH,
            title: 'Iterative Binary Search',
            description: 'Classic binary search using a while loop to maintain two pointers.',
            algorithm: '1. Initialize left and right pointers\n2. While left <= right, calculate mid\n3. If target found at mid, return mid\n4. If target < mid, search left half\n5. If target > mid, search right half',
            codeSolutions: [{ language: 'JavaScript', code: 'function binarySearch(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}', explanation: 'Maintains two pointers and narrows the search range by half each iteration.' }],
            timeComplexity: 'O(log n)',
            spaceComplexity: 'O(1)',
            pros: ['Efficient', 'Constant space', 'Easy to understand'],
            cons: ['Requires sorted array', 'Not suitable for unsorted data']
          }
        ])
        setFollowUpQuestions([
          'What if the array has duplicate elements?',
          'How would you find the first occurrence?',
          'Can you implement this recursively?'
        ])
        setRelatedProblems([
          'Search Insert Position',
          'Find First and Last Position',
          'Search in Rotated Sorted Array'
        ])
        break
      
      case 'dynamic-programming':
        setFormData({
          title: 'Dynamic Programming - Memoization vs Tabulation',
          overview: 'Dynamic programming solves complex problems by breaking them into simpler subproblems. We\'ll explore both top-down (memoization) and bottom-up (tabulation) approaches.',
          isPublished: false
        })
        setApproaches([
          {
            type: ApproachType.DYNAMIC_PROGRAMMING,
            title: 'Top-Down with Memoization',
            description: 'Recursive approach that stores results of subproblems to avoid redundant calculations.',
            algorithm: '1. Define base cases\n2. Check if result exists in memo\n3. If not, compute result recursively\n4. Store result in memo\n5. Return result',
            codeSolutions: [{ language: 'JavaScript', code: 'function fibonacciMemo(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  \n  memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);\n  return memo[n];\n}', explanation: 'Memoization stores previously computed values to avoid redundant calculations.' }],
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            pros: ['Intuitive', 'Only computes needed subproblems', 'Easy to implement'],
            cons: ['Recursive call overhead', 'Stack space usage', 'May cause stack overflow']
          }
        ])
        setFollowUpQuestions([
          'How would you implement bottom-up approach?',
          'What\'s the space complexity of bottom-up?',
          'Can you optimize space further?'
        ])
        setRelatedProblems([
          'Climbing Stairs',
          'House Robber',
          'Coin Change'
        ])
        break
    }
  }

  const removeApproach = (index: number) => {
    if (approaches.length > 1) {
      setApproaches(approaches.filter((_, i) => i !== index))
    }
  }

  const updateApproach = (index: number, field: keyof Approach, value: any) => {
    const newApproaches = [...approaches]
    newApproaches[index] = { ...newApproaches[index], [field]: value }
    setApproaches(newApproaches)
  }

  const addCodeSolution = (approachIndex: number) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].codeSolutions.push({
      language: 'JavaScript',
      code: '',
      explanation: ''
    })
    setApproaches(newApproaches)
  }

  const removeCodeSolution = (approachIndex: number, solutionIndex: number) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].codeSolutions.splice(solutionIndex, 1)
    setApproaches(newApproaches)
  }

  const updateCodeSolution = (approachIndex: number, solutionIndex: number, field: keyof CodeSolution, value: string) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].codeSolutions[solutionIndex] = {
      ...newApproaches[approachIndex].codeSolutions[solutionIndex],
      [field]: value
    }
    setApproaches(newApproaches)
  }

  const addPro = (approachIndex: number) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].pros.push('')
    setApproaches(newApproaches)
  }

  const removePro = (approachIndex: number, proIndex: number) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].pros.splice(proIndex, 1)
    setApproaches(newApproaches)
  }

  const updatePro = (approachIndex: number, proIndex: number, value: string) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].pros[proIndex] = value
    setApproaches(newApproaches)
  }

  const addCon = (approachIndex: number) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].cons.push('')
    setApproaches(newApproaches)
  }

  const removeCon = (approachIndex: number, conIndex: number) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].cons.splice(conIndex, 1)
    setApproaches(newApproaches)
  }

  const updateCon = (approachIndex: number, conIndex: number, value: string) => {
    const newApproaches = [...approaches]
    newApproaches[approachIndex].cons[conIndex] = value
    setApproaches(newApproaches)
  }

  const addFollowUpQuestion = () => {
    setFollowUpQuestions([...followUpQuestions, ''])
  }

  const removeFollowUpQuestion = (index: number) => {
    if (followUpQuestions.length > 1) {
      setFollowUpQuestions(followUpQuestions.filter((_, i) => i !== index))
    }
  }

  const updateFollowUpQuestion = (index: number, value: string) => {
    const newQuestions = [...followUpQuestions]
    newQuestions[index] = value
    setFollowUpQuestions(newQuestions)
  }

  const addRelatedProblem = () => {
    setRelatedProblems([...relatedProblems, ''])
  }

  const removeRelatedProblem = (index: number) => {
    if (relatedProblems.length > 1) {
      setRelatedProblems(relatedProblems.filter((_, i) => i !== index))
    }
  }

  const updateRelatedProblem = (index: number, value: string) => {
    const newProblems = [...relatedProblems]
    newProblems[index] = value
    setRelatedProblems(newProblems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProblemId) {
      alert('Please select a problem')
      return
    }

    try {
      const response = await fetch('/api/admin/editorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: selectedProblemId,
          ...formData,
          approaches,
          followUpQuestions: followUpQuestions.filter(q => q.trim()),
          relatedProblems: relatedProblems.filter(p => p.trim())
        }),
      })

      if (response.ok) {
        const editorial = await response.json()
        alert('Editorial created successfully!')
        window.location.href = '/admin/editorials'
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating editorial:', error)
      alert('Failed to create editorial. Please try again.')
    }
  }

  const selectedProblem = problems.find(p => p._id === selectedProblemId)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/editorials" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editorials
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Editorial</h1>
          <p className="text-muted-foreground mt-2">Add a comprehensive solution explanation for a problem</p>
        </div>

        {/* Template Buttons */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Quick Templates</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadTemplate('two-sum')}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
            >
              Two Sum Problem
            </button>
            <button
              type="button"
              onClick={() => loadTemplate('binary-search')}
              className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
            >
              Binary Search
            </button>
            <button
              type="button"
              onClick={() => loadTemplate('dynamic-programming')}
              className="px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800"
            >
              Dynamic Programming
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Problem Selection */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Problem Selection</h2>
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">
                Search and Select Problem *
              </label>
              <div
                className="flex items-center gap-2"
                onFocus={() => setIsProblemOpen(true)}
              >
                <input
                  type="text"
                  value={problemSearch}
                  onChange={(e) => {
                    setProblemSearch(e.target.value)
                    setIsProblemOpen(true)
                    setActiveProblemIndex(0)
                  }}
                  onKeyDown={(e) => {
                    const filtered = problems.filter(p =>
                      (p.title + ' ' + p.slug + ' #' + p.questionNumber)
                        .toLowerCase()
                        .includes(problemSearch.toLowerCase())
                    )
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setActiveProblemIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)))
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setActiveProblemIndex((prev) => Math.max(prev - 1, 0))
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      const choice = filtered[activeProblemIndex]
                      if (choice) {
                        setSelectedProblemId(choice._id)
                        setProblemSearch(`#${choice.questionNumber} · ${choice.title}`)
                        setIsProblemOpen(false)
                      }
                    } else if (e.key === 'Escape') {
                      setIsProblemOpen(false)
                    }
                  }}
                  placeholder="Type to search (title, slug, or #number)"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setIsProblemOpen((s) => !s)}
                  className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted"
                >
                  {isProblemOpen ? 'Hide' : 'Browse'}
                </button>
              </div>

              {isProblemOpen && (
                <div className="absolute z-10 mt-2 w-full bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-72 overflow-auto">
                  {problems
                    .filter(p => (p.title + ' ' + p.slug + ' #' + p.questionNumber).toLowerCase().includes(problemSearch.toLowerCase()))
                    .slice(0, 200)
                    .map((p, idx) => {
                      const isActive = idx === activeProblemIndex
                      const isSelected = selectedProblemId === p._id
                      return (
                        <button
                          key={p._id}
                          type="button"
                          onMouseEnter={() => setActiveProblemIndex(idx)}
                          onClick={() => {
                            setSelectedProblemId(p._id)
                            setProblemSearch(`#${p.questionNumber} · ${p.title}`)
                            setIsProblemOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-accent ${isActive ? 'bg-accent' : ''}`}
                        >
                          <div>
                            <div className="text-sm font-medium">#{p.questionNumber} · {p.title}</div>
                            <div className="text-xs text-muted-foreground">{p.slug}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${p.difficulty === 'EASY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : p.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {p.difficulty}
                          </span>
                          {isSelected && <span className="ml-2 text-xs text-primary">Selected</span>}
                        </button>
                      )
                    })}
                  {problems.filter(p => (p.title + ' ' + p.slug + ' #' + p.questionNumber).toLowerCase().includes(problemSearch.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
                  )}
                </div>
              )}

              {selectedProblem && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground font-medium">{selectedProblem.title}</div>
                    <div className="text-xs text-muted-foreground">Difficulty: {selectedProblem.difficulty} • Slug: {selectedProblem.slug}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedProblemId(''); setProblemSearch(''); setIsProblemOpen(true) }}
                    className="text-xs px-2 py-1 border border-border rounded hover:bg-muted"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Editorial Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Two Sum - Multiple Approaches Explained"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Overview *
                </label>
                <MarkdownEditor
                  value={formData.overview}
                  onChange={(value) => setFormData({...formData, overview: value})}
                  placeholder="Provide a high-level overview of the problem and solution approaches..."
                  rows={6}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="rounded border-border"
                />
                <label htmlFor="isPublished" className="text-sm text-foreground">
                  Publish immediately (make visible to users)
                </label>
              </div>
            </div>
          </div>

          {/* Approaches */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Solution Approaches</h2>
              <button
                type="button"
                onClick={addApproach}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Approach
              </button>
            </div>
            
            <div className="space-y-6">
              {approaches.map((approach, approachIndex) => (
                <div key={approachIndex} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">Approach {approachIndex + 1}</h3>
                    {approaches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeApproach(approachIndex)}
                        className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Approach Type *
                      </label>
                      <select
                        required
                        value={approach.type}
                        onChange={(e) => updateApproach(approachIndex, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {Object.values(ApproachType).map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={approach.title}
                        onChange={(e) => updateApproach(approachIndex, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Brute Force with Two Loops"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        value={approach.description}
                        onChange={(e) => updateApproach(approachIndex, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Explain the approach in detail..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Algorithm Steps *
                      </label>
                      <textarea
                        required
                        value={approach.algorithm}
                        onChange={(e) => updateApproach(approachIndex, 'algorithm', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Step-by-step algorithm explanation..."
                      />
                    </div>
                  </div>

                  {/* Code Solutions */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-foreground">Code Solutions</h4>
                      <div className="flex items-center gap-2">
                        {supportedLanguages.map((lang) => (
                          <button
                            key={lang.value}
                            type="button"
                            onClick={() => {
                              const newApproaches = [...approaches]
                              newApproaches[approachIndex].codeSolutions.push({ language: lang.value, code: '', explanation: '' })
                              setApproaches(newApproaches)
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs border border-border rounded hover:bg-muted"
                          >
                            + {lang.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => addCodeSolution(approachIndex)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Custom
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-foreground">
                          <tr>
                            <th className="text-left px-3 py-2 w-40">Language</th>
                            <th className="text-left px-3 py-2">Code</th>
                            <th className="text-left px-3 py-2 w-64">Explanation</th>
                            <th className="text-left px-3 py-2 w-16">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {approach.codeSolutions.map((solution, solutionIndex) => (
                            <tr key={solutionIndex} className="border-t border-border align-top">
                              <td className="px-3 py-2">
                                <select
                                  value={solution.language}
                                  onChange={(e) => updateCodeSolution(approachIndex, solutionIndex, 'language', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                  <option value="">Select language</option>
                                  {supportedLanguages.map((lang) => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <textarea
                                  required
                                  value={solution.code}
                                  onChange={(e) => updateCodeSolution(approachIndex, solutionIndex, 'code', e.target.value)}
                                  rows={6}
                                  className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                  placeholder={`// ${solution.language || 'Language'} code here...`}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <textarea
                                  value={solution.explanation || ''}
                                  onChange={(e) => updateCodeSolution(approachIndex, solutionIndex, 'explanation', e.target.value)}
                                  rows={6}
                                  className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  placeholder="Explain the code logic..."
                                />
                              </td>
                              <td className="px-3 py-2">
                                {approach.codeSolutions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeCodeSolution(approachIndex, solutionIndex)}
                                    className="text-destructive hover:bg-destructive/10 rounded p-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Complexity Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Time Complexity *
                      </label>
                      <input
                        type="text"
                        required
                        value={approach.timeComplexity}
                        onChange={(e) => updateApproach(approachIndex, 'timeComplexity', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., O(n²)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Space Complexity *
                      </label>
                      <input
                        type="text"
                        required
                        value={approach.spaceComplexity}
                        onChange={(e) => updateApproach(approachIndex, 'spaceComplexity', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., O(1)"
                      />
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">Pros</label>
                        <button
                          type="button"
                          onClick={() => addPro(approachIndex)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {approach.pros.map((pro, proIndex) => (
                          <div key={proIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={pro}
                              onChange={(e) => updatePro(approachIndex, proIndex, e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="e.g., Simple to understand"
                            />
                            {approach.pros.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePro(approachIndex, proIndex)}
                                className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">Cons</label>
                        <button
                          type="button"
                          onClick={() => addCon(approachIndex)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {approach.cons.map((con, conIndex) => (
                          <div key={conIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={con}
                              onChange={(e) => updateCon(approachIndex, conIndex, e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="e.g., Inefficient for large inputs"
                            />
                            {approach.cons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCon(approachIndex, conIndex)}
                                className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Questions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Follow-up Questions</h2>
              <button
                type="button"
                onClick={addFollowUpQuestion}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>
            
            <div className="space-y-3">
              {followUpQuestions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => updateFollowUpQuestion(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Follow-up question ${index + 1}`}
                  />
                  {followUpQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFollowUpQuestion(index)}
                      className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related Problems */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Related Problems</h2>
              <button
                type="button"
                onClick={addRelatedProblem}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Problem
              </button>
            </div>
            
            <div className="space-y-3">
              {relatedProblems.map((problem, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => updateRelatedProblem(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Related problem ${index + 1}`}
                  />
                  {relatedProblems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRelatedProblem(index)}
                      className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/editorials">
              <button
                type="button"
                className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              <Eye className="h-4 w-4 mr-2 inline" />
              Preview
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              Create Editorial
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Editorial Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{formData.title}</h2>
                  <p className="text-muted-foreground">Solution explanation for: {selectedProblem ? selectedProblem.title : 'Selected Problem'}</p>
                </div>

                {/* Overview */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Overview</h3>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <div dangerouslySetInnerHTML={{ __html: formData.overview }} />
                  </div>
                </div>

                {/* Approaches */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Solution Approaches</h3>
                  
                  {approaches.map((approach, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="p-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {approach.type === ApproachType.BRUTE_FORCE ? '⚡' : 
                           approach.type === ApproachType.OPTIMIZED ? '✓' : 
                           approach.type === ApproachType.DYNAMIC_PROGRAMMING ? '📚' : '💻'}
                        </span>
                        <div>
                          <h4 className="font-semibold text-foreground">{approach.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>⏱️ {approach.timeComplexity}</span>
                            <span>💾 {approach.spaceComplexity}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Description</h5>
                          <p className="text-sm text-muted-foreground">{approach.description}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-foreground mb-2">Algorithm Steps</h5>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-sm whitespace-pre-wrap text-foreground">{approach.algorithm}</pre>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-foreground mb-3">Code Solutions</h5>
                          <div className="space-y-3">
                            {approach.codeSolutions.map((solution, solutionIndex) => (
                              <div key={solutionIndex} className="border border-border rounded-lg overflow-hidden">
                                <div className="bg-muted px-3 py-2 border-b border-border">
                                  <span className="text-sm font-medium text-foreground">{solution.language}</span>
                                </div>
                                <div className="p-3">
                                  <pre className="text-sm overflow-x-auto">
                                    <code className="language-javascript">{solution.code}</code>
                                  </pre>
                                  {solution.explanation && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                      <p className="text-sm text-muted-foreground">{solution.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              Pros
                            </h5>
                            <ul className="space-y-1">
                              {approach.pros.map((pro, proIndex) => (
                                <li key={proIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                              <span className="text-red-500">✗</span>
                              Cons
                            </h5>
                            <ul className="space-y-1">
                              {approach.cons.map((con, conIndex) => (
                                <li key={conIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Follow-up Questions */}
                {followUpQuestions.filter(q => q.trim()).length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Follow-up Questions</h3>
                    <div className="space-y-2">
                      {followUpQuestions.filter(q => q.trim()).map((question, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-sm font-medium text-primary mt-1">Q{index + 1}.</span>
                          <p className="text-sm text-muted-foreground">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Problems */}
                {relatedProblems.filter(p => p.trim()).length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Related Problems</h3>
                    <div className="flex flex-wrap gap-2">
                      {relatedProblems.filter(p => p.trim()).map((problem, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full"
                        >
                          {problem}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateEditorialPage
