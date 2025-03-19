
import { useState, useCallback, useRef } from 'react';
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
  Node,
  Edge,
  Connection,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Flow, 
  FlowNode as FlowNodeType, 
  FlowEdge as FlowEdgeType,
  FlowNodeType as NodeType,
} from '@/lib/types';
import { Button } from './ui/button';
import { 
  Play, 
  Plus, 
  Save,
  AlertTriangle,
  Check,
  Clock,
  List,
  SplitSquareVertical,
  Repeat,
  Code2,
  Zap,
  UserCheck,
  Database,
  Trash2,
} from 'lucide-react';
import FlowNodeComponent from './FlowNodeComponent';
import { EmptyState } from './ui/empty-state';
import { Badge } from './ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

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
  human_approval: FlowNodeComponent,
  data_operation: FlowNodeComponent,
};

export default function FlowEditor({ 
  flow, 
  onSave, 
  onRun,
  readOnly = false
}: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowInstance = useReactFlow();
  const { toast } = useToast();
  
  // For human intervention tracking
  const [pendingApprovals, setPendingApprovals] = useState<string[]>(
    flow.humanInterventionPoints?.filter(p => p.status === 'pending').map(p => p.nodeId) || []
  );

  const onConnect = useCallback((params: any) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    let edgeType = 'default';
    
    // Set edge type based on source node and handle
    if (sourceNode?.type === 'condition') {
      edgeType = params.sourceHandle === 'true' ? 'success' : 'failure';
    } else if (sourceNode?.type === 'human_approval') {
      edgeType = params.sourceHandle === 'approved' ? 'approval' : 'rejection';
    }
    
    setEdges((eds) => addEdge({
      ...params,
      id: `edge-${uuidv4()}`,
      type: edgeType,
      animated: edgeType === 'default' ? false : true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: edgeType === 'success' || edgeType === 'approval' ? '#16a34a' : 
               edgeType === 'failure' || edgeType === 'rejection' ? '#dc2626' : 
               '#64748b'
      }
    }, eds));
  }, [nodes, setEdges]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...flow,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: "Flow saved",
        description: "Your flow has been saved successfully.",
      });
    }
  };

  const handleRun = () => {
    // Check if the flow has human approval nodes that are pending
    const hasHumanApprovalNodes = nodes.some(node => 
      node.type === 'human_approval' && pendingApprovals.includes(node.id)
    );
    
    if (hasHumanApprovalNodes) {
      toast({
        title: "Human approval required",
        description: "This flow has pending approval steps that must be resolved before running.",
        variant: "warning",
      });
      return;
    }

    if (onRun) {
      onRun({
        ...flow,
        nodes,
        edges,
        status: 'running',
        lastRun: new Date().toISOString(),
      });
      
      toast({
        title: "Flow started",
        description: "Your flow is now running.",
      });
    }
  };

  const addNewNode = (type: NodeType) => {
    // Create a new node of the specified type
    const newNode: FlowNodeType = {
      id: `node-${uuidv4()}`,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      data: {
        description: `New ${type.replace('_', ' ')} node`,
      },
      position: { 
        x: Math.random() * 300 + 50, 
        y: Math.random() * 300 + 50 
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };
  
  const deleteSelectedNode = () => {
    if (selectedNode) {
      // Remove all connected edges
      setEdges(edges.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      
      // Remove the node
      setNodes(nodes.filter(node => node.id !== selectedNode.id));
      setSelectedNode(null);
      
      toast({
        title: "Node deleted",
        description: `${selectedNode.type} node has been removed from the flow.`,
      });
    }
  };

  const approveHumanNode = (nodeId: string, approved: boolean) => {
    // Update the pendingApprovals state
    setPendingApprovals(prev => prev.filter(id => id !== nodeId));
    
    // Update the flow's humanInterventionPoints
    const updatedFlow = {
      ...flow,
      humanInterventionPoints: flow.humanInterventionPoints?.map(point => 
        point.nodeId === nodeId 
          ? { ...point, status: 'completed' } 
          : point
      )
    };
    
    if (onSave) {
      onSave(updatedFlow);
    }
    
    toast({
      title: approved ? "Node approved" : "Node rejected",
      description: `The human approval step has been ${approved ? 'approved' : 'rejected'}.`,
      variant: approved ? "default" : "destructive",
    });
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
                  id: `node-${uuidv4()}`,
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
        onNodeClick={handleNodeClick}
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
          <>
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
                
                {selectedNode && (
                  <Button variant="destructive" size="sm" onClick={deleteSelectedNode}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Node
                  </Button>
                )}
              </div>
            </Panel>
            
            <Panel position="bottom-left">
              <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Node
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Node Types</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addNewNode('task')} className="cursor-pointer">
                      <List className="h-4 w-4 mr-2" />
                      Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addNewNode('condition')} className="cursor-pointer">
                      <SplitSquareVertical className="h-4 w-4 mr-2" />
                      Condition
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addNewNode('loop')} className="cursor-pointer">
                      <Repeat className="h-4 w-4 mr-2" />
                      Loop
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addNewNode('parallel')} className="cursor-pointer">
                      <Code2 className="h-4 w-4 mr-2" />
                      Parallel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addNewNode('sequence')} className="cursor-pointer">
                      <List className="h-4 w-4 mr-2" />
                      Sequence
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addNewNode('event')} className="cursor-pointer">
                      <Zap className="h-4 w-4 mr-2" />
                      Event
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addNewNode('human_approval')} className="cursor-pointer">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Human Approval
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addNewNode('data_operation')} className="cursor-pointer">
                      <Database className="h-4 w-4 mr-2" />
                      Data Operation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Panel>
          </>
        )}
        
        <Panel position="top-left">
          <div className="flex items-center bg-white dark:bg-gray-900 px-4 py-2 rounded-md border shadow-sm">
            <span className="font-medium mr-2">Flow status:</span>
            {getStatusIndicator()}
          </div>
        </Panel>
        
        {pendingApprovals.length > 0 && (
          <Panel position="bottom-center">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-md border shadow-sm">
              <h4 className="text-sm font-medium mb-2">Pending Human Approvals</h4>
              <div className="space-y-2">
                {pendingApprovals.map(nodeId => {
                  const node = nodes.find(n => n.id === nodeId);
                  if (!node) return null;
                  
                  return (
                    <div key={nodeId} className="flex items-center justify-between gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <div>
                        <p className="text-xs font-medium">{node.data.description}</p>
                        <p className="text-xs text-muted-foreground">Requires approval</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => approveHumanNode(nodeId, true)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => approveHumanNode(nodeId, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
