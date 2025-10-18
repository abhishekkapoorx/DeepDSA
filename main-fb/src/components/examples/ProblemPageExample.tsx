"use client";

import React from 'react';
import { ProblemDiscussionButton } from '@/components/discussions';

interface ProblemPageExampleProps {
  problem: {
    _id: string;
    slug: string;
    title: string;
    discussionCount?: number;
  };
}

export const ProblemPageExample: React.FC<ProblemPageExampleProps> = ({ problem }) => {
  return (
    <div className="space-y-6">
      {/* Problem Content */}
      <div className="bg-card p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        {/* Problem content here */}
      </div>

      {/* Discussion Integration */}
      <div className="bg-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Discussions</h2>
        <ProblemDiscussionButton 
          problemSlug={problem.slug}
          problemTitle={problem.title}
          discussionCount={problem.discussionCount || 0}
        />
      </div>
    </div>
  );
};