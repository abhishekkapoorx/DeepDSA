"use client"
import React, { useState, useEffect } from 'react'
import type { IContest } from '@/models'
import { Search, Filter, Plus, Eye, Edit, Trash2, Users, Calendar, Trophy, MoreHorizontal, Download, Upload } from 'lucide-react'
import ContestTemplates from '@/components/admin/ContestTemplates'

const AdminContestsPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contests' | 'templates'>('overview')
  const [contests, setContests] = useState<IContest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'running' | 'ended' | 'draft'>('all')
  const [selectedContests, setSelectedContests] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [contestForm, setContestForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    difficulty: 'mixed',
    tags: ''
  })

  useEffect(() => {
    if (activeTab === 'contests') {
      fetchContests()
    }
  }, [activeTab])

  const fetchContests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contests?includeUnpublished=true&includeDeleted=true')
      if (!response.ok) throw new Error('Failed to fetch contests')
      const data = await response.json()
      setContests(data.contests)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to fetch contests')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToggle = async (slug: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/contests/${slug}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished })
      })
      if (!response.ok) throw new Error('Failed to update publish state')
      setMessage(`Contest ${!isPublished ? 'published' : 'unpublished'} successfully`)
      fetchContests()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update contest')
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this contest?')) return
    try {
      const response = await fetch(`/api/contests/${slug}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete contest')
      setMessage('Contest deleted successfully')
      fetchContests()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to delete contest')
    }
  }

  const handleRestore = async (slug: string) => {
    try {
      const response = await fetch(`/api/contests/${slug}/restore`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to restore contest')
      setMessage('Contest restored successfully')
      fetchContests()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to restore contest')
    }
  }

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedContests.length === 0) return
    
    const confirmMessage = `Are you sure you want to ${action} ${selectedContests.length} contest(s)?`
    if (!confirm(confirmMessage)) return

    try {
      const promises = selectedContests.map(slug => {
        switch (action) {
          case 'publish':
            return fetch(`/api/contests/${slug}/publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isPublished: true })
            })
          case 'unpublish':
            return fetch(`/api/contests/${slug}/publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isPublished: false })
            })
          case 'delete':
            return fetch(`/api/contests/${slug}`, { method: 'DELETE' })
        }
      })

      await Promise.all(promises)
      setMessage(`Bulk ${action} completed successfully`)
      setSelectedContests([])
      setShowBulkActions(false)
      fetchContests()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : `Failed to ${action} contests`)
    }
  }

  const handleSelectContest = (slug: string) => {
    setSelectedContests(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    )
  }

  const handleSelectAll = () => {
    const filteredContests = getFilteredContests()
    if (selectedContests.length === filteredContests.length) {
      setSelectedContests([])
    } else {
      setSelectedContests(filteredContests.map(c => c.slug))
    }
  }

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contestForm.title || !contestForm.description || !contestForm.startTime || !contestForm.endTime) {
      setMessage('Please fill in all required fields')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contestForm.title,
          description: contestForm.description,
          startTime: contestForm.startTime,
          endTime: contestForm.endTime,
          duration: (new Date(contestForm.endTime).getTime() - new Date(contestForm.startTime).getTime()) / 60000,
          maxParticipants: contestForm.maxParticipants ? parseInt(contestForm.maxParticipants) : undefined,
          problems: [],
          rules: [],
          prizes: [],
          difficulty: contestForm.difficulty,
          tags: contestForm.tags ? contestForm.tags.split(',').map(t => t.trim()) : []
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create contest')
      }

      const data = await response.json()
      setMessage('Contest created successfully!')
      setShowCreateModal(false)
      setContestForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        maxParticipants: '',
        difficulty: 'mixed',
        tags: ''
      })
      
      // Refresh contests list
      fetchContests()
      
      // Redirect to the new contest after a short delay
      setTimeout(() => {
        window.location.href = `/admin/contests/${data.slug}`
      }, 1000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create contest')
    } finally {
      setCreating(false)
    }
  }

  const getFilteredContests = () => {
    return contests.filter(contest => {
      const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contest.slug.toLowerCase().includes(searchTerm.toLowerCase())
      
      const now = new Date()
      const start = new Date(contest.startTime)
      const end = new Date(contest.endTime)
      
      let matchesStatus = true
      if (statusFilter === 'upcoming') matchesStatus = now < start
      else if (statusFilter === 'running') matchesStatus = now >= start && now <= end
      else if (statusFilter === 'ended') matchesStatus = now > end
      else if (statusFilter === 'draft') matchesStatus = !contest.isPublished
      
      return matchesSearch && matchesStatus
    })
  }

  const getContestStats = () => {
    const now = new Date()
    const upcoming = contests.filter(c => new Date(c.startTime) > now).length
    const running = contests.filter(c => {
      const start = new Date(c.startTime)
      const end = new Date(c.endTime)
      return now >= start && now <= end
    }).length
    const ended = contests.filter(c => new Date(c.endTime) < now).length
    const draft = contests.filter(c => !c.isPublished).length
    
    return { upcoming, running, ended, draft, total: contests.length }
  }

  const filteredContests = getFilteredContests()
  const stats = getContestStats()

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contest Management</h1>
            <p className="text-muted-foreground">Manage programming contests and participants</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-border rounded-md hover:bg-accent flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 border border-border rounded-md hover:bg-accent flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Contest
            </button>
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
            onClick={() => setActiveTab('contests')}
            className={`px-4 py-2 rounded-md border ${activeTab === 'contests' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
          >
            All Contests
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md border ${activeTab === 'templates' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
          >
            Templates
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-md mb-6 ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contests</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Running</p>
                    <p className="text-2xl font-bold text-green-600">{stats.running}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ended</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.ended}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
                  </div>
                  <Edit className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="p-4 border border-border rounded-lg hover:bg-accent text-left"
                >
                  <Plus className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium text-foreground">Create Contest</h4>
                  <p className="text-sm text-muted-foreground">Start a new programming contest</p>
                </button>
                <button 
                  onClick={() => setActiveTab('contests')}
                  className="p-4 border border-border rounded-lg hover:bg-accent text-left"
                >
                  <Users className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium text-foreground">Manage Participants</h4>
                  <p className="text-sm text-muted-foreground">View and manage contest participants</p>
                </button>
                <button 
                  onClick={() => setActiveTab('templates')}
                  className="p-4 border border-border rounded-lg hover:bg-accent text-left"
                >
                  <Trophy className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium text-foreground">Contest Templates</h4>
                  <p className="text-sm text-muted-foreground">Use pre-configured contest templates</p>
                </button>
              </div>
            </div>

            {/* Recent Contests */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Contests</h3>
              <div className="space-y-3">
                {contests.slice(0, 5).map((contest) => {
                  const now = new Date()
                  const start = new Date(contest.startTime)
                  const end = new Date(contest.endTime)
                  const status = now < start ? 'upcoming' : (now > end ? 'ended' : 'running')
                  
                  return (
                    <div key={contest.slug} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">{contest.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {start.toLocaleDateString()} • {(contest as any).registrationCount || 0} participants
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${
                          status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          status === 'running' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status}
                        </span>
                        <a
                          href={`/admin/contests/${contest.slug}`}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          Manage
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Contests Tab */}
        {activeTab === 'contests' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search contests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="running">Running</option>
                    <option value="ended">Ended</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedContests.length > 0 && (
              <div className="bg-accent border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {selectedContests.length} contest(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('publish')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleBulkAction('unpublish')}
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      Unpublish
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedContests([])}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Contests Table */}
            {loading ? (
              <div className="text-center text-muted-foreground py-12">Loading contests...</div>
            ) : filteredContests.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No contests found.</div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent">
                      <tr>
                        <th className="text-left p-4">
                          <input
                            type="checkbox"
                            checked={selectedContests.length === filteredContests.length && filteredContests.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-border"
                          />
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Title</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Start Time</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Participants</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Published</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContests.map((contest) => {
                        const now = new Date()
                        const start = new Date(contest.startTime)
                        const end = new Date(contest.endTime)
                        const status = now < start ? 'upcoming' : (now > end ? 'ended' : 'running')
                        
                        return (
                          <tr key={contest.slug} className="border-t border-border hover:bg-accent/50">
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={selectedContests.includes(contest.slug)}
                                onChange={() => handleSelectContest(contest.slug)}
                                className="rounded border-border"
                              />
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium text-foreground">{contest.title}</div>
                                <div className="text-sm text-muted-foreground">{contest.slug}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs capitalize ${
                                status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                status === 'running' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {start.toLocaleString()}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {(contest as any).registrationCount || 0}
                              {contest.maxParticipants && ` / ${contest.maxParticipants}`}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                contest.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contest.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <a
                                  href={`/contests/${contest.slug}`}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                  title="View"
                                >
                                  <Eye className="w-3 h-3" />
                                </a>
                                <a
                                  href={`/admin/contests/${contest.slug}`}
                                  className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                                  title="Manage"
                                >
                                  <Edit className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => handlePublishToggle(contest.slug, contest.isPublished)}
                                  className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                                  title={contest.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                  {contest.isPublished ? 'Unpublish' : 'Publish'}
                                </button>
                                {contest.isDeleted ? (
                                  <button
                                    onClick={() => handleRestore(contest.slug)}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                                    title="Restore"
                                  >
                                    Restore
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDelete(contest.slug)}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <ContestTemplates onApplyTemplate={() => {
              // Refresh contests after applying template
              fetchContests()
              setActiveTab('contests')
            }} />
          </div>
        )}
      </div>

      {/* Create Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Create New Contest</h2>
              <p className="text-sm text-muted-foreground mt-1">Fill in the contest details below</p>
            </div>

            <form onSubmit={handleCreateContest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contest Title *
                </label>
                <input
                  type="text"
                  required
                  value={contestForm.title}
                  onChange={(e) => setContestForm({...contestForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Weekly Coding Challenge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={contestForm.description}
                  onChange={(e) => setContestForm({...contestForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe what this contest is about..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={contestForm.startTime}
                    onChange={(e) => setContestForm({...contestForm, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={contestForm.endTime}
                    onChange={(e) => setContestForm({...contestForm, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={contestForm.maxParticipants}
                    onChange={(e) => setContestForm({...contestForm, maxParticipants: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Difficulty
                  </label>
                  <select
                    value={contestForm.difficulty}
                    onChange={(e) => setContestForm({...contestForm, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={contestForm.tags}
                  onChange={(e) => setContestForm({...contestForm, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Comma-separated tags (e.g., arrays, dynamic-programming)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setContestForm({
                      title: '',
                      description: '',
                      startTime: '',
                      endTime: '',
                      maxParticipants: '',
                      difficulty: 'mixed',
                      tags: ''
                    })
                  }}
                  className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Contest
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContestsPage