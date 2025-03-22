
import { ReactNode } from 'react';
import { Panel } from '@xyflow/react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { reactNodeToString } from '@/lib/flowTypeUtils';

interface NodeToolbarProps {
  selectedNode: Node | null;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function NodeToolbar({ selectedNode, onDuplicate, onDelete }: NodeToolbarProps) {
  if (!selectedNode) return null;
  
  return (
    <Panel position="top-right" className="space-y-2">
      <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm space-y-2">
        <p className="text-xs font-medium">
          Selected: {selectedNode.data?.label ? reactNodeToString(selectedNode.data.label) : selectedNode.type}
        </p>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onDuplicate}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate Node</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Node (Delete)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Panel>
  );
}
