
import { ReactNode } from 'react';
import { Panel } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Save, Play, Undo, Redo, Maximize, Minimize, Layout, FileDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  icon: ReactNode;
  onClick: () => void;
  tooltip: string;
  disabled?: boolean;
}

const ToolbarButton = ({ icon, onClick, tooltip, disabled = false }: ToolbarButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={onClick} disabled={disabled}>
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
  canRedo
}: FlowEditorToolbarProps) {
  return (
    <Panel position="top-right" className="space-y-2">
      <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
        <div className="flex gap-2">
          <ToolbarButton 
            icon={<Save className="h-4 w-4" />}
            onClick={onSave}
            tooltip="Save Flow (Ctrl+S)"
          />
          
          <ToolbarButton 
            icon={<Play className="h-4 w-4" />}
            onClick={onRun}
            tooltip="Run Flow"
            disabled={isRunning}
          />
          
          <ToolbarButton 
            icon={<Undo className="h-4 w-4" />}
            onClick={onUndo}
            tooltip="Undo (Ctrl+Z)"
            disabled={!canUndo}
          />
          
          <ToolbarButton 
            icon={<Redo className="h-4 w-4" />}
            onClick={onRedo}
            tooltip="Redo (Ctrl+Y)"
            disabled={!canRedo}
          />
          
          <ToolbarButton 
            icon={isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            onClick={onToggleFullscreen}
            tooltip="Toggle Fullscreen"
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
        <div className="flex gap-2">
          <ToolbarButton 
            icon={<Layout className="h-4 w-4" />}
            onClick={onOrganizeLayout}
            tooltip="Organize Layout"
          />
          
          <ToolbarButton 
            icon={<FileDown className="h-4 w-4" />}
            onClick={onExportFlow}
            tooltip="Export Flow"
          />
        </div>
      </div>
    </Panel>
  );
}
