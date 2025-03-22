
import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { createNewNode } from '@/lib/flowEditorUtils';
import { flowNodesToReactFlowNodes } from '@/lib/flowTypeUtils';

interface EmptyFlowStateProps {
  readOnly: boolean;
  setNodes: (nodes: any) => void;
  saveToHistory: () => void;
}

export function EmptyFlowState({ readOnly, setNodes, saveToHistory }: EmptyFlowStateProps) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-16 w-16 opacity-20" />}
      title="No flow nodes defined"
      description="Add nodes to create your workflow automation."
      action={
        !readOnly && (
          <Button variant="outline" onClick={() => {
            const newNode = createNewNode('event', 250, 50);
            newNode.label = 'Start';
            newNode.data.description = 'Starting point of the workflow';
            
            const reactFlowNode = flowNodesToReactFlowNodes([newNode])[0];
            setNodes([reactFlowNode]);
            saveToHistory();
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Start Node
          </Button>
        )
      }
    />
  );
}
