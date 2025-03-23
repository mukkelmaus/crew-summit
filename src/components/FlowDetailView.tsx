import { useState } from "react";
import { Flow } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FlowEditor from "@/components/flow/FlowEditor";
import FlowControls from "./FlowControls";
import FlowEventTriggers from "./FlowEventTriggers";
import FlowLogger from "./FlowLogger";
import { saveFlow } from "@/lib/localDatabase";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Eye, Settings } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{currentFlow.name}</h1>
            <p className="text-sm text-muted-foreground">{currentFlow.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
          <FlowControls flow={currentFlow} onStatusChange={handleFlowStatusChange} />
        </div>
      </div>
      
      <Tabs defaultValue="flow">
        <TabsList>
          <TabsTrigger value="flow">Flow Editor</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flow" className="mt-6">
          <FlowEditor 
            flow={currentFlow}
            readOnly={!editMode}
            onSave={handleSave}
            onRun={handleRun}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="monitoring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Flow Monitoring</CardTitle>
              <CardDescription>
                Track the status and performance of your flow in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Flow Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <span className="text-sm font-medium">Current Status</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        currentFlow.status === "running" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30" 
                          : currentFlow.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                            : currentFlow.status === "error"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30"
                      }`}>
                        {currentFlow.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <span className="text-sm font-medium">Last Run</span>
                      <span className="text-sm">
                        {currentFlow.lastRun 
                          ? new Date(currentFlow.lastRun).toLocaleString() 
                          : "Never"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <span className="text-sm font-medium">Node Count</span>
                      <span className="text-sm">{currentFlow.nodes.length} nodes</span>
                    </div>
                    
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <span className="text-sm font-medium">Edge Count</span>
                      <span className="text-sm">{currentFlow.edges.length} connections</span>
                    </div>
                    
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <span className="text-sm font-medium">Human Interventions</span>
                      <span className="text-sm">
                        {currentFlow.humanInterventionPoints?.length || 0} points
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Active Nodes</h3>
                  <div className="space-y-3">
                    {currentFlow.nodes.length > 0 ? (
                      currentFlow.nodes.map((node) => (
                        <div key={node.id} className="border p-3 rounded-md flex items-center justify-between">
                          <div>
                            <div className="font-medium">{node.label}</div>
                            <div className="text-xs text-muted-foreground">{node.type}</div>
                          </div>
                          <div className={`h-2 w-2 rounded-full ${
                            currentFlow.status === "running" 
                              ? "bg-blue-500 animate-pulse" 
                              : currentFlow.status === "completed"
                                ? "bg-green-500"
                                : currentFlow.status === "error"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                          }`} />
                        </div>
                      ))
                    ) : (
                      <div className="border p-3 rounded-md text-center">
                        <p className="text-muted-foreground">No nodes defined</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="triggers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Triggers</CardTitle>
              <CardDescription>
                Configure events that will automatically trigger this flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlowEventTriggers 
                flow={currentFlow} 
                onFlowUpdate={handleFlowStatusChange} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution Logs</CardTitle>
              <CardDescription>
                View detailed logs of flow execution and node operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlowLogger flow={currentFlow} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Flow Settings</CardTitle>
              <CardDescription>
                Configure advanced settings for this flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">General Settings</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Flow ID</label>
                    <input 
                      type="text" 
                      value={currentFlow.id} 
                      readOnly 
                      className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Created At</label>
                    <input 
                      type="text" 
                      value={new Date(currentFlow.createdAt).toLocaleString()} 
                      readOnly 
                      className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Updated At</label>
                    <input 
                      type="text" 
                      value={currentFlow.updatedAt 
                        ? new Date(currentFlow.updatedAt).toLocaleString() 
                        : "Never"} 
                      readOnly 
                      className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Crew ID</label>
                    <input 
                      type="text" 
                      value={currentFlow.crewId} 
                      readOnly 
                      className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Options</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Storage Type</label>
                    <select className="w-full py-2 px-3 border rounded-md bg-background text-sm" defaultValue="local">
                      <option value="local">Local (IndexedDB)</option>
                      <option value="external">External Connection</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-Retry on Failure</label>
                    <select className="w-full py-2 px-3 border rounded-md bg-background text-sm" defaultValue="false">
                      <option value="false">Disabled</option>
                      <option value="true">Enabled</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Retries</label>
                    <input 
                      type="number" 
                      defaultValue={3}
                      min={0}
                      max={10}
                      className="w-full py-2 px-3 border rounded-md bg-background text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timeout (seconds)</label>
                    <input 
                      type="number" 
                      defaultValue={300}
                      min={0}
                      className="w-full py-2 px-3 border rounded-md bg-background text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
