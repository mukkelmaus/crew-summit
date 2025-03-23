
import { useState } from "react";
import { Flow } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveFlow } from "@/lib/localDatabase";
import { useToast } from "@/hooks/use-toast";
import { FlowHeader } from "@/components/flow/FlowHeader";
import { FlowEditorTab } from "@/components/flow/tabs/FlowEditorTab";
import { FlowMonitoringTab } from "@/components/flow/tabs/FlowMonitoringTab";
import { FlowTriggersTab } from "@/components/flow/tabs/FlowTriggersTab";
import { FlowLogsTab } from "@/components/flow/tabs/FlowLogsTab";
import { FlowSettingsTab } from "@/components/flow/tabs/FlowSettingsTab";

interface FlowDetailViewProps {
  flow: Flow;
  onFlowUpdate?: (flow: Flow) => void;
  onBack?: () => void;
}

export default function FlowDetailView({ flow, onFlowUpdate, onBack }: FlowDetailViewProps) {
  const [currentFlow, setCurrentFlow] = useState<Flow>(flow);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const handleFlowStatusChange = (updatedFlow: Flow) => {
    setCurrentFlow(updatedFlow);
    if (onFlowUpdate) {
      onFlowUpdate(updatedFlow);
    }
  };
  
  const handleSave = async (updatedFlow: Flow) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await saveFlow(updatedFlow);
      setCurrentFlow(updatedFlow);
      if (onFlowUpdate) {
        onFlowUpdate(updatedFlow);
      }
      
      toast({
        title: "Flow saved",
        description: "Flow changes have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving flow:", error);
      setError(error instanceof Error ? error : new Error("Unknown error occurred"));
      
      toast({
        title: "Error saving flow",
        description: "Could not save flow changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRun = (updatedFlow: Flow) => {
    setCurrentFlow(updatedFlow);
    if (onFlowUpdate) {
      onFlowUpdate(updatedFlow);
    }
  };
  
  return (
    <div className="space-y-6">
      <FlowHeader 
        flow={currentFlow}
        editMode={editMode}
        onEditModeToggle={() => setEditMode(!editMode)}
        onBack={onBack}
        onFlowUpdate={handleFlowStatusChange}
      />
      
      <Tabs defaultValue="flow">
        <TabsList>
          <TabsTrigger value="flow">Flow Editor</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flow" className="mt-6">
          <FlowEditorTab
            flow={currentFlow}
            editMode={editMode}
            isLoading={isLoading}
            error={error}
            onSave={handleSave}
            onRun={handleRun}
          />
        </TabsContent>
        
        <TabsContent value="monitoring" className="mt-6">
          <FlowMonitoringTab flow={currentFlow} />
        </TabsContent>
        
        <TabsContent value="triggers" className="mt-6">
          <FlowTriggersTab
            flow={currentFlow}
            onFlowUpdate={handleFlowStatusChange}
          />
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <FlowLogsTab flow={currentFlow} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <FlowSettingsTab flow={currentFlow} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
