
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface FlowEditorLoadingStateProps {
  isLoading: boolean;
  error: Error | null;
}

export function FlowEditorLoadingState({ isLoading, error }: FlowEditorLoadingStateProps) {
  if (isLoading) {
    return (
      <div className="border rounded-md p-8 h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading flow editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-md p-8 h-[500px] flex items-center justify-center">
        <EmptyState
          icon={<AlertTriangle className="h-16 w-16 text-destructive opacity-20" />}
          title="Error loading flow"
          description={error.message || "Could not load the flow editor. Please try again."}
          action={
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          }
        />
      </div>
    );
  }

  return null;
}
