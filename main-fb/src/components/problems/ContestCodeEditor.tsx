"use client";
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';
import { Play, Send } from 'lucide-react';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface ContestCodeEditorProps {
  contestSlug: string;
  problemSlug: string;
  starterCode: string;
  onTestResults?: (results: any) => void;
  onExecutionStart?: () => void;
  onCodeChange?: (code: string, language: string) => void;
  onExecutionStateChange?: (isRunning: boolean, isSubmitting: boolean) => void;
}

export interface ContestCodeEditorRef {
  run: () => void;
  submit: () => void;
}

const LANGUAGE_CONFIGS = {
  cpp: { name: 'C++', monacoLanguage: 'cpp' },
  java: { name: 'Java', monacoLanguage: 'java' },
  python: { name: 'Python', monacoLanguage: 'python' },
  javascript: { name: 'JavaScript', monacoLanguage: 'javascript' }
};

export const ContestCodeEditor = forwardRef<ContestCodeEditorRef, ContestCodeEditorProps>(({ 
  contestSlug,
  problemSlug,
  starterCode, 
  onTestResults, 
  onExecutionStart, 
  onCodeChange,
  onExecutionStateChange
}, ref) => {
  const { theme } = useTheme();
  
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
      // Ctrl+' (single quote) to run code
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        e.stopPropagation();
        handleRun();
      }
      // Ctrl+Enter to submit code
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [code, currentLanguage, contestSlug, problemSlug]);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    onCodeChange?.(code, language);
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      debouncedCodeUpdate(value, currentLanguage);
    }
  }, [currentLanguage]);

  const debouncedCodeUpdate = useCallback(
    debounce((code: string, language: string) => {
      onCodeChange?.(code, language);
    }, 500),
    [onCodeChange]
  );

  const handleRun = useCallback(async () => {
    if (!contestSlug || !problemSlug) return;
    
    setIsRunning(true);
    onExecutionStart?.();
    try {
      const response = await fetch(`/api/contests/${contestSlug}/problems/${problemSlug}/run`, {
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
        console.log('Run results:', data);
        setResults(data);
        onTestResults?.(data);
      } else {
        const errorData = await response.json();
        console.error('Run failed:', errorData.error);
        setError(errorData.error || 'Failed to run code');
      }
    } catch (error) {
      console.error('Error running code:', error);
      setError('Network error while running code');
    } finally {
      setIsRunning(false);
    }
  }, [contestSlug, problemSlug, code, currentLanguage, onExecutionStart, onTestResults]);

  const handleSubmit = useCallback(async () => {
    if (!contestSlug || !problemSlug) return;
    
    if (!confirm('Submit solution? This will count towards your contest score.')) return;
    
    setIsSubmitting(true);
    onExecutionStart?.();
    try {
      const response = await fetch(`/api/contests/${contestSlug}/problems/${problemSlug}/submit`, {
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
        console.log('Submit results:', data);
        setResults(data);
        onTestResults?.(data);
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData.error);
        setError(errorData.error || 'Failed to submit code');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setError('Network error while submitting code');
    } finally {
      setIsSubmitting(false);
    }
  }, [contestSlug, problemSlug, code, currentLanguage, onExecutionStart, onTestResults]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Language Selector and Action Buttons */}
      <div className="flex items-center justify-between p-3 border-b border-border">
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
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRun}
            disabled={isRunning || isLoading || isSubmitting}
            size="sm"
            title="Run code (Ctrl+')"
            variant="outline"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || isRunning}
            size="sm"
            title="Submit code (Ctrl+Enter)"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm border-b border-red-200 dark:border-red-800">
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
    </div>
  );
});

ContestCodeEditor.displayName = 'ContestCodeEditor';

