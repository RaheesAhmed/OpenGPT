"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Copy, 
  Download, 
  X, 
  FileText, 
  Code, 
  Globe,
  CheckCheck
} from "lucide-react";

interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'markdown' | 'html' | 'text' | 'json';
  language?: string;
  content: string;
  filename?: string;
}

interface ArtifactsPanelProps {
  artifact: Artifact;
  onClose: () => void;
}

export function ArtifactsPanel({ artifact, onClose }: ArtifactsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename || `${artifact.title.toLowerCase().replace(/\s+/g, '-')}.${getFileExtension(artifact.type, artifact.language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (type: string, language?: string) => {
    if (language) {
      const langMap: { [key: string]: string } = {
        'javascript': 'js',
        'typescript': 'ts',
        'python': 'py',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'xml': 'xml',
        'yaml': 'yml',
        'markdown': 'md',
        'bash': 'sh',
        'shell': 'sh',
      };
      return langMap[language.toLowerCase()] || 'txt';
    }
    
    switch (type) {
      case 'code': return 'txt';
      case 'markdown': return 'md';
      case 'html': return 'html';
      case 'json': return 'json';
      default: return 'txt';
    }
  };

  const getLanguageLabel = () => {
    if (artifact.language) {
      return artifact.language.charAt(0).toUpperCase() + artifact.language.slice(1);
    }
    return artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1);
  };

  const getIcon = () => {
    switch (artifact.type) {
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'html':
        return <Globe className="w-4 h-4" />;
      case 'markdown':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h2 className="text-white font-semibold">{artifact.title}</h2>
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <span>{getLanguageLabel()}</span>
                {artifact.filename && (
                  <>
                    <span>•</span>
                    <span>{artifact.filename}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#2a2a2a] hover:text-white"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#2a2a2a] hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] overflow-hidden">
            <SyntaxHighlighter
              language={artifact.language || 'text'}
              style={oneDark}
              customStyle={{
                height: '100%',
                margin: 0,
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.5',
                backgroundColor: 'transparent',
                overflow: 'auto'
              }}
              showLineNumbers={true}
              wrapLines={true}
              lineNumberStyle={{
                backgroundColor: 'transparent',
                color: '#6b7280',
                paddingRight: '16px',
                borderRight: 'none'
              }}
              codeTagProps={{
                style: {
                  backgroundColor: 'transparent'
                }
              }}
              lineProps={(lineNumber) => ({
                style: {
                  backgroundColor: 'transparent',
                  display: 'block'
                }
              })}
            >
              {artifact.content}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
