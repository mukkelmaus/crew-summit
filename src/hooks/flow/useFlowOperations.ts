
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Flow } from '@/lib/types';
import { prepareFlowForSave } from '@/lib/flowEditorUtils';
import { useToast } from '@/hooks/use-toast';

export function useFlowOperations(
  flow: Flow,
  nodes: Node[],
  edges: Edge[],
  onSave?: (flow: Flow) => void,
  onRun?: (flow: Flow) => void,
  pendingApprovals: string[] = []
) {
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

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

  const handleRun = useCallback(async () => {
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
  }, [onRun, flow, nodes, edges, pendingApprovals, toast]);

  const exportFlow = useCallback(() => {
    const updatedFlow = prepareFlowForSave(flow, nodes, edges);
    
    const dataStr = JSON.stringify(updatedFlow, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `${flow.name.replace(/\s/g, '_')}_flow.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [flow, nodes, edges]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      const element = document.querySelector('.flow-editor-container');
      if (element) {
        element.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  }, []);

  const approveHumanNode = useCallback(async (nodeId: string, approved: boolean) => {
    setIsSaving(true);
    try {
      // Update the flow's humanInterventionPoints
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
  }, [flow, onSave, toast]);

  return {
    isSaving,
    isRunning,
    isFullscreen,
    handleSave,
    handleRun,
    exportFlow,
    toggleFullscreen,
    approveHumanNode
  };
}
