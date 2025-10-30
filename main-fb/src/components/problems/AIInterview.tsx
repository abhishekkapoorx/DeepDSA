"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Send, Bot, User, Mic, Square, Play, Clock, CheckCircle, TrendingUp, AlertCircle, Lightbulb, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Custom Toast Component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []); // Empty deps - only run once on mount

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-5 duration-300`}>
      <div className="flex items-center gap-2">
        {type === 'success' && <CheckCircle className="h-5 w-5" />}
        {type === 'error' && <AlertCircle className="h-5 w-5" />}
        {type === 'info' && <Sparkles className="h-5 w-5" />}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Custom Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

interface Problem {
  title: string;
  description: string;
  difficulty: string;
  tags?: string[];
  starterCode?: string;
}

interface CodeContext {
  code: string;
  language: string;
  cursorPosition?: { line: number; column: number };
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface InterviewResult {
  score: number;
  breakdown: {
    correctness: number;
    approach: number;
    clarity: number;
    efficiency: number;
    communication: number;
  };
  suggestions: string[];
  improvements: string[];
  mistakes: string[];
  summary: string;
  timeLimitExceeded?: boolean;
}

interface AIInterviewProps {
  problem?: Problem;
  codeContext?: CodeContext;
}

export const AIInterview: React.FC<AIInterviewProps> = ({ problem, codeContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [provider] = useState<'gemini' | 'openai'>('gemini');
  const recognitionRef = useRef<null | any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // 10 minutes in seconds
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toasts, showToast, removeToast } = useToast();

  // Enhanced message with code context
  const enhancedInputValue = useMemo(() => {
    if (!codeContext?.code) return inputValue;
    
    const contextInfo = `\n\n[Code Context: ${codeContext.language}]\n${codeContext.code.slice(0, 200)}${codeContext.code.length > 200 ? '...' : ''}`;
    return inputValue + contextInfo;
  }, [inputValue, codeContext]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resetInterview = useCallback(() => {
    setIsInterviewActive(false);
    setTimeRemaining(10 * 60);
    setMessages([]);
    setInterviewId(null);
    setInterviewResult(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const finalizeInterview = useCallback(async () => {
    if (!interviewId || !isInterviewActive) return;
    
    setFinalizing(true);
    
    try {
      const res = await fetch(`/api/interviews/${interviewId}/finalize`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.error || 'Failed to finalize interview', 'error');
        setFinalizing(false);
        return;
      }

      // Set result and stop interview
      setInterviewResult({
        score: data.score || 0,
        breakdown: data.breakdown || {},
        suggestions: data.suggestions || [],
        improvements: data.improvements || [],
        mistakes: data.mistakes || [],
        summary: data.summary || 'No summary available',
        timeLimitExceeded: data.timeLimitExceeded || false
      });
      
      setIsInterviewActive(false);
      
      // Show appropriate toast message
      if (data.timeLimitExceeded) {
        showToast('Interview exceeded time limit. Results reflect time management.', 'info');
      } else {
        showToast('Interview scored successfully!', 'success');
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      showToast(`Interview completed! Score: ${data.score}/10`, 'success');
      
    } catch (error) {
      console.error('Error finalizing interview:', error);
      showToast('Network error while finalizing interview', 'error');
    } finally {
      setFinalizing(false);
    }
  }, [interviewId, isInterviewActive, showToast]);

  // Timer effect
  useEffect(() => {
    if (isInterviewActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-finalize when time runs out
            finalizeInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isInterviewActive, timeRemaining, finalizeInterview]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    if (isInterviewActive) return;
    
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        const res = await fetch('/api/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            provider,
            problemSlug: problem?.title ? problem.title.toLowerCase().replace(/\s+/g, '-') : undefined
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 429) {
            showToast('Daily interview limit reached (3 interviews per day)', 'error');
          } else if (res.status === 401) {
            showToast('Please sign in to start an interview', 'error');
          } else if (res.status >= 500 && retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          } else {
            showToast(data.error || 'Failed to start interview', 'error');
          }
          break;
        }
        
        setInterviewId(data.id);
        setMessages([
          { id: 'welcome', type: 'ai', content: data.message.content, timestamp: new Date() },
        ]);
        setIsInterviewActive(true);
        setTimeRemaining(10 * 60);
        showToast('Interview started! Good luck!', 'success');
        break;
        
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        } else {
          showToast('Network error. Please check your connection.', 'error');
          break;
        }
      }
    }
    
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !interviewId || !isInterviewActive) return;
    
    const content = enhancedInputValue.trim();
    const userMessage: Message = { 
      id: Date.now().toString(), 
      type: 'user', 
      content: inputValue.trim(), // Display only user text, not code context
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        const res = await fetch(`/api/interviews/${interviewId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }), // Send full content with code context
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 429) {
            showToast('Rate limit exceeded. Please wait a moment.', 'error');
          } else if (res.status === 401) {
            showToast('Session expired. Please refresh the page.', 'error');
          } else if (res.status >= 500 && retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          } else {
            showToast(data.error || 'Failed to send message', 'error');
          }
          break;
        }
        
        const aiMsg: Message = { 
          id: crypto.randomUUID(), 
          type: 'ai', 
          content: data.message.content, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, aiMsg]);
        break;
        
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        } else {
          showToast('Network error. Please try again.', 'error');
          break;
        }
      }
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecord = () => {
    const SpeechRecognitionImpl = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognitionImpl) {
      showToast('Speech recognition not supported in your browser', 'error');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    
    const rec: any = new SpeechRecognitionImpl();
    recognitionRef.current = rec;
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    
    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript as string;
      setInputValue(prev => (prev ? prev + ' ' : '') + text);
      showToast('Voice input captured', 'success');
    };
    
    rec.onerror = (event: any) => {
      setIsRecording(false);
      showToast(`Speech recognition error: ${event.error}`, 'error');
    };
    
    rec.onend = () => setIsRecording(false);
    
    rec.start();
    setIsRecording(true);
    showToast('Listening...', 'info');
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}

      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Interview</h2>
              <p className="text-xs text-muted-foreground">Practice with AI-powered interviews</p>
            </div>
          </div>
          
          {/* Timer */}
          {isInterviewActive && (
            <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <span className={`font-mono font-semibold ${timeRemaining <= 60 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
        
        {/* Problem Context */}
        {problem && (
          <div className="mt-3 p-3 bg-muted border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{problem.title}</h3>
              <Badge variant={
                problem.difficulty === 'HARD' ? 'destructive' : 
                problem.difficulty === 'MEDIUM' ? 'default' : 
                'secondary'
              }>
                {problem.difficulty}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {problem.description.slice(0, 150)}...
            </p>
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {problem.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Context Display */}
        {codeContext && codeContext.code && isInterviewActive && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Current Code Context</span>
              <Badge variant="outline" className="text-xs">
                {codeContext.language}
              </Badge>
            </div>
            <pre className="text-xs text-blue-800 dark:text-blue-200 mt-1 overflow-x-auto max-h-20">
              {codeContext.code.slice(0, 150)}...
            </pre>
          </div>
        )}
      </div>

      {/* Results Display */}
      {interviewResult && !isInterviewActive && (
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Time Limit Warning Banner */}
            {interviewResult.timeLimitExceeded && (
              <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                        Time Limit Exceeded
                      </h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Your interview exceeded the 10-minute time limit. Time management is a critical skill in technical interviews. 
                        The score below reflects this.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Score Card */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-xl">
                      <div className="w-28 h-28 rounded-full bg-background flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-primary">{interviewResult.score}</span>
                        <span className="text-sm text-muted-foreground">/10</span>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Interview Completed!</h2>
                <p className="text-muted-foreground mt-2">{interviewResult.summary}</p>
              </CardHeader>
            </Card>

            {/* Score Breakdown */}
            {interviewResult.breakdown && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Performance Breakdown</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(interviewResult.breakdown).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{key}</span>
                        <span className="text-sm font-bold text-primary">{value}/10</span>
                      </div>
                      <Progress value={value * 10} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {interviewResult.suggestions && interviewResult.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Suggestions</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewResult.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Improvements */}
            {interviewResult.improvements && interviewResult.improvements.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewResult.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Mistakes */}
            {interviewResult.mistakes && interviewResult.mistakes.length > 0 && (
              <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Common Mistakes</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewResult.mistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold flex-shrink-0">×</span>
                        <span className="text-sm text-muted-foreground">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-4">
              <Button 
                onClick={resetInterview}
                size="lg"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Start New Interview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {isInterviewActive && !interviewResult && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-300`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={message.type === 'ai' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}>
                    {message.type === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <Card className={`${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-500 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Start Interview Button */}
      {!isInterviewActive && !interviewResult && (
        <div className="p-6 text-center mt-auto border-t border-border bg-card">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                💡 Tip: Explain your thought process clearly and ask clarifying questions!
              </p>
            </div>
            
            <Button 
              onClick={startInterview}
              className="w-full h-12 text-base gap-2"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start Interview
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              🎯 You have <strong>3 interviews per day</strong> • Each interview lasts <strong>10 minutes</strong>
            </p>
          </div>
        </div>
      )}

      {/* Input (only shown during active interview) */}
      {isInterviewActive && !interviewResult && (
        <div className="p-4 border-t border-border bg-card">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={loading || finalizing}
            />
            <Button 
              variant={isRecording ? 'destructive' : 'secondary'} 
              onClick={toggleRecord}
              disabled={loading || finalizing}
              className="flex-shrink-0"
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || loading || finalizing}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button 
              variant="default" 
              onClick={finalizeInterview} 
              disabled={!interviewId || finalizing}
              className="flex-shrink-0 bg-green-600 hover:bg-green-700"
            >
              {finalizing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>Finish</>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Use microphone for voice input • Finish when ready to get your score
          </p>
        </div>
      )}
    </div>
  );
};
