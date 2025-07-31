"use client";
import React from 'react';
import { ProblemNavbar } from '@/components/problems/ProblemNavbar';

interface ProblemLayoutPageProps {
  children: React.ReactNode;
  params: {
    'problem-name': string;
  };
}

export default function ProblemLayoutPage({ children, params }: ProblemLayoutPageProps) {
  const problemName = params['problem-name'];
  
  const handleSubmit = () => {
    console.log('Submit solution');
    // TODO: Implement submission logic
  };

  const handleRun = () => {
    console.log('Run code');
    // TODO: Implement code execution logic
  };

  const handleNavigatePrevious = () => {
    console.log('Navigate to previous problem');
    // TODO: Implement navigation to previous problem
  };

  const handleNavigateNext = () => {
    console.log('Navigate to next problem');
    // TODO: Implement navigation to next problem
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Problem-specific navbar */}
      <ProblemNavbar
        problemTitle="Problem List"
        onSubmit={handleSubmit}
        onRun={handleRun}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
      />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}