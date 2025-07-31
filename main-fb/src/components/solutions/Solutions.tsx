"use client";
import React from 'react';
import { Play, ThumbsUp, Eye, MessageCircle, ChevronDown, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Solution {
  id: string;
  author: {
    name: string;
    avatar: string;
    status: string;
  };
  title: string;
  tags: string[];
  upvotes: string;
  views: string;
  comments: string;
  hasVideo?: boolean;
  isEfficient?: boolean;
}

const dummySolutions: Solution[] = [
  {
    id: '1',
    author: {
      name: 'niits',
      avatar: '/api/placeholder/32/32',
      status: 'Open'
    },
    title: '【Video】 Divide each array into two groups',
    tags: ['Array', 'Binary Search', 'Divide and Conquer', 'C++', '3+'],
    upvotes: '630',
    views: '25.3K',
    comments: '3',
    hasVideo: true
  },
  {
    id: '2',
    author: {
      name: 'Sidhant Singh',
      avatar: '/api/placeholder/32/32',
      status: 'Open'
    },
    title: '✅99% 🔥||✅ Journey From Brute Force to Most 🔥 Optimized ✅ Three Approaches|| Easy to understand',
    tags: ['Two Pointers', 'Binary Search', 'Sorting', 'C++', '2+'],
    upvotes: '4.9K',
    views: '358.4K',
    comments: '91',
    isEfficient: true
  },
  {
    id: '3',
    author: {
      name: 'Loginov Kirill',
      avatar: '/api/placeholder/32/32',
      status: 'Open'
    },
    title: 'Merging Sorted Arrays for Median – The Cleanest Shortcut You\'ll See',
    tags: ['Array', 'Binary Search', 'Divide and Conquer', 'Java', '1+'],
    upvotes: '2.1K',
    views: '156.7K',
    comments: '45'
  }
];

export const Solutions: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header with Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Solutions</h2>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Sort by
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Input 
              placeholder="Search solutions..." 
              className="max-w-sm"
            />
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">My Solution</Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="python">Python3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Solutions List */}
        <div className="space-y-4">
          {dummySolutions.map((solution) => (
            <Card key={solution.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Author Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={solution.author.avatar} alt={solution.author.name} />
                    <AvatarFallback>
                      {solution.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    {/* Author and Status */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-sm">{solution.author.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {solution.author.status}
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
                    </div>
                    
                    {/* Engagement Metrics */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{solution.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{solution.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{solution.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 