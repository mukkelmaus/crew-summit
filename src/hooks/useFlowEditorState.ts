
import { useCallback, useState, useRef, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  useReactFlow,
  useKeyPress,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { Flow, FlowNodeType } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';

export function useFlowEditorState(flow: Flow, onSave?: (flow: Flow) => void, onRun?: (flow: Flow) => void, readOnly = false) {
  const initialNodes = flowNodesToReactFlowNodes(flow.nodes);
  const initialEdges = flowEdgesToReactFlowEdges(flow.edges);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
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

  const saveToHistory = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, { nodes, edges }]);
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, history, historyIndex]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };
  
  const deleteSelectedNode = useCallback(() => {
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
  }, [selectedNode, setEdges, edges, setNodes, nodes, saveToHistory, toast]);

  const undoAction = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  const redoAction = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history, setNodes, setEdges, history.length]);

  const handleSave = useCallback(async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        const updatedFlow = prepareFlowForSave(flow, nodes, edges);
        await onSave(updatedFlow);
        
        toast({
          title: "Flow saved",
          description: "Your flow has been saved successfully.",
        });
      } catch (error) {
        console.error("Error saving flow:", error);
        toast({
          title: "Failed to save",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  }, [onSave, flow, nodes, edges, toast]);

  // Effect hooks for keyboard shortcuts
  useEffect(() => {
    if (deleteKeyPressed && selectedNode && !readOnly) {
      deleteSelectedNode();
    }
  }, [deleteKeyPressed, selectedNode, readOnly, deleteSelectedNode]);

  useEffect(() => {
    if (ctrlSPressed && !readOnly) {
      handleSave();
    }
  }, [ctrlSPressed, readOnly, handleSave]);

  useEffect(() => {
    if (ctrlZPressed && historyIndex > 0 && !readOnly) {
      undoAction();
    }
  }, [ctrlZPressed, historyIndex, readOnly, undoAction]);

  useEffect(() => {
    if (ctrlYPressed && historyIndex < history.length - 1 && !readOnly) {
      redoAction();
    }
  }, [ctrlYPressed, historyIndex, history.length, readOnly, redoAction]);

  // Initialize history
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      saveToHistory();
    }
  }, []);

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const connection = createConnection(params, sourceNode);
    setEdges((eds) => addEdge(connection, eds));
    saveToHistory();
  }, [nodes, setEdges, saveToHistory]);

  const handleRun = async () => {
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
      setIsRunning(true);
      try {
        const updatedFlow = prepareFlowForSave(flow, nodes, edges);
        updatedFlow.status = 'running';
        updatedFlow.lastRun = new Date().toISOString();
        
        await onRun(updatedFlow);
        
        toast({
          title: "Flow started",
          description: "Your flow is now running.",
        });
      } catch (error) {
        console.error("Error running flow:", error);
        toast({
          title: "Failed to start flow",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsRunning(false);
      }
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

  const approveHumanNode = async (nodeId: string, approved: boolean) => {
    setIsSaving(true);
    try {
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
        await onSave(updatedFlow);
      }
      
      toast({
        title: approved ? "Node approved" : "Node rejected",
        description: `The human approval step has been ${approved ? 'approved' : 'rejected'}.`,
        variant: approved ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error approving node:", error);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  return {
    nodes: filteredNodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    handleNodeClick,
    isFullscreen,
    searchQuery,
    setSearchQuery,
    history,
    historyIndex,
    isSaving,
    isRunning,
    reactFlowWrapper,
    pendingApprovals,
    handleSave,
    handleRun,
    addNewNode,
    deleteSelectedNode,
    duplicateSelectedNode,
    approveHumanNode,
    toggleFullscreen,
    exportFlow,
    organizeLayout,
    undoAction,
    redoAction,
    flow
  };
}
