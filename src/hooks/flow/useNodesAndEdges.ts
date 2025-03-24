
import { useState, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from '@xyflow/react';
import { Flow } from '@/lib/types';
import {
  flowNodesToReactFlowNodes,
  flowEdgesToReactFlowEdges,
} from '@/lib/flowTypeUtils';
import { createConnection } from '@/lib/flowEditorUtils';

export function useNodesAndEdges(flow: Flow, saveToHistory: () => void) {
  const initialNodes = flowNodesToReactFlowNodes(flow.nodes);
  const initialEdges = flowEdgesToReactFlowEdges(flow.edges);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const connection = createConnection(params, sourceNode);
    setEdges((eds) => addEdge(connection, eds));
    saveToHistory();
  }, [nodes, setEdges, saveToHistory]);

  // Filter nodes based on search query
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
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    setSelectedNode,
    handleNodeClick,
    searchQuery,
    setSearchQuery,
  };
}
