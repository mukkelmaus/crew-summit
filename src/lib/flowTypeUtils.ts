
import { Node, Edge } from '@xyflow/react';
import { FlowNode, FlowEdge } from './types';
import { ReactNode, isValidElement } from 'react';

/**
 * Safely converts ReactNode to string
 */
export const reactNodeToString = (node: ReactNode): string => {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number' || typeof node === 'boolean') return String(node);
  if (isValidElement(node)) return 'React Element';
  return '';
};

/**
 * Converts a FlowNode array to ReactFlow Node array
 */
export const flowNodesToReactFlowNodes = (nodes: FlowNode[]): Node[] => {
  return nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: { ...node.data, label: node.label },
    // Other properties that ReactFlow's Node might expect
    draggable: true,
    selectable: true,
  }));
};

/**
 * Converts ReactFlow Node array back to FlowNode array
 */
export const reactFlowNodesToFlowNodes = (nodes: Node[]): FlowNode[] => {
  return nodes.map(node => ({
    id: node.id,
    type: node.type as any, // Cast to our FlowNodeType
    label: node.data?.label ? reactNodeToString(node.data.label) : 'Node',
    data: { ...node.data },
    position: node.position,
  }));
};

/**
 * Converts FlowEdge array to ReactFlow Edge array
 */
export const flowEdgesToReactFlowEdges = (edges: FlowEdge[]): Edge[] => {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    label: edge.label,
    animated: edge.animated,
    type: edge.type,
    style: edge.type === 'success' || edge.type === 'approval' 
      ? { stroke: '#16a34a' } 
      : edge.type === 'failure' || edge.type === 'rejection' 
        ? { stroke: '#dc2626' } 
        : { stroke: '#64748b' },
  }));
};

/**
 * Converts ReactFlow Edge array back to FlowEdge array
 */
export const reactFlowEdgesToFlowEdges = (edges: Edge[]): FlowEdge[] => {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    // Convert ReactNode label to string if needed
    label: edge.label ? reactNodeToString(edge.label) : undefined,
    animated: edge.animated,
    type: edge.type as any, // Cast to our EdgeType
  }));
};
