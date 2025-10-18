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
  Clock,
  ChevronDown,
  ChevronRight,
  MessageSquare
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
  defaultExpanded?: boolean;
  defaultCollapsed?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  discussionId,
  userVote,
  onVote,
  onReply,
  maxDepth = 5,
  defaultExpanded = false,
  defaultCollapsed = false
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(
    defaultCollapsed ? false : (defaultExpanded ? true : true)
  );

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
    <div className={`${comment.depth > 0 ? 'ml-6 mt-3' : 'mb-6'}`}>
      {/* Visual connection line for nested comments */}
      {comment.depth > 0 && (
        <div className="relative">
          <div className="absolute -left-6 top-0 bottom-0 w-px bg-border/60"></div>
          <div className="absolute -left-6 top-6 w-4 h-px bg-border/60"></div>
        </div>
      )}
      
      <Card className={`transition-all duration-200 hover:shadow-sm ${
        comment.depth > 0 
          ? 'bg-muted/20 border-l-4 border-l-primary/20' 
          : 'bg-card border shadow-sm'
      }`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className={`${comment.depth > 0 ? 'h-6 w-6' : 'h-8 w-8'}`}>
                  <AvatarImage src={comment.author.imageUrl} />
                  <AvatarFallback className={`${comment.depth > 0 ? 'text-xs' : 'text-sm'}`}>
                    {getAuthorInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`${comment.depth > 0 ? 'text-sm' : 'text-base'} font-medium`}>
                      {getAuthorDisplayName()}
                    </span>
                    {comment.depth > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
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
              
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-60 hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className={`whitespace-pre-wrap ${comment.depth > 0 ? 'text-sm' : 'text-base'} leading-relaxed`}>
                {comment.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              {/* Vote Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-3 transition-colors ${
                    userVote === 'upvote' 
                      ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' 
                      : 'hover:text-green-600 hover:bg-green-50/50'
                  }`}
                  onClick={() => handleVote('upvote')}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span className="ml-1 text-xs font-medium">{comment.upvotes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-3 transition-colors ${
                    userVote === 'downvote' 
                      ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950' 
                      : 'hover:text-red-600 hover:bg-red-50/50'
                  }`}
                  onClick={() => handleVote('downvote')}
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span className="ml-1 text-xs font-medium">{comment.downvotes}</span>
                </Button>
              </div>

              {/* Reply Button */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">Reply</span>
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <div className="pt-4 border-t border-border/30">
                <div className="bg-muted/30 rounded-lg p-3">
                  <CommentForm
                    discussionId={discussionId}
                    parentCommentId={comment._id}
                    onSubmit={handleReply}
                    onCancel={() => setShowReplyForm(false)}
                    placeholder={`Reply to ${getAuthorDisplayName()}...`}
                  />
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(!showReplies)}
                    className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {showReplies ? (
                      <ChevronDown className="h-3 w-3 mr-1 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1 transition-transform duration-200" />
                    )}
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>
                      {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  </Button>
                  
                  {showReplies && (
                    <div className="text-xs text-muted-foreground">
                      {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                    </div>
                  )}
                </div>
                
                {/* Collapsed state preview */}
                {!showReplies && comment.replies.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <MessageSquare className="h-3 w-3" />
                      <span>Latest reply:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={comment.replies[comment.replies.length - 1].author.imageUrl} />
                        <AvatarFallback className="text-xs">
                          {comment.replies[comment.replies.length - 1].author.firstName?.[0] || 
                           comment.replies[comment.replies.length - 1].author.username?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {comment.replies[comment.replies.length - 1].author.firstName && comment.replies[comment.replies.length - 1].author.lastName
                            ? `${comment.replies[comment.replies.length - 1].author.firstName} ${comment.replies[comment.replies.length - 1].author.lastName}`
                            : comment.replies[comment.replies.length - 1].author.username || 'Anonymous'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {comment.replies[comment.replies.length - 1].content.substring(0, 100)}
                          {comment.replies[comment.replies.length - 1].content.length > 100 && '...'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {showReplies && (
                  <div className="space-y-3">
                    {comment.replies.map((reply) => (
                      <CommentCard
                        key={reply._id}
                        comment={reply}
                        discussionId={discussionId}
                        onVote={onVote}
                        onReply={onReply}
                        maxDepth={maxDepth}
                        defaultExpanded={defaultExpanded}
                        defaultCollapsed={defaultCollapsed}
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