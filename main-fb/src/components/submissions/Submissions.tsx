"use client";
import React from 'react';
import { Clock, Cpu, ChevronDown, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Submission {
  id: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  date: string;
  language: string;
  runtime: string;
  memory: string;
  notes?: string;
}

const dummySubmissions: Submission[] = [
  {
    id: 2,
    status: 'Accepted',
    date: 'Jul 10, 2025',
    language: 'Java',
    runtime: '1 ms',
    memory: '46.6 MB'
  },
  {
    id: 1,
    status: 'Accepted',
    date: 'Jul 09, 2025',
    language: 'Java',
    runtime: '1 ms',
    memory: '46 MB'
  }
];

export const Submissions: React.FC = () => {
  const getStatusColor = (status: Submission['status']) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'Wrong Answer':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Time Limit Exceeded':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'Runtime Error':
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
              {dummySubmissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(submission.status)} border-0`}
                      >
                        {submission.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {submission.date}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {submission.language}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{submission.runtime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Cpu className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{submission.memory}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {submission.notes || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State (when no submissions) */}
        {dummySubmissions.length === 0 && (
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