
import React from 'react';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface FlowEditorLoadingStateProps {
  isLoading: boolean;
  error: Error | null;
}

export function FlowEditorLoadingState({ isLoading, error }: FlowEditorLoadingStateProps) {
  if (isLoading) {
    return (
      <div className="border rounded-md p-8 h-[500px] flex items-center justify-center">
        <LoadingIndicator size="lg" text="Loading flow..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-md p-8 h-[500px] flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error loading flow</AlertTitle>
          <AlertDescription>{error.message || "An unexpected error occurred"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
