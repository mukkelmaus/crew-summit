import { Agent, AgentRole, Crew, Task, Flow } from './types';

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
  },
  {
    id: 'task-4',
    description: 'Review content for technical accuracy',
    assignedTo: 'agent-4',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-5',
    description: 'Review content for writing quality',
    assignedTo: 'agent-2',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-6',
    description: 'Generate final report',
    assignedTo: 'agent-7',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-7',
    description: 'Clean and prepare data for analysis',
    assignedTo: 'agent-5',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-8',
    description: 'Analyze key features',
    assignedTo: 'agent-6',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-9',
    description: 'Generate final report',
    assignedTo: 'agent-7',
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

export const mockFlows: Flow[] = [
  {
    id: "flow-1",
    name: "Research and Content Creation",
    description: "Automated workflow for researching a topic and creating content",
    crewId: "crew-1",
    nodes: [
      {
        id: "node-1",
        type: "event",
        label: "Start",
        data: {
          description: "Starting point of the workflow",
        },
        position: { x: 250, y: 5 },
      },
      {
        id: "node-2",
        type: "task",
        label: "Research Task",
        data: {
          description: "Research the given topic thoroughly",
          taskIds: ["task-1"],
          agentId: "agent-1",
        },
        position: { x: 250, y: 100 },
      },
      {
        id: "node-3",
        type: "condition",
        label: "Evaluation",
        data: {
          description: "Check if research is sufficient",
          condition: "research.quality > 0.8",
        },
        position: { x: 250, y: 200 },
      },
      {
        id: "node-4",
        type: "task",
        label: "Content Creation",
        data: {
          description: "Create content based on research",
          taskIds: ["task-2"],
          agentId: "agent-2",
        },
        position: { x: 400, y: 300 },
      },
      {
        id: "node-5",
        type: "task",
        label: "Additional Research",
        data: {
          description: "Conduct additional research",
          taskIds: ["task-3"],
          agentId: "agent-1",
        },
        position: { x: 100, y: 300 },
      },
    ],
    edges: [
      {
        id: "edge-1-2",
        source: "node-1",
        target: "node-2",
        type: "default",
      },
      {
        id: "edge-2-3",
        source: "node-2",
        target: "node-3",
        type: "default",
      },
      {
        id: "edge-3-4",
        source: "node-3",
        target: "node-4",
        type: "conditional",
        label: "If sufficient",
        animated: true,
      },
      {
        id: "edge-3-5",
        source: "node-3",
        target: "node-5",
        type: "conditional",
        label: "If insufficient",
      },
      {
        id: "edge-5-2",
        source: "node-5",
        target: "node-2",
        type: "default",
      },
    ],
    createdAt: "2023-06-12T10:00:00Z",
    updatedAt: "2023-06-15T14:30:00Z",
    status: "idle",
  },
  {
    id: "flow-2",
    name: "Content Review Process",
    description: "Workflow for reviewing and refining content",
    crewId: "crew-1",
    nodes: [
      {
        id: "node-1",
        type: "event",
        label: "Start",
        data: {
          description: "Content submission",
        },
        position: { x: 250, y: 5 },
      },
      {
        id: "node-2",
        type: "task",
        label: "Initial Review",
        data: {
          description: "First pass review of content",
          taskIds: ["task-4"],
          agentId: "agent-3",
        },
        position: { x: 250, y: 100 },
      },
      {
        id: "node-3",
        type: "parallel",
        label: "Parallel Reviews",
        data: {
          description: "Multiple specialists review simultaneously",
        },
        position: { x: 250, y: 200 },
      },
      {
        id: "node-4",
        type: "task",
        label: "Technical Review",
        data: {
          description: "Review technical accuracy",
          taskIds: ["task-5"],
          agentId: "agent-4",
        },
        position: { x: 100, y: 300 },
      },
      {
        id: "node-5",
        type: "task",
        label: "Editorial Review",
        data: {
          description: "Review writing quality",
          taskIds: ["task-6"],
          agentId: "agent-2",
        },
        position: { x: 400, y: 300 },
      },
      {
        id: "node-6",
        type: "condition",
        label: "Approval Decision",
        data: {
          description: "Determine if content is approved",
          condition: "reviews.all(score > 0.7)",
        },
        position: { x: 250, y: 400 },
      },
    ],
    edges: [
      {
        id: "edge-1-2",
        source: "node-1",
        target: "node-2",
        type: "default",
      },
      {
        id: "edge-2-3",
        source: "node-2",
        target: "node-3",
        type: "default",
      },
      {
        id: "edge-3-4",
        source: "node-3",
        target: "node-4",
        type: "default",
      },
      {
        id: "edge-3-5",
        source: "node-3",
        target: "node-5",
        type: "default",
      },
      {
        id: "edge-4-6",
        source: "node-4",
        target: "node-6",
        type: "default",
      },
      {
        id: "edge-5-6",
        source: "node-5",
        target: "node-6",
        type: "default",
      },
    ],
    createdAt: "2023-07-05T09:15:00Z",
    updatedAt: "2023-07-08T16:20:00Z",
    status: "completed",
    lastRun: "2023-07-10T11:30:00Z",
  },
  {
    id: "flow-3",
    name: "Data Analysis Pipeline",
    description: "Automated data analysis workflow with iterative refinement",
    crewId: "crew-2",
    nodes: [
      {
        id: "node-1",
        type: "event",
        label: "Start",
        data: {
          description: "Data collection",
        },
        position: { x: 250, y: 5 },
      },
      {
        id: "node-2",
        type: "task",
        label: "Data Preparation",
        data: {
          description: "Clean and prepare data for analysis",
          taskIds: ["task-7"],
          agentId: "agent-5",
        },
        position: { x: 250, y: 100 },
      },
      {
        id: "node-3",
        type: "loop",
        label: "Analysis Loop",
        data: {
          description: "Iterative analysis process",
          iterations: 3,
        },
        position: { x: 250, y: 200 },
      },
      {
        id: "node-4",
        type: "task",
        label: "Feature Analysis",
        data: {
          description: "Analyze key features",
          taskIds: ["task-8"],
          agentId: "agent-6",
        },
        position: { x: 250, y: 300 },
      },
      {
        id: "node-5",
        type: "task",
        label: "Report Generation",
        data: {
          description: "Generate final report",
          taskIds: ["task-9"],
          agentId: "agent-7",
        },
        position: { x: 250, y: 400 },
      },
    ],
    edges: [
      {
        id: "edge-1-2",
        source: "node-1",
        target: "node-2",
        type: "default",
      },
      {
        id: "edge-2-3",
        source: "node-2",
        target: "node-3",
        type: "default",
      },
      {
        id: "edge-3-4",
        source: "node-3",
        target: "node-4",
        type: "default",
      },
      {
        id: "edge-4-3",
        source: "node-4",
        target: "node-3",
        type: "default",
        animated: true,
      },
      {
        id: "edge-3-5",
        source: "node-3",
        target: "node-5",
        type: "default",
      },
    ],
    createdAt: "2023-08-20T13:45:00Z",
    updatedAt: "2023-08-22T10:10:00Z",
    status: "running",
    lastRun: "2023-08-25T09:30:00Z",
  },
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
