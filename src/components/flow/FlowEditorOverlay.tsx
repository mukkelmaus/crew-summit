
import React from 'react';
import { Loader2, Play, XCircle } from 'lucide-react';

interface FlowEditorOverlayProps {
  isSaving: boolean;
  isRunning: boolean;
  progress?: number;
  status?: string;
  error?: string | null;
}

export function FlowEditorOverlay({ 
  isSaving, 
  isRunning, 
  progress, 
  status,
  error
}: FlowEditorOverlayProps) {
  if (!isSaving && !isRunning && !error) return null;

  return (
    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-4 rounded-md shadow-lg flex flex-col items-center gap-3 min-w-[250px]">
        {error ? (
          <>
            <XCircle className="h-6 w-6 text-destructive" />
            <p className="font-medium text-destructive">Error</p>
            <p className="text-sm text-muted-foreground text-center">{error}</p>
          </>
        ) : isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="font-medium">Saving flow...</p>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
            {progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : isRunning ? (
          <>
            <Play className="h-6 w-6 text-primary animate-pulse" />
            <p className="font-medium">Running flow...</p>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
            {progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
