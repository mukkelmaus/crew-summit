
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FlowNodeType } from '@/lib/types';
import { 
  List, 
  SplitSquareVertical, 
  Repeat, 
  CircleDot, 
  Code2, 
  Zap,
  User,
  UserCheck,
  Database
} from 'lucide-react';

interface FlowNodeProps {
  id: string;
  data: {
    description?: string;
    condition?: string;
    iterations?: number;
    taskIds?: string[];
    agentId?: string;
    requiresApproval?: boolean;
    approver?: string;
    dataSource?: string;
  };
  type: FlowNodeType;
  isConnectable: boolean;
}

const FlowNodeComponent = ({ id, data, type, isConnectable }: FlowNodeProps) => {
  const getNodeIcon = () => {
    switch (type) {
      case 'task':
        return <List className="h-4 w-4 mr-2" />;
      case 'condition':
        return <SplitSquareVertical className="h-4 w-4 mr-2" />;
      case 'loop':
        return <Repeat className="h-4 w-4 mr-2" />;
      case 'parallel':
        return <Code2 className="h-4 w-4 mr-2" />;
      case 'sequence':
        return <List className="h-4 w-4 mr-2" />;
      case 'event':
        return <Zap className="h-4 w-4 mr-2" />;
      case 'human_approval':
        return <UserCheck className="h-4 w-4 mr-2" />;
      case 'data_operation':
        return <Database className="h-4 w-4 mr-2" />;
      default:
        return <CircleDot className="h-4 w-4 mr-2" />;
    }
  };

  const getNodeClass = () => {
    switch (type) {
      case 'task':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
      case 'condition':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700';
      case 'loop':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'parallel':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700';
      case 'sequence':
        return 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700';
      case 'event':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
      case 'human_approval':
        return 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700';
      case 'data_operation':
        return 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-md border ${getNodeClass()} min-w-[150px] shadow-sm`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable} 
        className="w-2 h-2"
      />
      <div className="font-medium flex items-center">
        {getNodeIcon()}
        <span className="capitalize">{type.replace('_', ' ')}</span>
      </div>
      
      {data.description && (
        <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
      )}
      
      {data.condition && type === 'condition' && (
        <div className="text-xs mt-2 bg-white dark:bg-gray-800 p-1 rounded">
          <code>{data.condition}</code>
        </div>
      )}
      
      {data.iterations !== undefined && type === 'loop' && (
        <div className="text-xs mt-2">
          Iterations: {data.iterations}
        </div>
      )}

      {data.requiresApproval && type === 'human_approval' && (
        <div className="text-xs mt-2 flex items-center">
          <User className="h-3 w-3 mr-1" />
          Approver: {data.approver || 'Any user'}
        </div>
      )}

      {data.dataSource && type === 'data_operation' && (
        <div className="text-xs mt-2">
          Data source: {data.dataSource}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="w-2 h-2"
      />
      
      {type === 'condition' && (
        <>
          <Handle 
            id="true" 
            type="source" 
            position={Position.Right} 
            isConnectable={isConnectable}
            className="w-2 h-2 !bg-green-500"
          />
          <Handle 
            id="false" 
            type="source" 
            position={Position.Left} 
            isConnectable={isConnectable}
            className="w-2 h-2 !bg-red-500"
          />
        </>
      )}

      {type === 'human_approval' && (
        <>
          <Handle 
            id="approved" 
            type="source" 
            position={Position.Right} 
            isConnectable={isConnectable}
            className="w-2 h-2 !bg-green-500"
          />
          <Handle 
            id="rejected" 
            type="source" 
            position={Position.Left} 
            isConnectable={isConnectable}
            className="w-2 h-2 !bg-red-500"
          />
        </>
      )}
    </div>
  );
};

export default memo(FlowNodeComponent);
