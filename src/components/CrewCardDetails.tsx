
import React from "react";
import { Crew, CrewStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Play, 
  Loader2, 
  Check, 
  AlertTriangle,
  Users,
  ListTodo,
  Settings2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getStatusColorClass } from "@/utils/crewUtils";

interface CrewCardDetailsProps {
  crew: Crew;
  onRunCrew?: (crewId: string) => void;
}

export default function CrewCardDetails({ crew, onRunCrew }: CrewCardDetailsProps) {
  const getStatusIcon = (status: CrewStatus) => {
    switch (status) {
      case "idle":
        return <Clock className="h-4 w-4" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "completed":
        return <Check className="h-4 w-4" />;
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Cast the status to CrewStatus to ensure type safety
  const status = crew.status as CrewStatus;
  // Alternatively: const status: CrewStatus = crew.status;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{crew.name}</CardTitle>
            <CardDescription className="mt-1">{crew.description}</CardDescription>
          </div>
          <Badge className={getStatusColorClass(status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              Agents
            </div>
            <div className="font-medium">{crew.agents.length} agents</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {crew.agents.map(agent => (
                <Badge key={agent.id} variant="outline" className="text-xs">
                  {agent.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <ListTodo className="h-4 w-4 mr-2" />
              Tasks
            </div>
            <div className="font-medium">{crew.tasks.length} tasks</div>
            <div className="text-sm text-muted-foreground">
              {crew.config.taskExecutionStrategy === "sequential" ? 
                "Sequential execution" : 
                "Parallel execution"}
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Settings2 className="h-4 w-4 mr-2" />
            Configuration
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Verbose Mode:</span>
              <span className="ml-2 font-medium">{crew.config.verbose ? "On" : "Off"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Max Iterations:</span>
              <span className="ml-2 font-medium">{crew.config.maxIterations}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Execution:</span>
              <span className="ml-2 font-medium capitalize">{crew.config.taskExecutionStrategy}</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Timeline</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {formatDistanceToNow(new Date(crew.createdAt), { addSuffix: true })}
              </span>
            </div>
            {crew.lastRun && (
              <div>
                <span className="text-muted-foreground">Last Run:</span>
                <span className="ml-2 font-medium">
                  {formatDistanceToNow(new Date(crew.lastRun), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/50 p-4 flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Back
        </Button>
        
        <div className="flex gap-2">
          {status !== "running" && (
            <Button
              onClick={() => onRunCrew && onRunCrew(crew.id)}
              disabled={status === "running"}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Crew
            </Button>
          )}
          
          {status === "running" && (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Running
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
