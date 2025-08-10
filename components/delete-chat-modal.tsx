"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatTitle: string;
}

export function DeleteChatModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  chatTitle 
}: DeleteChatModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span>Delete Chat</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 mt-4">
            Are you sure you want to delete this chat? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {/* Chat Preview */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 my-4">
          <div className="flex items-center gap-2 text-sm">
            <Trash2 className="w-4 h-4 text-slate-400" />
            <span className="text-white font-medium truncate">
              "{chatTitle}"
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
