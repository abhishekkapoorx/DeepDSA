"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface DiscussionFiltersProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  availableTags: string[];
  problemId?: string;
  problemTitle?: string;
  onProblemFilterChange?: (problemId: string) => void;
}

export const DiscussionFilters: React.FC<DiscussionFiltersProps> = ({
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  availableTags,
  problemId,
  problemTitle,
  onProblemFilterChange
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'mostUpvoted', label: 'Most Upvoted' },
    { value: 'mostCommented', label: 'Most Commented' },
    { value: 'trending', label: 'Trending' }
  ];

  const clearFilters = () => {
    onSearchChange('');
    onTagChange('');
    if (onProblemFilterChange) {
      onProblemFilterChange('');
    }
  };

  const hasActiveFilters = searchQuery || selectedTag || problemId;

  return (
    <div className="space-y-4">
      {/* Problem Filter */}
      {problemId && problemTitle && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtered by problem:</span>
          <Badge variant="secondary" className="font-medium">
            {problemTitle}
          </Badge>
          {onProblemFilterChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProblemFilterChange('')}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by tags:</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTagChange('')}
              className="h-8"
            >
              All
            </Button>
            
            {availableTags.slice(0, 10).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTagChange(tag)}
                className="h-8"
              >
                {tag}
              </Button>
            ))}
            
            {availableTags.length > 10 && (
              <Badge variant="secondary" className="h-8 px-2">
                +{availableTags.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedTag && (
            <Badge variant="secondary" className="gap-1">
              Tag: {selectedTag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onTagChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {problemId && (
            <Badge variant="secondary" className="gap-1">
              Problem-specific
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onProblemFilterChange?.('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};