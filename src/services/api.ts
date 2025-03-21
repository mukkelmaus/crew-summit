
import { Agent, Crew, Task, Flow } from "@/lib/types";

// Base API configuration
const API_BASE_URL = "/api/v1";

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

// Agent API service
export const AgentService = {
  // Get all agents
  async getAgents(): Promise<Agent[]> {
    if (USE_MOCK_API) {
      // Use mock data from lib/data for now
      const { agents } = await import("@/lib/data");
      return mockResponse(agents);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get agent by ID
  async getAgent(id: string): Promise<Agent> {
    if (USE_MOCK_API) {
      const { agents } = await import("@/lib/data");
      const agent = agents.find((a) => a.id === id);
      if (!agent) throw new Error(`Agent not found: ${id}`);
      return mockResponse(agent);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new agent
  async createAgent(agentData: Omit<Agent, "id" | "status">): Promise<Agent> {
    if (USE_MOCK_API) {
      const { v4: uuidv4 } = await import("uuid");
      const newAgent: Agent = {
        id: uuidv4(),
        status: "idle",
        ...agentData,
      };
      return mockResponse(newAgent);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents`, {
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
      const { agents } = await import("@/lib/data");
      const agent = agents.find((a) => a.id === id);
      if (!agent) throw new Error(`Agent not found: ${id}`);
      const updatedAgent = { ...agent, ...agentData };
      return mockResponse(updatedAgent);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
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
      return mockResponse(undefined);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Crew API service
export const CrewService = {
  // Get all crews
  async getCrews(): Promise<Crew[]> {
    if (USE_MOCK_API) {
      const { crews } = await import("@/lib/data");
      return mockResponse(crews);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crews`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get crew by ID
  async getCrew(id: string): Promise<Crew> {
    if (USE_MOCK_API) {
      const { crews } = await import("@/lib/data");
      const crew = crews.find((c) => c.id === id);
      if (!crew) throw new Error(`Crew not found: ${id}`);
      return mockResponse(crew);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crews/${id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new crew
  async createCrew(crewData: Omit<Crew, "id" | "status" | "createdAt">): Promise<Crew> {
    if (USE_MOCK_API) {
      const { v4: uuidv4 } = await import("uuid");
      const newCrew: Crew = {
        id: uuidv4(),
        status: "idle",
        createdAt: new Date().toISOString(),
        ...crewData,
      };
      return mockResponse(newCrew);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crews`, {
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
      const { crews } = await import("@/lib/data");
      const crew = crews.find((c) => c.id === id);
      if (!crew) throw new Error(`Crew not found: ${id}`);
      const updatedCrew = { ...crew, ...crewData };
      return mockResponse(updatedCrew);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crews/${id}`, {
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
      return mockResponse(undefined);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crews/${id}`, {
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
      const { v4: uuidv4 } = await import("uuid");
      return mockResponse({ runId: uuidv4() });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crews/${id}/run`, {
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

// Task API service
export const TaskService = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    if (USE_MOCK_API) {
      const { tasks } = await import("@/lib/data");
      return mockResponse(tasks);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get task by ID
  async getTask(id: string): Promise<Task> {
    if (USE_MOCK_API) {
      const { tasks } = await import("@/lib/data");
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error(`Task not found: ${id}`);
      return mockResponse(task);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new task
  async createTask(taskData: Omit<Task, "id" | "status" | "createdAt">): Promise<Task> {
    if (USE_MOCK_API) {
      const { v4: uuidv4 } = await import("uuid");
      const newTask: Task = {
        id: uuidv4(),
        status: "pending",
        createdAt: new Date().toISOString(),
        ...taskData,
      };
      return mockResponse(newTask);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update existing task
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    if (USE_MOCK_API) {
      const { tasks } = await import("@/lib/data");
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error(`Task not found: ${id}`);
      const updatedTask = { ...task, ...taskData };
      return mockResponse(updatedTask);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete task
  async deleteTask(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockResponse(undefined);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Flow API service
export const FlowService = {
  // Get all flows
  async getFlows(): Promise<Flow[]> {
    if (USE_MOCK_API) {
      const { flows } = await import("@/lib/data");
      return mockResponse(flows || []);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/flows`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Additional flow methods would go here
};

// Database configuration service
export const DatabaseService = {
  // Get current database configuration
  async getConfig(): Promise<{ type: 'sqlite' | 'postgresql', connection: string }> {
    if (USE_MOCK_API) {
      return mockResponse({ 
        type: 'sqlite', 
        connection: 'sqlite:///./crewsummit.db' 
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/config/database`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update database configuration
  async updateConfig(config: { type: 'sqlite' | 'postgresql', connection: string }): Promise<{ success: boolean }> {
    if (USE_MOCK_API) {
      return mockResponse({ success: true });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/config/database`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// CrewAI integration service
export const CrewAIService = {
  // Get CrewAI status
  async getStatus(): Promise<{ connected: boolean, version: string }> {
    if (USE_MOCK_API) {
      return mockResponse({ connected: true, version: "0.22.0" });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/crewai/status`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
};
