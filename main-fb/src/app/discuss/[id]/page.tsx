"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Clock, 
  ExternalLink,
  ArrowLeft,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentCard, CommentForm } from '@/components/discussions';
import Link from 'next/link';

interface Discussion {
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
  updatedAt: string;
  netScore: number;
}

interface Comment {
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
  replies?: Comment[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = params.id as string;

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [commentDisplayMode, setCommentDisplayMode] = useState<'expanded' | 'collapsed' | 'mixed'>('mixed');

  // Fetch discussion details
  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      setError(null);

      const [discussionRes, commentsRes, voteRes] = await Promise.all([
        fetch(`/api/discussions/${discussionId}`),
        fetch(`/api/discussions/${discussionId}/comments`),
        fetch(`/api/discussions/${discussionId}/vote`)
      ]);

      if (!discussionRes.ok) {
        throw new Error('Discussion not found');
      }

      const discussionData = await discussionRes.json();
      const commentsData = await commentsRes.json();
      const voteData = await voteRes.json();

      setDiscussion(discussionData.discussion);
      setComments(commentsData.comments);
      setUserVote(voteData.voteType);

      console.log("commentsData", commentsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discussion');
    } finally {
      setLoading(false);
    }
  };

  // Handle voting on discussion
  const handleDiscussionVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      setUserVote(data.voteType);
      setDiscussion(prev => prev ? {
        ...prev,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        netScore: data.upvotes - data.downvotes
      } : null);

    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  // Handle voting on comments
  const handleCommentVote = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      // Update comment in state
      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
              netScore: data.upvotes - data.downvotes
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(updateComment(comments));

    } catch (err) {
      console.error('Error voting on comment:', err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (parentCommentId: string | null, content: string) => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parentCommentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }

      // Refresh comments
      const commentsRes = await fetch(`/api/discussions/${discussionId}/comments`);
      const commentsData = await commentsRes.json();
      setComments(commentsData.comments);

      // Update comment count on discussion
      setDiscussion(prev => prev ? {
        ...prev,
        commentCount: prev.commentCount + 1
      } : null);

      setShowCommentForm(false);

    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (discussionId) {
      fetchDiscussion();
    }
  }, [discussionId]);

  const getAuthorDisplayName = (author: any) => {
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.username || 'Anonymous';
  };

  const getAuthorInitials = (author: any) => {
    const firstName = author.firstName || '';
    const lastName = author.lastName || '';
    const username = author.username || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username[0]?.toUpperCase() || 'A';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Discussion not found'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </Button>

        {/* Discussion Header */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              {/* Title and Problem Link */}
              <div>
                <CardTitle className="text-2xl mb-2">{discussion.title}</CardTitle>
                {discussion.problemId && (
                  <Link 
                    href={`/problems/${discussion.problemId.slug}`}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {discussion.problemId.title}
                  </Link>
                )}
              </div>

              {/* Author and Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={discussion.author.imageUrl} />
                    <AvatarFallback>
                      {getAuthorInitials(discussion.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {getAuthorDisplayName(discussion.author)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              {discussion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {discussion.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{discussion.content}</div>
            </div>

            {/* Vote Actions */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${userVote === 'upvote' ? 'text-green-600 bg-green-50' : ''}`}
                  onClick={() => handleDiscussionVote('upvote')}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="ml-1">{discussion.upvotes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${userVote === 'downvote' ? 'text-red-600 bg-red-50' : ''}`}
                  onClick={() => handleDiscussionVote('downvote')}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="ml-1">{discussion.downvotes}</span>
                </Button>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{discussion.commentCount} comments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageCircle className="h-5 w-5 text-primary" />
                Comments ({discussion.commentCount})
              </CardTitle>
              
              {/* Comment Display Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommentDisplayMode(commentDisplayMode === 'expanded' ? 'mixed' : 'expanded')}
                  className="h-8 px-3 text-xs"
                >
                  {commentDisplayMode === 'expanded' ? (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Expanded
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Expand All
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommentDisplayMode(commentDisplayMode === 'collapsed' ? 'mixed' : 'collapsed')}
                  className="h-8 px-3 text-xs"
                >
                  {commentDisplayMode === 'collapsed' ? (
                    <>
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Collapsed
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Collapse All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comment Form */}
            {!showCommentForm ? (
              <div className="bg-muted/30 rounded-lg p-4 border border-dashed border-border/50">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCommentForm(true)}
                  className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-background"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add a comment
                </Button>
              </div>
            ) : (
              <div className="bg-muted/20 rounded-lg p-4 border">
                <CommentForm
                  discussionId={discussionId}
                  onSubmit={(content) => handleCommentSubmit(null, content)}
                  onCancel={() => setShowCommentForm(false)}
                />
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <CommentCard
                    key={comment._id}
                    comment={comment}
                    discussionId={discussionId}
                    onVote={handleCommentVote}
                    onReply={(parentCommentId, content) => 
                      handleCommentSubmit(parentCommentId, content)
                    }
                    defaultExpanded={commentDisplayMode === 'expanded'}
                    defaultCollapsed={commentDisplayMode === 'collapsed'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium text-muted-foreground">No comments yet</p>
                    <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}