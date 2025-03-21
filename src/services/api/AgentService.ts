
import { Agent } from "@/lib/types";
import { mockAgents } from "@/lib/data";
import { localDB } from "@/lib/localDatabase";

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

export const AgentService = {
  // Get all agents
  async getAgents(): Promise<Agent[]> {
    if (USE_MOCK_API) {
      try {
        // First try to get from local database
        const agents = await localDB.getCollection<Agent>("agents");
        if (agents && agents.length > 0) {
          return agents;
        }
        
        // If no agents in local DB, use mock data and store it
        for (const agent of mockAgents) {
          await localDB.addItem("agents", agent);
        }
        
        return mockResponse(mockAgents);
      } catch (error) {
        // Fallback to mock data if local DB fails
        console.error("Error accessing local database:", error);
        return mockResponse(mockAgents);
      }
    }

    try {
      const response = await fetch("/api/v1/agents");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get agent by ID
  async getAgent(id: string): Promise<Agent> {
    if (USE_MOCK_API) {
      try {
        // Try to get from local database first
        const agent = await localDB.getItem<Agent>("agents", id);
        if (agent) {
          return mockResponse(agent);
        }
        
        // Fallback to mock data
        const mockAgent = mockAgents.find((a) => a.id === id);
        if (!mockAgent) throw new Error(`Agent not found: ${id}`);
        return mockResponse(mockAgent);
      } catch (error) {
        // If not found in local DB or it fails, check mock data
        const mockAgent = mockAgents.find((a) => a.id === id);
        if (!mockAgent) throw new Error(`Agent not found: ${id}`);
        return mockResponse(mockAgent);
      }
    }

    try {
      const response = await fetch(`/api/v1/agents/${id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new agent
  async createAgent(agentData: Omit<Agent, "id" | "status">): Promise<Agent> {
    if (USE_MOCK_API) {
      try {
        const { v4: uuidv4 } = await import("uuid");
        const newAgent: Agent = {
          id: uuidv4(),
          status: "idle",
          ...agentData,
        };
        
        // Save to local database
        await localDB.addItem("agents", newAgent);
        return mockResponse(newAgent);
      } catch (error) {
        console.error("Error saving agent to local database:", error);
        
        // Fallback to just returning the data without persisting
        const { v4: uuidv4 } = await import("uuid");
        const newAgent: Agent = {
          id: uuidv4(),
          status: "idle",
          ...agentData,
        };
        return mockResponse(newAgent);
      }
    }

    try {
      const response = await fetch("/api/v1/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update existing agent
  async updateAgent(id: string, agentData: Partial<Agent>): Promise<Agent> {
    if (USE_MOCK_API) {
      try {
        // Get current agent from local DB
        const existingAgent = await localDB.getItem<Agent>("agents", id);
        let updatedAgent: Agent;
        
        if (existingAgent) {
          updatedAgent = { ...existingAgent, ...agentData };
          await localDB.updateItem("agents", updatedAgent);
        } else {
          // Fallback to mock data
          const mockAgent = mockAgents.find((a) => a.id === id);
          if (!mockAgent) throw new Error(`Agent not found: ${id}`);
          updatedAgent = { ...mockAgent, ...agentData };
        }
        
        return mockResponse(updatedAgent);
      } catch (error) {
        console.error("Error updating agent in local database:", error);
        
        // Fallback to mock data
        const mockAgent = mockAgents.find((a) => a.id === id);
        if (!mockAgent) throw new Error(`Agent not found: ${id}`);
        const updatedAgent = { ...mockAgent, ...agentData };
        return mockResponse(updatedAgent);
      }
    }

    try {
      const response = await fetch(`/api/v1/agents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete agent
  async deleteAgent(id: string): Promise<void> {
    if (USE_MOCK_API) {
      try {
        await localDB.deleteItem("agents", id);
        return mockResponse(undefined);
      } catch (error) {
        console.error("Error deleting agent from local database:", error);
        return mockResponse(undefined);
      }
    }

    try {
      const response = await fetch(`/api/v1/agents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default AgentService;
