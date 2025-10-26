"use client";
import React from 'react';
import { PythonTutorVisualization } from './PythonTutorVisualization';

interface CodeVisualizationProps {
  code?: string;
  language?: string;
  problem?: {
    title?: string;
    testcases?: Array<{ input: string; output: string }>;
  };
}

export const CodeVisualization: React.FC<CodeVisualizationProps> = (props) => {
  return <PythonTutorVisualization {...props} />;
}; 