"use client";
import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'error';
  input: string;
  expected: string;
  actual: string;
  runtime: string;
  memory: string;
}

const dummyTestResults: TestResult[] = [
  {
    id: '1',
    name: 'Test Case 1',
    status: 'passed',
    input: 'nums1 = [1,3], nums2 = [2]',
    expected: '2.00000',
    actual: '2.00000',
    runtime: '1ms',
    memory: '46.6MB'
  },
  {
    id: '2',
    name: 'Test Case 2',
    status: 'passed',
    input: 'nums1 = [1,2], nums2 = [3,4]',
    expected: '2.50000',
    actual: '2.50000',
    runtime: '1ms',
    memory: '46.6MB'
  },
  {
    id: '3',
    name: 'Test Case 3',
    status: 'failed',
    input: 'nums1 = [0,0], nums2 = [0,0]',
    expected: '0.00000',
    actual: '0.50000',
    runtime: '1ms',
    memory: '46.6MB'
  }
];

export const TestResults: React.FC = () => {
  const passedTests = dummyTestResults.filter(test => test.status === 'passed').length;
  const totalTests = dummyTestResults.length;
  const successRate = (passedTests / totalTests) * 100;

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'running':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          
          {/* Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">Test Results Summary</p>
                  <p className="text-xs text-muted-foreground">
                    {passedTests} of {totalTests} tests passed
                  </p>
                </div>
                <Badge variant={successRate === 100 ? 'default' : 'destructive'}>
                  {successRate.toFixed(0)}% Success
                </Badge>
              </div>
              <Progress value={successRate} className="w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Test Results List */}
        <div className="space-y-4">
          {dummyTestResults.map((test) => (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(test.status)} border-0`}
                    >
                      {test.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Runtime: {test.runtime}</span>
                    <span>Memory: {test.memory}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Input</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {test.input}
                  </code>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected</p>
                    <code className="text-sm bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                      {test.expected}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Actual</p>
                    <code className={`text-sm px-2 py-1 rounded ${
                      test.status === 'passed' 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {test.actual}
                    </code>
                  </div>
                </div>
                {test.status === 'failed' && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Test failed: Expected {test.expected}, but got {test.actual}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 