
# API Endpoints

This document details the RESTful endpoints provided by the CrewSUMMIT API.

## Base URL

All endpoints are prefixed with `/api/v1`.

## Authentication

API requests require authentication:

```typescript
// Example of an authenticated request
const response = await fetch('https://api.example.com/api/v1/agents', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Agents Endpoints

### Get All Agents

```
GET /api/v1/agents
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by agent role
- `status` (optional): Filter by agent status

**Response:**
```json
{
  "data": [
    {
      "id": "agent-1",
      "name": "Research Assistant",
      "role": "researcher",
      "description": "Performs web research and information gathering",
      "status": "idle",
      "llm": "gpt-4",
      "tools": ["web-search", "document-analysis"],
      "memory": "short-term",
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z"
    },
    {
      "id": "agent-2",
      "name": "Content Writer",
      "role": "writer",
      "description": "Creates written content based on research",
      "status": "idle",
      "llm": "claude-2",
      "tools": ["text-generation", "grammar-check"],
      "memory": null,
      "created_at": "2023-06-01T12:30:00Z",
      "updated_at": "2023-06-01T12:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "pages": 1
  }
}
```

### Get Agent by ID

```
GET /api/v1/agents/{agent_id}
```

**Response:**
```json
{
  "data": {
    "id": "agent-1",
    "name": "Research Assistant",
    "role": "researcher",
    "description": "Performs web research and information gathering",
    "status": "idle",
    "llm": "gpt-4",
    "tools": ["web-search", "document-analysis"],
    "memory": "short-term",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

### Create Agent

```
POST /api/v1/agents
```

**Request Body:**
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

**Response:**
```json
{
  "data": {
    "id": "agent-3",
    "name": "Data Analyst",
    "role": "analyst",
    "description": "Analyzes data sets and generates insights",
    "status": "idle",
    "llm": "gpt-4",
    "tools": ["data-analysis", "chart-generation"],
    "memory": "short-term",
    "created_at": "2023-06-02T09:00:00Z",
    "updated_at": "2023-06-02T09:00:00Z"
  }
}
```

### Update Agent

```
PUT /api/v1/agents/{agent_id}
```

**Request Body:**
```json
{
  "name": "Data Analyst Pro",
  "description": "Advanced data analysis and visualization",
  "tools": ["data-analysis", "chart-generation", "statistical-modeling"]
}
```

**Response:**
```json
{
  "data": {
    "id": "agent-3",
    "name": "Data Analyst Pro",
    "role": "analyst",
    "description": "Advanced data analysis and visualization",
    "status": "idle",
    "llm": "gpt-4",
    "tools": ["data-analysis", "chart-generation", "statistical-modeling"],
    "memory": "short-term",
    "created_at": "2023-06-02T09:00:00Z",
    "updated_at": "2023-06-02T10:15:00Z"
  }
}
```

### Delete Agent

```
DELETE /api/v1/agents/{agent_id}
```

**Response:** 204 No Content

## Crews Endpoints

### Get All Crews

```
GET /api/v1/crews
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by crew status

