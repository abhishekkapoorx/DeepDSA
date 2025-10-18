"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CommentFormProps {
  discussionId: string;
  parentCommentId?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  discussionId,
  parentCommentId,
  onSubmit,
  onCancel,
  placeholder = "Write your comment..."
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    const now = Date.now();
    if (isSubmitting || (now - lastSubmissionTime < 2000)) {
      console.log('Preventing duplicate submission:', { isSubmitting, timeSinceLastSubmission: now - lastSubmissionTime });
      return;
    }
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 5000) {
      setError('Comment must be less than 5000 characters');
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionTime(now);
    setError(null);
    
    console.log('Submitting comment:', { content: content.trim(), parentCommentId, timestamp: now });

    try {
      const response = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parentCommentId: parentCommentId || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }

      onSubmit(content.trim());
      setContent('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError(null);
        }}
        placeholder={placeholder}
        rows={3}
        maxLength={5000}
        className="resize-none"
      />
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {content.length}/5000 characters
        </p>
        
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim() || (Date.now() - lastSubmissionTime < 2000)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {isSubmitting ? 'Posting...' : (parentCommentId ? 'Reply' : 'Comment')}
          </Button>
        </div>
      </div>
    </form>
  );
};