"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { MessageSquare, Send, Bot, User, Mic, Square, Play, Pause, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Simple notify helper
const notify = {
  error: (msg: string) => (typeof window !== 'undefined' ? window.alert(msg) : console.error(msg)),
  success: (msg: string) => (typeof window !== 'undefined' ? window.alert(msg) : console.log(msg)),
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
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced message with code context
  const enhancedInputValue = useMemo(() => {
    if (!codeContext?.code) return inputValue;
    
    const contextInfo = `\n\n[Code Context: ${codeContext.language}]\n${codeContext.code.slice(0, 200)}${codeContext.code.length > 200 ? '...' : ''}`;
    return inputValue + contextInfo;
  }, [inputValue, codeContext]);

  const stopInterview = useCallback(() => {
    setIsInterviewActive(false);
    setIsPaused(false);
    setTimeRemaining(10 * 60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const finalizeInterview = useCallback(async () => {
    if (!interviewId || !isInterviewActive) return;
    setFinalizing(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/finalize`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error || 'Failed to finalize');
        return;
      }
      notify.success(`Interview completed! Score: ${data.score}/10`);
      // append compact summary
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), type: 'ai', content: `Summary: ${data.summary}`, timestamp: new Date() },
        { id: crypto.randomUUID(), type: 'ai', content: `Suggestions: ${(data.suggestions || []).join('; ')}`, timestamp: new Date() },
      ]);
      setIsInterviewActive(false);
      stopInterview();
    } catch {
      notify.error('Network error');
    } finally {
      setFinalizing(false);
    }
  }, [interviewId, isInterviewActive, stopInterview]);

  // Timer effect with proper dependencies
  useEffect(() => {
    if (isInterviewActive && !isPaused && timeRemaining > 0) {
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
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewActive, isPaused, timeRemaining, finalizeInterview]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    if (isInterviewActive) return;
    
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
        
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 429) {
            notify.error('Daily interview limit reached (3 interviews per day)');
            break;
          } else if (res.status === 401) {
            notify.error('Please sign in to start an interview');
            break;
          } else if (res.status >= 500 && retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          } else {
            notify.error(data.error || 'Failed to start interview');
            break;
          }
        }
        
        const data = await res.json();
        setInterviewId(data.id);
        setMessages([
          { id: 'welcome', type: 'ai', content: data.message.content, timestamp: new Date() },
        ]);
        setIsInterviewActive(true);
        setTimeRemaining(10 * 60);
        setIsPaused(false);
        break; // Success, exit retry loop
        
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          continue;
        } else {
          notify.error('Network error. Please check your connection and try again.');
          break;
        }
      }
    }
  };

  const pauseInterview = () => {
    setIsPaused(!isPaused);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !interviewId || !isInterviewActive) return;
    const content = enhancedInputValue.trim(); // ✅ Use enhanced input with code context
    const userMessage: Message = { id: Date.now().toString(), type: 'user', content, timestamp: new Date() };
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
          body: JSON.stringify({ content }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 429) {
            notify.error('Rate limit exceeded. Please wait a moment.');
            break;
          } else if (res.status === 401) {
            notify.error('Session expired. Please refresh the page.');
            break;
          } else if (res.status >= 500 && retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          } else {
            notify.error(data.error || 'Failed to send message');
            break;
          }
        }
        
        const data = await res.json();
        const aiMsg: Message = { id: crypto.randomUUID(), type: 'ai', content: data.message.content, timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
        break; // Success, exit retry loop
        
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          continue;
        } else {
          notify.error('Network error. Please check your connection and try again.');
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
      notify.error('Speech recognition not supported');
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
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
    setIsRecording(true);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">AI Interview</h2>
          </div>
          
          {/* Timer and Controls */}
          <div className="flex items-center space-x-2 bg-card">
            {isInterviewActive && (
              <>
                <div className="flex items-center space-x-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={`font-mono ${timeRemaining <= 60 ? 'text-red-500' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseInterview}
                  className="h-8 px-2"
                >
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Problem Context */}
        {problem && (
          <div className="mt-2 p-2 bg-muted border border-border rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{problem.title}</h3>
              <Badge variant={problem.difficulty === 'HARD' ? 'destructive' : problem.difficulty === 'MEDIUM' ? 'default' : 'secondary'}>
                {problem.difficulty}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {problem.description.slice(0, 150)}...
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {problem.tags?.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Code Context Display */}
        {codeContext && codeContext.code && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Current Code Context</span>
              <Badge variant="outline" className="text-xs">
                {codeContext.language}
              </Badge>
            </div>
            <pre className="text-xs text-blue-800 dark:text-blue-200 mt-1 overflow-x-auto">
              {codeContext.code.slice(0, 100)}...
            </pre>
          </div>
        )}
      </div>

      

      {/* Messages */}
      {isInterviewActive && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.type === 'ai' ? '/api/placeholder/32/32' : undefined} />
                  <AvatarFallback className={message.type === 'ai' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}>
                    {message.type === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <Card className={`${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-muted'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Interview Button */}
      {!isInterviewActive && (
        <div className="p-4 text-center justify-self-end mt-auto border-t">
          <Button 
            onClick={startInterview}
            className="w-full"
            disabled={loading}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Interview
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You have 3 interviews per day. Each interview lasts 10 minutes.
          </p>
        </div>
      )}

      {/* Input */}
      {isInterviewActive && (
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button variant={isRecording ? 'destructive' : 'secondary'} onClick={toggleRecord}>
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={finalizeInterview} disabled={!interviewId || finalizing}>
              Finish & Score
            </Button>
            <Button variant="outline" onClick={stopInterview} className="text-red-600 hover:text-red-700">
              Stop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 
