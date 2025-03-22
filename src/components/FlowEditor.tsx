
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
  Connection,
  Node,
  Edge,
  useReactFlow,
  useKeyPress,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Flow, 
  FlowNodeType
} from '@/lib/types';
import {
  flowNodesToReactFlowNodes,
  flowEdgesToReactFlowEdges,
} from '@/lib/flowTypeUtils';
import { 
  createNewNode, 
  prepareFlowForSave, 
  createConnection,
  organizeNodesLayout
} from '@/lib/flowEditorUtils';
import { Button } from './ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import FlowNodeComponent from './FlowNodeComponent';
import { EmptyState } from './ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { FlowEditorTopBar } from './flow/FlowEditorTopBar';
import { FlowEditorToolbar } from './flow/FlowEditorToolbar';
import { NodeToolbar } from './flow/NodeToolbar';
import { NodeAddMenu } from './flow/NodeAddMenu';
import { ApprovalPanel } from './flow/ApprovalPanel';

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

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const connection = createConnection(params, sourceNode);
    setEdges((eds) => addEdge(connection, eds));
    saveToHistory();
  }, [nodes, setEdges, saveToHistory]);

  const handleSave = () => {
    if (onSave) {
      const updatedFlow = prepareFlowForSave(flow, nodes, edges);
      onSave(updatedFlow);
      
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
      const updatedFlow = prepareFlowForSave(flow, nodes, edges);
      updatedFlow.status = 'running';
      updatedFlow.lastRun = new Date().toISOString();
      
      onRun(updatedFlow);
      
      toast({
        title: "Flow started",
        description: "Your flow is now running.",
      });
    }
  };

  const addNewNode = (type: FlowNodeType) => {
    if (reactFlowInstance) {
      const center = reactFlowInstance.screenToFlowPosition({
        x: reactFlowWrapper.current ? reactFlowWrapper.current.clientWidth / 2 : 400,
        y: reactFlowWrapper.current ? reactFlowWrapper.current.clientHeight / 2 : 300,
      });
      
      const newNode = createNewNode(type, center.x, center.y);
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

  const exportFlow = () => {
    const updatedFlow = prepareFlowForSave(flow, nodes, edges);
    
    const dataStr = JSON.stringify(updatedFlow, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `${flow.name.replace(/\s/g, '_')}_flow.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const organizeLayout = () => {
    const updatedNodes = organizeNodesLayout(nodes);
    setNodes(updatedNodes);
    
    reactFlowInstance.fitView({ padding: 0.2 });
    
    toast({
      title: "Layout organized",
      description: "Nodes have been arranged in a structured layout."
    });
  };

  const filteredNodes = nodes.filter(node => {
    if (!searchQuery) return true;
    
    const labelString = node.data?.label || '';
    const descriptionString = node.data?.description || '';
    
    return (
      String(labelString).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(descriptionString).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${isFullscreen ? 'h-screen' : 'h-[500px]'} relative`} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={filteredNodes}
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
        
        {/* Status Bar */}
        <FlowEditorTopBar 
          flowStatus={flow.status} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          readOnly={readOnly}
        />
        
        {!readOnly && (
          <>
            {/* Main Toolbar */}
            <FlowEditorToolbar 
              onSave={handleSave}
              onRun={handleRun}
              onUndo={undoAction}
              onRedo={redoAction}
              onToggleFullscreen={toggleFullscreen}
              onOrganizeLayout={organizeLayout}
              onExportFlow={exportFlow}
              isFullscreen={isFullscreen}
              isRunning={flow.status === 'running'}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
            
            {/* Selected Node Toolbar */}
            {selectedNode && (
              <NodeToolbar
                selectedNode={selectedNode}
                onDuplicate={duplicateSelectedNode}
                onDelete={deleteSelectedNode}
              />
            )}
            
            {/* Node Add Menu */}
            <NodeAddMenu onAddNode={addNewNode} />
          </>
        )}
        
        {/* Approval Panel */}
        <ApprovalPanel 
          pendingApprovals={pendingApprovals}
          nodes={nodes}
          onApprove={approveHumanNode}
        />
      </ReactFlow>
    </div>
  );
}
