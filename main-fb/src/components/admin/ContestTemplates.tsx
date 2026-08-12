"use client"
import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Star, Users, Clock, Tag, Filter, BookOpen } from 'lucide-react'
import type { IContestTemplate } from '@/models'

interface ContestTemplatesProps {
  onApplyTemplate: (template: IContestTemplate) => void
}

const ContestTemplates = ({ onApplyTemplate }: ContestTemplatesProps) => {
  const [templates, setTemplates] = useState<IContestTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [publicFilter, setPublicFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [searchTerm, categoryFilter, difficultyFilter, publicFilter])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter)
      if (publicFilter !== 'all') params.append('isPublic', publicFilter)

      const response = await fetch(`/api/admin/contests/templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = async (template: IContestTemplate) => {
    const title = prompt('Enter contest title:', `${template.name} Contest`)
    if (!title) return

    const startTime = prompt('Enter start time (YYYY-MM-DDTHH:MM):', new Date().toISOString().slice(0, 16))
    if (!startTime) return

    const endTime = prompt('Enter end time (YYYY-MM-DDTHH:MM):', new Date(Date.now() + template.duration * 60000).toISOString().slice(0, 16))
    if (!endTime) return

    try {
      const response = await fetch(`/api/admin/contests/templates/${template._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: template.description,
          startTime,
          endTime,
          maxParticipants: template.maxParticipants
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to apply template')
      }

      const data = await response.json()
      alert('Contest created successfully!')
      onApplyTemplate(template)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to apply template')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-blue-100 text-blue-800'
      case 'intermediate': return 'bg-purple-100 text-purple-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Contest Templates</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="custom">Custom</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="mixed">Mixed</option>
          </select>

          <select
            value={publicFilter}
            onChange={(e) => setPublicFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Templates</option>
            <option value="true">Public Only</option>
            <option value="false">My Templates</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading templates...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No templates found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={String(template._id)} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">
                    {template.rating ? template.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
                {template.isPublic && (
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    Public
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{template.duration}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{template.maxParticipants || '∞'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{template.problems.length}</span>
                </div>
              </div>

              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-accent text-foreground rounded">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-accent text-foreground rounded">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyTemplate(template)}
                  className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                >
                  Apply Template
                </button>
                <button
                  className="px-3 py-2 border border-border rounded-md hover:bg-accent text-sm"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Template</h3>
            <p className="text-muted-foreground mb-4">Template creation form coming soon...</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContestTemplates
