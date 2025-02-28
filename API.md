
# CrewAI Hub API Implementation Guide

This guide provides instructions for building a backend API service that connects the CrewAI Hub frontend with your CrewAI framework implementation.

## Overview

The backend API will serve as a bridge between the CrewAI Hub frontend and your CrewAI Python framework. It will:

1. Expose REST endpoints for managing agents, crews, and tasks
2. Handle the conversion between frontend data models and CrewAI objects
3. Manage state persistence for your CrewAI instances

## Technology Stack

- **FastAPI**: Modern, high-performance web framework for building APIs
- **Uvicorn**: ASGI server for running the FastAPI application
- **Pydantic**: Data validation and settings management
- **CrewAI**: Your existing CrewAI implementation

## Project Structure

```
crewai-hub-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── agent.py            # Agent data models
│   │   ├── crew.py             # Crew data models
│   │   └── task.py             # Task data models
│   ├── routers/                # API route definitions
│   │   ├── __init__.py
│   │   ├── agents.py           # Agent endpoints
│   │   ├── crews.py            # Crew endpoints
│   │   └── tasks.py            # Task endpoints
│   └── services/               # Business logic
│       ├── __init__.py
│       ├── agent_service.py    # Agent operations
│       ├── crew_service.py     # Crew operations
│       └── task_service.py     # Task operations
├── .env                        # Environment variables
├── .gitignore
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- CrewAI framework installed and functional

### Installation

1. Create a new directory for your API project:
   ```bash
   mkdir crewai-hub-api
   cd crewai-hub-api
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required packages:
   ```bash
   pip install fastapi uvicorn pydantic crewai python-dotenv
   ```

4. Create a `requirements.txt` file:
   ```bash
   pip freeze > requirements.txt
   ```

## Implementation

### Core Models

Create Pydantic models that match the frontend data structures. Below are the key models to implement:

#### Agent Model (app/models/agent.py)

```python
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class AgentRole(str, Enum):
    RESEARCHER = "researcher"
    WRITER = "writer"
    ANALYST = "analyst"
    DESIGNER = "designer"
    DEVELOPER = "developer"
    REVIEWER = "reviewer"
    CUSTOM = "custom"


class AgentStatus(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    COMPLETED = "completed"
    ERROR = "error"


class Agent(BaseModel):
    id: str
    name: str
    role: AgentRole
    description: str
    status: AgentStatus
    llm: str
    tools: List[str]
    memory: Optional[str] = None
```

#### Crew Model (app/models/crew.py)

```python
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

from .agent import Agent
from .task import Task


class TaskExecutionStrategy(str, Enum):
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"


class CrewStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"


class CrewConfig(BaseModel):
    verbose: bool
    maxIterations: int
    taskExecutionStrategy: TaskExecutionStrategy


class Crew(BaseModel):
    id: str
    name: str
    description: str
    agents: List[Agent]
    tasks: List[Task]
    status: CrewStatus
    createdAt: str
    lastRun: Optional[str] = None
    config: CrewConfig
```

#### Task Model (app/models/task.py)

```python
from pydantic import BaseModel
from typing import Optional
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class Task(BaseModel):
    id: str
    description: str
    assignedTo: str  # Agent ID
    status: TaskStatus
    output: Optional[str] = None
    createdAt: str
    completedAt: Optional[str] = None
```

### API Routes

Create the following endpoints to manage agents, crews, and tasks:

#### Agent Routes (app/routers/agents.py)

```python
from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import uuid4
from datetime import datetime

from ..models.agent import Agent, AgentRole, AgentStatus
from ..services.agent_service import AgentService

router = APIRouter(prefix="/agents", tags=["agents"])
agent_service = AgentService()


@router.get("/", response_model=List[Agent])
async def get_agents():
    return agent_service.get_all_agents()


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    agent = agent_service.get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/", response_model=Agent, status_code=status.HTTP_201_CREATED)
async def create_agent(agent: Agent):
    return agent_service.create_agent(agent)


@router.put("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, agent: Agent):
    updated_agent = agent_service.update_agent(agent_id, agent)
    if not updated_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return updated_agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str):
    deleted = agent_service.delete_agent(agent_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Agent not found")
    return None
```