**Response:**
```json
{
  "data": [
    {
      "id": "crew-1",
      "name": "Content Creation Team",
      "description": "Researches and creates content",
      "agent_ids": ["agent-1", "agent-2"],
      "task_ids": ["task-1"],
      "status": "idle",
      "created_at": "2023-06-01T14:00:00Z",
      "last_run": null,
      "config": {
        "verbose": true,
        "max_iterations": 3,
        "task_execution_strategy": "sequential"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Get Crew by ID

```
GET /api/v1/crews/{crew_id}
```

**Response:**
```json
{
  "data": {
    "id": "crew-1",
    "name": "Content Creation Team",
    "description": "Researches and creates content",
    "agent_ids": ["agent-1", "agent-2"],
    "task_ids": ["task-1"],
    "status": "idle",
    "created_at": "2023-06-01T14:00:00Z",
    "last_run": null,
    "config": {
      "verbose": true,
      "max_iterations": 3,
      "task_execution_strategy": "sequential"
    }
  }
}
```

### Get Crew with Expanded Details

```
GET /api/v1/crews/{crew_id}?expand=agents,tasks
```

**Response:**
```json
{
  "data": {
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
        "assigned_to": "agent-2",
        "status": "pending",
        "output": null,
        "created_at": "2023-06-01T14:30:00Z",
        "completed_at": null
      }
    ],
    "status": "idle",
    "created_at": "2023-06-01T14:00:00Z",
    "last_run": null,
    "config": {
      "verbose": true,
      "max_iterations": 3,
      "task_execution_strategy": "sequential"
    }
  }
}
```

### Create Crew

```
POST /api/v1/crews
```

**Request Body:**
```json
{
  "name": "Data Analysis Team",
  "description": "Analyzes and visualizes complex data",
  "agent_ids": ["agent-1", "agent-3"],
  "config": {
    "verbose": true,
    "max_iterations": 5,
    "task_execution_strategy": "parallel"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "crew-2",
    "name": "Data Analysis Team",
    "description": "Analyzes and visualizes complex data",
    "agent_ids": ["agent-1", "agent-3"],
    "task_ids": [],
    "status": "idle",
    "created_at": "2023-06-02T11:00:00Z",
    "last_run": null,
    "config": {
      "verbose": true,
      "max_iterations": 5,
      "task_execution_strategy": "parallel"
    }
  }
}
```

### Update Crew

```
PUT /api/v1/crews/{crew_id}
```

**Request Body:**
```json
{
  "name": "Advanced Data Analysis Team",
  "description": "Expert analysis of complex datasets",
  "agent_ids": ["agent-1", "agent-3", "agent-4"],
  "config": {
    "max_iterations": 10
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "crew-2",
    "name": "Advanced Data Analysis Team",
    "description": "Expert analysis of complex datasets",
    "agent_ids": ["agent-1", "agent-3", "agent-4"],
    "task_ids": [],
    "status": "idle",
    "created_at": "2023-06-02T11:00:00Z",
    "last_run": null,
    "config": {
      "verbose": true,
      "max_iterations": 10,
      "task_execution_strategy": "parallel"
    }
  }
}
```

### Delete Crew

```
DELETE /api/v1/crews/{crew_id}
```

**Response:** 204 No Content

### Run Crew

```
POST /api/v1/crews/{crew_id}/run
```

**Request Body (optional):**
```json
{
  "async": true
}
```

**Response:**
```json
{
  "data": {
    "id": "crew-2",
    "name": "Advanced Data Analysis Team",
    "description": "Expert analysis of complex datasets",
    "agent_ids": ["agent-1", "agent-3", "agent-4"],
    "task_ids": [],
    "status": "running",
    "created_at": "2023-06-02T11:00:00Z",
    "last_run": "2023-06-03T15:00:00Z",
    "config": {
      "verbose": true,
      "max_iterations": 10,
      "task_execution_strategy": "parallel"
    },
    "run_id": "run-1"
  }
}
```

## Tasks Endpoints

### Get All Tasks

```
GET /api/v1/tasks
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by task status
- `assigned_to` (optional): Filter by assigned agent ID

**Response:**
```json
{
  "data": [
    {
      "id": "task-1",
      "description": "Write an article about climate change",
      "assigned_to": "agent-2",
      "status": "pending",
      "output": null,
      "created_at": "2023-06-01T14:30:00Z",
      "completed_at": null
    },
    {
      "id": "task-2",
      "description": "Analyze Q2 sales data",
      "assigned_to": "agent-3",
      "status": "completed",
      "output": "Sales increased by 24% compared to Q1...",
      "created_at": "2023-06-02T10:00:00Z",
      "completed_at": "2023-06-02T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "pages": 1
  }
}
```

### Get Task by ID

```
GET /api/v1/tasks/{task_id}
```

**Response:**
```json
{
  "data": {
    "id": "task-1",
    "description": "Write an article about climate change",
    "assigned_to": "agent-2",
    "status": "pending",
    "output": null,
    "created_at": "2023-06-01T14:30:00Z",
    "completed_at": null
  }
}
```

### Create Task

```
POST /api/v1/tasks
```

**Request Body:**
```json
{
  "description": "Generate a summary of recent AI research papers",
  "assigned_to": "agent-1"
}
```

**Response:**
```json
{
  "data": {
    "id": "task-3",
    "description": "Generate a summary of recent AI research papers",
    "assigned_to": "agent-1",
    "status": "pending",
    "output": null,
    "created_at": "2023-06-03T16:00:00Z",
    "completed_at": null
  }
}
```

### Update Task

```
PUT /api/v1/tasks/{task_id}
```

**Request Body:**
```json
{
  "description": "Generate a comprehensive summary of recent AI research papers",
  "status": "in_progress"
}
```

**Response:**
```json
{
  "data": {
    "id": "task-3",
    "description": "Generate a comprehensive summary of recent AI research papers",
    "assigned_to": "agent-1",
    "status": "in_progress",
    "output": null,
    "created_at": "2023-06-03T16:00:00Z",
    "completed_at": null
  }
}
```

### Delete Task

```
DELETE /api/v1/tasks/{task_id}
```

**Response:** 204 No Content

## Flows Endpoints

### Get All Flows

