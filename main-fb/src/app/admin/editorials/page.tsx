'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Editorial {
  _id: string
  title: string
  isPublished: boolean
  createdAt: string
  problemId: {
    _id: string
    title: string
    questionNumber: number
    difficulty: string
    slug: string
  }
}

const EditorialsPage = () => {
  const [editorials, setEditorials] = useState<Editorial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'unpublished'>('all')

  useEffect(() => {
    fetchEditorials()
  }, [])

  const fetchEditorials = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/editorials')
      if (response.ok) {
        const data = await response.json()
        setEditorials(data.editorials || [])
      }
    } catch (error) {
      console.error('Error fetching editorials:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEditorial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this editorial?')) return

    try {
      const response = await fetch(`/api/admin/editorials/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEditorials(editorials.filter(e => e._id !== id))
        alert('Editorial deleted successfully')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting editorial:', error)
      alert('Failed to delete editorial')
    }
  }

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const editorial = editorials.find(e => e._id === id)
      if (!editorial) return

      const response = await fetch(`/api/admin/editorials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editorial,
          isPublished: !currentStatus
        })
      })

      if (response.ok) {
        setEditorials(editorials.map(e => 
          e._id === id ? { ...e, isPublished: !currentStatus } : e
        ))
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating editorial:', error)
      alert('Failed to update editorial')
    }
  }

  const filteredEditorials = editorials.filter(editorial => {
    const matchesSearch = editorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         editorial.problemId.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterPublished === 'all' ||
                         (filterPublished === 'published' && editorial.isPublished) ||
                         (filterPublished === 'unpublished' && !editorial.isPublished)

    return matchesSearch && matchesFilter
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-500'
      case 'MEDIUM': return 'text-yellow-500'
      case 'HARD': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading editorials...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editorials</h1>
            <p className="text-muted-foreground mt-2">Manage problem solution explanations</p>
          </div>
          <Link href="/admin/editorials/create">
            <Button className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Editorial
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search editorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Editorials List */}
        <div className="space-y-4">
          {filteredEditorials.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery || filterPublished !== 'all' 
                  ? 'No editorials match your filters' 
                  : 'No editorials found'}
              </div>
              {!searchQuery && filterPublished === 'all' && (
                <Link href="/admin/editorials/create">
                  <Button>Create Your First Editorial</Button>
                </Link>
              )}
            </div>
          ) : (
            filteredEditorials.map((editorial) => (
              <div key={editorial._id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{editorial.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        editorial.isPublished 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {editorial.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      Problem: #{editorial.problemId.questionNumber} - {editorial.problemId.title}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Difficulty: <span className={getDifficultyColor(editorial.problemId.difficulty)}>{editorial.problemId.difficulty}</span></span>
                      <span>Created: {new Date(editorial.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(editorial._id, editorial.isPublished)}
                    >
                      {editorial.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    
                    <Link href={`/problems/${editorial.problemId.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    
                    <Link href={`/admin/editorials/${editorial._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEditorial(editorial._id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorialsPage
