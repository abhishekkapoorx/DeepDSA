import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';


export interface Problem {
  title: string;
  description: string;
  questionNumber: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  starterCode: string;
  testcases: TestCase[];
}

export interface TestCase {
  input: string;
  output: string;
}

interface ProblemDescriptionProps {
  problem: Pick<Problem, 'title' | 'description' | 'questionNumber' | 'difficulty'>;
  markdownContent?: string; // Optional custom markdown content
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ 
  problem, 
  markdownContent 
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'HARD':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Easy';
      case 'MEDIUM':
        return 'Medium';
      case 'HARD':
        return 'Hard';
      default:
        return difficulty;
    }
  };

  // Use provided markdown content or generate default content
  const content = markdownContent || `
# ${problem.title}

${problem.description}
`;

  // Custom components for ReactMarkdown
  const components: Components = {
    // Custom component styling
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium mb-2 mt-4 text-foreground">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-3 leading-relaxed text-foreground">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
    ),
    li: ({ children, ...props }: any) => {
      // Handle task list items (GitHub Flavored Markdown)
      const checked = (props as any).checked;
      if (checked !== null && checked !== undefined) {
        return (
          <li className="flex items-center ml-4 mb-1 text-foreground">
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span>{children}</span>
          </li>
        );
      }
      return (
        <li className="ml-4 mb-1 text-foreground">{children}</li>
      );
    },
    code: ({ children, className, ...props }: any) => {
      const inline = (props as any).inline;
      const isInline = inline || !className;
      if (isInline) {
        return (
          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">
            {children}
          </code>
        );
      }
      
      // Extract language from className (format: language-{lang})
      const language = className?.replace('language-', '') || '';
      
      return (
        <div className="relative">
          {language && (
            <div className="absolute top-0 right-0 bg-muted px-2 py-1 text-xs text-muted-foreground rounded-bl">
              {language}
            </div>
          )}
          <code className={`${className} block bg-muted p-3 rounded text-sm font-mono text-foreground overflow-x-auto ${language ? 'pt-8' : ''}`}>
            {children}
          </code>
        </div>
      );
    },
    pre: ({ children }) => (
      <pre className="bg-muted p-3 rounded text-sm font-mono text-foreground overflow-x-auto mb-3">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-3">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-border px-3 py-2 text-left font-semibold bg-muted">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-3 py-2 text-foreground">
        {children}
      </td>
    ),
    hr: () => (
      <hr className="border-border my-6" />
    ),
    a: ({ children, href }) => (
      <a 
        href={href} 
        className="text-primary hover:text-primary/80 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    // Handle task lists
    input: ({ type, checked }) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
        );
      }
      return null;
    },
  };

  return (
    <div className="h-full w-full bg-card text-card-foreground">
      <div className="p-4 h-full overflow-y-auto">
        {/* Problem Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold ">
              {problem.questionNumber}.
            </span>
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span className={`px-2 text-lg font-semibold rounded-full ${getDifficultyColor(problem.difficulty)} bg-opacity-10`}>
              {getDifficultyLabel(problem.difficulty)}
            </span>
          </div>
        </div>

        {/* Problem Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};