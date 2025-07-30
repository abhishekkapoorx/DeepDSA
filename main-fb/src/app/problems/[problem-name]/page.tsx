"use client";
import React, { useRef, useEffect } from "react";
import { DockviewReact, DockviewReadyEvent } from "dockview-react";
import MonacoEditor from "@monaco-editor/react";
import "dockview-core/dist/styles/dockview.css";

const ProblemDescription = ({ problem }: { problem: any }) => (
  <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
    <h2>{problem.title}</h2>
    <p>{problem.description}</p>
    {/* Add more fields as needed */}
  </div>
);

const CodeEditor = ({ starterCode }: { starterCode: string }) => (
  <MonacoEditor
    height="100%"
    defaultLanguage="java"
    defaultValue={starterCode}
    theme="vs-dark"
    options={{ fontSize: 16 }}
  />
);

const TestcasePanel = ({ testcases }: { testcases: any[] }) => (
  <div style={{ padding: 16, height: "100%", background: "#181818", color: "#fff" }}>
    <h4>Testcase</h4>
    {testcases.map((tc, i) => (
      <div key={i} style={{ marginBottom: 8 }}>
        <div>Input: {tc.input}</div>
        <div>Output: {tc.output}</div>
      </div>
    ))}
  </div>
);

// Dummy data for now; replace with real data fetching
const dummyProblem = {
  title: "4. Median of Two Sorted Arrays",
  description: "Given two sorted arrays ...",
  starterCode: `class Solution {\n    public double findMedianSortedArrays(int[] a, int[] b) {\n        // ...\n    }\n}`,
  testcases: [
    { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" },
    { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" },
  ],
};

export default function ProblemDetailPage() {
  const handleReady = (event: DockviewReadyEvent) => {
    const api = event.api;
    
    // Add the description panel
    const descriptionPanel = api.addPanel({
      id: "description",
      component: "description",
      title: "Problem Description",
    });

    // Add the editor panel to the right of description
    const editorPanel = api.addPanel({
      id: "editor", 
      component: "editor",
      title: "Code Editor",
      position: { direction: "right", referencePanel: descriptionPanel },
    });

    // Add the testcase panel below the editor
    api.addPanel({
      id: "testcase",
      component: "testcase", 
      title: "Test Cases",
      position: { direction: "below", referencePanel: editorPanel },
    });

    // Set initial sizes
    descriptionPanel.api.setSize({ width: 400 });
    editorPanel.api.setSize({ height: 400 });
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <DockviewReact
        className="dockview-theme-light"
        components={{
          description: () => <ProblemDescription problem={dummyProblem} />,
          editor: () => <CodeEditor starterCode={dummyProblem.starterCode} />,
          testcase: () => <TestcasePanel testcases={dummyProblem.testcases} />,
        }}
        onReady={handleReady}
      />
    </div>
  );
}