'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

interface Problem {
  id: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  createdAt: string
  testCases: { id: string; isHidden: boolean }[]
}

const ProblemsPage = () => {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(difficultyFilter !== 'ALL' && { difficulty: difficultyFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/problems?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProblems(data.problems)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Failed to fetch problems:', data.error)
      }
    } catch (error) {
      console.error('Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProblems()
  }, [currentPage, difficultyFilter, searchTerm])

  const handleDelete = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return

    try {
      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProblems(problems.filter(p => p.id !== problemId))
        setSelectedProblems(prev => {
          const newSet = new Set(prev)
          newSet.delete(problemId)
          return newSet
        })
      } else {
        console.error('Failed to delete problem')
      }
    } catch (error) {
      console.error('Error deleting problem:', error)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProblems(new Set(problems.map(p => p.id)))
    } else {
      setSelectedProblems(new Set())
    }
  }

  const handleSelectProblem = (problemId: string, checked: boolean) => {
    const newSelected = new Set(selectedProblems)
    if (checked) {
      newSelected.add(problemId)
    } else {
      newSelected.delete(problemId)
    }
    setSelectedProblems(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedProblems.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedProblems.size} problem(s)?`)) return

    setBulkActionLoading(true)
    try {
      const deletePromises = Array.from(selectedProblems).map(id =>
        fetch(`/api/admin/problems/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      setProblems(problems.filter(p => !selectedProblems.has(p.id)))
      setSelectedProblems(new Set())
      alert(`Successfully deleted ${selectedProblems.size} problem(s)`)
    } catch (error) {
      console.error('Error in bulk delete:', error)
      alert('Some problems could not be deleted')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDifficultyChange = async (newDifficulty: string) => {
    if (selectedProblems.size === 0) return
    
    if (!confirm(`Are you sure you want to change difficulty to ${newDifficulty} for ${selectedProblems.size} problem(s)?`)) return

    setBulkActionLoading(true)
    try {
      const updatePromises = Array.from(selectedProblems).map(async (id) => {
        const problem = problems.find(p => p.id === id)
        if (!problem) return
        
        return fetch(`/api/admin/problems/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...problem,
            difficulty: newDifficulty,
            tags: problem.tags.join(', ')
          })
        })
      })
      
      await Promise.all(updatePromises)
      
      // Refresh the problems list
      await fetchProblems()
      setSelectedProblems(new Set())
      alert(`Successfully updated ${selectedProblems.size} problem(s)`)
    } catch (error) {
      console.error('Error in bulk update:', error)
      alert('Some problems could not be updated')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'HARD': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Problems</h1>
              <p className="text-muted-foreground mt-2">View and manage all coding problems</p>
            </div>
            <Link href="/admin/problems/create">
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Problem
              </button>
            </Link>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Row */}
            {selectedProblems.size > 0 && (
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium text-foreground">
                  {selectedProblems.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkDifficultyChange(e.target.value)
                        e.target.value = '' // Reset selection
                      }
                    }}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Change Difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                  
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {bulkActionLoading ? 'Deleting...' : 'Delete Selected'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedProblems(new Set())}
                    className="px-3 py-1 text-sm border border-border rounded text-foreground hover:bg-muted"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Problems</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading problems...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No problems found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProblems.size === problems.length && problems.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Test Cases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {problems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProblems.has(problem.id)}
                          onChange={(e) => handleSelectProblem(problem.id, e.target.checked)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-foreground">{problem.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
                              {tag}
                            </span>
                          ))}
                          {problem.tags.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs text-muted-foreground">
                              +{problem.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {problem.testCases.length} test cases
                        {problem.testCases.some(tc => tc.isHidden) && (
                          <span className="ml-2 text-orange-600">({problem.testCases.filter(tc => tc.isHidden).length} hidden)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/problems/${problem.title.toLowerCase().replace(/\s+/g, '-')}`}>
                            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/admin/problems/${problem.id}/edit`}>
                            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(problem.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProblemsPage