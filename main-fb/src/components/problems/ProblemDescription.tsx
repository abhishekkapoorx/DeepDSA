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

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  const markdownContent = `
# ${problem.title}

${problem.description}

## Examples

### Example 1:
**Input:** nums1 = [1,3], nums2 = [2]  
**Output:** 2.00000  
**Explanation:** merged array = [1,2,3] and median is 2.

### Example 2:
**Input:** nums1 = [1,2], nums2 = [3,4]  
**Output:** 2.50000  
**Explanation:** merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.

## Constraints

- nums1.length == m
- nums2.length == n
- 0 ≤ m ≤ 1000
- 0 ≤ n ≤ 1000
- 1 ≤ m + n ≤ 2000
- -10^6 ≤ nums1[i], nums2[i] ≤ 10^6

## Follow-up

The overall run time complexity should be O(log (m+n)).
`;

  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return `<h1 class="text-2xl font-bold mb-4">${line.slice(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-semibold mb-3 mt-6">${line.slice(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-lg font-medium mb-2 mt-4">${line.slice(4)}</h3>`;
        }
        
        // Bold text
        if (line.includes('**')) {
          line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return `<li class="ml-4 mb-1">${line.slice(2)}</li>`;
        }
        
        // Empty lines
        if (line.trim() === '') {
          return '<br>';
        }
        
        // Regular paragraphs
        return `<p class="mb-3 leading-relaxed">${line}</p>`;
      })
      .join('');
  };

  return (
    <div className="h-full w-full bg-card text-card-foreground">
      <div className="p-4 h-full overflow-y-auto">
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: renderMarkdown(markdownContent) 
          }} 
        />
      </div>
    </div>
  );
};