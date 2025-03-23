
import React from "react";
import { Flow } from "@/lib/types";
import FlowEditor from "@/components/flow/FlowEditor";

interface FlowEditorTabProps {
  flow: Flow;
  editMode: boolean;
  isLoading: boolean;
  error: Error | null;
  onSave: (updatedFlow: Flow) => Promise<void>;
  onRun: (updatedFlow: Flow) => void;
}

export function FlowEditorTab({
  flow,
  editMode,
  isLoading,
  error,
  onSave,
  onRun,
}: FlowEditorTabProps) {
  return (
    <FlowEditor 
      flow={flow}
      readOnly={!editMode}
      onSave={onSave}
      onRun={onRun}
      isLoading={isLoading}
      error={error}
    />
  );
}