#### Crew Routes (app/routers/crews.py)

```python
from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import uuid4
from datetime import datetime

from ..models.crew import Crew, CrewStatus
from ..services.crew_service import CrewService

router = APIRouter(prefix="/crews", tags=["crews"])
crew_service = CrewService()


@router.get("/", response_model=List[Crew])
async def get_crews():
    return crew_service.get_all_crews()


@router.get("/{crew_id}", response_model=Crew)
async def get_crew(crew_id: str):
    crew = crew_service.get_crew_by_id(crew_id)
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    return crew


@router.post("/", response_model=Crew, status_code=status.HTTP_201_CREATED)
async def create_crew(crew: Crew):
    return crew_service.create_crew(crew)


@router.put("/{crew_id}", response_model=Crew)
async def update_crew(crew_id: str, crew: Crew):
    updated_crew = crew_service.update_crew(crew_id, crew)
    if not updated_crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    return updated_crew


@router.delete("/{crew_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_crew(crew_id: str):
    deleted = crew_service.delete_crew(crew_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Crew not found")
    return None


@router.post("/{crew_id}/run", response_model=Crew)
async def run_crew(crew_id: str):
    crew = crew_service.run_crew(crew_id)
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    return crew
```

#### Task Routes (app/routers/tasks.py)

```python
from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import uuid4
from datetime import datetime

from ..models.task import Task, TaskStatus
from ..services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])
task_service = TaskService()


@router.get("/", response_model=List[Task])
async def get_tasks():
    return task_service.get_all_tasks()


@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: str):
    task = task_service.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(task: Task):
    return task_service.create_task(task)


@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: str, task: Task):
    updated_task = task_service.update_task(task_id, task)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    deleted = task_service.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
```

### Services

Implement services that handle the business logic and interact with your CrewAI implementation:

#### Agent Service (app/services/agent_service.py)

```python
from typing import List, Optional
import uuid
from datetime import datetime

from ..models.agent import Agent, AgentStatus


class AgentService:
    # This would be replaced with database storage in a production app
    _agents = {}

    def get_all_agents(self) -> List[Agent]:
        return list(self._agents.values())

    def get_agent_by_id(self, agent_id: str) -> Optional[Agent]:
        return self._agents.get(agent_id)

    def create_agent(self, agent: Agent) -> Agent:
        # Here you would translate the agent model to a CrewAI agent
        # Example:
        # from crewai import Agent as CrewAIAgent
        # crewai_agent = CrewAIAgent(
        #     name=agent.name,
        #     role=agent.role,
        #     goal=agent.description,
        #     backstory=agent.description,
        #     llm=self._get_llm_for_agent(agent.llm),
        #     tools=self._get_tools_for_agent(agent.tools)
        # )
        
        # For this example, we'll just store the agent model
        if not agent.id:
            agent.id = str(uuid4())
        
        if not agent.status:
            agent.status = AgentStatus.IDLE
            
        self._agents[agent.id] = agent
        return agent

    def update_agent(self, agent_id: str, agent: Agent) -> Optional[Agent]:
        if agent_id not in self._agents:
            return None
            
        # Update CrewAI agent implementation here
        
        self._agents[agent_id] = agent
        return agent

    def delete_agent(self, agent_id: str) -> bool:
        if agent_id not in self._agents:
            return False
            
        # Clean up CrewAI agent implementation here
        
        del self._agents[agent_id]
        return True
        
    # Helper methods to map between API models and CrewAI objects
    def _get_llm_for_agent(self, llm_name: str):
        # Implement logic to return the appropriate LLM based on the name
        pass
        
    def _get_tools_for_agent(self, tool_names: List[str]):
        # Implement logic to return the appropriate tools based on the names
        pass
```

