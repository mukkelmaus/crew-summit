
import { Agent, AgentRole, Crew, Task } from './types';

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Research Specialist',
    role: 'researcher',
    description: 'Collects and analyzes information from various sources',
    status: 'idle',
    llm: 'gpt-4',
    tools: ['web-search', 'document-analysis']
  },
  {
    id: 'agent-2',
    name: 'Content Writer',
    role: 'writer',
    description: 'Creates engaging and informative content',
    status: 'idle',
    llm: 'gpt-4',
    tools: ['text-generation']
  },
  {
    id: 'agent-3',
    name: 'Data Analyst',
    role: 'analyst',
    description: 'Processes and interprets complex data sets',
    status: 'idle',
    llm: 'gpt-4',
    tools: ['data-processing', 'visualization']
  },
  {
    id: 'agent-4',
    name: 'Code Developer',
    role: 'developer',
    description: 'Writes and optimizes code in multiple languages',
    status: 'idle',
    llm: 'gpt-4',
    tools: ['code-generation', 'debugging']
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    description: 'Research market trends in AI adoption',
    assignedTo: 'agent-1',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-2',
    description: 'Write a blog post about recent AI advancements',
    assignedTo: 'agent-2',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-3',
    description: 'Analyze user engagement metrics from last month',
    assignedTo: 'agent-3',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockCrews: Crew[] = [
  {
    id: 'crew-1',
    name: 'Content Creation Team',
    description: 'Researches topics and creates engaging content',
    agents: [mockAgents[0], mockAgents[1]],
    tasks: [mockTasks[0], mockTasks[1]],
    status: 'idle',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastRun: new Date(Date.now() - 2 * 86400000).toISOString(),
    config: {
      verbose: true,
      maxIterations: 5,
      taskExecutionStrategy: 'sequential'
    }
  },
  {
    id: 'crew-2',
    name: 'Data Analysis Crew',
    description: 'Analyzes data and generates insights',
    agents: [mockAgents[2]],
    tasks: [mockTasks[2]],
    status: 'completed',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastRun: new Date(Date.now() - 1 * 86400000).toISOString(),
    config: {
      verbose: false,
      maxIterations: 3,
      taskExecutionStrategy: 'sequential'
    }
  }
];

// Available agent roles with their descriptions
export const agentRoles: Record<AgentRole, string> = {
  researcher: 'Gathers and analyzes information from various sources',
  writer: 'Creates written content like articles, reports, and documentation',
  analyst: 'Processes data and extracts meaningful insights',
  designer: 'Creates visual designs and user interfaces',
  developer: 'Writes and optimizes code across different languages',
  reviewer: 'Evaluates and provides feedback on work',
  custom: 'Custom role with specific capabilities'
};

// Available LLM options
export const llmOptions = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'llama-3', label: 'Llama 3' },
  { value: 'custom', label: 'Custom Model' }
];

// Available tools
export const toolOptions = [
  { value: 'web-search', label: 'Web Search' },
  { value: 'document-analysis', label: 'Document Analysis' },
  { value: 'text-generation', label: 'Text Generation' },
  { value: 'data-processing', label: 'Data Processing' },
  { value: 'visualization', label: 'Data Visualization' },
  { value: 'code-generation', label: 'Code Generation' },
  { value: 'debugging', label: 'Debugging' },
  { value: 'custom-tool', label: 'Custom Tool' }
];
