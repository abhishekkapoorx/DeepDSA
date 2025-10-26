"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { executeCode, type ExecutionStep } from '../../utils/codeExecutor';

interface PythonTutorVisualizationProps {
  code?: string;
  language?: string;
  problem?: {
    title?: string;
    testcases?: Array<{ input: string; output: string }>;
  };
}

export const PythonTutorVisualization: React.FC<PythonTutorVisualizationProps> = ({
  code = '',
  language = 'java',
  problem
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Execute code and get steps
  const steps = useMemo<ExecutionStep[]>(() => {
    if (!code || code.trim().length === 0) {
      return [];
    }

    try {
      const testCase = problem?.testcases?.[0];
      return executeCode(code, language, testCase);
    } catch (err) {
      console.error('Execution error:', err);
      return [];
    }
  }, [code, language, problem]);

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < totalSteps - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
      }, 1500);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep === totalSteps - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, totalSteps]);

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const gotoStep = (step: number) => {
    setCurrentStep(step);
  };

  if (!code || code.trim().length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card">
        <div className="text-center text-muted-foreground">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start typing code to see visualization</p>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card">
        <div className="text-center text-muted-foreground">
          <p>No execution steps generated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Controls */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentStep === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={currentStep === totalSteps - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {/* Main visualization area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Left: Code */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-medium">Code</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 font-mono text-sm">
                {code.split('\n').map((line, index) => (
                  <div
                    key={index}
                    className={`px-2 py-1 rounded ${
                      currentStepData?.highlightedLine === index
                        ? 'bg-yellow-200 dark:bg-yellow-900/30'
                        : ''
                    }`}
                  >
                    <span className="text-muted-foreground text-xs mr-2">{index + 1}</span>
                    {line}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right: Frames and Objects */}
          <div className="flex flex-col gap-4">
            {/* Frames */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Frames</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentStepData?.state.frames.map((frame, index) => (
                    <div key={index} className="border rounded p-2">
                      <div className="font-semibold text-sm mb-2">{frame.name}</div>
                      <div className="space-y-1">
                        {Object.entries(frame.locals).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="font-mono">{key}:</span>
                            <span className="font-mono text-muted-foreground">
                              {Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Objects */}
            {currentStepData?.state.heap.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-medium">Objects</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentStepData.state.heap.map((obj) => (
                      <div key={obj.id} className="border rounded p-2">
                        <div className="font-semibold text-sm mb-2">{obj.id}</div>
                        {Array.isArray(obj.value) && (
                          <div className="flex gap-1 flex-wrap">
                            {obj.value.map((val: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-10 h-10 border rounded flex items-center justify-center text-sm font-semibold"
                              >
                                {val}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Output */}
            {currentStepData?.state.output.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-medium">Output</h3>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-sm space-y-1">
                    {currentStepData.state.output.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Step slider */}
      {totalSteps > 1 && (
        <div className="p-4 border-t">
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => gotoStep(0)}
              className="text-xs"
            >
              First
            </Button>
            <div className="flex-1 flex gap-1 overflow-x-auto">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => gotoStep(index)}
                  className={`min-w-[32px] h-8 rounded text-xs ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => gotoStep(totalSteps - 1)}
              className="text-xs"
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

