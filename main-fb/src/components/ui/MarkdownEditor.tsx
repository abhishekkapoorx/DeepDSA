'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Code, Split } from 'lucide-react'

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
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')

  // Enhanced markdown-to-HTML converter
  const renderMarkdown = (markdown: string) => {
    if (!markdown.trim()) {
      return '<p class="text-muted-foreground italic">Start typing to see the preview...</p>'
    }

    let html = markdown
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      
      // Headers (must be at start of line)
      .replace(/^#### (.*$)/gm, '<h4 class="text-base font-semibold text-foreground mb-2 mt-4">$1</h4>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-foreground mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-foreground mb-3 mt-6">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-foreground mb-4 mt-8">$1</h1>')
      
      // Code blocks (with language support)
      .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4 border border-border"><code class="text-sm font-mono text-foreground">${code.trim()}</code></pre>`
      })
      
      // Inline code
      .replace(/`([^`\n]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border">$1</code>')
      
      // Bold and italic (improved regex)
      .replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-2" />')
      
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="border-border my-4" />')
      
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">$1</blockquote>')

    // Handle lists properly
    const lines = html.split('\n')
    const processedLines = []
    let inList = false
    let listType = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isUnorderedItem = /^[\*\-] (.+)$/.test(line)
      const isOrderedItem = /^\d+\. (.+)$/.test(line)
      
      if (isUnorderedItem || isOrderedItem) {
        if (!inList) {
          listType = isUnorderedItem ? 'ul' : 'ol'
          processedLines.push(`<${listType} class="list-${isUnorderedItem ? 'disc' : 'decimal'} ml-6 my-2 space-y-1">`)
          inList = true
        } else if ((isUnorderedItem && listType === 'ol') || (isOrderedItem && listType === 'ul')) {
          processedLines.push(`</${listType}>`)
          listType = isUnorderedItem ? 'ul' : 'ol'
          processedLines.push(`<${listType} class="list-${isUnorderedItem ? 'disc' : 'decimal'} ml-6 my-2 space-y-1">`)
        }
        
        const content = line.replace(/^[\*\-] (.+)$/, '$1').replace(/^\d+\. (.+)$/, '$1')
        processedLines.push(`<li class="text-foreground">${content}</li>`)
      } else {
        if (inList) {
          processedLines.push(`</${listType}>`)
          inList = false
          listType = ''
        }
        
        // Convert line breaks to paragraphs for non-empty lines
        if (line.trim()) {
          // Don't wrap already formatted elements
          if (!line.match(/^<(h[1-6]|pre|blockquote|hr)/)) {
            processedLines.push(`<p class="text-foreground mb-2">${line}</p>`)
          } else {
            processedLines.push(line)
          }
        } else {
          processedLines.push('')
        }
      }
    }
    
    if (inList) {
      processedLines.push(`</${listType}>`)
    }

    return processedLines.join('')
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
              Markdown Editor
            </span>
          </div>
          
          <div className="flex items-center gap-1 bg-background border border-border rounded p-1">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'edit' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Code className="h-3 w-3 mr-1" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'split' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Split className="h-3 w-3 mr-1" />
              Split
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {viewMode === 'edit' && (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={rows}
              className="w-full p-4 bg-background text-foreground border-0 resize-none focus:outline-none font-mono text-sm"
              placeholder={placeholder}
            />
          )}
          
          {viewMode === 'preview' && (
            <div 
              className="p-4 min-h-[200px] bg-background text-foreground max-w-none overflow-auto"
              style={{ height: `${rows * 1.5 + 2}rem` }}
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(value)
              }}
            />
          )}
          
          {viewMode === 'split' && (
            <div className="flex h-full">
              {/* Editor Side */}
              <div className="flex-1 border-r border-border">
                <div className="p-2 bg-muted/30 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground">Editor</span>
                </div>
                <textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  rows={rows}
                  className="w-full p-4 bg-background text-foreground border-0 resize-none focus:outline-none font-mono text-sm"
                  placeholder={placeholder}
                />
              </div>
              
              {/* Preview Side */}
              <div className="flex-1">
                <div className="p-2 bg-muted/30 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
                </div>
                <div 
                  className="p-4 bg-background text-foreground max-w-none overflow-auto"
                  style={{ height: `${rows * 1.5}rem` }}
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(value)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-xs text-muted-foreground">
        <p className="mb-1">
          <strong>Supported formats:</strong> **bold**, *italic*, `code`, ```code blocks```, # headers, - lists, [links](url), &gt; quotes
        </p>
        <p>
          <strong>Tip:</strong> Use Split view for real-time preview while typing
        </p>
      </div>
    </div>
  )
}

export default MarkdownEditor