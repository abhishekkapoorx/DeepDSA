"use client";
import React from "react";
import * as FlexLayout from "flexlayout-react";
import "./flexlayout-theme.css";
import { ProblemDescription, CodeEditor, TestcasePanel, type Problem } from "@/components/problems";

// Dummy data for now; replace with real data fetching
const dummyProblem: Problem = {
  title: "4. Median of Two Sorted Arrays",
  description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
  starterCode: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Write your solution here
        
    }
}`,
  testcases: [
    { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" },
    { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" },
  ],
};

// FlexLayout configuration
const layoutConfig = {
  global: {
    tabEnableClose: false,
    tabEnableFloat: false,
    tabEnableDrag: true,
    tabEnableRename: false,

    "splitterEnableHandle": true,
    "tabEnablePopout": false,
    "tabSetEnableActiveIcon": true,
    "borderMinSize": 500,
    "borderEnableTabScrollbar": true,
    "relativeTabSize": true,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 50,
        children: [
          {
            type: "tab",
            name: "Description",
            component: "description",
            id: "description",
          },
          {
            type: "tab",
            name: "Editorial",
            component: "editorial",
            id: "editorial",
          },
          {
            type: "tab",
            name: "Solutions",
            component: "solutions",
            id: "solutions",
          },
          {
            type: "tab",
            name: "Submissions",
            component: "submissions",
            id: "submissions",
          },
        ],
      },
      {
        type: "col",
        weight: 50,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Code",
                component: "editor",
                id: "editor",
              },
              {
                type: "tab",
                name: "AI Interview",
                component: "ai-interview",
                id: "ai-interview",
              },
              {
                type: "tab",
                name: "Code Visualization",
                component: "code-visualization",
                id: "code-visualization",
              },
            ],
          },
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Testcase",
                component: "testcase",
                id: "testcase",
              },
              {
                type: "tab",
                name: "Test Results",
                component: "test-results",
                id: "test-results",
              },
            ],
          },
        ],
      },
    ],
  },
};

export default function ProblemDetailPage() {
  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();

    switch (component) {
      case "description":
        return <ProblemDescription problem={dummyProblem} />;
      case "editor":
        return <CodeEditor starterCode={dummyProblem.starterCode} />;
      case "testcase":
        return <TestcasePanel testcases={dummyProblem.testcases} />;
      case "editorial":
        return <div className="p-4">Editorial content coming soon.</div>;
      case "solutions":
        return <div className="p-4">Solutions will be shown here.</div>;
      case "submissions":
        return <div className="p-4">Your submissions will appear here.</div>;
      case "ai-interview":
        return <div className="p-4">AI Interview feature coming soon.</div>;
      case "code-visualization":
        return <div className="p-4">Code Visualization coming soon.</div>;
      case "test-results":
        return <div className="p-4">Your test results will appear here.</div>;
      default:
        return <div>Component not found</div>;
    }
  };

  const onRenderTabSet = (node: FlexLayout.TabSetNode | FlexLayout.BorderNode, renderValues: FlexLayout.ITabSetRenderValues) => {
    // Add language selector to Code tab header
    if (node instanceof FlexLayout.TabSetNode && node.getChildren().some((child: any) => child.getComponent() === "editor")) {
      renderValues.stickyButtons.push(
        <div key="language-selector" className="language-selector flex items-center mr-2">
          <select
            defaultValue="java"
            className="px-2 py-1 text-xs font-medium bg-muted text-foreground border border-border rounded hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer min-w-[80px]"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      );
    }
  };

  return (
    <div className="h-full w-full bg-background text-foreground">
      {/* Main layout container - full height available (navbar handled by layout) */}
      <div className="h-full p-2">
        <div className="h-full w-full rounded-lg overflow-hidden border border-border/50">
          <FlexLayout.Layout
            model={FlexLayout.Model.fromJson(layoutConfig)}
            factory={factory}
            onRenderTabSet={onRenderTabSet}
            realtimeResize
          />
        </div>
      </div>
    </div>
  );
}