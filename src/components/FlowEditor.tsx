
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Flow, 
  FlowNode as FlowNodeType, 
  FlowEdge as FlowEdgeType 
} from '@/lib/types';
import { Button } from './ui/button';
import { 
  Play, 
  Plus, 
  Save,
  AlertTriangle,
  Check,
  Clock 
} from 'lucide-react';
import FlowNodeComponent from './FlowNodeComponent';
import { EmptyState } from './ui/empty-state';
import { Badge } from './ui/badge';

interface FlowEditorProps {
  flow: Flow;
  onSave?: (flow: Flow) => void;
  onRun?: (flow: Flow) => void;
  readOnly?: boolean;
}

const nodeTypes = {
  task: FlowNodeComponent,
  condition: FlowNodeComponent,
  loop: FlowNodeComponent,
  parallel: FlowNodeComponent,
  sequence: FlowNodeComponent,
  event: FlowNodeComponent,
};

export default function FlowEditor({ 
  flow, 
  onSave, 
  onRun,
  readOnly = false
}: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'default',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }, eds));
  }, [setEdges]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...flow,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun({
        ...flow,
        nodes,
        edges,
        status: 'running',
        lastRun: new Date().toISOString(),
      });
    }
  };

  const getStatusIndicator = () => {
    switch (flow.status) {
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

  if (nodes.length === 0) {
    return (
      <div className="border rounded-md p-8 h-[500px] flex items-center justify-center">
        <EmptyState
          icon={<AlertTriangle className="h-16 w-16 opacity-20" />}
          title="No flow nodes defined"
          description="Add nodes to create your workflow automation."
          action={
            !readOnly && (
              <Button variant="outline" onClick={() => {
                // Add initial start node
                const newNode: FlowNodeType = {
                  id: `node-${Date.now()}`,
                  type: 'event',
                  label: 'Start',
                  data: {
                    description: 'Starting point of the workflow',
                  },
                  position: { x: 250, y: 50 },
                };
                setNodes([newNode]);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Start Node
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="border rounded-md h-[500px] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Controls />
        <MiniMap />
        <Background />
        {!readOnly && (
          <Panel position="top-right">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm" onClick={handleRun} disabled={flow.status === 'running'}>
                <Play className="h-4 w-4 mr-2" />
                Run Flow
              </Button>
            </div>
          </Panel>
        )}
        <Panel position="top-left">
          <div className="flex items-center bg-white dark:bg-gray-900 px-4 py-2 rounded-md border shadow-sm">
            <span className="font-medium mr-2">Flow status:</span>
            {getStatusIndicator()}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
