import React, { useState } from 'react';
import { TestCase } from './ProblemDescription';
import { Button } from '../ui/button';

interface TestcasePanelProps {
  testcases: TestCase[];
}

export const TestcasePanel: React.FC<TestcasePanelProps> = ({ testcases }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="h-full w-full bg-card text-card-foreground flex flex-col">
      {/* Tab Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
        <span>🧪</span>
        <span className="font-medium text-foreground">Testcase</span>
      </div>
      
      {/* Tab Buttons */}
      <div className="flex gap-1 p-2 border-b border-border bg-muted/20">
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
      
      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {testcases[activeTab] && (
          <div className="space-y-4">
            <div className="bg-muted/20 p-3 rounded-md font-mono text-sm">
              <p className="font-medium text-foreground mb-2">Input:</p>
              <div className="text-muted-foreground">
                {testcases[activeTab].input}
              </div>
            </div>
            <div className="bg-muted/20 p-3 rounded-md font-mono text-sm">
              <p className="font-medium text-foreground mb-2">Expected Output:</p>
              <div className="text-muted-foreground">
                {testcases[activeTab].output}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};