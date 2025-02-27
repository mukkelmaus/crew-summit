
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Crew } from "@/lib/types";
import { format } from "date-fns";
import AgentCard from "./AgentCard";
import { Check, Clock, AlertCircle, Play, MoreVertical } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskList from "./TaskList";
import { useToast } from "@/hooks/use-toast";

interface CrewCardProps {
  crew: Crew;
}

export default function CrewCard({ crew }: CrewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tasksVisible, setTasksVisible] = useState(false);
  const { toast } = useToast();
  
  const agentMap = crew.agents.reduce((acc, agent) => {
    acc[agent.id] = agent.name;
    return acc;
  }, {} as Record<string, string>);

  const getStatusIcon = (status: Crew['status']) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <span className="animate-pulse">•</span>;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: Crew['status']) => {
    switch (status) {
      case 'idle':
        return 'status-badge-idle';
      case 'running':
        return 'status-badge-running';
      case 'completed':
        return 'status-badge-completed';
      case 'error':
        return 'status-badge-error';
      default:
        return '';
    }
  };
  
  const runCrew = () => {
    toast({
      title: "Crew execution started",
      description: `${crew.name} is now running...`,
    });
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md card-hover">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{crew.name}</CardTitle>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className={getStatusClass(crew.status)}>
                  {getStatusIcon(crew.status)}
                  <span className="ml-1 capitalize">{crew.status}</span>
                </Badge>
                {crew.lastRun && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Last run: {format(new Date(crew.lastRun), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Crew Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTasksVisible(true)}>
                  View Tasks
                </DropdownMenuItem>
                <DropdownMenuItem>Edit Crew</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground mb-4">{crew.description}</p>
          
          <div className="text-sm font-medium mb-2">Agents ({crew.agents.length})</div>
          <div className="space-y-2">
            {isExpanded 
              ? crew.agents.map(agent => <AgentCard key={agent.id} agent={agent} compact />)
              : crew.agents.slice(0, 2).map(agent => <AgentCard key={agent.id} agent={agent} compact />)
            }
            {!isExpanded && crew.agents.length > 2 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(true)}
                className="text-xs w-full py-1 h-auto"
              >
                Show {crew.agents.length - 2} more agents
              </Button>
            )}
            {isExpanded && crew.agents.length > 2 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(false)}
                className="text-xs w-full py-1 h-auto"
              >
                Show less
              </Button>
            )}
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Tasks: {crew.tasks.length}</span>
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setTasksVisible(true)}>
                View all
              </Button>
            </div>
            
            <div className="mt-4 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Execution Strategy:</span>
                <span className="font-medium capitalize">{crew.config.taskExecutionStrategy}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Max Iterations:</span>
                <span className="font-medium">{crew.config.maxIterations}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="pt-3 flex justify-between">
          <div className="text-xs text-muted-foreground">
            Created {format(new Date(crew.createdAt), "MMM d, yyyy")}
          </div>
          <Button 
            size="sm" 
            className="gap-1" 
            onClick={runCrew}
            disabled={crew.status === 'running'}
          >
            <Play className="h-4 w-4" />
            Run Crew
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={tasksVisible} onOpenChange={setTasksVisible}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tasks for {crew.name}</DialogTitle>
            <DialogDescription>
              Manage and monitor tasks assigned to this crew
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <TaskList tasks={crew.tasks} agentMap={agentMap} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
