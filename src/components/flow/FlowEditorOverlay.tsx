
import React from 'react';
import { Loader2, Play } from 'lucide-react';

interface FlowEditorOverlayProps {
  isSaving: boolean;
  isRunning: boolean;
}

export function FlowEditorOverlay({ isSaving, isRunning }: FlowEditorOverlayProps) {
  if (!isSaving && !isRunning) return null;

  return (
    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-4 rounded-md shadow-lg flex items-center gap-3">
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="font-medium">Saving flow...</p>
          </>
        ) : isRunning ? (
          <>
            <Play className="h-6 w-6 text-primary animate-pulse" />
            <p className="font-medium">Running flow...</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