#### Crew Service (app/services/crew_service.py)

```python
from typing import List, Optional
import uuid
from datetime import datetime

from ..models.crew import Crew, CrewStatus
from ..models.task import TaskStatus


class CrewService:
    # This would be replaced with database storage in a production app
    _crews = {}

    def get_all_crews(self) -> List[Crew]:
        return list(self._crews.values())

    def get_crew_by_id(self, crew_id: str) -> Optional[Crew]:
        return self._crews.get(crew_id)

    def create_crew(self, crew: Crew) -> Crew:
        # Here you would translate the crew model to a CrewAI crew
        # Example:
        # from crewai import Crew as CrewAICrew
        # crewai_agents = [self._get_crewai_agent(agent_id) for agent in crew.agents]
        # crewai_tasks = [self._get_crewai_task(task_id) for task in crew.tasks]
        # crewai_crew = CrewAICrew(
        #     agents=crewai_agents,
        #     tasks=crewai_tasks,
        #     verbose=crew.config.verbose,
        #     process=crew.config.taskExecutionStrategy
        # )
        
        # For this example, we'll just store the crew model
        if not crew.id:
            crew.id = str(uuid4())
        
        if not crew.createdAt:
            crew.createdAt = datetime.now().isoformat()
            
        if not crew.status:
            crew.status = CrewStatus.IDLE
            
        self._crews[crew.id] = crew
        return crew

    def update_crew(self, crew_id: str, crew: Crew) -> Optional[Crew]:
        if crew_id not in self._crews:
            return None
            
        # Update CrewAI crew implementation here
        
        self._crews[crew_id] = crew
        return crew

    def delete_crew(self, crew_id: str) -> bool:
        if crew_id not in self._crews:
            return False
            
        # Clean up CrewAI crew implementation here
        
        del self._crews[crew_id]
        return True
        
    def run_crew(self, crew_id: str) -> Optional[Crew]:
        if crew_id not in self._crews:
            return None
            
        crew = self._crews[crew_id]
        
        # Here you would run the CrewAI crew
        # Example:
        # crewai_crew = self._get_crewai_crew(crew)
        # result = crewai_crew.run()
        # Then update the tasks with the results
        
        # For this example, we'll just update the status
        crew.status = CrewStatus.RUNNING
        
        # In a real implementation, you would start this process in the background
        # and update the status when it completes
        
        return crew
        
    # Helper methods to map between API models and CrewAI objects
    def _get_crewai_agent(self, agent):
        # Implement logic to convert API agent to CrewAI agent
        pass
        
    def _get_crewai_task(self, task):
        # Implement logic to convert API task to CrewAI task
        pass
        
    def _get_crewai_crew(self, crew):
        # Implement logic to convert API crew to CrewAI crew
        pass
```

#### Task Service (app/services/task_service.py)

```python
from typing import List, Optional
import uuid
from datetime import datetime

from ..models.task import Task, TaskStatus


class TaskService:
    # This would be replaced with database storage in a production app
    _tasks = {}

    def get_all_tasks(self) -> List[Task]:
        return list(self._tasks.values())

    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def create_task(self, task: Task) -> Task:
        # Here you would translate the task model to a CrewAI task
        # Example:
        # from crewai import Task as CrewAITask
        # crewai_task = CrewAITask(
        #     description=task.description,
        #     agent=self._get_agent_for_task(task.assignedTo)
        # )
        
        # For this example, we'll just store the task model
        if not task.id:
            task.id = str(uuid4())
        
        if not task.createdAt:
            task.createdAt = datetime.now().isoformat()
            
        if not task.status:
            task.status = TaskStatus.PENDING
            
        self._tasks[task.id] = task
        return task

    def update_task(self, task_id: str, task: Task) -> Optional[Task]:
        if task_id not in self._tasks:
            return None
            
        # Update CrewAI task implementation here
        
        self._tasks[task_id] = task
        return task

    def delete_task(self, task_id: str) -> bool:
        if task_id not in self._tasks:
            return False
            
        # Clean up CrewAI task implementation here
        
        del self._tasks[task_id]
        return True
        
    # Helper methods to map between API models and CrewAI objects
    def _get_agent_for_task(self, agent_id: str):
        # Implement logic to return the appropriate CrewAI agent based on the ID
        pass
```

