"use client"
import React, { useState } from 'react'
import { Users, Trash2, Download, CheckSquare, Square } from 'lucide-react'
import type { IContestRegistration } from '@/models'

interface BulkParticipantManagerProps {
  participants: IContestRegistration[]
  onRemoveParticipants: (clerkIds: string[]) => void
  onExportParticipants: (clerkIds?: string[]) => void
}

const BulkParticipantManager = ({ participants, onRemoveParticipants, onExportParticipants }: BulkParticipantManagerProps) => {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  const handleSelectParticipant = (clerkId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(clerkId) 
        ? prev.filter(id => id !== clerkId)
        : [...prev, clerkId]
    )
  }

  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([])
    } else {
      setSelectedParticipants(participants.map(p => p.clerkId))
    }
  }

  const handleBulkRemove = () => {
    if (selectedParticipants.length === 0) return
    
    const confirmMessage = `Are you sure you want to remove ${selectedParticipants.length} participant(s)?`
    if (!confirm(confirmMessage)) return

    onRemoveParticipants(selectedParticipants)
    setSelectedParticipants([])
    setShowBulkActions(false)
  }

  const handleBulkExport = () => {
    onExportParticipants(selectedParticipants.length > 0 ? selectedParticipants : undefined)
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedParticipants.length > 0 && (
        <div className="bg-accent border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedParticipants.length} participant(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkExport}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Export Selected
              </button>
              <button
                onClick={handleBulkRemove}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Remove Selected
              </button>
              <button
                onClick={() => setSelectedParticipants([])}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {participants.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p>No participants registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="text-left p-4">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                    >
                      {selectedParticipants.length === participants.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      Select All
                    </button>
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">User ID</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Registration Date</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Score</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Problems Solved</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr key={participant.clerkId} className="border-t border-border hover:bg-accent/50">
                    <td className="p-4">
                      <button
                        onClick={() => handleSelectParticipant(participant.clerkId)}
                        className="flex items-center gap-2"
                      >
                        {selectedParticipants.includes(participant.clerkId) ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{participant.clerkId}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(participant.registeredAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-muted-foreground">{participant.score || 0}</td>
                    <td className="p-4 text-muted-foreground">{participant.problemsSolved || 0}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onExportParticipants([participant.clerkId])}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          title="Export"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRemoveParticipants([participant.clerkId])}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default BulkParticipantManager
