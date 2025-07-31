'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Code } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  label?: string
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content in Markdown format...",
  rows = 10,
  label
}) => {
  const [isPreview, setIsPreview] = useState(false)

  // Simple markdown-to-HTML converter for basic formatting
  const renderMarkdown = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-foreground mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-foreground mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-foreground mb-4">$1</h1>')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Bold and italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      
      // Lists
      .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      
      // Line breaks
      .replace(/\n/g, '<br>')
      
      // Wrap lists
      .replace(/(<li[^>]*>.*<\/li>)/g, '<ul class="my-2">$1</ul>')

    return html
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {isPreview ? 'Preview' : 'Editor'}
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="inline-flex items-center px-3 py-1 text-sm bg-background border border-border rounded hover:bg-muted"
          >
            {isPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="relative">
          {isPreview ? (
            <div 
              className="p-4 min-h-[200px] bg-background text-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: value ? renderMarkdown(value) : '<p class="text-muted-foreground italic">Nothing to preview</p>' 
              }}
            />
          ) : (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={rows}
              className="w-full p-4 bg-background text-foreground border-0 resize-none focus:outline-none font-mono text-sm"
              placeholder={placeholder}
            />
          )}
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground mt-2">
        Supports Markdown formatting: **bold**, *italic*, `code`, ```code blocks```, # headers, - lists
      </p>
    </div>
  )
}

export default MarkdownEditor