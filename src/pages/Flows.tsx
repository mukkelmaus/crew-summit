
import { useState, useEffect } from "react";
import { Flow } from "@/lib/types";
import { 
  getFlows, 
  saveFlow,
} from "@/lib/localDatabase";
import FlowDashboard from "@/components/FlowDashboard";
import FlowDetailView from "@/components/FlowDetailView";
import AIProviderSettings from "@/components/AIProviderSettings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FlowTemplateSelector } from "@/components/FlowTemplates";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Plus, Settings } from "lucide-react";

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadFlows() {
      try {
        const loadedFlows = await getFlows();
        setFlows(loadedFlows);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading flows:", error);
        toast({
          title: "Error loading flows",
          description: "Could not load flows from local database",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }

    loadFlows();
  }, [toast]);

  const handleFlowUpdate = async (updatedFlow: Flow) => {
    try {
      await saveFlow(updatedFlow);
      
      // Update the flows list
      setFlows(prevFlows => 
        prevFlows.map(flow => 
          flow.id === updatedFlow.id ? updatedFlow : flow
        )
      );
      
      // Update the selected flow if it's the one being updated
      if (selectedFlow && selectedFlow.id === updatedFlow.id) {
        setSelectedFlow(updatedFlow);
      }
      
      toast({
        title: "Flow updated",
        description: `${updatedFlow.name} has been updated`,
      });
    } catch (error) {
      console.error("Error updating flow:", error);
      toast({
        title: "Error updating flow",
        description: "Could not update flow",
        variant: "destructive",
      });
    }
  };

  const handleCreateFlow = async (template?: Flow) => {
    try {
      const now = new Date().toISOString();
      
      // Create a new flow using the template or default values
      const newFlow: Flow = template || {
        id: uuidv4(),
        name: "New Flow",
        description: "A new workflow",
        crewId: "default-crew",
        nodes: [],
        edges: [],
        createdAt: now,
        status: "idle",
      };
      
      // Save the new flow
      await saveFlow(newFlow);
      
      // Update the flows list
      setFlows(prevFlows => [...prevFlows, newFlow]);
      
      // Select the new flow
      setSelectedFlow(newFlow);
      
      // Close the template dialog if it's open
      setIsTemplateDialogOpen(false);
      
      toast({
        title: "Flow created",
        description: `${newFlow.name} has been created`,
      });
    } catch (error) {
      console.error("Error creating flow:", error);
      toast({
        title: "Error creating flow",
        description: "Could not create flow",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6">
      {selectedFlow ? (
        <FlowDetailView
          flow={selectedFlow}
          onFlowUpdate={handleFlowUpdate}
          onBack={() => setSelectedFlow(null)}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Flows</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsTemplateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Flow
              </Button>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                AI Settings
              </Button>
            </div>
          </div>
          
          <FlowDashboard />
        </div>
      )}
      
      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Flow</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="templates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Use Template</TabsTrigger>
              <TabsTrigger value="empty">Start Empty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="mt-6">
              <FlowTemplateSelector onSelect={handleCreateFlow} />
            </TabsContent>
            
            <TabsContent value="empty" className="mt-6">
              <div className="text-center p-12">
                <h3 className="text-lg font-medium mb-4">Start with an Empty Flow</h3>
                <p className="text-muted-foreground mb-6">
                  Create a blank flow and build your workflow from scratch.
                </p>
                <Button onClick={() => handleCreateFlow()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Empty Flow
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* AI Provider Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI Provider Settings</DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            <AIProviderSettings />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