```
GET /api/v1/flows
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by flow status
- `crew_id` (optional): Filter by crew ID

**Response:**
```json
{
  "data": [
    {
      "id": "flow-1",
      "name": "Content Creation Flow",
      "description": "Research and content creation workflow",
      "crew_id": "crew-1",
      "nodes": [...],
      "edges": [...],
      "created_at": "2023-06-04T09:00:00Z",
      "updated_at": null,
      "last_run": null,
      "status": "idle"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Get Flow by ID

```
GET /api/v1/flows/{flow_id}
```

**Response:**
```json
{
  "data": {
    "id": "flow-1",
    "name": "Content Creation Flow",
    "description": "Research and content creation workflow",
    "crew_id": "crew-1",
    "nodes": [...],
    "edges": [...],
    "created_at": "2023-06-04T09:00:00Z",
    "updated_at": null,
    "last_run": null,
    "status": "idle"
  }
}
```

### Create Flow

```
POST /api/v1/flows
```

**Request Body:**
```json
{
  "name": "Data Analysis Flow",
  "description": "Analyze and visualize data",
  "crew_id": "crew-2",
  "nodes": [...],
  "edges": [...]
}
```

**Response:**
```json
{
  "data": {
    "id": "flow-2",
    "name": "Data Analysis Flow",
    "description": "Analyze and visualize data",
    "crew_id": "crew-2",
    "nodes": [...],
    "edges": [...],
    "created_at": "2023-06-05T14:00:00Z",
    "updated_at": null,
    "last_run": null,
    "status": "idle"
  }
}
```

### Update Flow

```
PUT /api/v1/flows/{flow_id}
```

**Request Body:**
```json
{
  "name": "Advanced Data Analysis Flow",
  "description": "Comprehensive data analysis and visualization",
  "nodes": [...],
  "edges": [...]
}
```

**Response:**
```json
{
  "data": {
    "id": "flow-2",
    "name": "Advanced Data Analysis Flow",
    "description": "Comprehensive data analysis and visualization",
    "crew_id": "crew-2",
    "nodes": [...],
    "edges": [...],
    "created_at": "2023-06-05T14:00:00Z",
    "updated_at": "2023-06-06T11:00:00Z",
    "last_run": null,
    "status": "idle"
  }
}
```

### Delete Flow

```
DELETE /api/v1/flows/{flow_id}
```

**Response:** 204 No Content

### Run Flow

```
POST /api/v1/flows/{flow_id}/run
```

**Request Body (optional):**
```json
{
  "async": true
}
```

**Response:**
```json
{
  "data": {
    "id": "flow-2",
    "name": "Advanced Data Analysis Flow",
    "description": "Comprehensive data analysis and visualization",
    "crew_id": "crew-2",
    "nodes": [...],
    "edges": [...],
    "created_at": "2023-06-05T14:00:00Z",
    "updated_at": "2023-06-06T11:00:00Z",
    "last_run": "2023-06-06T15:00:00Z",
    "status": "running",
    "run_id": "run-2"
  }
}
```

## Runs Endpoints

### Get All Runs

```
GET /api/v1/runs
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by run status
- `crew_id` (optional): Filter by crew ID
- `flow_id` (optional): Filter by flow ID

**Response:**
```json
{
  "data": [
    {
      "id": "run-1",
      "crew_id": "crew-2",
      "flow_id": null,
      "status": "completed",
      "started_at": "2023-06-03T15:00:00Z",
      "completed_at": "2023-06-03T15:10:00Z",
      "duration_seconds": 600,
      "result": "Data analysis completed successfully",
      "logs": [...]
    },
    {
      "id": "run-2",
      "crew_id": null,
      "flow_id": "flow-2",
      "status": "running",
      "started_at": "2023-06-06T15:00:00Z",
      "completed_at": null,
      "duration_seconds": null,
      "result": null,
      "logs": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "pages": 1
  }
}
```

### Get Run by ID

```
GET /api/v1/runs/{run_id}
```

**Response:**
```json
{
  "data": {
    "id": "run-1",
    "crew_id": "crew-2",
    "flow_id": null,
    "status": "completed",
    "started_at": "2023-06-03T15:00:00Z",
    "completed_at": "2023-06-03T15:10:00Z",
    "duration_seconds": 600,
    "result": "Data analysis completed successfully",
    "logs": [...]
  }
}
```

### Cancel Run

```
POST /api/v1/runs/{run_id}/cancel
```

**Response:**
```json
{
  "data": {
    "id": "run-2",
    "crew_id": null,
    "flow_id": "flow-2",
    "status": "cancelled",
    "started_at": "2023-06-06T15:00:00Z",
    "completed_at": "2023-06-06T15:05:00Z",
    "duration_seconds": 300,
    "result": "Run cancelled by user",
    "logs": [...]
  }
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
