
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

export function useFlowHistory(initialNodes: Node[], initialEdges: Edge[]) {
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, { nodes: initialNodes, edges: initialEdges }]);
    setHistoryIndex(prev => prev + 1);
  }, [initialNodes, initialEdges, history, historyIndex]);

  const undoAction = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      return {
        nodes: prevState.nodes,
        edges: prevState.edges,
        newIndex: historyIndex - 1
      };
    }
    return null;
  }, [historyIndex, history]);

  const redoAction = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      return {
        nodes: nextState.nodes,
        edges: nextState.edges,
        newIndex: historyIndex + 1
      };
    }
    return null;
  }, [historyIndex, history, history.length]);

  return {
    history,
    historyIndex,
    saveToHistory,
    undoAction,
    redoAction,
    setHistoryIndex,
    setHistory // Expose setHistory to allow modification from outside
  };
}
