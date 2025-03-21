
import { Crew, CrewStatus } from "@/lib/types";

// Get CSS class for crew status badge
export const getStatusColorClass = (status: CrewStatus): string => {
  switch (status) {
    case 'idle':
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case 'running':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case 'completed':
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case 'error':
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Filter crews based on search query and status
export const filterCrews = (
  crews: Crew[], 
  searchQuery: string, 
  statusFilter: string
): Crew[] => {
  return crews.filter(crew => {
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          crew.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || crew.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
};
