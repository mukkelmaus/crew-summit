
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { FlowNodeType } from '@/lib/types';
import { createNewNode } from '@/lib/flowEditorUtils';
import { flowNodesToReactFlowNodes } from '@/lib/flowTypeUtils';
import { useToast } from '@/hooks/use-toast';

export function useNodeOperations(
  nodes: Node[], 
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<any[]>>,
  saveToHistory: () => void,
  selectedNode: Node | null,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>,
  reactFlowInstance: any
) {
  const { toast } = useToast();
  const reactFlowWrapper = { current: null } as React.RefObject<HTMLDivElement>;

  const addNewNode = useCallback((type: FlowNodeType) => {
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
  }, [reactFlowInstance, setNodes, saveToHistory, toast]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setEdges(edges => edges.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      
      setNodes(nodes => nodes.filter(node => node.id !== selectedNode.id));
      setSelectedNode(null);
      
      saveToHistory();
      
      toast({
        title: "Node deleted",
        description: `${selectedNode.type} node has been removed from the flow.`,
      });
    }
  }, [selectedNode, setEdges, setNodes, setSelectedNode, saveToHistory, toast]);

  const duplicateSelectedNode = useCallback(() => {
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
  }, [selectedNode, setNodes, saveToHistory, toast]);

  const organizeLayout = useCallback(() => {
    const updatedNodes = reactFlowInstance.getNodes().map((node: Node) => ({
      ...node,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500
      }
    }));
    
    setNodes(updatedNodes);
    reactFlowInstance.fitView({ padding: 0.2 });
    
    toast({
      title: "Layout organized",
      description: "Nodes have been arranged in a structured layout."
    });
  }, [reactFlowInstance, setNodes, toast]);

  return {
    reactFlowWrapper,
    addNewNode,
    deleteSelectedNode,
    duplicateSelectedNode,
    organizeLayout
  };
}
