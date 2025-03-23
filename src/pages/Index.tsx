import React from "react";
import { Button } from "@/components/ui/button";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import CreateCrewDialog from "@/components/CreateCrewDialog";
import { TaskExecutionPanel } from "@/components/TaskExecutionPanel";
import { CrewAIStatus } from "@/components/CrewAIStatus";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Database, Workflow, Cog } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted dark:bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                CrewSUMMIT Platform
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Create, manage, and orchestrate AI agent crews for collaborative task execution.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <CreateAgentDialog />
                <CreateCrewDialog />
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 md:px-6 py-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Quick Access</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="h-full">
              <CardHeader>
                <Users className="h-6 w-6 mb-2" />
                <CardTitle>Agents</CardTitle>
                <CardDescription>
                  Create and manage AI agents with specific roles.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigateTo("/agents")}>
                  View Agents
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="h-full">
              <CardHeader>
                <Users className="h-6 w-6 mb-2" />
                <CardTitle>Crews</CardTitle>
                <CardDescription>
                  Organize agents into collaborative teams.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigateTo("/crews")}>
                  View Crews
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="h-full">
              <CardHeader>
                <Workflow className="h-6 w-6 mb-2" />
                <CardTitle>Flows</CardTitle>
                <CardDescription>
                  Design visual workflows for agent interaction.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigateTo("/flows")}>
                  View Flows
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="h-full">
              <CardHeader>
                <Cog className="h-6 w-6 mb-2" />
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure platform settings and integrations.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigateTo("/settings")}>
                  Open Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        <section className="container px-4 md:px-6 py-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Task Execution Preview</h2>
              <TaskExecutionPanel taskId="task-1" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Integration Status</h2>
              <CrewAIStatus />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
