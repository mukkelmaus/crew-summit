
import React from "react";
import { Flow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Eye } from "lucide-react";
import FlowControls from "@/components/FlowControls";

interface FlowHeaderProps {
  flow: Flow;
  editMode: boolean;
  onEditModeToggle: () => void;
  onBack?: () => void;
  onFlowUpdate: (flow: Flow) => void;
}

export function FlowHeader({
  flow,
  editMode,
  onEditModeToggle,
  onBack,
  onFlowUpdate,
}: FlowHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{flow.name}</h1>
          <p className="text-sm text-muted-foreground">{flow.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onEditModeToggle}
        >
          {editMode ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              View Mode
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Mode
            </>
          )}
        </Button>
        <FlowControls flow={flow} onStatusChange={onFlowUpdate} />
      </div>
    </div>
  );
}
