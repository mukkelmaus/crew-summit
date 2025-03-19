
export type AgentRole = 'researcher' | 'writer' | 'analyst' | 'designer' | 'developer' | 'reviewer' | 'custom';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  status: AgentStatus;
  llm: string;
  tools: string[];
  memory?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Task {
  id: string;
  description: string;
  assignedTo: string; // Agent ID
  status: TaskStatus;
  output?: string;
  createdAt: string;
  completedAt?: string;
}

export type CrewStatus = 'idle' | 'running' | 'completed' | 'error';

export interface Crew {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  tasks: Task[];
  status: CrewStatus;
  createdAt: string;
  lastRun?: string;
  config: {
    verbose: boolean;
    maxIterations: number;
    taskExecutionStrategy: 'sequential' | 'parallel';
  };
}

// Flow types for workflow automation
export type FlowNodeType = 'task' | 'condition' | 'loop' | 'parallel' | 'sequence' | 'event';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  data: {
    description?: string;
    condition?: string;
    iterations?: number;
    taskIds?: string[];
    agentId?: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  type?: 'default' | 'conditional' | 'success' | 'failure';
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  crewId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  updatedAt?: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}
