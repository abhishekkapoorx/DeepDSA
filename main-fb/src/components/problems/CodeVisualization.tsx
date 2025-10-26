"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Eye, Code, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { parseCode } from '../../utils/codeVisualizer';

interface CodeVisualizationProps {
  code?: string;
  language?: string;
  problem?: {
    title?: string;
    testcases?: Array<{ input: string; output: string }>;
  };
}

interface VisualizationStep {
  step: number;
  description: string;
  code: string;
  variables: Record<string, any>;
  highlightedLines?: number[];
}

export const CodeVisualization: React.FC<CodeVisualizationProps> = ({ 
  code = '', 
  language = 'java',
  problem 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState([1]);
  const [error, setError] = useState<string | null>(null);

  // Parse code and generate visualization steps
  const steps = useMemo<VisualizationStep[]>(() => {
    if (!code || code.trim().length === 0) {
      return [{
        step: 1,
        description: "Start typing your code to see visualization",
        code: "// Your code will appear here",
        variables: {}
      }];
    }

    try {
      const parsed = parseCode(code, language);
      return parsed;
    } catch (err) {
      setError(`Unable to parse code: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return [{
        step: 1,
        description: "Code parsing error",
        code: code.slice(0, 100) + (code.length > 100 ? '...' : ''),
        variables: {}
      }];
    }
  }, [code, language]);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      }, 2000 / speed[0]); // Adjust speed based on slider
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleStepChange = (value: number[]) => {
    setCurrentStep(value[0]);
  };

  const currentStepData = steps[currentStep] || steps[0];

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Code Visualization</h2>
            {problem?.title && (
              <Badge variant="outline" className="ml-2">
                {problem.title}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              disabled={steps.length <= 1}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={steps.length <= 1}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!code || code.trim().length === 0 ? (
          <div className="mt-2 flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Start typing code in the editor to see visualization</span>
          </div>
        ) : error ? (
          <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      {/* Visualization Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Step Information */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Step {currentStepData.step}</h3>
              <Badge variant="secondary">{currentStep + 1}/{steps.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {currentStepData.description}
            </p>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm whitespace-pre-wrap">{currentStepData.code}</code>
            </div>
          </CardContent>
        </Card>

        {/* Variables Display */}
        {Object.keys(currentStepData.variables).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-medium">Variables</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(currentStepData.variables).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between">
                    <span className="text-sm font-medium">{key}:</span>
                    <div className="text-right max-w-[70%]">
                      {Array.isArray(value) ? (
                        <Badge variant="outline" className="text-xs font-mono">
                          [{value.join(', ')}]
                        </Badge>
                      ) : typeof value === 'object' && value !== null ? (
                        <Badge variant="outline" className="text-xs font-mono">
                          {JSON.stringify(value)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-mono">
                          {String(value)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Slider */}
        {steps.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-medium">Step Control</h3>
            </CardHeader>
            <CardContent>
              <Slider
                value={[currentStep]}
                onValueChange={handleStepChange}
                max={steps.length - 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Step 1</span>
                <span>Step {steps.length}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 