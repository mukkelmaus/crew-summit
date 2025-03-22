
import { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Panel } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, Clock } from 'lucide-react';
import { Flow } from '@/lib/types';

interface FlowStatusProps {
  status: Flow['status'];
}

const FlowStatusIndicator = ({ status }: FlowStatusProps) => {
  switch (status) {
    case 'running':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <span className="animate-pulse mr-1">•</span>
          Running
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <Check className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Idle
        </Badge>
      );
  }
};

interface FlowEditorTopBarProps {
  flowStatus: Flow['status'];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  readOnly?: boolean;
}

export function FlowEditorTopBar({ 
  flowStatus, 
  searchQuery, 
  onSearchChange,
  readOnly = false
}: FlowEditorTopBarProps) {
  return (
    <>
      <Panel position="top-left">
        <div className="flex items-center bg-white dark:bg-gray-900 px-4 py-2 rounded-md border shadow-sm">
          <span className="font-medium mr-2">Flow status:</span>
          <FlowStatusIndicator status={flowStatus} />
        </div>
      </Panel>
      
      {!readOnly && (
        <Panel position="top-right" className="space-y-2">
          <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-48"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </Panel>
      )}
    </>
  );
}
