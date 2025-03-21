
import { AgentService } from "./AgentService";
import { CrewService } from "./CrewService";
import { TaskService } from "./TaskService";

// Database configuration service
export const DatabaseService = {
  // Get current database configuration
  async getConfig(): Promise<{ type: 'sqlite' | 'postgresql', connection: string }> {
    return {
      type: 'sqlite',
      connection: 'sqlite:///./crewsummit.db'
    };
  },

  // Update database configuration
  async updateConfig(config: { type: 'sqlite' | 'postgresql', connection: string }): Promise<{ success: boolean }> {
    console.log("Database configuration updated:", config);
    return { success: true };
  },
};

// CrewAI integration service
export const CrewAIService = {
  // Get CrewAI status
  async getStatus(): Promise<{ connected: boolean, version: string }> {
    return { connected: true, version: "0.22.0" };
  },
};

export {
  AgentService,
  CrewService,
  TaskService
};
