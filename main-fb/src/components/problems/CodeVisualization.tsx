"use client";
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export const CodeVisualization: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState([1]);

  const steps = [
    {
      step: 1,
      description: "Initialize two pointers i=0, j=0",
      code: "int i = 0, j = 0;",
      variables: { i: 0, j: 0, nums1: [1, 3], nums2: [2] }
    },
    {
      step: 2,
      description: "Compare nums1[i] and nums2[j]",
      code: "if (nums1[i] <= nums2[j]) { merged[k++] = nums1[i++]; }",
      variables: { i: 0, j: 0, nums1: [1, 3], nums2: [2], merged: [1] }
    },
    {
      step: 3,
      description: "Add smaller element to merged array",
      code: "merged[k++] = nums1[i++];",
      variables: { i: 1, j: 0, nums1: [1, 3], nums2: [2], merged: [1] }
    },
    {
      step: 4,
      description: "Continue with next comparison",
      code: "if (nums1[i] <= nums2[j]) { merged[k++] = nums1[i++]; }",
      variables: { i: 1, j: 0, nums1: [1, 3], nums2: [2], merged: [1, 2] }
    },
    {
      step: 5,
      description: "Add remaining elements",
      code: "while (i < nums1.length) { merged[k++] = nums1[i++]; }",
      variables: { i: 2, j: 1, nums1: [1, 3], nums2: [2], merged: [1, 2, 3] }
    }
  ];

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

  const currentStepData = steps[currentStep];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Code Visualization</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="flex-1 p-4 space-y-4">
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
              <code className="text-sm">{currentStepData.code}</code>
            </div>
          </CardContent>
        </Card>

        {/* Variables Display */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-medium">Variables</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pointers</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">i:</span>
                    <Badge variant="outline" className="text-xs">
                      {currentStepData.variables.i}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">j:</span>
                    <Badge variant="outline" className="text-xs">
                      {currentStepData.variables.j}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Arrays</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">nums1:</span>
                    <Badge variant="outline" className="text-xs">
                      [{currentStepData.variables.nums1.join(', ')}]
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">nums2:</span>
                    <Badge variant="outline" className="text-xs">
                      [{currentStepData.variables.nums2.join(', ')}]
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Merged Array</p>
              <div className="bg-background border rounded-md p-2">
                <code className="text-sm">
                  [{currentStepData.variables.merged?.join(', ') || '[]'}]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Slider */}
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
      </div>
    </div>
  );
}; 