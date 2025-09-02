"use client";
import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TestResult {
  testCaseId: string;
  testCaseNumber: number;
  status: string;
  time?: number;
  memory?: number;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
}

interface TestResultsProps {
  testResults?: TestResult[] | null;
  isRunning?: boolean;
}

export const TestResults: React.FC<TestResultsProps> = ({ testResults, isRunning }) => {
  // If no test results, show empty state
  if (!testResults || testResults.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <Card>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isRunning ? 'Running tests...' : 'No test results yet. Run your code to see results.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;
  const successRate = (passedTests / totalTests) * 100;

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('accepted') || statusLower.includes('passed')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (statusLower.includes('failed') || statusLower.includes('wrong')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (statusLower.includes('running') || statusLower.includes('in_queue')) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('accepted') || statusLower.includes('passed')) {
      return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    } else if (statusLower.includes('failed') || statusLower.includes('wrong')) {
      return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    } else if (statusLower.includes('running') || statusLower.includes('in_queue')) {
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    } else {
      return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('accepted') || statusLower.includes('passed')) {
      return 'passed';
    } else if (statusLower.includes('failed') || statusLower.includes('wrong')) {
      return 'failed';
    } else if (statusLower.includes('running') || statusLower.includes('in_queue')) {
      return 'running';
    } else {
      return 'error';
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
          {testResults.map((test) => (
            <Card key={test.testCaseId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.testCaseNumber}</span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(test.status)} border-0`}
                    >
                      {getStatusText(test.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Runtime: {test.time ? `${test.time}ms` : 'N/A'}</span>
                    <span>Memory: {test.memory ? `${test.memory}MB` : 'N/A'}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Input</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {test.compile_output || test.stderr || test.stdout || 'N/A'}
                  </code>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected</p>
                    <code className="text-sm bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                      {test.expectedOutput}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Actual</p>
                    <code className={`text-sm px-2 py-1 rounded ${
                      test.passed 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {test.actualOutput || 'N/A'}
                    </code>
                  </div>
                </div>
                {test.passed === false && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Test failed: Expected {test.expectedOutput}, but got {test.actualOutput || 'N/A'}
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