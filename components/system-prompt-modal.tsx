"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  MessageSquare,
  Save,
  RotateCcw,
  Sparkles
} from "lucide-react";

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemPromptModal({ isOpen, onClose }: SystemPromptModalProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tempSystemPrompt, setTempSystemPrompt] = useState("");

  // Default system prompts
  const defaultPrompts = [
    {
      name: "Default Assistant",
      prompt: "You are a helpful AI assistant. Be concise, accurate, and friendly in your responses."
    },
    {
      name: "Code Expert",
      prompt: "You are an expert software developer. Provide clean, well-documented code examples and explain programming concepts clearly. Focus on best practices and efficient solutions."
    },
    {
      name: "Creative Writer",
      prompt: "You are a creative writing assistant. Help users with storytelling, character development, plot ideas, and writing techniques. Be imaginative and inspiring."
    },
    {
      name: "Academic Tutor",
      prompt: "You are an academic tutor. Explain complex topics in simple terms, provide step-by-step solutions, and encourage critical thinking. Adapt your teaching style to the user's level."
    }
  ];

  // Load system prompt on mount
  useEffect(() => {
    const savedSystemPrompt = localStorage.getItem('openai_system_prompt') || "";
    setSystemPrompt(savedSystemPrompt);
    setTempSystemPrompt(savedSystemPrompt);
  }, []);

  const handleSave = () => {
    const trimmedPrompt = tempSystemPrompt.trim();
    localStorage.setItem('openai_system_prompt', trimmedPrompt);
    setSystemPrompt(trimmedPrompt);
    onClose();
  };

  const handleCancel = () => {
    setTempSystemPrompt(systemPrompt);
    onClose();
  };

  const handleReset = () => {
    setTempSystemPrompt("");
  };

  const handleUseTemplate = (template: string) => {
    setTempSystemPrompt(template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#2a2a2a] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            System Prompt
          </DialogTitle>
          <DialogDescription className="text-[#a1a1aa]">
            Customize how the AI assistant behaves by setting a system prompt. This will be sent with every message to guide the AI's responses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Current System Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Custom System Prompt</label>
            <Textarea
              value={tempSystemPrompt}
              onChange={(e) => setTempSystemPrompt(e.target.value)}
              placeholder="Enter your custom system prompt here..."
              className="bg-[#2a2a2a] border border-[#3a3a3a] text-white placeholder-[#6b7280] min-h-[120px] resize-none focus:ring-1 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
              rows={6}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#6b7280]">
                {tempSystemPrompt.length} characters
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a] text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Tips for Good System Prompts
            </h4>
            <ul className="text-xs text-blue-200/80 space-y-1">
              <li>• Be specific about the AI's role and behavior</li>
              <li>• Include formatting preferences (e.g., "use bullet points")</li>
              <li>• Specify the tone (professional, casual, friendly, etc.)</li>
              <li>• Mention any constraints or guidelines to follow</li>
              <li>• Keep it concise but comprehensive</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t border-[#2a2a2a]">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            className="border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#2a2a2a] hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-white hover:bg-gray-200 text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            Save System Prompt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
