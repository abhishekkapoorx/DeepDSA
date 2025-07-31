import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '@/components/theme';

interface CodeEditorProps {
  starterCode: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ starterCode }) => {
  // Detect theme from document class or system preference
  const { theme } = useTheme();
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  return (
    <div className="w-full h-full bg-background">
      <MonacoEditor
        height="100%"
        width="100%"
        defaultLanguage="java"
        defaultValue={starterCode}
        theme={editorTheme}
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
  );
};