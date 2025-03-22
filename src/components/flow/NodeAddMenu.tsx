
import { Panel } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronsUpDown, List, Zap, SplitSquareVertical, Repeat, Code2, UserCheck, Database } from 'lucide-react';
import { FlowNodeType } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

interface NodeAddMenuProps {
  onAddNode: (type: FlowNodeType) => void;
}

export function NodeAddMenu({ onAddNode }: NodeAddMenuProps) {
  return (
    <Panel position="bottom-left">
      <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Node
                    <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a new node to the flow</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Node Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Basic</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAddNode('task')} className="cursor-pointer">
                <List className="h-4 w-4 mr-2" />
                Task
                <DropdownMenuShortcut>T</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNode('event')} className="cursor-pointer">
                <Zap className="h-4 w-4 mr-2" />
                Event
                <DropdownMenuShortcut>E</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Control Flow</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAddNode('condition')} className="cursor-pointer">
                <SplitSquareVertical className="h-4 w-4 mr-2" />
                Condition
                <DropdownMenuShortcut>C</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNode('loop')} className="cursor-pointer">
                <Repeat className="h-4 w-4 mr-2" />
                Loop
                <DropdownMenuShortcut>L</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNode('parallel')} className="cursor-pointer">
                <Code2 className="h-4 w-4 mr-2" />
                Parallel
                <DropdownMenuShortcut>P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNode('sequence')} className="cursor-pointer">
                <List className="h-4 w-4 mr-2" />
                Sequence
                <DropdownMenuShortcut>S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Advanced</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAddNode('human_approval')} className="cursor-pointer">
                <UserCheck className="h-4 w-4 mr-2" />
                Human Approval
                <DropdownMenuShortcut>H</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNode('data_operation')} className="cursor-pointer">
                <Database className="h-4 w-4 mr-2" />
                Data Operation
                <DropdownMenuShortcut>D</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Panel>
  );
}
