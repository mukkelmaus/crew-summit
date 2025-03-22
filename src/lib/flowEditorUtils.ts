
import { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { Flow, FlowNode, FlowNodeType } from './types';
import { 
  flowNodesToReactFlowNodes, 
  reactFlowNodesToFlowNodes, 
  reactFlowEdgesToFlowEdges 
} from './flowTypeUtils';

/**
 * Creates a new node of the specified type
 */
export const createNewNode = (type: FlowNodeType, centerX: number, centerY: number): FlowNode => {
  return {
    id: `node-${uuidv4()}`,
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    data: {
      description: `New ${type.replace('_', ' ')} node`,
    },
    position: { 
      x: centerX, 
      y: centerY 
    },
  };
};

/**
 * Prepares flow data for saving
 */
export const prepareFlowForSave = (flow: Flow, nodes: Node[], edges: Edge[]): Flow => {
  const flowNodes = reactFlowNodesToFlowNodes(nodes);
  const flowEdges = reactFlowEdgesToFlowEdges(edges);
  
  return {
    ...flow,
    nodes: flowNodes,
    edges: flowEdges,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Creates a connection between nodes
 */
export const createConnection = (params: any, sourceNode: Node | undefined) => {
  let edgeType = 'default';
  
  if (sourceNode?.type === 'condition') {
    edgeType = params.sourceHandle === 'true' ? 'success' : 'failure';
  } else if (sourceNode?.type === 'human_approval') {
    edgeType = params.sourceHandle === 'approved' ? 'approval' : 'rejection';
  }
  
  return {
    ...params,
    id: `edge-${uuidv4()}`,
    type: edgeType,
    animated: edgeType === 'default' ? false : true,
    markerEnd: {
      type: 'arrowclosed',
    },
    style: {
      stroke: edgeType === 'success' || edgeType === 'approval' ? '#16a34a' : 
              edgeType === 'failure' || edgeType === 'rejection' ? '#dc2626' : 
              '#64748b'
    }
  };
};

/**
 * Organizes nodes in a structured layout
 */
export const organizeNodesLayout = (nodes: Node[]): Node[] => {
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
  
  return updatedNodes;
};
