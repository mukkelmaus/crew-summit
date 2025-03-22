
import { ReactNode } from 'react';
import { Panel } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  Play, 
  Undo2, 
  Redo2, 
  Maximize, 
  Minimize, 
  Download, 
  Layout, 
  Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: ReactNode;
  tooltip: string;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline" | "destructive" | "link" | "ghost" | null | undefined;
}

const ToolbarButton = ({ onClick, icon, tooltip, disabled = false, variant = "outline" }: ToolbarButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size="icon" onClick={onClick} disabled={disabled}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface FlowEditorToolbarProps {
  onSave: () => void;
  onRun: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleFullscreen: () => void;
  onOrganizeLayout: () => void;
  onExportFlow: () => void;
  isFullscreen: boolean;
  isRunning: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isSaving?: boolean;
}

export function FlowEditorToolbar({ 
  onSave, 
  onRun, 
  onUndo, 
  onRedo, 
  onToggleFullscreen, 
  onOrganizeLayout, 
  onExportFlow,
  isFullscreen,
  isRunning,
  canUndo,
  canRedo,
  isSaving = false
}: FlowEditorToolbarProps) {
  return (
    <Panel position="top-center" className="space-y-2">
      <div className="flex space-x-2 bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
        <ToolbarButton
          onClick={onSave}
          icon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          tooltip={isSaving ? "Saving..." : "Save Flow (Ctrl+S)"}
          disabled={isSaving}
        />
        
        <ToolbarButton
          onClick={onRun}
          icon={isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          tooltip={isRunning ? "Running..." : "Run Flow"}
          disabled={isRunning}
          variant={isRunning ? "outline" : "default"}
        />
        
        <span className="border-r border-gray-200 dark:border-gray-700 mx-1"></span>
        
        <ToolbarButton
          onClick={onUndo}
          icon={<Undo2 className="h-4 w-4" />}
          tooltip="Undo (Ctrl+Z)"
          disabled={!canUndo}
        />
        
        <ToolbarButton
          onClick={onRedo}
          icon={<Redo2 className="h-4 w-4" />}
          tooltip="Redo (Ctrl+Y)"
          disabled={!canRedo}
        />
        
        <span className="border-r border-gray-200 dark:border-gray-700 mx-1"></span>
        
        <ToolbarButton
          onClick={onOrganizeLayout}
          icon={<Layout className="h-4 w-4" />}
          tooltip="Auto-organize Layout"
        />
        
        <ToolbarButton
          onClick={onToggleFullscreen}
          icon={isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        />
        
        <ToolbarButton
          onClick={onExportFlow}
          icon={<Download className="h-4 w-4" />}
          tooltip="Export Flow"
        />
      </div>
    </Panel>
  );
}
