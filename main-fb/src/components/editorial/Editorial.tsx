'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface EditorialProps {
  problemTitle: string;
  editorial: any;
  isProblemSolved?: boolean;
}

export const Editorial: React.FC<EditorialProps> = ({ problemTitle, editorial, isProblemSolved = false }) => {
  if (!editorial) {
    return (
      <div className="p-6 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Editorial Available</h3>
        <p className="text-muted-foreground">
          Editorial for "{problemTitle}" hasn't been created yet.
        </p>
      </div>
    );
  }

  const isHtmlContent = typeof editorial?.content === 'string' && /<\w|<p|<div|<ul|<ol|<h[1-6]|<pre|<code/.test(editorial.content);

  return (
    <div className="p-6 space-y-6">
      {/* Warning Banner for Unsolved Problems */}
      {/* {!isProblemSolved && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-amber-800 dark:text-amber-200">⚠️ Solution Spoiler Warning</span>
          </div>
          <p className="text-amber-700 dark:text-amber-300 mt-2">
            You haven't solved this problem yet. The editorial contains the complete solution. 
            Consider trying to solve it yourself first for better learning!
          </p>
        </div>
      )} */}

      {/* Editorial Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Editorial: {problemTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          {isHtmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: editorial.content }} />
          ) : (
            <p className="whitespace-pre-wrap">{editorial.overview || ''}</p>
          )}

          {Array.isArray(editorial.approaches) && editorial.approaches.length > 0 && (
            <div className="mt-6 space-y-6">
              {editorial.approaches.map((approach: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base font-semibold">{approach.title}</h3>
                  {approach.description && (
                    <p className="text-muted-foreground">{approach.description}</p>
                  )}
                  {approach.algorithm && (
                    <pre className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap text-foreground">
{approach.algorithm}
                    </pre>
                  )}
                  {Array.isArray(approach.codeSolutions) && approach.codeSolutions.length > 0 && (
                    <div className="space-y-3">
                      {approach.codeSolutions.map((sol: any, sIdx: number) => (
                        <div key={sIdx}>
                          <div className="text-xs font-medium text-muted-foreground mb-1">{sol.language}</div>
                          <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs text-foreground">
                            <code>{sol.code}</code>
                          </pre>
                          {sol.explanation && (
                            <p className="text-muted-foreground mt-1">{sol.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {Array.isArray(editorial.followUpQuestions) && editorial.followUpQuestions.length > 0 && (
            <div className="mt-8">
              <Separator className="my-4" />
              <h3 className="text-base font-semibold mb-2">Follow-up Questions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {editorial.followUpQuestions.map((q: string, qIdx: number) => (
                  <li key={qIdx} className="text-muted-foreground">{q}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(editorial.relatedProblems) && editorial.relatedProblems.length > 0 && (
            <div className="mt-8">
              <Separator className="my-4" />
              <h3 className="text-base font-semibold mb-2">Related Problems</h3>
              <div className="flex flex-wrap gap-2">
                {editorial.relatedProblems.map((rp: string, rIdx: number) => (
                  <Badge key={rIdx} variant="secondary">{rp}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 