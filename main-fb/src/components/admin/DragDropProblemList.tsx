"use client"
import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit, Trash2 } from 'lucide-react'
import type { IContestProblem } from '@/models'

interface SortableProblemItemProps {
  problem: IContestProblem & { problemId?: any }
  index: number
  onEdit: (problemSlug: string, points: number) => void
  onRemove: (problemSlug: string) => void
}

const SortableProblemItem = ({ problem, index, onEdit, onRemove }: SortableProblemItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: problem.problemSlug })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground min-w-[2rem]">
            {problem.order}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {problem.problemId?.title || `Problem ${index + 1}`}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {problem.problemSlug} • {problem.points} points • {problem.problemId?.difficulty || 'Mixed'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(problem.problemSlug, problem.points)}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
          title="Edit points"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRemove(problem.problemSlug)}
          className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded"
          title="Remove problem"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface DragDropProblemListProps {
  problems: (IContestProblem & { problemId?: any })[]
  onReorder: (problems: IContestProblem[]) => void
  onEdit: (problemSlug: string, points: number) => void
  onRemove: (problemSlug: string) => void
}

const DragDropProblemList = ({ problems, onReorder, onEdit, onRemove }: DragDropProblemListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = problems.findIndex(problem => problem.problemSlug === active.id)
      const newIndex = problems.findIndex(problem => problem.problemSlug === over?.id)

      const reorderedProblems = arrayMove(problems, oldIndex, newIndex)
      
      // Update order numbers
      const updatedProblems = reorderedProblems.map((problem, index) => ({
        ...problem,
        order: index + 1
      }))

      onReorder(updatedProblems)
    }
  }

  if (problems.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No problems added to this contest yet.</p>
        <p className="text-sm mt-1">Add problems to get started.</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={problems.map(p => p.problemSlug)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {problems.map((problem, index) => (
            <SortableProblemItem
              key={problem.problemSlug}
              problem={problem}
              index={index}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DragDropProblemList
