"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, MessageSquare } from 'lucide-react';
import { DiscussionCard, DiscussionFilters, CreateDiscussionForm, ProblemDiscussionButton } from '@/components/discussions';

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
  netScore: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function DiscussPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-4xl"><div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div></div>}>
      <DiscussPageContent />
    </Suspense>
  );
}

function DiscussPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Filters
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [problemId, setProblemId] = useState<string>('');
  const [problemTitle, setProblemTitle] = useState<string>('');

  // Fetch discussions
  const fetchDiscussions = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedTag && { tag: selectedTag }),
        ...(problemId && { problemId })
      });

      const response = await fetch(`/api/discussions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch discussions');
      }

      if (reset) {
        setDiscussions(data.discussions);
      } else {
        setDiscussions(prev => [...prev, ...data.discussions]);
      }
      
      setPagination(data.pagination);
      
      // Extract unique tags for filter
      const allTags = new Set<string>();
      data.discussions.forEach((discussion: Discussion) => {
        discussion.tags.forEach(tag => allTags.add(tag));
      });
      setAvailableTags(Array.from(allTags).sort());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discussions');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchDiscussions(1, true);
  };

  // Load more discussions
  const loadMore = () => {
    if (pagination && currentPage < pagination.pages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchDiscussions(nextPage, false);
    }
  };

  // Handle voting
  const handleVote = async (discussionId: string, voteType: 'upvote' | 'downvote') => {
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

      // Update local state
      setDiscussions(prev => prev.map(discussion => 
        discussion._id === discussionId 
          ? {
              ...discussion,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
              netScore: data.upvotes - data.downvotes
            }
          : discussion
      ));

    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDiscussions(1, true);
  }, []);

  // Initialize from URL params
  useEffect(() => {
    const params = searchParams;
    if (params.get('sort')) setSortBy(params.get('sort') || 'newest');
    if (params.get('search')) setSearchQuery(params.get('search') || '');
    if (params.get('tag')) setSelectedTag(params.get('tag') || '');
    if (params.get('problemId')) {
      setProblemId(params.get('problemId') || '');
      setProblemTitle(params.get('problemTitle') || '');
    }
  }, [searchParams]);

  // Handle filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFilterChange();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTag, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Discussions</h1>
            <p className="text-muted-foreground mt-1">
              Share ideas, ask questions, and learn from the community
            </p>
          </div>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CreateDiscussionForm
                problemId={problemId}
                problemSlug={problemId}
                problemTitle={problemTitle}
                showProblemSelection={!problemId} // Show problem selection only if no problem is pre-selected
                onSuccess={() => {
                  setShowCreateForm(false);
                  fetchDiscussions(1, true);
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <DiscussionFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          availableTags={availableTags}
          problemId={problemId}
          problemTitle={problemTitle}
          onProblemFilterChange={(id) => {
            setProblemId(id);
            setProblemTitle('');
            router.push('/discuss');
          }}
        />

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && discussions.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Discussions List */}
        {discussions.length > 0 && (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion._id}
                discussion={discussion}
                onVote={handleVote}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && discussions.length === 0 && !error && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTag 
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to start a discussion!'
              }
            </p>
            {!searchQuery && !selectedTag && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Discussion
              </Button>
            )}
          </div>
        )}

        {/* Load More */}
        {pagination && currentPage < pagination.pages && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Load More Discussions
            </Button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {discussions.length} of {pagination.total} discussions
          </div>
        )}
      </div>
    </div>
  );
}