### Main Application (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import agents, crews, tasks

app = FastAPI(title="CrewAI Hub API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router)
app.include_router(crews.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {"message": "Welcome to CrewAI Hub API"}
```

## Running the API

1. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```

2. Access the API documentation at `http://127.0.0.1:8000/docs`

## Connecting to the Frontend

To connect the CrewAI Hub frontend to your API:

1. Create an API client in the frontend to make requests to your API endpoints. For example, create a new file `src/lib/api.ts`:

```typescript
// Define the base URL for API requests
const API_BASE_URL = 'http://localhost:8000';

// Generic fetch function with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
}

// API methods for Agents
export const agentAPI = {
  getAll: () => fetchAPI<Agent[]>('/agents'),
  getById: (id: string) => fetchAPI<Agent>(`/agents/${id}`),
  create: (agent: Omit<Agent, 'id'>) => 
    fetchAPI<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    }),
  update: (id: string, agent: Agent) =>
    fetchAPI<Agent>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agent),
    }),
  delete: (id: string) =>
    fetchAPI(`/agents/${id}`, { method: 'DELETE' }),
};

// API methods for Crews
export const crewAPI = {
  getAll: () => fetchAPI<Crew[]>('/crews'),
  getById: (id: string) => fetchAPI<Crew>(`/crews/${id}`),
  create: (crew: Omit<Crew, 'id'>) =>
    fetchAPI<Crew>('/crews', {
      method: 'POST',
      body: JSON.stringify(crew),
    }),
  update: (id: string, crew: Crew) =>
    fetchAPI<Crew>(`/crews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(crew),
    }),
  delete: (id: string) =>
    fetchAPI(`/crews/${id}`, { method: 'DELETE' }),
  run: (id: string) =>
    fetchAPI<Crew>(`/crews/${id}/run`, { method: 'POST' }),
};

// API methods for Tasks
export const taskAPI = {
  getAll: () => fetchAPI<Task[]>('/tasks'),
  getById: (id: string) => fetchAPI<Task>(`/tasks/${id}`),
  create: (task: Omit<Task, 'id'>) =>
    fetchAPI<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  update: (id: string, task: Task) =>
    fetchAPI<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),
  delete: (id: string) =>
    fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),
};
```

2. Update the frontend components to use the API client instead of mock data.

## Integrating with CrewAI Framework

To fully integrate with your CrewAI framework:

1. Import your CrewAI implementation in the service files
2. Implement the helper methods that convert between API models and CrewAI objects
3. Add proper error handling and logging
4. Consider adding persistence (database) for storing state between API calls

## Advanced Features

Once you have the basic API working, consider adding these advanced features:

1. **WebSocket Support**: For real-time updates during crew execution
2. **Authentication**: Secure your API with JWT or API keys
3. **Persistent Storage**: Add a database to store crew, agent, and task data
4. **Result History**: Store and retrieve past crew execution results
5. **File Handling**: Allow uploading and downloading of documents for tasks

## Troubleshooting

### CORS Issues

If you encounter CORS errors when connecting the frontend to the API:

1. Ensure the `allow_origins` in the CORS middleware includes your frontend URL
2. Check that your requests include the correct headers
3. Verify that your frontend is making requests to the correct API URL

### CrewAI Integration Issues

If you have trouble integrating with CrewAI:

1. Ensure you're using compatible versions of CrewAI and its dependencies
2. Check that your LLM configurations are correctly passed to CrewAI
3. Consider starting with simple agents and tasks to verify the integration works

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
