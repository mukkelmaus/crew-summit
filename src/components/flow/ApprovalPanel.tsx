
import { useState } from 'react';
import { Panel } from '@xyflow/react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { reactNodeToString } from '@/lib/flowTypeUtils';
import { Loader2 } from 'lucide-react';

interface ApprovalPanelProps {
  pendingApprovals: string[];
  nodes: Node[];
  onApprove: (nodeId: string, approved: boolean) => void;
}

export function ApprovalPanel({ pendingApprovals, nodes, onApprove }: ApprovalPanelProps) {
  const [processingNodes, setProcessingNodes] = useState<string[]>([]);
  
  if (pendingApprovals.length === 0) return null;
  
  const handleApprove = async (nodeId: string, approved: boolean) => {
    setProcessingNodes(prev => [...prev, nodeId]);
    
    try {
      await onApprove(nodeId, approved);
    } finally {
      setProcessingNodes(prev => prev.filter(id => id !== nodeId));
    }
  };
  
  return (
    <Panel position="bottom-center">
      <div className="bg-white dark:bg-gray-900 p-3 rounded-md border shadow-sm">
        <h4 className="text-sm font-medium mb-2">Pending Human Approvals</h4>
        <div className="space-y-2">
          {pendingApprovals.map(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return null;
            
            const nodeDescription = typeof node.data?.description === 'string' 
              ? node.data.description 
              : reactNodeToString(node.data?.description || '');
            
            const isProcessing = processingNodes.includes(nodeId);
            
            return (
              <div key={nodeId} className="flex items-center justify-between gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <div>
                  <p className="text-xs font-medium">{nodeDescription}</p>
                  <p className="text-xs text-muted-foreground">Requires approval</p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    onClick={() => handleApprove(nodeId, true)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    onClick={() => handleApprove(nodeId, false)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reject"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
