"use client";
import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import type { CodeEditorRef } from '@/components/problems/CodeEditor';

interface ProblemContextType {
  codeEditorRef: React.RefObject<CodeEditorRef | null>;
  isRunning: boolean;
  isSubmitting: boolean;
  executionTime: number;
  setIsRunning: (running: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setExecutionTime: (duration: number) => void;
  handleRun: () => void;
  handleSubmit: () => void;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export function ProblemProvider({ children }: { children: ReactNode }) {
  const codeEditorRef = useRef<CodeEditorRef>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);

  const handleRun = () => {
    if (codeEditorRef.current) {
      codeEditorRef.current.run();
    }
  };

  const handleSubmit = () => {
    if (codeEditorRef.current) {
      codeEditorRef.current.submit();
    }
  };

  const value: ProblemContextType = {
    codeEditorRef,
    isRunning,
    isSubmitting,
    executionTime,
    setIsRunning,
    setIsSubmitting,
    setExecutionTime,
    handleRun,
    handleSubmit,
  };

  return (
    <ProblemContext.Provider value={value}>
      {children}
    </ProblemContext.Provider>
  );
}

export function useProblem() {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider');
  }
  return context;
}
