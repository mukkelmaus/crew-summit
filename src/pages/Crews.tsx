
import React, { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import CreateCrewDialog from "@/components/CreateCrewDialog";
import CrewFilter from "@/components/crew/CrewFilter";
import CrewList from "@/components/crew/CrewList";
import { Crew, CrewStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getStatusColorClass, filterCrews } from "@/utils/crewUtils";

const mockCrews: Crew[] = [
  {
    id: "crew-1",
    name: "Research Team Alpha",
    description: "Specialized in market research and trend analysis",
    agents: [
      {
        id: "agent-1",
        name: "Data Analyst",
        role: "analyst",
        description: "Processes market data and identifies patterns",
        status: "idle",
        llm: "GPT-4",
        tools: ["web-search", "data-analysis"]
      },
      {
        id: "agent-2",
        name: "Research Assistant",
        role: "researcher",
        description: "Gathers information from various sources",
        status: "idle",
        llm: "Claude-2",
        tools: ["web-search", "document-reader"]
      }
    ],
    tasks: [],
    status: "idle",
    createdAt: "2023-05-10T14:30:00Z",
    config: {
      verbose: true,
      maxIterations: 5,
      taskExecutionStrategy: "sequential"
    }
  },
  {
    id: "crew-2",
    name: "Content Production",
    description: "Creates and reviews content for marketing campaigns",
    agents: [
      {
        id: "agent-3",
        name: "Content Writer",
        role: "writer",
        description: "Creates engaging marketing copy",
        status: "working",
        llm: "GPT-4",
        tools: ["text-generation"]
      },
      {
        id: "agent-4",
        name: "Content Reviewer",
        role: "reviewer",
        description: "Reviews and refines content",
        status: "idle",
        llm: "Claude-2",
        tools: ["grammar-check", "tone-analysis"]
      }
    ],
    tasks: [],
    status: "running",
    createdAt: "2023-06-15T09:45:00Z",
    lastRun: "2023-07-20T11:30:00Z",
    config: {
      verbose: true,
      maxIterations: 3,
      taskExecutionStrategy: "sequential"
    }
  },
  {
    id: "crew-3",
    name: "Development Squad",
    description: "Designs and implements software solutions",
    agents: [
      {
        id: "agent-5",
        name: "UI Designer",
        role: "designer",
        description: "Creates user interface mockups",
        status: "completed",
        llm: "GPT-4",
        tools: ["image-generation", "wireframe-tools"]
      },
      {
        id: "agent-6",
        name: "Code Generator",
        role: "developer",
        description: "Implements designs in code",
        status: "completed",
        llm: "Claude-2",
        tools: ["code-generation", "code-review"]
      }
    ],
    tasks: [],
    status: "completed",
    createdAt: "2023-07-05T16:20:00Z",
    lastRun: "2023-07-25T14:10:00Z",
    config: {
      verbose: false,
      maxIterations: 10,
      taskExecutionStrategy: "parallel"
    }
  }
];

export default function Crews() {
  const [crews, setCrews] = useState<Crew[]>(mockCrews);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filter crews based on search query and status filter
  const filteredCrews = filterCrews(crews, searchQuery, statusFilter);

  const handleDeleteCrew = async (crewId: string) => {
    try {
      setIsLoading(true);
      // This would be replaced with an actual API call
      setTimeout(() => {
        setCrews(crews.filter(crew => crew.id !== crewId));
        setIsLoading(false);
        toast({
          title: "Crew deleted",
          description: "The crew has been successfully removed.",
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the crew. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const getStatusColorClass = (status: CrewStatus) => {
    switch (status) {
      case "idle":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Crews</h1>
          <CreateCrewDialog />
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
          getStatusColorClass={getStatusColorClass}
        />
      </main>
    </div>
  );
}
