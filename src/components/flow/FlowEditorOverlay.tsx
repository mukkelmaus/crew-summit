
import React from 'react';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface FlowEditorOverlayProps {
  isSaving: boolean;
  isRunning: boolean;
}

export function FlowEditorOverlay({ isSaving, isRunning }: FlowEditorOverlayProps) {
  if (!isSaving && !isRunning) return null;

  return (
    <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
      <LoadingIndicator 
        size="lg" 
        text={isSaving ? "Saving flow..." : "Running flow..."}
        className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg"
      />
    </div>
  );
}
