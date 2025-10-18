"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Clock, 
  User,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionCardProps {
  discussion: {
    _id: string;
    title: string;
    content: string;
    author: {
      firstName: string;
      lastName: string;
      username: string;
      imageUrl: string;
    };
    problemId?: {
      title: string;
      slug: string;
    };
    tags: string[];
    upvotes: number;
    downvotes: number;
    commentCount: number;
    createdAt: string;
    netScore: number;
  };
  userVote?: 'upvote' | 'downvote' | null;
  onVote?: (discussionId: string, voteType: 'upvote' | 'downvote') => void;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  userVote,
  onVote
}) => {
  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (onVote) {
      onVote(discussion._id, voteType);
    }
  };

  const getAuthorDisplayName = () => {
    if (discussion.author.firstName && discussion.author.lastName) {
      return `${discussion.author.firstName} ${discussion.author.lastName}`;
    }
    return discussion.author.username || 'Anonymous';
  };

  const getAuthorInitials = () => {
    const firstName = discussion.author.firstName || '';
    const lastName = discussion.author.lastName || '';
    const username = discussion.author.username || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username[0]?.toUpperCase() || 'A';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link 
              href={`/discuss/${discussion._id}`}
              className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
            >
              {discussion.title}
            </Link>
            
            {discussion.problemId && (
              <div className="mt-2">
                <Link 
                  href={`/problems/${discussion.problemId.slug}`}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {discussion.problemId.title}
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Content Preview */}
          <p className="text-muted-foreground line-clamp-3">
            {discussion.content}
          </p>

          {/* Tags */}
          {discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {discussion.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {discussion.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{discussion.tags.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={discussion.author.imageUrl} />
                <AvatarFallback className="text-xs">
                  {getAuthorInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {getAuthorDisplayName()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Vote Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${
                    userVote === 'upvote' ? 'text-green-600 bg-green-50' : ''
                  }`}
                  onClick={() => handleVote('upvote')}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span className="ml-1 text-xs">{discussion.upvotes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${
                    userVote === 'downvote' ? 'text-red-600 bg-red-50' : ''
                  }`}
                  onClick={() => handleVote('downvote')}
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span className="ml-1 text-xs">{discussion.downvotes}</span>
                </Button>
              </div>

              {/* Comments */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span>{discussion.commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};