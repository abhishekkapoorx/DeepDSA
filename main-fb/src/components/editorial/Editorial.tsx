"use client";
import React from 'react';
import { Play, ThumbsUp, Eye, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface EditorialProps {
  problemTitle?: string;
}

export const Editorial: React.FC<EditorialProps> = ({ problemTitle = "Median of Two Sorted Arrays" }) => {
  const editorialContent = `
# Editorial: ${problemTitle}

## Problem Overview
Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).

## Approach 1: Brute Force
The simplest approach is to merge the two sorted arrays and find the median.

\`\`\`java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] merged = new int[nums1.length + nums2.length];
        int i = 0, j = 0, k = 0;
        
        while (i < nums1.length && j < nums2.length) {
            if (nums1[i] <= nums2[j]) {
                merged[k++] = nums1[i++];
            } else {
                merged[k++] = nums2[j++];
            }
        }
        
        while (i < nums1.length) {
            merged[k++] = nums1[i++];
        }
        
        while (j < nums2.length) {
            merged[k++] = nums2[j++];
        }
        
        int n = merged.length;
        if (n % 2 == 0) {
            return (merged[n/2 - 1] + merged[n/2]) / 2.0;
        } else {
            return merged[n/2];
        }
    }
}
\`\`\`

**Time Complexity:** O(m + n)  
**Space Complexity:** O(m + n)

## Approach 2: Binary Search (Optimal)
We can find the median without merging the arrays using binary search.

\`\`\`java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }
        
        int x = nums1.length;
        int y = nums2.length;
        
        int low = 0;
        int high = x;
        
        while (low <= high) {
            int partitionX = (low + high) / 2;
            int partitionY = (x + y + 1) / 2 - partitionX;
            
            int maxLeftX = (partitionX == 0) ? Integer.MIN_VALUE : nums1[partitionX - 1];
            int minRightX = (partitionX == x) ? Integer.MAX_VALUE : nums1[partitionX];
            
            int maxLeftY = (partitionY == 0) ? Integer.MIN_VALUE : nums2[partitionY - 1];
            int minRightY = (partitionY == y) ? Integer.MAX_VALUE : nums2[partitionY];
            
            if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
                if ((x + y) % 2 == 0) {
                    return (Math.max(maxLeftX, maxLeftY) + Math.min(minRightX, minRightY)) / 2.0;
                } else {
                    return Math.max(maxLeftX, maxLeftY);
                }
            } else if (maxLeftX > minRightY) {
                high = partitionX - 1;
            } else {
                low = partitionX + 1;
            }
        }
        
        throw new IllegalArgumentException("Input arrays are not sorted");
    }
}
\`\`\`

**Time Complexity:** O(log(min(m, n)))  
**Space Complexity:** O(1)

## Key Insights
1. The median divides the combined array into two equal halves
2. We can use binary search to find the correct partition
3. The optimal solution runs in logarithmic time
`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Editorial Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">LeetCode</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Editorial
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="p-1">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>491</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>702K</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>203</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                className="markdown-content"
                dangerouslySetInnerHTML={{ 
                  __html: editorialContent 
                    .split('\n')
                    .map(line => {
                      if (line.startsWith('```')) {
                        return `<pre><code class="language-java">`;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return `<strong>${line.slice(2, -2)}</strong>`;
                      }
                      if (line.startsWith('#')) {
                        const level = line.match(/^#+/)[0].length;
                        const text = line.replace(/^#+\s*/, '');
                        return `<h${level}>${text}</h${level}>`;
                      }
                      if (line.trim() === '') {
                        return '<br>';
                      }
                      return `<p>${line}</p>`;
                    })
                    .join('')
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 