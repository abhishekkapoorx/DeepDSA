import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
  starterCode: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ starterCode }) => {
  // Detect theme from document class or system preference
  const [theme, setTheme] = useState('vs-dark');
  
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'vs-dark' : 'vs');
    };
    
    updateTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(updateTheme);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeListener(updateTheme);
    };
  }, []);

  return (
    <div className="w-full h-full bg-background">
      <MonacoEditor
        height="100%"
        width="100%"
        defaultLanguage="java"
        defaultValue={starterCode}
        theme={theme}
        options={{ 
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
          lineHeight: 20,
          padding: { top: 8, bottom: 8 },
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          },
          suggest: {
            showKeywords: true,
            showSnippets: true
          }
        }}
      />
    </div>
  );
};