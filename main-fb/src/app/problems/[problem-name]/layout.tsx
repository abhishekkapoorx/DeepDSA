"use client";
import React, { useState, useEffect } from 'react';
import { ProblemNavbar } from '@/components/problems/ProblemNavbar';
import { ProblemProvider, useProblem } from '@/contexts/ProblemContext';

function ProblemLayoutContent({ children }: { children: React.ReactNode }) {
  const { isRunning, isSubmitting, executionTime, handleRun, handleSubmit } = useProblem();
  const [problemTitle, setProblemTitle] = useState("Problem List");

  // Extract problem title from URL for display
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const problemSlug = pathParts[pathParts.length - 1];
    if (problemSlug && problemSlug !== 'problems') {
      // Convert slug to title (e.g., "two-sum" -> "Two Sum")
      const title = problemSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setProblemTitle(title);
    }
  }, []);

  const handleNavigatePrevious = () => {
    // Implement navigation to previous problem
    console.log('Navigate to previous problem');
  };

  const handleNavigateNext = () => {
    // Implement navigation to next problem
    console.log('Navigate to next problem');
  };

  return (
    <div className="h-screen flex flex-col">
      <ProblemNavbar
        problemTitle={problemTitle}
        onSubmit={handleSubmit}
        onRun={handleRun}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
        executionTime={executionTime}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export default function ProblemLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProblemProvider>
      <ProblemLayoutContent>
        {children}
      </ProblemLayoutContent>
    </ProblemProvider>
  );
}