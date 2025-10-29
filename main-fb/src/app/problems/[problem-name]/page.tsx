"use client";
import React, { useMemo, useEffect, useState } from "react";
import * as FlexLayout from "flexlayout-react";
import "./flexlayout-theme.css";
import { ProblemDescription, CodeEditor, TestcasePanel, type Problem } from "@/components/problems";
import { Editorial } from "@/components/editorial";
import { Solutions } from "@/components/solutions";
import { Submissions } from "@/components/submissions";
import { AIInterview } from "@/components/problems/AIInterview";
import { CodeVisualization } from "@/components/problems/CodeVisualization";
import { TestResults } from "@/components/problems/TestResults";
import { Accepted } from "@/components/problems/Accepted";
import { useIsMobile } from "@/hooks/useIsMobile";
import { desktopLayoutConfig, mobileLayoutConfig } from "@/config/layoutConfigs";
import { useParams } from "next/navigation";
import { useProblem } from "@/contexts/ProblemContext";

interface TestCase {
  input: string;
  output: string;
  isHidden: boolean;
  isExample: boolean;
}

interface ProblemWithTestCases extends Problem {
  testcases: TestCase[];
}

export default function ProblemDetailPage() {
  const isMobile = useIsMobile();
  const params = useParams();
  const slug = params['problem-name'] as string;
  
  const { 
    codeEditorRef, 
    setIsRunning, 
    setIsSubmitting, 
    setExecutionTime,
    acceptedSubmission,
    setAcceptedSubmission,
    setAddAcceptedTab
  } = useProblem();
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [editorial, setEditorial] = useState<any>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<string>('java');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [layoutModelRef, setLayoutModelRef] = useState<FlexLayout.Model | null>(null);

  // Fetch problem data by slug
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/problems/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Problem not found');
          } else {
            setError('Failed to load problem');
          }
          return;
        }

        const data = await response.json();
        setProblem(data);
        setCurrentCode(data.starterCode || '');
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProblem();
    }
  }, [slug]);

  // Fetch editorial data
  useEffect(() => {
    const fetchEditorial = async () => {
      if (!problem) return;
      
      try {
        const response = await fetch(`/api/editorials/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setEditorial(data.editorial);
        }
      } catch (err) {
        console.error('Error fetching editorial:', err);
      }
    };

    fetchEditorial();
  }, [problem, slug]);

  // Handle test results from CodeEditor
  const handleTestResults = (results: any) => {
    setTestResults(results.results);
    
    // Calculate execution time
    if (startTime) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      setExecutionTime(duration);
      setStartTime(null);
    }

    // Always update the persistent My Submission tab with latest status
    const submissionData = {
      _id: results.submissionId || 'unknown',
      status: results.summary?.passed === results.summary?.total ? 'Accepted' : 'Submitted',
      testsPassed: results.summary?.passed ?? 0,
      totalTests: results.summary?.total ?? 0,
      createdAt: new Date().toISOString(),
      language: results.language,
      runtime: results.results?.reduce((sum: number, r: any) => sum + (r.runtime || 0), 0) || 0,
      memory: results.results?.reduce((sum: number, r: any) => sum + (r.memory || 0), 0) || 0,
    };
    setAcceptedSubmission(submissionData);
    
    // Auto-select My Submission tab on submit
    if (layoutModelRef) {
      const acceptedNode = layoutModelRef.getNodeById('accepted');
      if (acceptedNode) {
        layoutModelRef.doAction(FlexLayout.Actions.selectTab('accepted'));
      }
    }
  };

  // Handle run/submit start
  const handleExecutionStart = () => {
    setStartTime(Date.now());
  };

  // Handle code changes from CodeEditor
  const handleCodeChange = (code: string, language: string) => {
    setCurrentCode(code);
    setCurrentLanguage(language);
  };

  // Handle execution state changes from CodeEditor
  const handleExecutionStateChange = (isRunning: boolean, isSubmitting: boolean) => {
    setIsRunning(isRunning);
    setIsSubmitting(isSubmitting);
  };

  // Create the layout model with useMemo to ensure it updates when isMobile changes
  const layoutModel = useMemo(() => {
    const config = isMobile ? mobileLayoutConfig : desktopLayoutConfig;
    const model = FlexLayout.Model.fromJson(config);
    
    // Ensure persistent "My Submission" tab exists beside Description
    const descriptionNode = model.getNodeById('description') as FlexLayout.TabNode | undefined;
    const parentTabset = descriptionNode?.getParent() as FlexLayout.TabSetNode | undefined;
    if (descriptionNode && parentTabset) {
      const children = parentTabset.getChildren();
      const existing = children.find((n) => n.getId() === 'accepted');
      if (!existing) {
        const descIndex = children.findIndex((n) => n.getId() === 'description');
        const addedTab = model.doAction(
          FlexLayout.Actions.addNode(
            {
              type: 'tab',
              name: 'My Submission',
              component: 'accepted',
              id: 'accepted',
              enableClose: true,
            },
            parentTabset.getId(),
            FlexLayout.DockLocation.CENTER,
            Math.max(0, descIndex + 1)
          )
        );
        // Ensure Description tab stays selected
        model.doAction(FlexLayout.Actions.selectTab('description'));
      }
    }
    
    // Store reference to layout model for later actions
    setLayoutModelRef(model);
    // no-op
    
    return model;
  }, [isMobile]);

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();
    
    console.log('[Factory] Rendering component:', component, 'for tab:', node.getId());

    if (loading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error || !problem) {
      return <div className="flex items-center justify-center h-full text-red-500">{error || 'Problem not found'}</div>;
    }

    switch (component) {
      case "description":
        return <ProblemDescription problem={problem} />;
      case "editor":
        return (
          <CodeEditor 
            ref={codeEditorRef}
            starterCode={problem.starterCode} 
            onTestResults={handleTestResults}
            onExecutionStart={handleExecutionStart}
            onCodeChange={handleCodeChange}
            onExecutionStateChange={handleExecutionStateChange}
          />
        );
      case "testcase":
        return (
          <TestcasePanel 
            testcases={problem.testcases || []} 
            testResults={testResults}
            isRunning={false}
          />
        );
      case "editorial":
        return <Editorial problemTitle={problem.title} editorial={editorial} />;
      case "solutions":
        return <Solutions problemSlug={slug} />;
      case "submissions":
        return <Submissions />;
      case "accepted":
        console.log('[Factory] Rendering Accepted component with submission:', acceptedSubmission);
        return <Accepted submission={acceptedSubmission} />;
      case "ai-interview":
        return (
          <AIInterview 
            problem={problem}
            codeContext={{
              code: currentCode,
              language: currentLanguage,
            }}
          />
        );
      case "code-visualization":
        return (
          <CodeVisualization 
            code={currentCode}
            language={currentLanguage}
            problem={problem}
          />
        );
      case "test-results":
        return <TestResults testResults={testResults} isRunning={false} />;
      default:
        return <div>Component not found</div>;
    }
  };

  const onRenderTabSet = (node: FlexLayout.TabSetNode | FlexLayout.BorderNode, renderValues: FlexLayout.ITabSetRenderValues) => {
    // Language selector is now integrated into CodeEditor component
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        
      >
        <div className="text-center">
          <div className="text-white text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-white text-lg">{error || 'Problem not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <FlexLayout.Layout
        model={layoutModel}
        factory={factory}
        onRenderTabSet={onRenderTabSet}
        onModelChange={() => {
          // This callback is called when the layout changes
          // We can use it to sync the model state if needed
        }}
      />
    </div>
  );
}