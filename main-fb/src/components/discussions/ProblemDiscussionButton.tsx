"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';

interface ProblemDiscussionButtonProps {
  problemSlug: string;
  problemTitle: string;
  discussionCount?: number;
}

export const ProblemDiscussionButton: React.FC<ProblemDiscussionButtonProps> = ({
  problemSlug,
  problemTitle,
  discussionCount = 0
}) => {
  return (
    <div className="flex items-center gap-2">
      <Link 
        href={`/discuss?problemId=${problemSlug}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Discussions ({discussionCount})</span>
      </Link>
      
      <Link 
        href={`/discuss/new?problemSlug=${problemSlug}&problemTitle=${encodeURIComponent(problemTitle)}`}
      >
        <Button size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Start Discussion
        </Button>
      </Link>
    </div>
  );
};
