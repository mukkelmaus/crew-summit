
import { Agent, Crew, Task, Flow } from "@/lib/types";

// Mock agents for development and demo
export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Data Analyst",
    role: "analyst",
    description: "Processes market data and identifies patterns",
    status: "idle",
    llm: "GPT-4",
    tools: ["web-search", "data-analysis"]
  },
  {
    id: "agent-2",
    name: "Research Assistant",
    role: "researcher",
    description: "Gathers information from various sources",
    status: "idle",
    llm: "Claude-2",
    tools: ["web-search", "document-reader"]
  },
  {
    id: "agent-3",
    name: "Content Writer",
    role: "writer",
    description: "Creates engaging marketing copy",
    status: "working",
    llm: "GPT-4",
    tools: ["text-generation"]
  },
  {
    id: "agent-4",
    name: "Content Reviewer",
    role: "reviewer",
    description: "Reviews and refines content",
    status: "idle",
    llm: "Claude-2",
    tools: ["grammar-check", "tone-analysis"]
  },
  {
    id: "agent-5",
    name: "UI Designer",
    role: "designer",
    description: "Creates user interface mockups",
    status: "completed",
    llm: "GPT-4",
    tools: ["image-generation", "wireframe-tools"]
  },
  {
    id: "agent-6",
    name: "Code Generator",
    role: "developer",
    description: "Implements designs in code",
    status: "completed",
    llm: "Claude-2",
    tools: ["code-generation", "code-review"]
  }
];

// Mock tasks for development and demo
export const mockTasks: Task[] = [
  {
    id: "task-1",
    description: "Research the latest trends in AI technology",
    assignedTo: "agent-2",
    status: "completed",
    output: "Completed research on AI trends. Found that generative AI, multimodal models, and AI agents are the top trends for this year.",
    createdAt: "2023-06-10T10:30:00Z",
    completedAt: "2023-06-11T14:45:00Z"
  },
  {
    id: "task-2",
    description: "Analyze quarterly sales data and identify patterns",
    assignedTo: "agent-1",
    status: "in_progress",
    createdAt: "2023-07-05T09:15:00Z"
  },
  {
    id: "task-3",
    description: "Write a blog post about the benefits of AI agents",
    assignedTo: "agent-3",
    status: "in_progress",
    createdAt: "2023-07-10T11:20:00Z"
  },
  {
    id: "task-4",
    description: "Review and edit the AI agents blog post",
    assignedTo: "agent-4",
    status: "pending",
    createdAt: "2023-07-10T11:25:00Z",
    requiresApproval: true,
    approver: "user-1"
  },
  {
    id: "task-5",
    description: "Design a landing page for the new product",
    assignedTo: "agent-5",
    status: "completed",
    output: "Completed landing page design with 3 mockups and responsive layouts.",
    createdAt: "2023-06-20T14:10:00Z",
    completedAt: "2023-06-22T16:30:00Z"
  },
  {
    id: "task-6",
    description: "Implement the landing page design in React",
    assignedTo: "agent-6",
    status: "completed",
    output: "Completed implementation of the landing page with React and Tailwind CSS.",
    createdAt: "2023-06-23T09:45:00Z",
    completedAt: "2023-06-25T17:20:00Z"
  }
];

// Mock crews for development and demo
export const mockCrews: Crew[] = [
  {
    id: "crew-1",
    name: "Research Team Alpha",
    description: "Specialized in market research and trend analysis",
    agents: [
      mockAgents[0], // Data Analyst
      mockAgents[1]  // Research Assistant
    ],
    tasks: [mockTasks[0], mockTasks[1]],
    status: "idle",
    createdAt: "2023-05-10T14:30:00Z",
    config: {
      verbose: true,
      maxIterations: 5,
      taskExecutionStrategy: "sequential"
    }
  },
  {
    id: "crew-2",
    name: "Content Production",
    description: "Creates and reviews content for marketing campaigns",
    agents: [
      mockAgents[2], // Content Writer
      mockAgents[3]  // Content Reviewer
    ],
    tasks: [mockTasks[2], mockTasks[3]],
    status: "running",
    createdAt: "2023-06-15T09:45:00Z",
    lastRun: "2023-07-20T11:30:00Z",
    config: {
      verbose: true,
      maxIterations: 3,
      taskExecutionStrategy: "sequential"
    }
  },
  {
    id: "crew-3",
    name: "Development Squad",
    description: "Designs and implements software solutions",
    agents: [
      mockAgents[4], // UI Designer
      mockAgents[5]  // Code Generator
    ],
    tasks: [mockTasks[4], mockTasks[5]],
    status: "completed",
    createdAt: "2023-07-05T16:20:00Z",
    lastRun: "2023-07-25T14:10:00Z",
    config: {
      verbose: false,
      maxIterations: 10,
      taskExecutionStrategy: "parallel"
    }
  }
];

// Mock flows for development and demo
export const mockFlows: Flow[] = [
  {
    id: "flow-1",
    name: "Content Marketing Pipeline",
    description: "End-to-end workflow for creating and publishing marketing content",
    crewId: "crew-2",
    nodes: [
      {
        id: "node-1",
        type: "task",
        label: "Research Topics",
        data: {
          description: "Research trending topics in our industry",
          taskIds: ["task-1"],
          agentId: "agent-2",
        },
        position: { x: 100, y: 100 },
      },
      {
        id: "node-2",
        type: "task",
        label: "Create Content",
        data: {
          description: "Write blog posts based on research",
          taskIds: ["task-3"],
          agentId: "agent-3",
        },
        position: { x: 300, y: 100 },
      },
      {
        id: "node-3",
        type: "human_approval",
        label: "Review Content",
        data: {
          description: "Human review of the generated content",
          requiresApproval: true,
          approver: "user-1",
        },
        position: { x: 500, y: 100 },
      }
    ],
    edges: [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        type: "success",
      },
      {
        id: "edge-2",
        source: "node-2",
        target: "node-3",
        type: "success",
      }
    ],
    createdAt: "2023-07-01T10:00:00Z",
    status: "idle",
  },
  {
    id: "flow-2",
    name: "Product Development Cycle",
    description: "Workflow for designing and implementing new product features",
    crewId: "crew-3",
    nodes: [
      {
        id: "node-1",
        type: "task",
        label: "Design UI",
        data: {
          description: "Create mockups for new features",
          taskIds: ["task-5"],
          agentId: "agent-5",
        },
        position: { x: 100, y: 100 },
      },
      {
        id: "node-2",
        type: "condition",
        label: "Design Approval",
        data: {
          description: "Check if designs are approved",
          condition: "designApproved === true",
        },
        position: { x: 300, y: 100 },
      },
      {
        id: "node-3",
        type: "task",
        label: "Implement Design",
        data: {
          description: "Code the approved designs",
          taskIds: ["task-6"],
          agentId: "agent-6",
        },
        position: { x: 500, y: 100 },
      }
    ],
    edges: [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        type: "success",
      },
      {
        id: "edge-2",
        source: "node-2",
        target: "node-3",
        type: "success",
        sourceHandle: "true",
      },
      {
        id: "edge-3",
        source: "node-2",
        target: "node-1",
        type: "failure",
        sourceHandle: "false",
        label: "Revise",
      }
    ],
    createdAt: "2023-07-15T14:30:00Z",
    lastRun: "2023-07-25T10:15:00Z",
    status: "completed",
  }
];
