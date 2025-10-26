"use client"
import React, { useState, useEffect } from 'react'
import { Search, X, Plus, Eye, Tag } from 'lucide-react'

interface ProblemSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProblem: (problemSlug: string, points: number) => void
  existingProblems: string[] // Array of existing problem slugs
}

const ProblemSearchModal = ({ isOpen, onClose, onAddProblem, existingProblems }: ProblemSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedProblem, setSelectedProblem] = useState<any>(null)
  const [points, setPoints] = useState(100)

  useEffect(() => {
    if (isOpen && searchTerm.length >= 2) {
      searchProblems()
    }
  }, [searchTerm, isOpen])

  const searchProblems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/problems/search?q=${encodeURIComponent(searchTerm)}&limit=20`)
      if (!response.ok) throw new Error('Failed to search problems')
      const data = await response.json()
      setProblems(data.problems || [])
    } catch (err) {
      console.error('Error searching problems:', err)
      setProblems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProblem = () => {
    if (selectedProblem && !existingProblems.includes(selectedProblem.slug)) {
      onAddProblem(selectedProblem.slug, points)
      onClose()
      setSelectedProblem(null)
      setSearchTerm('')
      setPoints(100)
    }
  }

  const filteredProblems = problems.filter(problem => {
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty
    const notAlreadyAdded = !existingProblems.includes(problem.slug)
    return matchesDifficulty && notAlreadyAdded
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Add Problem to Contest</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Search Panel */}
          <div className="w-1/2 border-r border-border p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Filter by Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Problem List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2">Searching problems...</p>
                  </div>
                ) : filteredProblems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>{searchTerm.length < 2 ? 'Type at least 2 characters to search' : 'No problems found'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProblems.map((problem) => (
                      <div
                        key={problem.slug}
                        onClick={() => setSelectedProblem(problem)}
                        className={`p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedProblem?.slug === problem.slug ? 'bg-accent border-primary' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">{problem.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{problem.slug}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className={`text-xs px-2 py-1 rounded capitalize ${
                                problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {problem.difficulty}
                              </span>
                              {problem.tags && problem.tags.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Tag className="w-3 h-3" />
                                  <span>{problem.tags.slice(0, 2).join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProblem(problem)
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-6">
            {selectedProblem ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedProblem.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProblem.slug}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Difficulty</label>
                    <span className={`text-sm px-2 py-1 rounded capitalize ${
                      selectedProblem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      selectedProblem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedProblem.difficulty}
                    </span>
                  </div>

                  {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedProblem.tags.map((tag: string, index: number) => (
                          <span key={index} className="text-xs px-2 py-1 bg-accent text-foreground rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProblem.description && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                      <p className="text-sm text-muted-foreground line-clamp-4">{selectedProblem.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Points for this problem</label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value) || 100)}
                      min="1"
                      max="1000"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddProblem}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Problem
                  </button>
                  <button
                    onClick={() => setSelectedProblem(null)}
                    className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Select a problem to preview details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemSearchModal
