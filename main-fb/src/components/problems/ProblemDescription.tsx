import React from 'react';

export interface Problem {
  title: string;
  description: string;
  starterCode: string;
  testcases: TestCase[];
}

export interface TestCase {
  input: string;
  output: string;
}

interface ProblemDescriptionProps {
  problem: Pick<Problem, 'title' | 'description'>;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => (
  <div className="h-full w-full bg-card text-card-foreground">
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-foreground">{problem.title}</h2>
      <p className="text-muted-foreground mb-6 leading-relaxed">{problem.description}</p>
      
      <div className="bg-muted/30 p-3 rounded-md mb-4 border-l-4 border-primary">
        <p className="font-medium text-foreground mb-2">Example 1:</p>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Input:</span> nums1 = [1,3], nums2 = [2]</p>
          <p><span className="font-medium">Output:</span> 2.00000</p>
          <p><span className="font-medium">Explanation:</span> merged array = [1,2,3] and median is 2.</p>
        </div>
      </div>
      
      <div className="bg-muted/30 p-3 rounded-md mb-4 border-l-4 border-primary">
        <p className="font-medium text-foreground mb-2">Example 2:</p>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Input:</span> nums1 = [1,2], nums2 = [3,4]</p>
          <p><span className="font-medium">Output:</span> 2.50000</p>
          <p><span className="font-medium">Explanation:</span> merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.</p>
        </div>
      </div>
      
      <div className="bg-card border border-border p-3 rounded-md">
        <p className="font-medium text-foreground mb-2">Constraints:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>nums1.length == m</li>
          <li>nums2.length == n</li>
          <li>0 ≤ m ≤ 1000</li>
          <li>0 ≤ n ≤ 1000</li>
          <li>1 ≤ m + n ≤ 2000</li>
        </ul>
      </div>
    </div>
  </div>
);