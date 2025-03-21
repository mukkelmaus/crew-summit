
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Crew, Task } from "@/lib/types";
import { CrewService, TaskService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import CrewCardDetails from "@/components/CrewCardDetails";
import TaskList from "@/components/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function CrewDetail() {
  const { id } = useParams<{ id: string }>();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    
    const loadCrewData = async () => {
      try {
        setIsLoading(true);
        const crewData = await CrewService.getCrew(id);
        setCrew(crewData);
        
        // Load tasks for this crew
        const allTasks = await TaskService.getTasks();
        const crewTasks = allTasks.filter(task => {
          // Match tasks with the crew's task list
          return crewData.tasks.some(crewTask => {
            if (typeof crewTask === 'string') {
              return crewTask === task.id;
            } else {
              return crewTask.id === task.id;
            }
          });
        });
        setTasks(crewTasks);
      } catch (error) {
        console.error("Error loading crew details:", error);
        toast({
          title: "Error",
          description: "Failed to load crew details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCrewData();
  }, [id, toast]);

  const handleRunCrew = async (crewId: string) => {
    if (!crew) return;
    
    try {
      // Update UI immediately
      setCrew({ ...crew, status: "running" });
      
      // Call API
      const { runId } = await CrewService.runCrew(crewId);
      
      toast({
        title: "Crew started",
        description: `Crew "${crew.name}" is now running.`,
      });
    } catch (error) {
      console.error("Failed to run crew:", error);
      
      // Revert on error
      setCrew({ ...crew, status: crew.status });
      
      toast({
        title: "Error",
        description: "Failed to start the crew. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading crew details...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!crew) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <EmptyState
            icon={<Loader2 className="h-12 w-12" />}
            title="Crew not found"
            description="The crew you're looking for doesn't exist or has been deleted."
            action={
              <Button onClick={() => window.location.href = "/crews"}>
                Back to Crews
              </Button>
            }
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <CrewCardDetails crew={crew} onRunCrew={handleRunCrew} />
        </div>

        <Tabs defaultValue="tasks" className="mt-6">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="runs">Run History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            
            {tasks.length > 0 ? (
              <TaskList tasks={tasks} />
            ) : (
              <EmptyState
                title="No Tasks"
                description="This crew doesn't have any tasks yet."
                action={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                }
              />
            )}
          </TabsContent>
          
          <TabsContent value="agents" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Agents</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>
            
            {crew.agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crew.agents.map(agent => (
                  <div key={agent.id} className="border p-4 rounded-lg">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.role}</div>
                    <div className="text-sm mt-2">{agent.description}</div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {agent.tools.map(tool => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Agents"
                description="This crew doesn't have any agents assigned yet."
                action={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Agent
                  </Button>
                }
              />
            )}
          </TabsContent>
          
          <TabsContent value="runs" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Run History</h2>
            </div>
            
            <EmptyState
              title="No Run History"
              description="This crew hasn't been run yet, or run history is not available."
              action={
                <Button onClick={() => handleRunCrew(crew.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Run Crew Now
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
