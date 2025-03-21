
import React from "react";
import { Crew, CrewStatus } from "@/lib/types";
import CrewCard from "@/components/CrewCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CrewListProps {
  crews: Crew[];
  filteredCrews: Crew[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  getStatusColorClass: (status: CrewStatus) => string;
  onDeleteCrew?: (crewId: string) => void;
  onRunCrew?: (crewId: string) => void;
}

export default function CrewList({
  crews,
  filteredCrews,
  isLoading,
  searchQuery,
  statusFilter,
  getStatusColorClass,
  onDeleteCrew,
  onRunCrew
}: CrewListProps) {
  if (isLoading && crews.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (filteredCrews.length > 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCrews.map(crew => (
          <Card key={crew.id} className="relative group overflow-hidden">
            <Badge 
              className={`absolute top-2 right-2 z-10 ${getStatusColorClass(crew.status)}`}
            >
              {crew.status.charAt(0).toUpperCase() + crew.status.slice(1)}
            </Badge>
            
            <CardHeader className="pb-2">
              <CardTitle>{crew.name}</CardTitle>
              <CardDescription className="line-clamp-2">{crew.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground mb-2">
                {crew.agents.length} Agents · {crew.tasks.length} Tasks
              </p>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {crew.agents.slice(0, 3).map(agent => (
                  <Badge key={agent.id} variant="outline" className="text-xs">
                    {agent.name}
                  </Badge>
                ))}
                {crew.agents.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{crew.agents.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(crew.createdAt).toLocaleDateString()}</span>
                </div>
                {crew.lastRun && (
                  <div className="flex justify-between">
                    <span>Last run:</span>
                    <span>{new Date(crew.lastRun).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.href = `/crew/${crew.id}`}
              >
                Details
              </Button>
              
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Crew</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{crew.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDeleteCrew && onDeleteCrew(crew.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {crew.status !== 'running' && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => onRunCrew && onRunCrew(crew.id)}
                    disabled={crew.status === 'running'}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Run
                  </Button>
                )}
                
                {crew.status === 'running' && (
                  <Button size="sm" variant="outline" disabled>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Running
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="No crews found"
      description={searchQuery || statusFilter !== "all" ? 
        "Try adjusting your search or filter criteria." : 
        "Get started by creating your first crew of AI agents."}
      action={
        <Button onClick={() => {
          const createCrewButton = document.querySelector('[data-testid="create-crew-button"]');
          if (createCrewButton instanceof HTMLElement) {
            createCrewButton.click();
          }
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Crew
        </Button>
      }
    />
  );
}
