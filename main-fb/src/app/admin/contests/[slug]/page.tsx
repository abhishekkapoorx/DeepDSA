"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { IContest } from '@/models'
import { ArrowLeft, Edit, Save, X, Plus, Trash2, Users, Trophy, Calendar, Settings, BarChart3, Download, BookOpen, Copy, AlertTriangle } from 'lucide-react'
import DragDropProblemList from '@/components/admin/DragDropProblemList'
import ProblemSearchModal from '@/components/admin/ProblemSearchModal'
import ContestAnalytics from '@/components/admin/ContestAnalytics'
import BulkParticipantManager from '@/components/admin/BulkParticipantManager'

const ContestDetailManagement = () => {
  const params = useParams()
  const slug = params.slug as string
  const [contest, setContest] = useState<IContest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'participants' | 'analytics' | 'settings'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [showProblemModal, setShowProblemModal] = useState(false)
  const [editingProblem, setEditingProblem] = useState<{slug: string, points: number} | null>(null)

  useEffect(() => {
    if (slug) {
      fetchContestDetails()
    }
  }, [slug])

  const fetchContestDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/contests/${slug}`)
      if (!response.ok) throw new Error('Failed to fetch contest details')
      const data = await response.json()
      setContest(data)
      setEditData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contest details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!contest) return
    
    try {
      const response = await fetch(`/api/contests/${contest?.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      
      if (!response.ok) throw new Error('Failed to update contest')
      
      const updatedContest = await response.json()
      setContest(updatedContest)
      setEditData(updatedContest)
      setIsEditing(false)
      setMessage('Contest updated successfully')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update contest')
    }
  }

  const handleCancel = () => {
    setEditData(contest)
    setIsEditing(false)
  }

  const handleAddProblem = async (problemSlug: string, points: number) => {
    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemSlug, points })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add problem')
      }
      
      setMessage('Problem added successfully')
      fetchContestDetails()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to add problem')
    }
  }

  const handleReorderProblems = async (reorderedProblems: any[]) => {
    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/problems/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problems: reorderedProblems })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reorder problems')
      }
      
      setMessage('Problems reordered successfully')
      fetchContestDetails()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to reorder problems')
    }
  }

  const handleEditProblemPoints = async (problemSlug: string, points: number) => {
    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/problems`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemSlug, points })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update problem')
      }
      
      setMessage('Problem updated successfully')
      fetchContestDetails()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update problem')
    }
  }

  const handleRemoveProblem = async (problemSlug: string) => {
    if (!confirm('Are you sure you want to remove this problem?')) return
    
    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/problems`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemSlug })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove problem')
      }
      
      setMessage('Problem removed successfully')
      fetchContestDetails()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove problem')
    }
  }

  const handleRemoveParticipant = async (clerkId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return
    
    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove participant')
      }
      
      setMessage('Participant removed successfully')
      fetchContestDetails()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove participant')
    }
  }

  const handleBulkRemoveParticipants = async (clerkIds: string[]) => {
    if (!confirm(`Are you sure you want to remove ${clerkIds.length} participant(s)?`)) return
    
    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/participants/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove participants')
      }
      
      const data = await response.json()
      setMessage(data.message)
      fetchContestDetails()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove participants')
    }
  }

  const handleExportParticipants = (clerkIds?: string[]) => {
    if (!contest) return
    
    const participantsToExport = clerkIds 
      ? contest?.registrations.filter(reg => clerkIds.includes(reg.clerkId))
      : contest?.registrations
    
    const csvContent = [
      ['User ID', 'Registration Date', 'Score', 'Problems Solved', 'Total Time'],
      ...participantsToExport.map(reg => [
        reg.clerkId,
        new Date(reg.registeredAt).toLocaleString(),
        reg.score || 0,
        reg.problemsSolved || 0,
        reg.totalTime || 0
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contest?.slug}-participants${clerkIds ? '-selected' : ''}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    setMessage(`Exported ${participantsToExport.length} participant(s)`)
  }

  const handleSaveAsTemplate = async () => {
    const name = prompt('Template name:', `${contest?.title} Template`)
    if (!name) return

    const description = prompt('Template description:', contest?.description)
    if (!description) return

    const category = prompt('Category (beginner/intermediate/advanced/custom):', 'custom')
    if (!category) return

    const isPublic = confirm('Make this template public?')

    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/save-as-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          difficulty: contest?.difficulty,
          isPublic,
          tags: contest?.tags
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save template')
      }

      setMessage('Template saved successfully!')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save template')
    }
  }

  const handleCloneContest = async () => {
    const title = prompt('Enter new contest title:', `${contest?.title} (Copy)`)
    if (!title) return

    const description = prompt('Enter contest description:', contest?.description)
    if (!description) return

    const startTime = prompt('Enter start time (YYYY-MM-DDTHH:MM):', new Date().toISOString().slice(0, 16))
    if (!startTime) return

    const endTime = prompt('Enter end time (YYYY-MM-DDTHH:MM):', new Date(Date.now() + (contest?.duration ? contest?.duration * 60000 : 0)).toISOString().slice(0, 16))
    if (!endTime) return

    const maxParticipants = prompt('Max participants (leave empty for no limit):', contest?.maxParticipants?.toString() || '')

    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startTime,
          endTime,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clone contest')
      }

      const data = await response.json()
      setMessage('Contest cloned successfully!')
      
      // Redirect to the new contest after a short delay
      setTimeout(() => {
        window.location.href = `/admin/contests/${data.contest?.slug}`
      }, 2000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to clone contest')
    }
  }

  const handlePermanentDelete = async () => {
    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE "${contest?.title}"?\n\nThis action cannot be undone and will:\n- Delete all contest data\n- Remove all problems and settings\n- Cannot be recovered\n\nType "DELETE" to confirm:`
    
    const confirmation = prompt(confirmMessage)
    if (confirmation !== 'DELETE') {
      setMessage('Permanent deletion cancelled')
      return
    }

    try {
      const response = await fetch(`/api/admin/contests/${contest?.slug}/permanent-delete`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to permanently delete contest')
      }

      setMessage('Contest permanently deleted successfully!')
      
      // Redirect to contests list after a short delay
      setTimeout(() => {
        window.location.href = '/admin/contests'
      }, 2000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to permanently delete contest')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading contest details...</p>
        </div>
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Contest not found'}</p>
          <Link href="/admin/contests" className="text-primary hover:underline">
            ← Back to Contests
          </Link>
        </div>
      </div>
    )
  }

  const now = new Date()
  const start = new Date(contest?.startTime)
  const end = new Date(contest?.endTime)
  const status = now < start ? 'upcoming' : (now > end ? 'ended' : 'running')

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/contests" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{contest?.title}</h1>
              <p className="text-muted-foreground">{contest?.slug}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveAsTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Save as Template
            </button>
            <button
              onClick={handleCloneContest}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Clone Contest
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-border rounded-md hover:bg-accent flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Contest
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-md mb-6 ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Status Banner */}
        <div className={`p-4 rounded-lg mb-8 ${
          status === 'upcoming' ? 'bg-blue-50 border border-blue-200' :
          status === 'running' ? 'bg-green-50 border border-green-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                status === 'upcoming' ? 'bg-blue-500' :
                status === 'running' ? 'bg-green-500' :
                'bg-gray-500'
              }`}></div>
              <span className={`font-medium capitalize ${
                status === 'upcoming' ? 'text-blue-800' :
                status === 'running' ? 'text-green-800' :
                'text-gray-800'
              }`}>
                {status === 'upcoming' ? 'Upcoming Contest' : 
                 status === 'running' ? 'Contest Running' : 'Contest Ended'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {start.toLocaleString()} - {end.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md border ${activeTab === 'overview' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-4 py-2 rounded-md border ${activeTab === 'problems' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2 rounded-md border ${activeTab === 'participants' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
          >
            Participants
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md border ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md border ${activeTab === 'settings' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
          >
            Settings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Contest Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-muted-foreground">{contest?.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
                  <p className="text-muted-foreground">{contest?.slug}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  {isEditing ? (
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-muted-foreground">{contest?.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="text-2xl font-bold text-foreground">{(contest as any).registrationCount || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Problems</p>
                    <p className="text-2xl font-bold text-foreground">{contest?.problems.length}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold text-foreground">{contest?.duration}m</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className="text-2xl font-bold text-foreground capitalize">{contest?.difficulty}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Rules and Prizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Rules</h3>
                {contest?.rules.length > 0 ? (
                  <ul className="space-y-2">
                    {contest?.rules.map((rule, i) => (
                      <li key={i} className="text-muted-foreground">• {rule}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No rules specified</p>
                )}
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Prizes</h3>
                {contest?.prizes && contest?.prizes.length > 0 ? (
                  <ul className="space-y-2">
                    {contest?.prizes.map((prize, i) => (
                      <li key={i} className="text-muted-foreground">• {prize}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No prizes specified</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Problems Tab */}
        {activeTab === 'problems' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Contest Problems</h3>
              <button
                onClick={() => setShowProblemModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Problem
              </button>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              {contest?.problems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No problems added to this contest yet.</p>
                  <p className="text-sm mt-1">Click "Add Problem" to get started.</p>
                </div>
              ) : (
                <DragDropProblemList
                  problems={contest?.problems}
                  onReorder={handleReorderProblems}
                  onEdit={(problemSlug, points) => {
                    const newPoints = prompt(`Enter new points for this problem (current: ${points}):`, points.toString())
                    if (newPoints && !isNaN(parseInt(newPoints))) {
                      handleEditProblemPoints(problemSlug, parseInt(newPoints))
                    }
                  }}
                  onRemove={handleRemoveProblem}
                />
              )}
            </div>

            {/* Problem Search Modal */}
            <ProblemSearchModal
              isOpen={showProblemModal}
              onClose={() => setShowProblemModal(false)}
              onAddProblem={handleAddProblem}
              existingProblems={contest?.problems.map(p => p.problemSlug)}
            />
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Contest Participants</h3>
              <button
                onClick={() => handleExportParticipants()}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
            
            <BulkParticipantManager
              participants={contest?.registrations}
              onRemoveParticipants={handleBulkRemoveParticipants}
              onExportParticipants={handleExportParticipants}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Contest Analytics</h3>
              <button
                onClick={fetchContestDetails}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Refresh
              </button>
            </div>
            
            <ContestAnalytics contestSlug={contest?.slug} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Contest Settings</h3>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Time</label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editData.startTime ? new Date(editData.startTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditData({...editData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-muted-foreground">{start.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Time</label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editData.endTime ? new Date(editData.endTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditData({...editData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-muted-foreground">{end.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.duration || ''}
                      onChange={(e) => setEditData({...editData, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-muted-foreground">{contest?.duration}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Participants</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.maxParticipants || ''}
                      onChange={(e) => setEditData({...editData, maxParticipants: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-muted-foreground">{contest?.maxParticipants || 'No limit'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
                  {isEditing ? (
                    <select
                      value={editData.difficulty || ''}
                      onChange={(e) => setEditData({...editData, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  ) : (
                    <p className="text-muted-foreground capitalize">{contest?.difficulty}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Published</label>
                  <p className="text-muted-foreground">{contest?.isPublished ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h4>
              <p className="text-red-700 mb-4">
                These actions are irreversible. Please be careful.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-md">
                  <div>
                    <h5 className="font-medium text-red-800">Permanently Delete Contest</h5>
                    <p className="text-sm text-red-600">
                      This will permanently delete the contest and all its data. This action cannot be undone.
                    </p>
                    {contest?.registrations.length > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        ⚠️ Contest has {contest?.registrations.length} participants. Remove all participants first.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handlePermanentDelete}
                    disabled={contest?.registrations.length > 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContestDetailManagement
