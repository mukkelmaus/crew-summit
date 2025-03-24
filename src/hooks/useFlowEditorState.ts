
import { useState, useRef, useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Flow } from '@/lib/types';
import { useNodesAndEdges } from './flow/useNodesAndEdges';
import { useFlowHistory } from './flow/useFlowHistory';
import { useNodeOperations } from './flow/useNodeOperations';
import { useFlowOperations } from './flow/useFlowOperations';
import { useKeyboardShortcuts } from './flow/useKeyboardShortcuts';
import { organizeNodesLayout } from '@/lib/flowEditorUtils';

export function useFlowEditorState(flow: Flow, onSave?: (flow: Flow) => void, onRun?: (flow: Flow) => void, readOnly = false) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  // Initialize pending approvals state
  const [pendingApprovals, setPendingApprovals] = useState<string[]>(
    flow.humanInterventionPoints?.filter(p => p.status === 'pending').map(p => p.nodeId) || []
  );

  // Use our smaller hooks for specific functionality
  const historyHook = useFlowHistory([], []);
  const { saveToHistory } = historyHook;
  
  const nodesAndEdgesHook = useNodesAndEdges(flow, saveToHistory);
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    selectedNode, 
    setSelectedNode,
    handleNodeClick,
    searchQuery, 
    setSearchQuery 
  } = nodesAndEdgesHook;
  
  // Update history hook with current nodes and edges
  useEffect(() => {
    historyHook.saveToHistory = () => {
      if (historyHook.historyIndex < historyHook.history.length - 1) {
        historyHook.setHistory(historyHook.history.slice(0, historyHook.historyIndex + 1));
      }
      
      historyHook.setHistory(prev => [...prev, { nodes, edges }]);
      historyHook.setHistoryIndex(prev => prev + 1);
    };
    
    // Initialize history if needed
    if ((nodes.length > 0 || edges.length > 0) && historyHook.history.length === 0) {
      historyHook.saveToHistory();
    }
  }, [nodes, edges, historyHook]);

  const nodeOperationsHook = useNodeOperations(
    nodes,
    setNodes,
    setEdges,
    saveToHistory,
    selectedNode,
    setSelectedNode,
    reactFlowInstance
  );

  const flowOperationsHook = useFlowOperations(
    flow,
    nodes,
    edges,
    onSave,
    onRun,
    pendingApprovals
  );

  // Implement undo/redo with Node/Edge state updates
  const undoAction = useCallback(() => {
    const result = historyHook.undoAction();
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
      historyHook.setHistoryIndex(result.newIndex);
    }
  }, [historyHook, setNodes, setEdges]);

  const redoAction = useCallback(() => {
    const result = historyHook.redoAction();
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
      historyHook.setHistoryIndex(result.newIndex);
    }
  }, [historyHook, setNodes, setEdges]);

  // Implement organizeLayout using the utility function
  const organizeLayout = useCallback(() => {
    const updatedNodes = organizeNodesLayout(nodes);
    setNodes(updatedNodes);
    
    reactFlowInstance.fitView({ padding: 0.2 });
    
    nodesAndEdgesHook.toast({
      title: "Layout organized",
      description: "Nodes have been arranged in a structured layout."
    });
  }, [nodes, setNodes, reactFlowInstance, nodesAndEdgesHook]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts(
    readOnly,
    selectedNode,
    nodeOperationsHook.deleteSelectedNode,
    flowOperationsHook.handleSave,
    undoAction,
    redoAction
  );

  // Update pending approvals when a human node is approved
  const approveHumanNode = useCallback(async (nodeId: string, approved: boolean) => {
    setPendingApprovals(prev => prev.filter(id => id !== nodeId));
    await flowOperationsHook.approveHumanNode(nodeId, approved);
  }, [flowOperationsHook]);

  // Return all the functionality
  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    handleNodeClick,
    isFullscreen: flowOperationsHook.isFullscreen,
    searchQuery,
    setSearchQuery,
    history: historyHook.history,
    historyIndex: historyHook.historyIndex,
    isSaving: flowOperationsHook.isSaving,
    isRunning: flowOperationsHook.isRunning,
    reactFlowWrapper,
    pendingApprovals,
    handleSave: flowOperationsHook.handleSave,
    handleRun: flowOperationsHook.handleRun,
    addNewNode: nodeOperationsHook.addNewNode,
    deleteSelectedNode: nodeOperationsHook.deleteSelectedNode,
    duplicateSelectedNode: nodeOperationsHook.duplicateSelectedNode,
    approveHumanNode,
    toggleFullscreen: flowOperationsHook.toggleFullscreen,
    exportFlow: flowOperationsHook.exportFlow,
    organizeLayout,
    undoAction,
    redoAction,
    flow
  };
}
