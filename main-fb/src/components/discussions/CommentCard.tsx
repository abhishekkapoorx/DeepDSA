"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentForm } from './CommentForm';

interface CommentCardProps {
  comment: {
    _id: string;
    content: string;
    author: {
      firstName: string;
      lastName: string;
      username: string;
      imageUrl: string;
    };
    upvotes: number;
    downvotes: number;
    replyCount: number;
    depth: number;
    createdAt: string;
    netScore: number;
    replies?: CommentCardProps['comment'][];
  };
  discussionId: string;
  userVote?: 'upvote' | 'downvote' | null;
  onVote?: (commentId: string, voteType: 'upvote' | 'downvote') => void;
  onReply?: (parentCommentId: string, content: string) => void;
  maxDepth?: number;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  discussionId,
  userVote,
  onVote,
  onReply,
  maxDepth = 5
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (onVote) {
      onVote(comment._id, voteType);
    }
  };

  const handleReply = (content: string) => {
    if (onReply) {
      onReply(comment._id, content);
      setShowReplyForm(false);
    }
  };

  const getAuthorDisplayName = () => {
    if (comment.author.firstName && comment.author.lastName) {
      return `${comment.author.firstName} ${comment.author.lastName}`;
    }
    return comment.author.username || 'Anonymous';
  };

  const getAuthorInitials = () => {
    const firstName = comment.author.firstName || '';
    const lastName = comment.author.lastName || '';
    const username = comment.author.username || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username[0]?.toUpperCase() || 'A';
  };

  const canReply = comment.depth < maxDepth;

  return (
    <div className={`${comment.depth > 0 ? 'ml-4 border-l-2 border-muted pl-4 mt-2' : 'mb-4'}`}>
      <Card className={`${comment.depth > 0 ? 'bg-muted/30' : ''}`}>
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={comment.author.imageUrl} />
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getAuthorDisplayName()}
                    </span>
                    {comment.depth > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Reply
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              {/* Vote Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 ${
                    userVote === 'upvote' ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' : ''
                  }`}
                  onClick={() => handleVote('upvote')}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span className="ml-1 text-xs">{comment.upvotes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 ${
                    userVote === 'downvote' ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950' : ''
                  }`}
                  onClick={() => handleVote('downvote')}
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span className="ml-1 text-xs">{comment.downvotes}</span>
                </Button>
              </div>

              {/* Reply Button */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-7 px-2"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <div className="pt-3 border-t border-border/50">
                <CommentForm
                  discussionId={discussionId}
                  parentCommentId={comment._id}
                  onSubmit={handleReply}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder={`Reply to ${getAuthorDisplayName()}...`}
                />
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="h-7 px-2 mb-2 text-xs"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                </Button>
                
                {showReplies && (
                  <div className="space-y-2">
                    {comment.replies.map((reply) => (
                      <CommentCard
                        key={reply._id}
                        comment={reply}
                        discussionId={discussionId}
                        onVote={onVote}
                        onReply={onReply}
                        maxDepth={maxDepth}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
