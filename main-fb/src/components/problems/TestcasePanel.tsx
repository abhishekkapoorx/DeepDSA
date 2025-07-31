import React, { useState } from 'react';
import { TestCase } from './ProblemDescription';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TestcasePanelProps {
  testcases: TestCase[];
}

export const TestcasePanel: React.FC<TestcasePanelProps> = ({ testcases }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Mock test results for demonstration
  const mockTestResults = [
    { status: 'passed' as const, runtime: '1ms', memory: '46.6MB' },
    { status: 'passed' as const, runtime: '1ms', memory: '46.6MB' },
    { status: 'failed' as const, runtime: '1ms', memory: '46.6MB' },
    { status: 'running' as const, runtime: '1ms', memory: '46.6MB' }
  ];

  const getStatusIcon = (status: 'passed' | 'failed' | 'running' | 'error') => {
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

  const getStatusColor = (status: 'passed' | 'failed' | 'running' | 'error') => {
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
    <div className="h-full w-full bg-card text-card-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🧪</span>
            <h2 className="text-lg font-semibold">Test Cases</h2>
          </div>
          <Badge variant="outline" className="text-xs">
            {testcases.length} cases
          </Badge>
        </div>
      </div>
      
      {/* Tab Buttons */}
      <div className="flex gap-1 p-3 border-b border-border bg-muted/20">
        {testcases.map((_, i) => (
          <Button
            key={i}
            size="sm"
            variant={activeTab === i ? 'default' : 'outline'}
            onClick={() => setActiveTab(i)}
            className="h-7 px-3 text-xs"
          >
            Case {i + 1}
          </Button>
        ))}
      </div>
      
      {/* Test Case Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {testcases[activeTab] && (
          <div className="space-y-4">
            {/* Test Case Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(mockTestResults[activeTab]?.status || 'passed')}
                    <span className="font-medium">Test Case {activeTab + 1}</span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(mockTestResults[activeTab]?.status || 'passed')} border-0`}
                    >
                      {mockTestResults[activeTab]?.status || 'passed'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Runtime: {mockTestResults[activeTab]?.runtime || '1ms'}</span>
                    <span>Memory: {mockTestResults[activeTab]?.memory || '46.6MB'}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Input */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Input</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {testcases[activeTab].input}
                  </code>
                </div>
                
                {/* Expected Output */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expected Output</p>
                  <code className="text-sm bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    {testcases[activeTab].output}
                  </code>
                </div>

                {/* Actual Output (if failed) */}
                {mockTestResults[activeTab]?.status === 'failed' && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Actual Output</p>
                    <code className="text-sm bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                      Wrong Answer
                    </code>
                  </div>
                )}

                {/* Error Message (if failed) */}
                {mockTestResults[activeTab]?.status === 'failed' && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Test failed: Expected {testcases[activeTab].output}, but got Wrong Answer
                    </p>
                  </div>
                )}

                {/* Running Status */}
                {mockTestResults[activeTab]?.status === 'running' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Test case is currently running...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-sm font-medium">Test Case Details</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Case ID:</span>
                    <span>#{activeTab + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="secondary" className="text-xs">
                      {activeTab === 0 ? 'Sample' : 'Hidden'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(mockTestResults[activeTab]?.status || 'passed')} border-0`}
                    >
                      {mockTestResults[activeTab]?.status || 'passed'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};