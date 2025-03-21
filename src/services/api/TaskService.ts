
import { Task } from "@/lib/types";
import { mockTasks } from "@/lib/data";
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

export const TaskService = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    if (USE_MOCK_API) {
      try {
        // First try to get from local database
        const tasks = await localDB.getCollection<Task>("tasks");
        if (tasks && tasks.length > 0) {
          return tasks;
        }
        
        // If no tasks in local DB, use mock data and store it
        for (const task of mockTasks) {
          await localDB.addItem("tasks", task);
        }
        
        return mockResponse(mockTasks);
      } catch (error) {
        // Fallback to mock data if local DB fails
        console.error("Error accessing local database:", error);
        return mockResponse(mockTasks);
      }
    }

    try {
      const response = await fetch("/api/v1/tasks");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get task by ID
  async getTask(id: string): Promise<Task> {
    if (USE_MOCK_API) {
      try {
        // Try to get from local database first
        const task = await localDB.getItem<Task>("tasks", id);
        if (task) {
          return mockResponse(task);
        }
        
        // Fallback to mock data
        const mockTask = mockTasks.find((t) => t.id === id);
        if (!mockTask) throw new Error(`Task not found: ${id}`);
        return mockResponse(mockTask);
      } catch (error) {
        // If not found in local DB or it fails, check mock data
        const mockTask = mockTasks.find((t) => t.id === id);
        if (!mockTask) throw new Error(`Task not found: ${id}`);
        return mockResponse(mockTask);
      }
    }

    try {
      const response = await fetch(`/api/v1/tasks/${id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new task
  async createTask(taskData: Omit<Task, "id" | "status" | "createdAt">): Promise<Task> {
    if (USE_MOCK_API) {
      try {
        const { v4: uuidv4 } = await import("uuid");
        const newTask: Task = {
          id: uuidv4(),
          status: "pending",
          createdAt: new Date().toISOString(),
          ...taskData,
        };
        
        // Save to local database
        await localDB.addItem("tasks", newTask);
        return mockResponse(newTask);
      } catch (error) {
        console.error("Error saving task to local database:", error);
        
        // Fallback to just returning the data without persisting
        const { v4: uuidv4 } = await import("uuid");
        const newTask: Task = {
          id: uuidv4(),
          status: "pending",
          createdAt: new Date().toISOString(),
          ...taskData,
        };
        return mockResponse(newTask);
      }
    }

    try {
      const response = await fetch("/api/v1/tasks", {
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
      try {
        // Get current task from local DB
        const existingTask = await localDB.getItem<Task>("tasks", id);
        let updatedTask: Task;
        
        if (existingTask) {
          updatedTask = { ...existingTask, ...taskData };
          await localDB.updateItem("tasks", updatedTask);
        } else {
          // Fallback to mock data
          const mockTask = mockTasks.find((t) => t.id === id);
          if (!mockTask) throw new Error(`Task not found: ${id}`);
          updatedTask = { ...mockTask, ...taskData };
        }
        
        return mockResponse(updatedTask);
      } catch (error) {
        console.error("Error updating task in local database:", error);
        
        // Fallback to mock data
        const mockTask = mockTasks.find((t) => t.id === id);
        if (!mockTask) throw new Error(`Task not found: ${id}`);
        const updatedTask = { ...mockTask, ...taskData };
        return mockResponse(updatedTask);
      }
    }

    try {
      const response = await fetch(`/api/v1/tasks/${id}`, {
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
      try {
        await localDB.deleteItem("tasks", id);
        return mockResponse(undefined);
      } catch (error) {
        console.error("Error deleting task from local database:", error);
        return mockResponse(undefined);
      }
    }

    try {
      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default TaskService;
