"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Sidebar, ProblemList, RightSidebar, FeaturedCourses, TopicFilters } from './index';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';

export default function ProblemsPage() {
  const searchParams = useSearchParams();
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

  // Handle URL parameters
  useEffect(() => {
    const collection = searchParams.get('collection');
    const tags = searchParams.get('tags');
    
    if (collection) {
      setCollectionFilter(collection);
    }
    
    if (tags) {
      setSelectedTopic(tags);
    }
  }, [searchParams]);

  // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Filter problems based on collection
  const filterProblemsByCollection = (allProblems: any[], collection: string) => {
    switch (collection) {
      case 'beginner':
        return allProblems.filter(p => p.difficulty === 'EASY');
      case 'arrays':
        return allProblems.filter(p => p.tags.includes('Array'));
      case 'dynamic-programming':
        return allProblems.filter(p => p.tags.some((tag: string) => tag.includes('DP') || tag.includes('Dynamic')));
      case 'graph-algorithms':
        return allProblems.filter(p => p.tags.some((tag: string) => tag.includes('Graph') || tag.includes('Tree')));
      case 'two-pointers':
        return allProblems.filter(p => p.tags.includes('Two Pointers'));
      case 'company-prep':
        return allProblems.filter(p => p.companyTags.length > 0);
      default:
        return allProblems;
    }
  };

  // Fetch once at page level and share
  useEffect(() => {
    const fetchOnce = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/problems?limit=500', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch problems');
        const data = await res.json();
        const allProblems = data?.problems || [];
        
        // Apply collection filter if specified
        if (collectionFilter) {
          const filteredProblems = filterProblemsByCollection(allProblems, collectionFilter);
          setProblems(filteredProblems);
        } else {
          setProblems(allProblems);
        }
      } catch (e) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOnce();
  }, [collectionFilter]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex pt-16">
      {/* Mobile Menu Button */}
      <Button
        variant='ghost'
        className="lg:hidden fixed top-20 left-4 z-50 p-2 "
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop Sidebar Toggle Button */}
      <Button
        variant='ghost'
        className={`hidden lg:flex fixed top-20 z-50 p-2  transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-4' : 'left-4'}`}
        onClick={toggleSidebar}
        title={`${isSidebarOpen ? 'Hide' : 'Show'} Sidebar (Ctrl+B)`}
      >
        {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Left Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>
      <div className={`hidden lg:block transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} ${!isSidebarOpen ? 'lg:border-l lg:border-border' : ''}`}>
        {/* Featured Courses Section */}
        <div className="p-6 border-b border-border">
          <FeaturedCourses />
        </div>
        
        {/* Collection Filter Indicator */}
        {collectionFilter && (
          <div className="p-6 border-b border-border bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium text-primary">
                  Viewing: {collectionFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Collection
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setCollectionFilter(null);
                  setSelectedTopic('All Topics');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear Filter
              </Button>
            </div>
          </div>
        )}
        
        {/* Topic Filters and Search */}
        <div className="p-6 border-b border-border">
          <TopicFilters 
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            problems={problems}
          />
        </div>
        
        {/* Problem List */}
        <div className="flex-1 overflow-hidden">
          <ProblemList 
            selectedTopic={selectedTopic}
            searchQuery={searchQuery}
            problemsFromParent={problems}
          />
        </div>
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar problems={problems} />
    </div>
  );
} 