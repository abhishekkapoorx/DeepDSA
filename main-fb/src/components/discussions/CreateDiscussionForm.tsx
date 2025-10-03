"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X, Plus } from 'lucide-react';
import { TAG_CATEGORIES, DISCUSSION_TAGS, getTagDisplayName, validateTags } from '@/lib/discussionTags';

interface CreateDiscussionFormProps {
  problemId?: string;
  problemSlug?: string;
  problemTitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showProblemSelection?: boolean;
}

export const CreateDiscussionForm: React.FC<CreateDiscussionFormProps> = ({
  problemId,
  problemSlug,
  problemTitle,
  onSuccess,
  onCancel,
  showProblemSelection = false
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    selectedProblemId: problemId || '',
    selectedProblemTitle: problemTitle || ''
  });
  
  const [availableProblems, setAvailableProblems] = useState<Array<{_id: string, title: string, slug: string}>>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleAddTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const fetchProblems = async () => {
    try {
      setLoadingProblems(true);
      const response = await fetch('/api/problems');
      if (response.ok) {
        const data = await response.json();
        setAvailableProblems(data.problems || []);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleProblemSelect = (problemId: string) => {
    const problem = availableProblems.find(p => p._id === problemId);
    setFormData(prev => ({
      ...prev,
      selectedProblemId: problemId,
      selectedProblemTitle: problem?.title || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!validateTags(formData.tags)) {
      setError('Invalid tags selected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          tags: formData.tags,
          problemId: formData.selectedProblemId || null,
          problemSlug: formData.selectedProblemId || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create discussion');
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        tags: [],
        selectedProblemId: problemId || '',
        selectedProblemTitle: problemTitle || ''
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/discuss/${data.discussion._id}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discussion');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch problems when component mounts if problem selection is enabled
  useEffect(() => {
    if (showProblemSelection) {
      fetchProblems();
    }
  }, [showProblemSelection]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {problemTitle ? `Discuss: ${problemTitle}` : 'Create New Discussion'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a descriptive title for your discussion"
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Problem Selection */}
          {showProblemSelection && (
            <div className="space-y-2">
              <Label>Link to Problem (Optional)</Label>
              <Select 
                value={formData.selectedProblemId} 
                onValueChange={handleProblemSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a problem to link this discussion to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No problem linked</SelectItem>
                  {loadingProblems ? (
                    <SelectItem value="" disabled>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading problems...
                    </SelectItem>
                  ) : (
                    availableProblems.map((problem) => (
                      <SelectItem key={problem._id} value={problem._id}>
                        {problem.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formData.selectedProblemTitle && (
                <p className="text-xs text-muted-foreground">
                  Linked to: {formData.selectedProblemTitle}
                </p>
              )}
            </div>
          )}

          {/* Pre-filled Problem Info */}
          {!showProblemSelection && problemTitle && (
            <div className="space-y-2">
              <Label>Linked Problem</Label>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">{problemTitle}</p>
                <p className="text-xs text-muted-foreground">
                  This discussion will be linked to this problem
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Share your thoughts, ask questions, or provide solutions..."
              rows={8}
              maxLength={10000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/10000 characters
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {getTagDisplayName(tag)}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Tag Categories */}
            <div className="space-y-3">
              {Object.entries(TAG_CATEGORIES).map(([key, category]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {category.label}
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {category.tags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant={formData.tags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => 
                          formData.tags.includes(tag) 
                            ? handleRemoveTag(tag)
                            : handleAddTag(tag)
                        }
                      >
                        {getTagDisplayName(tag)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.back())}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Discussion
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
