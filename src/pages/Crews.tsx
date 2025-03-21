
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import CreateCrewDialog from "@/components/CreateCrewDialog";
import CrewFilter from "@/components/crew/CrewFilter";
import CrewList from "@/components/crew/CrewList";
import { Crew, CrewStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getStatusColorClass, filterCrews } from "@/utils/crewUtils";
import { CrewService } from "@/services/api";
import { Loader2 } from "lucide-react";

export default function Crews() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load crews on component mount
  useEffect(() => {
    loadCrews();
  }, []);

  const loadCrews = async () => {
    try {
      setIsLoading(true);
      const loadedCrews = await CrewService.getCrews();
      setCrews(loadedCrews);
    } catch (error) {
      console.error("Failed to load crews:", error);
      toast({
        title: "Error",
        description: "Failed to load crews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter crews based on search query and status filter
  const filteredCrews = filterCrews(crews, searchQuery, statusFilter);

  const handleDeleteCrew = async (crewId: string) => {
    try {
      setIsLoading(true);
      await CrewService.deleteCrew(crewId);
      setCrews(crews.filter(crew => crew.id !== crewId));
      toast({
        title: "Crew deleted",
        description: "The crew has been successfully removed.",
      });
    } catch (error) {
      console.error("Failed to delete crew:", error);
      toast({
        title: "Error",
        description: "Failed to delete the crew. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCrew = async (crewId: string) => {
    try {
      const crew = crews.find(c => c.id === crewId);
      if (!crew) return;

      // Update crew status locally first for immediate feedback
      const updatedCrew = { ...crew, status: "running" as CrewStatus };
      setCrews(crews.map(c => c.id === crewId ? updatedCrew : c));
      
      // Call API to run the crew
      const { runId } = await CrewService.runCrew(crewId);
      
      toast({
        title: "Crew started",
        description: `Crew "${crew.name}" is now running.`,
      });
    } catch (error) {
      console.error("Failed to run crew:", error);
      
      // Revert status on error
      const originalCrew = crews.find(c => c.id === crewId);
      if (originalCrew) {
        setCrews(crews.map(c => c.id === crewId ? originalCrew : c));
      }
      
      toast({
        title: "Error",
        description: "Failed to start the crew. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCrewCreated = async () => {
    // Reload crews after creating a new one
    await loadCrews();
    toast({
      title: "Success",
      description: "New crew has been created successfully.",
    });
  };

  if (isLoading && crews.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Crews</h1>
            <CreateCrewDialog onCrewCreated={handleCrewCreated} />
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading crews...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Crews</h1>
          <CreateCrewDialog onCrewCreated={handleCrewCreated} />
        </div>

        <CrewFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <CrewList
          crews={crews}
          filteredCrews={filteredCrews}
          isLoading={isLoading}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onDeleteCrew={handleDeleteCrew}
          onRunCrew={handleRunCrew}
          getStatusColorClass={getStatusColorClass}
        />
      </main>
    </div>
  );
}
