
import React from "react";
import { Crew, CrewStatus } from "@/lib/types";
import CrewCard from "@/components/CrewCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CrewListProps {
  crews: Crew[];
  filteredCrews: Crew[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  getStatusColorClass: (status: CrewStatus) => string;
}

export default function CrewList({
  crews,
  filteredCrews,
  isLoading,
  searchQuery,
  statusFilter,
  getStatusColorClass
}: CrewListProps) {
  if (isLoading) {
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
          <div key={crew.id} className="relative group">
            <Badge 
              className={`absolute top-2 right-2 z-10 ${getStatusColorClass(crew.status)}`}
            >
              {crew.status.charAt(0).toUpperCase() + crew.status.slice(1)}
            </Badge>
            <CrewCard crew={crew} />
          </div>
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
