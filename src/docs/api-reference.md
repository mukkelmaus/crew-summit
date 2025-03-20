
# API Reference

This document provides detailed information about the CrewSUMMIT API, which serves as the interface between the frontend application and the backend services.

## API Overview

The CrewSUMMIT API follows RESTful principles and uses JSON for data exchange. All endpoints are prefixed with `/api/v1`.

## Authentication

For applications with a backend, API requests require authentication:

```typescript
// Example of an authenticated request
const fetchData = async () => {
  const response = await fetch('https://api.example.com/api/v1/agents', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

## Agents API

### Get All Agents

```
GET /api/v1/agents
```

Response:
```json
[
  {
    "id": "agent-1",
    "name": "Research Assistant",
    "role": "researcher",
    "description": "Performs web research and information gathering",
    "status": "idle",
    "llm": "gpt-4",
    "tools": ["web-search", "document-analysis"],
    "memory": "short-term"
  },
  {
    "id": "agent-2",
    "name": "Content Writer",
    "role": "writer",
    "description": "Creates written content based on research",
    "status": "idle",
    "llm": "claude-2",
    "tools": ["text-generation", "grammar-check"],
    "memory": null
  }
]
```

### Get Agent by ID

```
GET /api/v1/agents/{agent_id}
```

Response:
```json
{
  "id": "agent-1",
  "name": "Research Assistant",
  "role": "researcher",
  "description": "Performs web research and information gathering",
  "status": "idle",
  "llm": "gpt-4",
  "tools": ["web-search", "document-analysis"],
  "memory": "short-term"
}
```

### Create Agent

```
POST /api/v1/agents
```

Request Body:
```json
{
  "name": "Data Analyst",
  "role": "analyst",
  "description": "Analyzes data sets and generates insights",
  "llm": "gpt-4",
  "tools": ["data-analysis", "chart-generation"],
  "memory": "short-term"
}
```

Response:
```json
{
  "id": "agent-3",
  "name": "Data Analyst",
  "role": "analyst",
  "description": "Analyzes data sets and generates insights",
  "status": "idle",
  "llm": "gpt-4",
  "tools": ["data-analysis", "chart-generation"],
  "memory": "short-term"
}
```

### Update Agent

```
PUT /api/v1/agents/{agent_id}
```

Request Body:
```json
{
  "name": "Data Analyst Pro",
  "role": "analyst",
  "description": "Advanced data analysis and visualization",
  "llm": "gpt-4",
  "tools": ["data-analysis", "chart-generation", "statistical-modeling"],
  "memory": "long-term"
}
```

Response:
```json
{
  "id": "agent-3",
  "name": "Data Analyst Pro",
  "role": "analyst",
  "description": "Advanced data analysis and visualization",
  "status": "idle",
  "llm": "gpt-4",
  "tools": ["data-analysis", "chart-generation", "statistical-modeling"],
  "memory": "long-term"
}
```

### Delete Agent

```
DELETE /api/v1/agents/{agent_id}
```

Response: 204 No Content

## Crews API

### Get All Crews

```
GET /api/v1/crews
```

Response:
```json
[
  {
    "id": "crew-1",
    "name": "Content Creation Team",
    "description": "Researches and creates content",
    "agents": ["agent-1", "agent-2"],
    "tasks": ["task-1"],
    "status": "idle",
    "createdAt": "2023-06-01T12:00:00Z",
    "lastRun": null,
    "config": {
      "verbose": true,
      "maxIterations": 3,
      "taskExecutionStrategy": "sequential"
    }
  }
]
```

### Get Crew by ID

```
GET /api/v1/crews/{crew_id}
```

Response:
```json
{
  "id": "crew-1",
  "name": "Content Creation Team",
  "description": "Researches and creates content",
  "agents": [
    {
      "id": "agent-1",
      "name": "Research Assistant",
      "role": "researcher",
      "description": "Performs web research and information gathering",
      "status": "idle",
      "llm": "gpt-4",
      "tools": ["web-search", "document-analysis"],
      "memory": "short-term"
    },
    {
      "id": "agent-2",
      "name": "Content Writer",
      "role": "writer",
      "description": "Creates written content based on research",
      "status": "idle",
      "llm": "claude-2",
      "tools": ["text-generation", "grammar-check"],
      "memory": null
    }
  ],
  "tasks": [
    {
      "id": "task-1",
      "description": "Write an article about climate change",
      "assignedTo": "agent-2",
      "status": "pending",
      "createdAt": "2023-06-01T14:00:00Z"
    }
  ],
  "status": "idle",
  "createdAt": "2023-06-01T12:00:00Z",
  "lastRun": null,
  "config": {
    "verbose": true,
    "maxIterations": 3,
    "taskExecutionStrategy": "sequential"
  }
}
```

### Create Crew

```
POST /api/v1/crews
```

Request Body:
```json
{
  "name": "Data Analysis Team",
  "description": "Analyzes and visualizes complex data",
  "agentIds": ["agent-1", "agent-3"],
  "config": {
    "verbose": true,
    "maxIterations": 5,
    "taskExecutionStrategy": "parallel"
  }
}
```

Response:
```json
{
  "id": "crew-2",
  "name": "Data Analysis Team",
  "description": "Analyzes and visualizes complex data",
  "agents": [
    {
      "id": "agent-1",
      "name": "Research Assistant",
      "role": "researcher",
      "description": "Performs web research and information gathering",
      "status": "idle",
      "llm": "gpt-4",
      "tools": ["web-search", "document-analysis"],
      "memory": "short-term"
    },
    {
      "id": "agent-3",
      "name": "Data Analyst Pro",
      "role": "analyst",
      "description": "Advanced data analysis and visualization",
      "status": "idle",
      "llm": "gpt-4",
      "tools": ["data-analysis", "chart-generation", "statistical-modeling"],
      "memory": "long-term"
    }
  ],
  "tasks": [],
  "status": "idle",
  "createdAt": "2023-06-02T09:00:00Z",
  "lastRun": null,
  "config": {
    "verbose": true,
    "maxIterations": 5,
    "taskExecutionStrategy": "parallel"
  }
}
```

### Update Crew

```
PUT /api/v1/crews/{crew_id}
```

Request Body:
```json
{
  "name": "Advanced Data Analysis Team",
  "description": "Expert analysis of complex datasets",
  "agentIds": ["agent-1", "agent-3", "agent-4"],
  "config": {
    "verbose": true,
    "maxIterations": 10,
    "taskExecutionStrategy": "parallel"
  }
}
```

Response:
```json
{
  "id": "crew-2",
  "name": "Advanced Data Analysis Team",
  "description": "Expert analysis of complex datasets",
  "agents": [...],
  "tasks": [],
  "status": "idle",
  "createdAt": "2023-06-02T09:00:00Z",
  "lastRun": null,
  "config": {
    "verbose": true,
    "maxIterations": 10,
    "taskExecutionStrategy": "parallel"
  }
}
```

### Delete Crew

```
DELETE /api/v1/crews/{crew_id}
```

Response: 204 No Content

### Run Crew

```
POST /api/v1/crews/{crew_id}/run
```

Response:
```json
{
  "id": "crew-2",
  "name": "Advanced Data Analysis Team",
  "description": "Expert analysis of complex datasets",
  "agents": [...],
  "tasks": [...],
  "status": "running",
  "createdAt": "2023-06-02T09:00:00Z",
  "lastRun": "2023-06-03T14:30:00Z",
  "config": {
    "verbose": true,
    "maxIterations": 10,
    "taskExecutionStrategy": "parallel"
  }
}
```

## Tasks API

### Get All Tasks

```
GET /api/v1/tasks
```

Response:
```json
[
  {
    "id": "task-1",
    "description": "Write an article about climate change",
    "assignedTo": "agent-2",
    "status": "pending",
    "output": null,
    "createdAt": "2023-06-01T14:00:00Z",
    "completedAt": null
  },
  {
    "id": "task-2",
    "description": "Analyze Q2 sales data",
    "assignedTo": "agent-3",
    "status": "completed",
    "output": "Sales increased by 24% compared to Q1...",
    "createdAt": "2023-06-02T10:00:00Z",
    "completedAt": "2023-06-02T11:30:00Z"
  }
]
```

### Get Task by ID

```
GET /api/v1/tasks/{task_id}
```

Response:
```json
{
  "id": "task-1",
  "description": "Write an article about climate change",
  "assignedTo": "agent-2",
  "status": "pending",
  "output": null,
  "createdAt": "2023-06-01T14:00:00Z",
  "completedAt": null
}
```

### Create Task

```
POST /api/v1/tasks
```

Request Body:
```json
{
  "description": "Generate a summary of recent AI research papers",
  "assignedTo": "agent-1"
}
```

Response:
```json
{
  "id": "task-3",
  "description": "Generate a summary of recent AI research papers",
  "assignedTo": "agent-1",
  "status": "pending",
  "output": null,
  "createdAt": "2023-06-03T15:00:00Z",
  "completedAt": null
}
```

### Update Task

```
PUT /api/v1/tasks/{task_id}
```

Request Body:
```json
{
  "description": "Generate a comprehensive summary of recent AI research papers",
  "assignedTo": "agent-1",
  "status": "in_progress"
}
```

Response:
```json
{
  "id": "task-3",
  "description": "Generate a comprehensive summary of recent AI research papers",
  "assignedTo": "agent-1",
  "status": "in_progress",
  "output": null,
  "createdAt": "2023-06-03T15:00:00Z",
  "completedAt": null
}
```

### Delete Task

```
DELETE /api/v1/tasks/{task_id}
```

Response: 204 No Content

## Flows API

### Get All Flows

```
GET /api/v1/flows
```

Response:
```json
[
  {
    "id": "flow-1",
    "name": "Content Creation Flow",
    "description": "Research and content creation workflow",
    "crewId": "crew-1",
    "nodes": [...],
    "edges": [...],
    "createdAt": "2023-06-04T09:00:00Z",
    "status": "idle"
  }
]
```

### Get Flow by ID

```
GET /api/v1/flows/{flow_id}
```

Response:
```json
{
  "id": "flow-1",
  "name": "Content Creation Flow",
  "description": "Research and content creation workflow",
  "crewId": "crew-1",
  "nodes": [
    {
      "id": "node-1",
      "type": "task",
      "label": "Research Task",
      "data": {
        "description": "Research the topic",
        "taskIds": ["task-1"],
        "agentId": "agent-1"
      },
      "position": {
        "x": 100,
        "y": 200
      }
    },
    {
      "id": "node-2",
      "type": "task",
      "label": "Content Creation",
      "data": {
        "description": "Create content based on research",
        "taskIds": ["task-2"],
        "agentId": "agent-2"
      },
      "position": {
        "x": 400,
        "y": 200
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "success"
    }
  ],
  "createdAt": "2023-06-04T09:00:00Z",
  "status": "idle"
}
```

### Create Flow

```
POST /api/v1/flows
```

Request Body:
```json
{
  "name": "Data Analysis Flow",
  "description": "Analyze and visualize data",
  "crewId": "crew-2",
  "nodes": [...],
  "edges": [...]
}
```

Response:
```json
{
  "id": "flow-2",
  "name": "Data Analysis Flow",
  "description": "Analyze and visualize data",
  "crewId": "crew-2",
  "nodes": [...],
  "edges": [...],
  "createdAt": "2023-06-05T11:00:00Z",
  "status": "idle"
}
```

### Update Flow

```
PUT /api/v1/flows/{flow_id}
```

Request Body:
```json
{
  "name": "Advanced Data Analysis Flow",
  "description": "Comprehensive data analysis and visualization",
  "nodes": [...],
  "edges": [...]
}
```

Response:
```json
{
  "id": "flow-2",
  "name": "Advanced Data Analysis Flow",
  "description": "Comprehensive data analysis and visualization",
  "crewId": "crew-2",
  "nodes": [...],
  "edges": [...],
  "createdAt": "2023-06-05T11:00:00Z",
  "updatedAt": "2023-06-06T14:00:00Z",
  "status": "idle"
}
```

### Delete Flow

```
DELETE /api/v1/flows/{flow_id}
```

Response: 204 No Content

### Run Flow

```
POST /api/v1/flows/{flow_id}/run
```

Response:
```json
{
  "id": "flow-2",
  "name": "Advanced Data Analysis Flow",
  "description": "Comprehensive data analysis and visualization",
  "crewId": "crew-2",
  "nodes": [...],
  "edges": [...],
  "createdAt": "2023-06-05T11:00:00Z",
  "updatedAt": "2023-06-06T14:00:00Z",
  "lastRun": "2023-06-06T15:30:00Z",
  "status": "running"
}
```

## Error Responses

The API uses standard HTTP status codes:

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **204 No Content**: Request succeeded but no content returned
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource not found
- **409 Conflict**: Request conflicts with current state
- **500 Internal Server Error**: Server error

Error response format:
```json
{
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "name",
        "issue": "Name cannot be empty"
      }
    ]
  }
}
```

## Rate Limiting

API requests are subject to rate limiting:

- 100 requests per minute per user
- 1000 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623456789
```

## Pagination

For endpoints returning multiple items, pagination is supported:

```
GET /api/v1/agents?page=2&limit=20
```

Response headers:
```
X-Pagination-Page: 2
X-Pagination-Limit: 20
X-Pagination-Total: 156
X-Pagination-Pages: 8
```

## Filtering and Sorting

```
GET /api/v1/agents?role=researcher&sort=name&order=asc
```

## Webhook Events

For real-time notifications, configure webhooks:

```
POST /api/v1/webhooks
```

Request:
```json
{
  "url": "https://your-app.com/webhook-handler",
  "events": ["agent.created", "task.completed", "crew.started"],
  "secret": "your-webhook-secret"
}
```

Webhook payload example:
```json
{
  "event": "task.completed",
  "timestamp": "2023-06-07T12:34:56Z",
  "data": {
    "taskId": "task-3",
    "agentId": "agent-1",
    "crewId": "crew-2",
    "completedAt": "2023-06-07T12:34:45Z"
  }
}
```
