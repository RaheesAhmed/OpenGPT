"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Components } from 'react-markdown';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Import highlight.js styles for syntax highlighting
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onOpenArtifact?: (artifact: {
    id: string;
    title: string;
    type: 'code' | 'markdown' | 'html' | 'text' | 'json';
    language?: string;
    content: string;
    filename?: string;
  }) => void;
}

export function MarkdownRenderer({ content, className = "", onOpenArtifact }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setShowToast(true);
      
      // Hide the checkmark after 2 seconds
      setTimeout(() => setCopiedCode(null), 2000);
      
      // Hide the toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Show error feedback
      setCopiedCode('error');
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const components: Components = {
    // Code blocks
    code(props: any) {
      const { node, inline, className, children, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      // Properly extract text content from React children
      const extractTextContent = (element: any): string => {
        if (typeof element === 'string') {
          return element;
        }
        if (typeof element === 'number') {
          return element.toString();
        }
        if (Array.isArray(element)) {
          return element.map(extractTextContent).join('');
        }
        if (element && typeof element === 'object' && element.props && element.props.children) {
          return extractTextContent(element.props.children);
        }
        return '';
      };
      
      const codeContent = extractTextContent(children).replace(/\n$/, '');
      const codeId = Math.random().toString(36).substr(2, 9);
      
      if (!inline) {
        const shouldShowArtifact = codeContent.length > 100 && onOpenArtifact; // Show artifact for longer code
        
        const handleOpenArtifact = () => {
          if (onOpenArtifact) {
            const artifact = {
              id: `artifact-${codeId}`,
              title: `${language || 'Code'} ${language === 'html' ? 'Page' : language === 'json' ? 'Data' : 'Snippet'}`,
              type: (language === 'html' ? 'html' : 
                     language === 'json' ? 'json' :
                     language === 'markdown' || language === 'md' ? 'markdown' :
                     'code') as 'code' | 'markdown' | 'html' | 'text' | 'json',
              language: language,
              content: codeContent,
              filename: `code.${language || 'txt'}`
            };
            onOpenArtifact(artifact);
          }
        };
        
        return (
          <div className="relative group my-4 not-prose">
            <div className="flex items-center justify-between bg-[#2f2f2f] px-4 py-2 rounded-t-lg">
              <span className="text-xs text-gray-300 font-medium">
                {language || 'plaintext'}
              </span>
              <div className="flex items-center gap-1">
                {shouldShowArtifact && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all duration-200 text-xs"
                    onClick={handleOpenArtifact}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all duration-200"
                  onClick={() => copyToClipboard(codeContent, codeId)}
                >
                  {copiedCode === codeId ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <pre className="bg-black text-white p-4 rounded-b-lg overflow-x-auto text-sm leading-6 font-mono">
              <code className={className} {...rest}>
                {children}
              </code>
            </pre>
          </div>
        );
      }
      
      // Inline code
      return (
        <code 
          className="bg-gray-800 text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" 
          {...rest}
        >
          {children}
        </code>
      );
    },

    // Headings with ChatGPT-like styling
    h1: ({ children }) => (
      <h1 className="text-2xl font-semibold text-white mt-8 mb-4 leading-tight tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-white mt-7 mb-3 leading-tight tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-white mt-6 mb-3 leading-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-white mt-5 mb-2 leading-tight">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-semibold text-slate-200 mt-4 mb-2 leading-tight">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-medium text-slate-300 mt-4 mb-2 leading-tight">
        {children}
      </h6>
    ),

    // Paragraphs with better spacing like ChatGPT
    p: ({ children }) => (
      <p className="text-slate-100 mb-4 leading-[1.7] text-[15px]">
        {children}
      </p>
    ),

    // Lists with ChatGPT-like styling
    ul: ({ children }) => (
      <ul className="text-slate-100 mb-4 space-y-2 [&>li]:relative [&>li]:pl-6 [&>li]:before:content-['•'] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-slate-400 [&>li]:before:font-bold">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="text-slate-100 mb-4 space-y-2 [counter-reset:item] [&>li]:relative [&>li]:pl-6 [&>li]:before:content-[counter(item,decimal)'.'] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-slate-400 [&>li]:before:font-medium [&>li]:[counter-increment:item]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-slate-100 text-[15px] leading-[1.7]">
        {children}
      </li>
    ),

    // Links with subtle styling
    a: ({ children, href }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-2 hover:decoration-blue-300/50 transition-colors"
      >
        {children}
      </a>
    ),

    // Text formatting
    strong: ({ children }) => (
      <strong className="font-semibold text-white">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-100">
        {children}
      </em>
    ),

    // Blockquotes with ChatGPT styling
    blockquote: ({ children }) => (
      <blockquote className="border-l-3 border-slate-500 pl-4 py-1 my-6 text-slate-300 italic bg-slate-800/20 rounded-r-md">
        <div className="text-[15px] leading-[1.7]">
          {children}
        </div>
      </blockquote>
    ),

    // Tables with clean styling
    table: ({ children }) => (
      <div className="overflow-x-auto my-6 rounded-md border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-slate-800/50">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-slate-900/20 divide-y divide-slate-700/50">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-slate-800/30 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200 tracking-wide">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-slate-100">
        {children}
      </td>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="border-slate-600 my-8 border-t border-solid" />
    ),

    // Images
    img: ({ src, alt }) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg shadow-lg my-6"
      />
    ),
  };

  return (
    <div className={`markdown-content text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
      
      {/* Copy success toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Code copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
}
