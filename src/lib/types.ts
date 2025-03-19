
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
  parentAgentId?: string; // For hierarchical agent structure
  subordinateAgentIds?: string[]; // For hierarchical agent structure
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'awaiting_approval';

export interface Task {
  id: string;
  description: string;
  assignedTo: string; // Agent ID
  status: TaskStatus;
  output?: string;
  createdAt: string;
  completedAt?: string;
  requiresApproval?: boolean;
  approver?: string; // User ID or role that can approve
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  parentTaskId?: string; // For hierarchical task structure
  subtaskIds?: string[]; // For hierarchical task structure
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
  parentCrewId?: string; // For hierarchical crew structure
  subCrewIds?: string[]; // For hierarchical crew structure
}

// Enhanced Flow types for workflow automation
export type FlowNodeType = 'task' | 'condition' | 'loop' | 'parallel' | 'sequence' | 'event' | 'human_approval' | 'data_operation';

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
    requiresApproval?: boolean; // For human-in-the-loop
    approver?: string; // User or role that can approve
    dataSource?: string; // For data operations
    dataOperation?: 'read' | 'write' | 'update' | 'delete'; // CRUD operations
  };
  position: {
    x: number;
    y: number;
  };
  parentNodeId?: string; // For hierarchical node structure
}

export type EdgeType = 'default' | 'conditional' | 'success' | 'failure' | 'approval' | 'rejection';

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // For conditional edges (true/false)
  label?: string;
  animated?: boolean;
  type?: EdgeType;
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
  humanInterventionPoints?: {
    nodeId: string;
    type: 'approval' | 'input';
    status: 'pending' | 'completed';
  }[];
  dataStorage?: {
    type: 'local' | 'external';
    connection?: string;
  };
}

// Local data persistence configuration
export interface LocalDataConfig {
  storageType: 'indexedDB' | 'localStorage' | 'sqlite';
  databaseName: string;
  collections: string[];
  autoBackup: boolean;
  backupInterval?: number; // in milliseconds
}

// AI Provider Integration
export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'custom';
  apiEndpoint: string;
  apiKey?: string; // Stored securely or input by user at runtime
  models: string[];
  defaultModel: string;
}

// Human-in-the-loop configuration
export interface HumanInterventionConfig {
  enabled: boolean;
  defaultApprover?: string;
  notificationMethod?: 'email' | 'ui' | 'webhook';
  timeoutInMinutes?: number;
  defaultAction?: 'approve' | 'reject' | 'none';
}
