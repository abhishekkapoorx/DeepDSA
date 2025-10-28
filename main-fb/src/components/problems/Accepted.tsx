"use client";
import React from 'react';
import { Clock, Cpu, TrendingUp, BookOpen, PenTool, ArrowLeft, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AcceptedProps {
  submission?: {
    _id: string;
    status: string;
    runtime?: number;
    memory?: number;
    testsPassed: number;
    totalTests: number;
    createdAt: string;
    language?: string;
  };
}

export const Accepted: React.FC<AcceptedProps> = ({ submission }) => {
  if (!submission) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Code not submitted yet
      </div>
    );
  }

  const runtimeMs = (submission.runtime || 0).toFixed(0);
  const memoryMB = ((submission.memory || 0) / (1024 * 1024)).toFixed(2);
  const runtimeBeatPercentage = 100; // Mock data
  const memoryBeatPercentage = 13.04; // Mock data

  // TODO: Make this live data
  // Mock data for runtime distribution chart
  const generateMockDistribution = () => {
    return [
      { time: '1ms', height: 100, users: 2345 },
      { time: '2ms', height: 12, users: 289 },
      { time: '3ms', height: 5, users: 145 },
      { time: '4ms', height: 2, users: 67 },
      { time: '5ms', height: 1, users: 34 }
    ];
  };

  const distribution = generateMockDistribution();

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">All Submissions</span>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Success Status */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              Accepted
            </Badge>
          </div>
          <p className="text-lg font-medium">
            {submission.testsPassed} / {submission.totalTests} testcases passed
          </p>
          <p className="text-sm text-muted-foreground">
            {submission._id} submitted at {new Date(submission.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })} {new Date(submission.createdAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Editorial
          </Button>
          <Button 
            variant="default" 
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <PenTool className="h-4 w-4" />
            Solution
          </Button>
        </div>

        {/* Runtime Section */}
        <div className="space-y-4 border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Runtime
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{runtimeMs} ms</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="font-medium text-green-600">
                Beats {runtimeBeatPercentage.toFixed(2)}%
              </span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>

            {/* Complexity Analysis Link */}
            <div className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 cursor-pointer">
              <Sparkles className="h-4 w-4" />
              <span>Analyze Complexity</span>
            </div>

            {/* Runtime Distribution Chart */}
            <div className="mt-6 space-y-2">
              <div className="flex items-end space-x-2 h-32">
                {distribution.map((dist, idx) => {
                  const isHighlighted = dist.time === `${runtimeMs}ms` || (parseInt(runtimeMs) <= 1 && dist.time === '1ms');
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center relative group">
                      <div className="relative w-full">
                        <div 
                          className="w-full bg-muted transition-all cursor-pointer group-hover:bg-primary"
                          style={{ height: `${dist.height}%` }}
                        >
                          {isHighlighted && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">{dist.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Distribution Legend */}
              <div className="flex space-x-1 pt-2 border-t border-border">
                {distribution.map((dist, idx) => (
                  <div 
                    key={idx} 
                    className={`flex-1 h-1 ${parseInt(runtimeMs) <= parseInt(dist.time.replace('ms', '')) ? 'bg-foreground' : 'bg-muted'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Memory Section */}
        <div className="space-y-4 border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Memory
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{memoryMB} MB</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="font-medium text-orange-600">
                Beats {memoryBeatPercentage.toFixed(2)}%
              </span>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Test Cases Summary */}
        <div className="space-y-4 border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold">Test Cases</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Tests:</span>
              <span className="font-medium">{submission.totalTests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Passed:</span>
              <span className="font-medium text-green-600">{submission.testsPassed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Failed:</span>
              <span className="font-medium text-red-600">{submission.totalTests - submission.testsPassed}</span>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="space-y-4 border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold">Submission Details</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Language:</span>
              <Badge variant="secondary">{submission.language?.toUpperCase() || 'N/A'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="bg-green-600 text-white">{submission.status}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
