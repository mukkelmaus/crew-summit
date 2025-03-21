
import { Crew } from "@/lib/types";
import { mockCrews } from "@/lib/data";
import { localDB } from "@/lib/localDatabase";
import { v4 as uuidv4 } from "uuid";

// For development/demo purposes before backend is implemented
const USE_MOCK_API = true;

// Simulated latency for mock API (milliseconds)
const MOCK_API_DELAY = 500;

// Helper for mock API responses
const mockResponse = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_API_DELAY);
  });
};

// Error handling helper
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  throw error;
};

export const CrewService = {
  // Get all crews
  async getCrews(): Promise<Crew[]> {
    if (USE_MOCK_API) {
      try {
        // First try to get from local database
        const crews = await localDB.getCollection<Crew>("crews");
        if (crews && crews.length > 0) {
          return crews;
        }
        
        // If no crews in local DB, use mock data and store it
        for (const crew of mockCrews) {
          await localDB.addItem("crews", crew);
        }
        
        return mockResponse(mockCrews);
      } catch (error) {
        // Fallback to mock data if local DB fails
        console.error("Error accessing local database:", error);
        return mockResponse(mockCrews);
      }
    }

    try {
      const response = await fetch("/api/v1/crews");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get crew by ID
  async getCrew(id: string): Promise<Crew> {
    if (USE_MOCK_API) {
      try {
        // Try to get from local database first
        const crew = await localDB.getItem<Crew>("crews", id);
        if (crew) {
          return mockResponse(crew);
        }
        
        // Fallback to mock data
        const mockCrew = mockCrews.find((c) => c.id === id);
        if (!mockCrew) throw new Error(`Crew not found: ${id}`);
        return mockResponse(mockCrew);
      } catch (error) {
        // If not found in local DB or it fails, check mock data
        const mockCrew = mockCrews.find((c) => c.id === id);
        if (!mockCrew) throw new Error(`Crew not found: ${id}`);
        return mockResponse(mockCrew);
      }
    }

    try {
      const response = await fetch(`/api/v1/crews/${id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new crew
  async createCrew(crewData: Omit<Crew, "id" | "status" | "createdAt">): Promise<Crew> {
    if (USE_MOCK_API) {
      try {
        const { v4: uuidv4 } = await import("uuid");
        const newCrew: Crew = {
          id: uuidv4(),
          status: "idle",
          createdAt: new Date().toISOString(),
          ...crewData,
        };
        
        // Save to local database
        await localDB.addItem("crews", newCrew);
        return mockResponse(newCrew);
      } catch (error) {
        console.error("Error saving crew to local database:", error);
        
        // Fallback to just returning the data without persisting
        const { v4: uuidv4 } = await import("uuid");
        const newCrew: Crew = {
          id: uuidv4(),
          status: "idle",
          createdAt: new Date().toISOString(),
          ...crewData,
        };
        return mockResponse(newCrew);
      }
    }

    try {
      const response = await fetch("/api/v1/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crewData),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update existing crew
  async updateCrew(id: string, crewData: Partial<Crew>): Promise<Crew> {
    if (USE_MOCK_API) {
      try {
        // Get current crew from local DB
        const existingCrew = await localDB.getItem<Crew>("crews", id);
        let updatedCrew: Crew;
        
        if (existingCrew) {
          updatedCrew = { ...existingCrew, ...crewData };
          await localDB.updateItem("crews", updatedCrew);
        } else {
          // Fallback to mock data
          const mockCrew = mockCrews.find((c) => c.id === id);
          if (!mockCrew) throw new Error(`Crew not found: ${id}`);
          updatedCrew = { ...mockCrew, ...crewData };
        }
        
        return mockResponse(updatedCrew);
      } catch (error) {
        console.error("Error updating crew in local database:", error);
        
        // Fallback to mock data
        const mockCrew = mockCrews.find((c) => c.id === id);
        if (!mockCrew) throw new Error(`Crew not found: ${id}`);
        const updatedCrew = { ...mockCrew, ...crewData };
        return mockResponse(updatedCrew);
      }
    }

    try {
      const response = await fetch(`/api/v1/crews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crewData),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete crew
  async deleteCrew(id: string): Promise<void> {
    if (USE_MOCK_API) {
      try {
        await localDB.deleteItem("crews", id);
        return mockResponse(undefined);
      } catch (error) {
        console.error("Error deleting crew from local database:", error);
        return mockResponse(undefined);
      }
    }

    try {
      const response = await fetch(`/api/v1/crews/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Run a crew
  async runCrew(id: string, options = { async: true }): Promise<{ runId: string }> {
    if (USE_MOCK_API) {
      try {
        const runId = uuidv4();
        
        // Update crew status in local DB
        const existingCrew = await localDB.getItem<Crew>("crews", id);
        if (existingCrew) {
          const updatedCrew = { 
            ...existingCrew, 
            status: "running",
            lastRun: new Date().toISOString()
          };
          await localDB.updateItem("crews", updatedCrew);
          
          // Simulate completing the run after some time (for demo purposes)
          setTimeout(async () => {
            try {
              const crew = await localDB.getItem<Crew>("crews", id);
              if (crew && crew.status === "running") {
                const completed = {
                  ...crew,
                  status: "completed",
                };
                await localDB.updateItem("crews", completed);
                console.log(`Crew ${id} completed automatically after delay`);
              }
            } catch (error) {
              console.error("Error auto-completing crew:", error);
            }
          }, 20000); // Complete after 20 seconds
        }
        
        return mockResponse({ runId });
      } catch (error) {
        console.error("Error running crew:", error);
        return mockResponse({ runId: uuidv4() });
      }
    }

    try {
      const response = await fetch(`/api/v1/crews/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default CrewService;
