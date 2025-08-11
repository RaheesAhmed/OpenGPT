"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2 } from "lucide-react";

interface OpenAIModel {
  id: string;
  object: string;
  owned_by: string;
}

interface ModelSelectorProps {
  apiKey?: string;
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

export function ModelSelector({ apiKey, selectedModel, onModelSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<OpenAIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default models to show when no API key is provided
  const defaultModels = [
    { id: "gpt-4-turbo", object: "model", owned_by: "openai" },
    { id: "gpt-4", object: "model", owned_by: "openai" },
    { id: "gpt-3.5-turbo", object: "model", owned_by: "openai" },
  ];

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (apiKey) {
        // Use POST with user's API key
        response = await fetch("/api/models", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey }),
        });
      } else {
        // Use GET with server's API key (if available)
        response = await fetch("/api/models", {
          method: "GET",
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      
      // If we got models from the API, use them; otherwise use defaults
      if (data.data && data.data.length > 0) {
        setModels(data.data);
      } else {
        setModels(defaultModels);
      }
      
    } catch (err) {
      console.error("Error fetching models:", err);
      setError("Failed to fetch models");
      setModels(defaultModels);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [apiKey]);

  const formatModelName = (modelId: string) => {
    return modelId
      .replace(/^gpt-/, "GPT-")
      .replace(/-/g, " ")
      .replace(/turbo/i, "Turbo")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getSelectedModelDisplay = () => {
    const model = models.find(m => m.id === selectedModel);
    return model ? formatModelName(model.id) : formatModelName(selectedModel);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="secondary" 
          className="bg-[#1a1a1a] text-[#a1a1aa] border border-[#2a2a2a] px-3 py-1 rounded-lg hover:bg-[#2a2a2a] hover:text-white h-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              {getSelectedModelDisplay()}
              <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-[#1a1a1a] border border-[#2a2a2a] max-h-[300px] overflow-y-auto"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelSelect(model.id)}
            className="text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a] cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{formatModelName(model.id)}</span>
              <span className="text-xs text-[#6b7280]">
                {!apiKey ? "Default" : `by ${model.owned_by}`}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        {!apiKey && (
          <DropdownMenuItem disabled className="text-amber-400 text-xs">
            Add API key to see your available models
          </DropdownMenuItem>
        )}
        
        {error && (
          <DropdownMenuItem disabled className="text-red-400">
            {error}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
