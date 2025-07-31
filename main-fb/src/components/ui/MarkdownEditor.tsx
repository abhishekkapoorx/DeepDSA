'use client'

import React, { useState, useRef, useCallback } from 'react'
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
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // Synchronized scrolling handlers
  const handleEditorScroll = useCallback(() => {
    if (isScrollingRef.current || !editorRef.current || !previewRef.current) return
    
    isScrollingRef.current = true
    const editor = editorRef.current
    const preview = previewRef.current
    
    // Calculate scroll percentage
    const scrollTop = editor.scrollTop
    const scrollHeight = editor.scrollHeight - editor.clientHeight
    const scrollPercentage = scrollHeight > 0 ? scrollTop / scrollHeight : 0
    
    // Apply to preview
    const previewScrollHeight = preview.scrollHeight - preview.clientHeight
    preview.scrollTop = previewScrollHeight * scrollPercentage
    
    // Reset flag after a short delay
    setTimeout(() => {
      isScrollingRef.current = false
    }, 50)
  }, [])

  const handlePreviewScroll = useCallback(() => {
    if (isScrollingRef.current || !editorRef.current || !previewRef.current) return
    
    isScrollingRef.current = true
    const editor = editorRef.current
    const preview = previewRef.current
    
    // Calculate scroll percentage
    const scrollTop = preview.scrollTop
    const scrollHeight = preview.scrollHeight - preview.clientHeight
    const scrollPercentage = scrollHeight > 0 ? scrollTop / scrollHeight : 0
    
    // Apply to editor
    const editorScrollHeight = editor.scrollHeight - editor.clientHeight
    editor.scrollTop = editorScrollHeight * scrollPercentage
    
    // Reset flag after a short delay
    setTimeout(() => {
      isScrollingRef.current = false
    }, 50)
  }, [])

  // Enhanced markdown-to-HTML converter with comprehensive support
  const renderMarkdown = (markdown: string) => {
    if (!markdown.trim()) {
      return '<p class="text-muted-foreground italic">Start typing to see the preview...</p>'
    }

    let html = markdown
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      
      // Headers (all levels)
      .replace(/^###### (.*$)/gm, '<h6 class="text-sm font-medium text-foreground mb-1 mt-3">$1</h6>')
      .replace(/^##### (.*$)/gm, '<h5 class="text-sm font-semibold text-foreground mb-2 mt-3">$1</h5>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-base font-semibold text-foreground mb-2 mt-4">$1</h4>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-foreground mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-foreground mb-3 mt-6">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-foreground mb-4 mt-8">$1</h1>')
      
      // Horizontal rules (multiple formats)
      .replace(/^(_{3,}|_{3,}|\*{3,})$/gm, '<hr class="border-border my-6" />')
      .replace(/^---$/gm, '<hr class="border-border my-6" />')
      
      // Strikethrough
      .replace(/~~([^~\n]+)~~/g, '<del class="line-through text-muted-foreground">$1</del>')
      
      // Mark/Highlight
      .replace(/==([^=\n]+)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
      
      // Subscript and Superscript
      .replace(/\^([^\^\s]+)\^/g, '<sup class="text-xs">$1</sup>')
      .replace(/~([^~\s]+)~/g, '<sub class="text-xs">$1</sub>')
      
      // Inserted text
      .replace(/\+\+([^+\n]+)\+\+/g, '<ins class="underline decoration-green-500">$1</ins>')
      
      // Code blocks (with language support and better styling)
      .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang ? ` data-language="${lang}"` : ''
        return `<pre class="bg-slate-900 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto my-4 border border-border"${language}><code class="text-sm font-mono text-green-400 dark:text-green-300">${code.trim()}</code></pre>`
      })
      
      // Inline code
      .replace(/`([^`\n]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border">$1</code>')
      
      // Bold and italic (improved regex with underscores)
      .replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
      .replace(/___([^_\n]+)___/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/__([^_\n]+)__/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
      .replace(/_([^_\n]+)_/g, '<em class="italic">$1</em>')
      
      // Links with title support
      .replace(/\[([^\]]+)\]\(([^)]+)\s+"([^"]+)"\)/g, '<a href="$2" title="$3" class="text-primary underline hover:text-primary/80">$1</a>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80">$1</a>')
      
      // Auto-links
      .replace(/(https?:\/\/[^\s<>]+)/g, '<a href="$1" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener">$1</a>')
      
      // Images with title support
      .replace(/!\[([^\]]*)\]\(([^)]+)\s+"([^"]+)"\)/g, '<img src="$2" alt="$1" title="$3" class="max-w-full h-auto rounded-md my-2 border border-border" />')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-2 border border-border" />')
      
      // Tables (basic support)
      .replace(/\|(.+)\|\n\|[\s\-\|:]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
        const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
          .map((cell: string) => `<th class="border border-border px-3 py-2 bg-muted font-semibold text-left">${cell}</th>`).join('')
        
        const bodyRows = rows.trim().split('\n').map((row: string) => {
          const cells = row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
            .map((cell: string) => `<td class="border border-border px-3 py-2">${cell}</td>`).join('')
          return `<tr>${cells}</tr>`
        }).join('')
        
        return `<table class="border-collapse border border-border my-4 w-full"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
      })

    // Handle complex structures (lists, blockquotes, etc.)
    const lines = html.split('\n')
    const processedLines = []
    let inList = false
    let listType = ''
    let inBlockquote = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Handle blockquotes (including nested)
      const blockquoteMatch = line.match(/^(>{1,})\s(.+)$/)
      if (blockquoteMatch) {
        const level = blockquoteMatch[1].length
        const content = blockquoteMatch[2]
        
        if (!inBlockquote) {
          processedLines.push(`<blockquote class="border-l-4 border-primary pl-4 my-4 bg-muted/30 rounded-r">`)
          inBlockquote = true
        }
        
        if (level > 1) {
          processedLines.push(`<blockquote class="border-l-2 border-muted-foreground pl-4 mt-2 italic text-muted-foreground">${content}</blockquote>`)
        } else {
          processedLines.push(`<p class="italic text-muted-foreground mb-2">${content}</p>`)
        }
        continue
      } else if (inBlockquote && line.trim() === '') {
        // Empty line in blockquote
        processedLines.push('<br>')
        continue
      } else if (inBlockquote) {
        processedLines.push('</blockquote>')
        inBlockquote = false
      }
      
      // Handle lists (including + - * and numbered)
      const unorderedMatch = line.match(/^(\s*)([\+\-\*])\s(.+)$/)
      const orderedMatch = line.match(/^(\s*)(\d+)\.\s(.+)$/)
      
      if (unorderedMatch || orderedMatch) {
        const match = unorderedMatch || orderedMatch
        const indent = match ? match[1].length : 0
        const content = match ? match[3] : ''
        const isOrdered = !!orderedMatch
        
        if (!inList) {
          listType = isOrdered ? 'ol' : 'ul'
          const listClass = isOrdered ? 'list-decimal' : 'list-disc'
          processedLines.push(`<${listType} class="${listClass} ml-6 my-2 space-y-1">`)
          inList = true
        } else if ((isOrdered && listType === 'ul') || (!isOrdered && listType === 'ol')) {
          processedLines.push(`</${listType}>`)
          listType = isOrdered ? 'ol' : 'ul'
          const listClass = isOrdered ? 'list-decimal' : 'list-disc'
          processedLines.push(`<${listType} class="${listClass} ml-6 my-2 space-y-1">`)
        }
        
        // Handle nested lists
        if (indent > 0) {
          const nestedListType = isOrdered ? 'ol' : 'ul'
          const nestedListClass = isOrdered ? 'list-decimal' : 'list-disc'
          processedLines.push(`<li class="text-foreground"><${nestedListType} class="${nestedListClass} ml-4"><li class="text-foreground">${content}</li></${nestedListType}></li>`)
        } else {
          processedLines.push(`<li class="text-foreground">${content}</li>`)
        }
      } else {
        if (inList) {
          processedLines.push(`</${listType}>`)
          inList = false
          listType = ''
        }
        
        // Convert line breaks to paragraphs for non-empty lines
        if (line.trim()) {
          // Don't wrap already formatted elements
          if (!line.match(/^<(h[1-6]|pre|blockquote|hr|table|ul|ol)/)) {
            processedLines.push(`<p class="text-foreground mb-2 leading-relaxed">${line}</p>`)
          } else {
            processedLines.push(line)
          }
        } else {
          processedLines.push('')
        }
      }
    }
    
    // Close any open structures
    if (inList) {
      processedLines.push(`</${listType}>`)
    }
    if (inBlockquote) {
      processedLines.push('</blockquote>')
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
              ref={editorRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleEditorScroll}
              rows={rows}
              className="w-full p-4 bg-background text-foreground border-0 resize-none focus:outline-none font-mono text-sm"
              placeholder={placeholder}
            />
          )}
          
          {viewMode === 'preview' && (
            <div 
              ref={previewRef}
              className="p-4 min-h-[200px] bg-background text-foreground max-w-none overflow-auto"
              style={{ height: `${rows * 1.5 + 2}rem` }}
              onScroll={handlePreviewScroll}
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(value)
              }}
            />
          )}
          
          {viewMode === 'split' && (
            <div className="flex h-full">
              {/* Editor Side */}
              <div className="flex-1 border-r border-border">
                <div className="p-2 bg-muted/30 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Editor</span>
                  <span className="text-xs text-muted-foreground/70">⚡ Synced scrolling</span>
                </div>
                <textarea
                  ref={editorRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onScroll={handleEditorScroll}
                  rows={rows}
                  className="w-full p-4 bg-background text-foreground border-0 resize-none focus:outline-none font-mono text-sm"
                  placeholder={placeholder}
                />
              </div>
              
              {/* Preview Side */}
              <div className="flex-1">
                <div className="p-2 bg-muted/30 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
                  <span className="text-xs text-muted-foreground/70">⚡ Synced scrolling</span>
                </div>
                <div 
                  ref={previewRef}
                  className="p-4 bg-background text-foreground max-w-none overflow-auto"
                  style={{ height: `${rows * 1.5}rem` }}
                  onScroll={handlePreviewScroll}
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
      <div className="mt-2 text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Text formatting:</strong> **bold**, *italic*, ~~strikethrough~~, ==highlight==, ^superscript^, ~subscript~, ++inserted++
        </p>
        <p>
          <strong>Structure:</strong> # headers (1-6 levels), &gt; blockquotes, --- horizontal rules, - lists, 1. numbered lists
        </p>
        <p>
          <strong>Code:</strong> `inline code`, ```language code blocks```, tables with | pipes |
        </p>
        <p>
          <strong>Links & Media:</strong> [text](url), ![image](url), auto-link URLs
        </p>
        <p className="text-primary">
          <strong>💡 Tip:</strong> Use Split view for real-time preview with synchronized scrolling • All GitHub Flavored Markdown supported
        </p>
      </div>
    </div>
  )
}

export default MarkdownEditor