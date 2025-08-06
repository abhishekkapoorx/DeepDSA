import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '@/components/theme';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

interface CodeEditorProps {
  starterCode: string;
}

type Language = 'cpp' | 'java' | 'python' | 'javascript';

const LANGUAGE_CONFIGS = {
  cpp: { name: 'C++', monacoLanguage: 'cpp' },
  java: { name: 'Java', monacoLanguage: 'java' },
  python: { name: 'Python', monacoLanguage: 'python' },
  javascript: { name: 'JavaScript', monacoLanguage: 'javascript' }
};

export const CodeEditor: React.FC<CodeEditorProps> = ({ starterCode }) => {
  const { theme } = useTheme();
  const params = useParams();
  const problemSlug = params['problem-name'] as string;
  
  const [currentLanguage, setCurrentLanguage] = useState<Language>('java');
  const [code, setCode] = useState<string>(starterCode);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const editorRef = useRef<any>(null);

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  // Fetch boilerplate code when language changes
  useEffect(() => {
    const fetchBoilerplate = async () => {
      if (!problemSlug) return;
      
      setIsLoading(true);
      setError(null);
      try {
        // Try the main API first, fallback to test API if it fails
        let response = await fetch(`/api/problems/${problemSlug}/boilerplate?language=${currentLanguage}`);
        
        if (!response.ok) {
          console.log('Main API failed, trying test API...');
          response = await fetch(`/api/test-boilerplate?language=${currentLanguage}`);
        }
        
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

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleSubmit = async () => {
    if (!problemSlug) return;
    
    setIsSubmitting(true);
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
        setResults(data.data);
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Language Selector and Submit Button */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex items-center space-x-2">
          {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
            <Button
              key={key}
              variant={currentLanguage === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLanguageChange(key as Language)}
              disabled={isLoading}
            >
              {config.name}
            </Button>
          ))}
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="ml-2"
        >
          {isSubmitting ? 'Running...' : 'Run Code'}
        </Button>
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
          
          <div className="space-y-2">
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
          </div>
        </div>
      )}
    </div>
  );
};