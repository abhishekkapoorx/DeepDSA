'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Zap, Code, BookOpen } from 'lucide-react'

interface CodeSolution {
  language: string
  code: string
  explanation?: string
}

interface Approach {
  type: string
  title: string
  description: string
  algorithm: string
  codeSolutions: CodeSolution[]
  timeComplexity: string
  spaceComplexity: string
  pros: string[]
  cons: string[]
}

interface Editorial {
  _id: string
  title: string
  overview: string
  approaches: Approach[]
  followUpQuestions?: string[]
  relatedProblems?: string[]
  isPublished: boolean
}

interface EditorialProps {
  problemTitle: string
  editorial?: Editorial | null
}

const EditorialComponent = ({ editorial, problemTitle }: EditorialProps) => {
  const [expandedApproaches, setExpandedApproaches] = useState<Set<number>>(new Set([0]))
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')

  const toggleApproach = (index: number) => {
    const newExpanded = new Set(expandedApproaches)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
        } else {
      newExpanded.add(index)
    }
    setExpandedApproaches(newExpanded)
  }

  const getApproachIcon = (type: string) => {
    switch (type) {
      case 'BRUTE_FORCE': return <Zap className="h-4 w-4" />
      case 'OPTIMIZED': return <CheckCircle className="h-4 w-4" />
      case 'DYNAMIC_PROGRAMMING': return <BookOpen className="h-4 w-4" />
      case 'GREEDY': return <Zap className="h-4 w-4" />
      default: return <Code className="h-4 w-4" />
    }
  }

  const getApproachColor = (type: string) => {
    switch (type) {
      case 'BRUTE_FORCE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'OPTIMIZED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'DYNAMIC_PROGRAMMING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'GREEDY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (!editorial || !editorial.isPublished) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className="text-muted-foreground">
          Editorial not available for this problem yet.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{editorial.title}</h2>
        <p className="text-muted-foreground">Solution explanation for: {problemTitle}</p>
      </div>

      {/* Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Overview</h3>
        <div className="prose prose-sm max-w-none text-foreground">
          <div dangerouslySetInnerHTML={{ __html: editorial.overview }} />
        </div>
      </div>

      {/* Approaches */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Solution Approaches</h3>
        
        {editorial.approaches.map((approach, index) => (
          <div key={index} className="bg-card border border-border rounded-lg">
            {/* Approach Header */}
            <button
              onClick={() => toggleApproach(index)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-full ${getApproachColor(approach.type)}`}>
                  {getApproachIcon(approach.type)}
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">{approach.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {approach.timeComplexity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {approach.spaceComplexity}
                    </span>
                  </div>
                </div>
              </div>
              {expandedApproaches.has(index) ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {/* Approach Content */}
            {expandedApproaches.has(index) && (
              <div className="px-4 pb-4 space-y-4">
                {/* Description */}
                <div>
                  <h5 className="font-medium text-foreground mb-2">Description</h5>
                  <p className="text-sm text-muted-foreground">{approach.description}</p>
                </div>

                {/* Algorithm */}
                <div>
                  <h5 className="font-medium text-foreground mb-2">Algorithm Steps</h5>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <div dangerouslySetInnerHTML={{ __html: approach.algorithm }} />
                    </div>
                  </div>
                </div>

                {/* Code Solutions */}
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

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
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
                      <XCircle className="h-4 w-4 text-red-500" />
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
            )}
            </div>
        ))}
      </div>

      {/* Follow-up Questions */}
      {editorial.followUpQuestions && editorial.followUpQuestions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Follow-up Questions</h3>
          <div className="space-y-2">
            {editorial.followUpQuestions.map((question, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-sm font-medium text-primary mt-1">Q{index + 1}.</span>
                <p className="text-sm text-muted-foreground">{question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Problems */}
      {editorial.relatedProblems && editorial.relatedProblems.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Related Problems</h3>
          <div className="flex flex-wrap gap-2">
            {editorial.relatedProblems.map((problem, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
              >
                {problem}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorialComponent 