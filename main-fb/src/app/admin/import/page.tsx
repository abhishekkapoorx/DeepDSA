"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  title: string;
  status: 'success' | 'skipped' | 'error';
  questionNumber?: number;
  testCasesAdded?: number;
  reason?: string;
  error?: string;
}

export default function ImportProblemsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults([]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import-problems', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import problems');
      }

      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import problems');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Import Problems</CardTitle>
          <CardDescription>
            Upload a JSON file containing problems and test cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              disabled={uploading}
            />

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                {error}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Problems
                </>
              )}
            </Button>
          </div>
          {/* Add a sample json schema for the file */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <details className="cursor-pointer">
              <summary className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📋 JSON Schema Format
              </summary>
              <div className="mt-3 space-y-3 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Required Fields:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">title</code> - Problem title</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">description</code> - Full problem description</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">difficulty</code> - "EASY", "MEDIUM", or "HARD"</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">tags</code> - Array of tags</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">starterCode</code> - Starter function code</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">functionName</code> - Function name</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">inputVariables</code> - Array of input parameters</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">outputVariable</code> - Output specification</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">testCases</code> - Array of test cases</li>
                </ul>
                
                <div className="mt-4">
                  <p className="font-medium">Sample JSON:</p>
                  <pre className="mt-2 p-3 bg-blue-100 dark:bg-blue-900 rounded text-xs overflow-x-auto">
{`[
  {
    "title": "Two Sum",
    "description": "Given an array...",
    "difficulty": "EASY",
    "tags": ["array", "hash-table"],
    "starterCode": "function twoSum(nums, target) {\\n  return [];\\n}",
    "functionName": "twoSum",
    "hints": ["Hint 1", "Hint 2"],
    "inputVariables": [
      {
        "name": "nums",
        "type": "number[]",
        "description": "Array of integers"
      }
    ],
    "outputVariable": {
      "type": "number[]",
      "description": "Indices of two numbers"
    },
    "companyTags": ["Google"],
    "testCases": [
      {
        "name": "Example 1",
        "input": "[2,7,11,15]\\n9",
        "output": "[0,1]",
        "isExample": true,
        "isHidden": false
      }
    ]
  }
]`}
                  </pre>
                </div>
              </div>
            </details>
          </div>

          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold">Import Results</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded flex items-center gap-2 ${
                      result.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : result.status === 'skipped'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : result.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.status === 'success' && (
                        <div className="text-sm">
                          Question #{result.questionNumber} • {result.testCasesAdded} test case(s)
                        </div>
                      )}
                      {result.status === 'skipped' && (
                        <div className="text-sm">{result.reason}</div>
                      )}
                      {result.status === 'error' && (
                        <div className="text-sm">{result.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

