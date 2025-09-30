import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'next/navigation';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface CodeEditorProps {
  starterCode: string;
  onTestResults?: (results: any) => void;
  onExecutionStart?: () => void;
  onCodeChange?: (code: string, language: string) => void;
  onExecutionStateChange?: (isRunning: boolean, isSubmitting: boolean) => void;
}

export interface CodeEditorRef {
  run: () => void;
  submit: () => void;
}

const LANGUAGE_CONFIGS = {
  cpp: { name: 'C++', monacoLanguage: 'cpp' },
  java: { name: 'Java', monacoLanguage: 'java' },
  python: { name: 'Python', monacoLanguage: 'python' },
  javascript: { name: 'JavaScript', monacoLanguage: 'javascript' }
};

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({ 
  starterCode, 
  onTestResults, 
  onExecutionStart, 
  onCodeChange,
  onExecutionStateChange
}, ref) => {
  const { theme } = useTheme();
  const params = useParams();
  const problemSlug = params['problem-name'] as string;
  
  const [currentLanguage, setCurrentLanguage] = useState<Language>('java');
  const [code, setCode] = useState<string>(starterCode);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const editorRef = useRef<any>(null);

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  // Expose run and submit functions to parent component
  useImperativeHandle(ref, () => ({
    run: handleRun,
    submit: handleSubmit
  }));

  // Notify parent of execution state changes
  useEffect(() => {
    onExecutionStateChange?.(isRunning, isSubmitting);
  }, [isRunning, isSubmitting, onExecutionStateChange]);

  // Fetch boilerplate code when language changes
  useEffect(() => {
    const fetchBoilerplate = async () => {
      if (!problemSlug) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/problems/${problemSlug}/boilerplate?language=${currentLanguage}`);
        
        if (response.ok) {
          const data = await response.json();
          setCode(data.data.boilerplate);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch boilerplate:', errorData.error);
          setError(`Failed to load ${currentLanguage} boilerplate: ${errorData.error}`);
          // Fallback to starter code
          setCode(starterCode);
        }
      } catch (error) {
        console.error('Error fetching boilerplate:', error);
        setError(`Network error loading ${currentLanguage} boilerplate`);
        // Fallback to starter code
        setCode(starterCode);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoilerplate();
  }, [currentLanguage, problemSlug, starterCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Debug logging
      if (e.ctrlKey) {
        console.log('Ctrl pressed with key:', e.key, 'code:', e.code);
      }
      
      // Ctrl+' (single quote) to run code
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        e.stopPropagation();
        console.log('Running code via Ctrl+\'');
        handleRun();
      }
      // Ctrl+Enter to submit code
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Submitting code via Ctrl+Enter');
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [code, currentLanguage, problemSlug]); // Add dependencies

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    onCodeChange?.(code, language);
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      // Debounced code context update to parent
      debouncedCodeUpdate(value, currentLanguage);
    }
  }, [currentLanguage]);

  // Debounced function for code context updates
  const debouncedCodeUpdate = useCallback(
    debounce((code: string, language: string) => {
      onCodeChange?.(code, language);
    }, 500), // 500ms delay
    [onCodeChange]
  );

  const handleRun = useCallback(async () => {
    if (!problemSlug) return;
    
    setIsRunning(true);
    onExecutionStart?.();
    try {
      const response = await fetch(`/api/problems/${problemSlug}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: currentLanguage,
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("--------------------------------")
        console.log('data from run', data);
        console.log("--------------------------------")
        setResults(data.data);
        onTestResults?.(data.data);
      } else {
        const errorData = await response.json();
        console.error('Run failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  }, [problemSlug, code, currentLanguage, onExecutionStart, onTestResults]);

  const handleSubmit = useCallback(async () => {
    if (!problemSlug) return;
    
    setIsSubmitting(true);
    onExecutionStart?.();
    try {
      const response = await fetch(`/api/problems/${problemSlug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: currentLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("--------------------------------")
        console.log('data from submit', data);
        console.log("--------------------------------")
        setResults(data.data);
        onTestResults?.(data.data);
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [problemSlug, code, currentLanguage, onExecutionStart, onTestResults]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Language Selector and Submit Button */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex items-center space-x-4">
          <Select value={currentLanguage} onValueChange={handleLanguageChange} disabled={isLoading}>
            <SelectTrigger className="w-32" size="sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* <div className="flex items-center space-x-2">
            <Button
              onClick={handleRun}
              disabled={isRunning || isLoading}
              size="sm"
              title="Run code (Ctrl+')"
              className="relative"
            >
              {isRunning ? 'Running...' : 'Run'}
              <span className="absolute -top-1 -right-1 text-xs bg-muted px-1 rounded text-muted-foreground">
                Ctrl+'
              </span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              size="sm"
              title="Submit code (Ctrl+Enter)"
              className="relative"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
              <span className="absolute -top-1 -right-1 text-xs bg-muted px-1 rounded text-muted-foreground">
                Ctrl+↵
              </span>
            </Button>
          </div> */}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs border-b border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          width="100%"
          language={LANGUAGE_CONFIGS[currentLanguage].monacoLanguage}
          value={code}
          onChange={handleCodeChange}
          theme={editorTheme}
          onMount={handleEditorDidMount}
          options={{ 
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            lineNumbers: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            lineHeight: 20,
            padding: { top: 8, bottom: 8 },
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: false,
              indentation: true
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showReferences: true,
            }
          }}
        />
      </div>

      {/* Results Panel */}
      {results && (
        <div className="border-t border-border p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Test Results</h3>
            <div className="text-sm">
              {results.summary.passed}/{results.summary.total} passed
              ({results.summary.successRate.toFixed(1)}%)
            </div>
          </div>
          
          {/* <div className="space-y-2">
            {results.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.passed 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Test Case {result.testCaseNumber}</span>
                  <span className="font-medium">
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                {!result.passed && (
                  <div className="mt-1 text-xs">
                    <div>Expected: {result.expectedOutput}</div>
                    <div>Actual: {result.actualOutput}</div>
                  </div>
                )}
              </div>
            ))}
          </div> */}
        </div>
      )}
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';