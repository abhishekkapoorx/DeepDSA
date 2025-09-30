'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlertTriangle } from 'lucide-react';

interface EditorialProps {
  problemTitle: string;
  editorial: any;
  isProblemSolved?: boolean;
}

export const Editorial: React.FC<EditorialProps> = ({ problemTitle, editorial, isProblemSolved = false }) => {
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
    <div className="p-6 space-y-6 bg-card h-full" >
      {/* Warning Banner for Unsolved Problems */}
      {!isProblemSolved && (
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
      )}

      {/* Editorial Content */}
      <Card className='bg-muted'>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>Editorial: {problemTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: editorial.content || editorial.overview || '' }} />
        </CardContent>
      </Card>
    </div>
  );
}; 