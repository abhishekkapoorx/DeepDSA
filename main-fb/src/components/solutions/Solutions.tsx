"use client";
import React, { useState, useEffect } from 'react';
import { Play, ThumbsUp, Eye, MessageCircle, ChevronDown, Settings, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SolutionAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string;
}

interface SolutionProblem {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
}

interface Solution {
  _id: string;
  title: string;
  description: string;
  content: string;
  code: string;
  language: string;
  author: SolutionAuthor;
  problemId: SolutionProblem;
  problemSlug: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  commentCount: number;
  isPublished: boolean;
  isEfficient?: boolean;
  hasVideo?: boolean;
  videoUrl?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  approach?: string;
  createdAt: string;
  updatedAt: string;
}

interface SolutionsResponse {
  solutions: Solution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface SolutionsProps {
  problemSlug?: string;
}

export const Solutions: React.FC<SolutionsProps> = ({ problemSlug }) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy
      });

      if (problemSlug) {
        params.append('problemSlug', problemSlug);
      }

      if (languageFilter !== 'all') {
        params.append('language', languageFilter);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/solutions?${params}`);
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch solutions');
      }
      const typed: SolutionsResponse = data;

      setSolutions(typed.solutions);
      setPagination(typed.pagination);

    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch solutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [problemSlug, languageFilter, sortBy, pagination.page]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSolutions();
  };

  const handleLanguageChange = (value: string) => {
    setLanguageFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };


  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getAuthorDisplayName = (author: SolutionAuthor): string => {
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.username || 'Anonymous';
  };

  const getAuthorInitials = (author: SolutionAuthor): string => {
    if (author.firstName && author.lastName) {
      return `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
    }
    return author.username?.[0]?.toUpperCase() || 'A';
  };

  if (loading && solutions.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-card">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-card">
      <div className="p-6 space-y-6">
        {/* Header with Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Solutions</h2>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="mostUpvoted">Most Upvoted</SelectItem>
                <SelectItem value="mostViewed">Most Viewed</SelectItem>
                <SelectItem value="mostEfficient">Most Efficient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <Input 
                placeholder="Search solutions..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Search
              </Button>
            </form>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">My Solution</Button>
              <Select value={languageFilter} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="python">Python3</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>


        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSolutions}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Solutions List */}
        {solutions.length > 0 ? (
          <div className="space-y-4">
            {solutions.map((solution) => (
              <Card key={solution._id} className="hover:shadow-md transition-shadow bg-muted">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Author Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={solution.author.imageUrl} alt={getAuthorDisplayName(solution.author)} />
                      <AvatarFallback>
                        {getAuthorInitials(solution.author)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      {/* Author and Status */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-sm">{getAuthorDisplayName(solution.author)}</span>
                        <Badge variant="outline" className="text-xs">
                          Open
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {solution.language.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Solution Title */}
                      <h3 className="text-sm font-medium mb-2 line-clamp-2">
                        {solution.title}
                        {solution.hasVideo && (
                          <Play className="h-3 w-3 inline ml-1 text-blue-500" />
                        )}
                        {solution.isEfficient && (
                          <span className="ml-1">🔥</span>
                        )}
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {solution.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs px-2 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {solution.timeComplexity && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            Time: {solution.timeComplexity}
                          </Badge>
                        )}
                        {solution.spaceComplexity && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            Space: {solution.spaceComplexity}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Engagement Metrics */}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{formatNumber(solution.upvotes)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(solution.views)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{solution.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-muted-foreground">No solutions found</p>
                <p className="text-sm text-muted-foreground">
                  {problemSlug ? 'Be the first to share your solution!' : 'Try adjusting your search criteria.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 