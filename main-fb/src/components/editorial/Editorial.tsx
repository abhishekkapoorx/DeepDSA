'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface EditorialProps {
  problemTitle: string;
  editorial: any;
}

export const Editorial: React.FC<EditorialProps> = ({ problemTitle, editorial }) => {
  
  if (!editorial) {
    return (
      <div className="p-6 text-center bg-background">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Editorial Available</h3>
        <p className="text-muted-foreground">
          Editorial for "{problemTitle}" hasn't been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-card h-full">
      {/* Editorial Content */}
      <Card className='bg-muted'>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>Editorial: {problemTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <div className="space-y-6">
            {editorial?.overview && (
              <p className="text-foreground/90">{editorial.overview}</p>
            )}

            {Array.isArray(editorial?.approaches) && editorial.approaches.length > 0 && (
              <div className="space-y-6">
                {editorial.approaches.map((approach: any, index: number) => (
                  <div key={approach._id || index} className="space-y-3">
                    {(approach?.title || approach?.type) && (
                      <h4 className="text-base font-semibold">
                        {approach.title || approach.type}
                      </h4>
                    )}

                    {approach?.description && (
                      <p>{approach.description}</p>
                    )}

                    {approach?.algorithm && (
                      <div>
                        <div className="text-sm font-medium">Algorithm</div>
                        <p>{approach.algorithm}</p>
                      </div>
                    )}

                    {(approach?.timeComplexity || approach?.spaceComplexity) && (
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                        {approach?.timeComplexity && (
                          <span>Time: {approach.timeComplexity}</span>
                        )}
                        {approach?.spaceComplexity && (
                          <span>Space: {approach.spaceComplexity}</span>
                        )}
                      </div>
                    )}

                    {(Array.isArray(approach?.pros) && approach.pros.length > 0) && (
                      <div>
                        <div className="text-sm font-medium">Pros</div>
                        <ul className="list-disc pl-5">
                          {approach.pros.map((pro: string, i: number) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(Array.isArray(approach?.cons) && approach.cons.length > 0) && (
                      <div>
                        <div className="text-sm font-medium">Cons</div>
                        <ul className="list-disc pl-5">
                          {approach.cons.map((con: string, i: number) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(approach?.codeSolutions) && approach.codeSolutions.length > 0 && (
                      <div className="space-y-4">
                        {approach.codeSolutions.map((sol: any, i: number) => (
                          <div key={sol._id || i} className="rounded-md border overflow-hidden">
                            <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50">
                              {sol.language || 'Code'}
                            </div>
                            {sol?.code && (
                              <pre className="p-3 overflow-auto text-sm bg-background">
                                <code>{sol.code}</code>
                              </pre>
                            )}
                            {sol?.explanation && (
                              <div className="px-3 pb-3 text-sm">
                                {sol.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 