"use client";
import React, { useEffect, useState } from 'react';
import { Clock, Cpu, ChevronDown, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ApiSubmission = {
  _id: string;
  problemId: { title: string; difficulty: string } | string;
  status: string;
  runtime?: number;
  memory?: number;
  testsPassed: number;
  totalTests: number;
  createdAt: string;
  language?: string;
};

export const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/submissions?limit=20`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (e) {
        console.error('Failed to load submissions', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'WRONG_ANSWER':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'TIME_LIMIT_EXCEEDED':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'RUNTIME_ERROR':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Submissions</h2>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Submissions Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center space-x-1 cursor-pointer hover:bg-muted/50">
                  <span>Status</span>
                  <ChevronDown className="h-3 w-3" />
                </TableHead>
                <TableHead className="flex items-center space-x-1 cursor-pointer hover:bg-muted/50">
                  <span>Language</span>
                  <ChevronDown className="h-3 w-3" />
                </TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(submission.status)} border-0`}
                      >
                        {submission.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {submission.language || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{submission.runtime ?? '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Cpu className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{submission.memory ?? '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {submission.testsPassed}/{submission.totalTests} passed
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State (when no submissions) */}
        {!loading && submissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg font-medium mb-2">No submissions yet</p>
              <p className="text-sm">Submit your solution to see it here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 