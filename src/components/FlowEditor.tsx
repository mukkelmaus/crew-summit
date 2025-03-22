import { useState, useCallback, useRef, useEffect } from 'react';
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
  useKeyPress,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Flow, 
  FlowNode as FlowNodeType, 
  FlowEdge as FlowEdgeType,
  FlowNodeType as NodeType,
} from '@/lib/types';
import {
  flowNodesToReactFlowNodes,
  reactFlowNodesToFlowNodes,
  flowEdgesToReactFlowEdges,
  reactFlowEdgesToFlowEdges,
  reactNodeToString
} from '@/lib/flowTypeUtils';
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
  Copy,
  FileDown,
  FileUp,
  Undo,
  Redo,
  Maximize,
  Minimize,
  Layout,
  Search,
  ChevronsUpDown,
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
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from './ui/input';

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
  const initialNodes = flowNodesToReactFlowNodes(flow.nodes);
  const initialEdges = flowEdgesToReactFlowEdges(flow.edges);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const { toast } = useToast();
  
  const [pendingApprovals, setPendingApprovals] = useState<string[]>(
    flow.humanInterventionPoints?.filter(p => p.status === 'pending').map(p => p.nodeId) || []
  );

  const deleteKeyPressed = useKeyPress('Delete');
  const ctrlSPressed = useKeyPress(['Control', 's']);
  const ctrlZPressed = useKeyPress(['Control', 'z']);
  const ctrlYPressed = useKeyPress(['Control', 'y']);

  useEffect(() => {
    if (deleteKeyPressed && selectedNode && !readOnly) {
      deleteSelectedNode();
    }
  }, [deleteKeyPressed, selectedNode]);

  useEffect(() => {
    if (ctrlSPressed && !readOnly) {
      handleSave();
    }
  }, [ctrlSPressed]);

  useEffect(() => {
    if (ctrlZPressed && historyIndex > 0 && !readOnly) {
      undoAction();
    }
  }, [ctrlZPressed]);

  useEffect(() => {
    if (ctrlYPressed && historyIndex < history.length - 1 && !readOnly) {
      redoAction();
    }
  }, [ctrlYPressed]);

  const saveToHistory = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, { nodes, edges }]);
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, history, historyIndex]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      saveToHistory();
    }
  }, []);

  const undoAction = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redoAction = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const onConnect = useCallback((params: any) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    let edgeType = 'default';
    
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
    
    saveToHistory();
  }, [nodes, setEdges, saveToHistory]);

  const handleSave = () => {
    if (onSave) {
      const flowNodes = reactFlowNodesToFlowNodes(nodes);
      const flowEdges = reactFlowEdgesToFlowEdges(edges);
      
      onSave({
        ...flow,
        nodes: flowNodes,
        edges: flowEdges,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: "Flow saved",
        description: "Your flow has been saved successfully.",
      });
    }
  };

  const handleRun = () => {
    const hasHumanApprovalNodes = nodes.some(node => 
      node.type === 'human_approval' && pendingApprovals.includes(node.id)
    );
    
    if (hasHumanApprovalNodes) {
      toast({
        title: "Human approval required",
        description: "This flow has pending approval steps that must be resolved before running.",
        variant: "destructive",
      });
      return;
    }

    if (onRun) {
      const flowNodes = reactFlowNodesToFlowNodes(nodes);
      const flowEdges = reactFlowEdgesToFlowEdges(edges);
      
      onRun({
        ...flow,
        nodes: flowNodes,
        edges: flowEdges,
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
    if (reactFlowInstance) {
      const center = reactFlowInstance.screenToFlowPosition({
        x: reactFlowWrapper.current ? reactFlowWrapper.current.clientWidth / 2 : 400,
        y: reactFlowWrapper.current ? reactFlowWrapper.current.clientHeight / 2 : 300,
      });
      
      const newNode: FlowNodeType = {
        id: `node-${uuidv4()}`,
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        data: {
          description: `New ${type.replace('_', ' ')} node`,
        },
        position: { 
          x: center.x, 
          y: center.y 
        },
      };
      
      const reactFlowNode = flowNodesToReactFlowNodes([newNode])[0];
      setNodes((nds) => [...nds, reactFlowNode]);
      
      saveToHistory();
      
      toast({
        title: "Node added",
        description: `Added new ${type.replace('_', ' ')} node`,
      });
    }
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };
  
  const deleteSelectedNode = () => {
    if (selectedNode) {
      setEdges(edges.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      
      setNodes(nodes.filter(node => node.id !== selectedNode.id));
      setSelectedNode(null);
      
      saveToHistory();
      
      toast({
        title: "Node deleted",
        description: `${selectedNode.type} node has been removed from the flow.`,
      });
    }
  };

  const duplicateSelectedNode = () => {
    if (selectedNode) {
      const newNode = {
        ...selectedNode,
        id: `node-${uuidv4()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
      };
      
      setNodes((nds) => [...nds, newNode]);
      
      saveToHistory();
      
      toast({
        title: "Node duplicated",
        description: `Created a copy of ${selectedNode.type} node.`,
      });
    }
  };

  const approveHumanNode = (nodeId: string, approved: boolean) => {
    setPendingApprovals(prev => prev.filter(id => id !== nodeId));
    
    const updatedFlow: Flow = {
      ...flow,
      humanInterventionPoints: flow.humanInterventionPoints?.map(point => 
        point.nodeId === nodeId 
          ? { ...point, status: 'completed' as const } 
          : point
      ) || []
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

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else if (reactFlowWrapper.current) {
      reactFlowWrapper.current.requestFullscreen();
      setIsFullscreen(true);
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

  const filteredNodes = nodes.filter(node => 
    (node.data?.label?.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.data?.description?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportFlow = () => {
    const flowNodes = reactFlowNodesToFlowNodes(nodes);
    const flowEdges = reactFlowEdgesToFlowEdges(edges);
    
    const dataStr = JSON.stringify({ ...flow, nodes: flowNodes, edges: flowEdges }, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `${flow.name.replace(/\s/g, '_')}_flow.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const organizeLayout = () => {
    const nodesByType: Record<string, Node[]> = {};
    
    nodes.forEach(node => {
      if (!nodesByType[node.type as string]) {
        nodesByType[node.type as string] = [];
      }
      nodesByType[node.type as string].push(node);
    });
    
    let updatedNodes: Node[] = [];
    let y = 50;
    
    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      const xSpacing = 250;
      const ySpacing = 150;
      const nodesPerRow = 3;
      
      typeNodes.forEach((node, index) => {
        const row = Math.floor(index / nodesPerRow);
        const col = index % nodesPerRow;
        
        updatedNodes.push({
          ...node,
          position: {
            x: 100 + col * xSpacing,
            y: y + row * ySpacing
          }
        });
      });
      
      const rows = Math.ceil(typeNodes.length / nodesPerRow);
      y += rows * ySpacing + 100;
    });
    
    setNodes(updatedNodes);
    reactFlowInstance.fitView({ padding: 0.2 });
    
    toast({
      title: "Layout organized",
      description: "Nodes have been arranged in a structured layout."
    });
  };

  if (nodes.length === 0) {
    return (
      <div className="border rounded-md p-8 h-[500px] flex items-center justify-center" ref={reactFlowWrapper}>
        <EmptyState
          icon={<AlertTriangle className="h-16 w-16 opacity-20" />}
          title="No flow nodes defined"
          description="Add nodes to create your workflow automation."
          action={
            !readOnly && (
              <Button variant="outline" onClick={() => {
                const newNode: FlowNodeType = {
                  id: `node-${uuidv4()}`,
                  type: 'event',
                  label: 'Start',
                  data: {
                    description: 'Starting point of the workflow',
                  },
                  position: { x: 250, y: 50 },
                };
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
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${isFullscreen ? 'h-screen' : 'h-[500px]'} relative`} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={searchQuery ? filteredNodes : nodes}
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
        <Controls showInteractive={true} />
        <MiniMap />
        <Background />
        
        {!readOnly && (
          <>
            <Panel position="top-right" className="space-y-2">
              <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
            
              <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleSave}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save Flow (Ctrl+S)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" onClick={handleRun} disabled={flow.status === 'running'}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Run Flow</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={undoAction} disabled={historyIndex <= 0}>
                          <Undo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Undo (Ctrl+Z)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={redoAction} disabled={historyIndex >= history.length - 1}>
                          <Redo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Redo (Ctrl+Y)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle Fullscreen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {selectedNode && (
                <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm space-y-2">
                  <p className="text-xs font-medium">
                    Selected: {selectedNode.data?.label || selectedNode.type}
                  </p>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={duplicateSelectedNode}>
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
                          <Button variant="destructive" size="icon" onClick={deleteSelectedNode}>
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
              )}
              
              <div className="bg-white dark:bg-gray-900 p-2 rounded-md border shadow-sm">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={organizeLayout}>
                          <Layout className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Organize Layout</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={exportFlow}>
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export Flow</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Panel>
            
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
                      <DropdownMenuItem onClick={() => addNewNode('task')} className="cursor-pointer">
                        <List className="h-4 w-4 mr-2" />
                        Task
                        <DropdownMenuShortcut>T</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNewNode('event')} className="cursor-pointer">
                        <Zap className="h-4 w-4 mr-2" />
                        Event
                        <DropdownMenuShortcut>E</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Control Flow</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => addNewNode('condition')} className="cursor-pointer">
                        <SplitSquareVertical className="h-4 w-4 mr-2" />
                        Condition
                        <DropdownMenuShortcut>C</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNewNode('loop')} className="cursor-pointer">
                        <Repeat className="h-4 w-4 mr-2" />
                        Loop
                        <DropdownMenuShortcut>L</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNewNode('parallel')} className="cursor-pointer">
                        <Code2 className="h-4 w-4 mr-2" />
                        Parallel
                        <DropdownMenuShortcut>P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNewNode('sequence')} className="cursor-pointer">
                        <List className="h-4 w-4 mr-2" />
                        Sequence
                        <DropdownMenuShortcut>S</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Advanced</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => addNewNode('human_approval')} className="cursor-pointer">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Human Approval
                        <DropdownMenuShortcut>H</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNewNode('data_operation')} className="cursor-pointer">
                        <Database className="h-4 w-4 mr-2" />
                        Data Operation
                        <DropdownMenuShortcut>D</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
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
                  
                  const nodeDescription = typeof node.data?.description === 'string' 
                    ? node.data.description 
                    : 'Approval required';
                  
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
