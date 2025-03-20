
# CrewSUMMIT API Implementation Guide

This document provides instructions for implementing a backend API service that integrates the CrewSUMMIT frontend with a CrewAI framework implementation.

## Table of Contents

- [Overview](#overview)
- [API Architecture](#api-architecture)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Core Data Models](#core-data-models)
- [API Endpoints](#api-endpoints)
- [Integration with CrewAI](#integration-with-crewai)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## Overview

The CrewSUMMIT API serves as a bridge between the CrewSUMMIT frontend and a CrewAI Python framework implementation. It provides:

1. RESTful endpoints for managing agents, crews, flows, and tasks
2. Data conversion between frontend models and CrewAI objects
3. State persistence and synchronization
4. Real-time updates for monitoring crew operations

## API Architecture

![API Architecture](public/placeholder.svg)

The API follows a clean architecture with:

- **Controller Layer**: Handles HTTP requests and responses
- **Service Layer**: Contains business logic and CrewAI integration
- **Repository Layer**: Manages data persistence
- **Model Layer**: Defines data structures

## Technology Stack

- **FastAPI**: Modern, high-performance web framework
- **Pydantic**: Data validation and settings management
- **SQLAlchemy** (optional): ORM for database interactions
- **WebSockets**: For real-time updates
- **CrewAI**: Core framework for AI agent orchestration

## Project Structure

```
crewsummit-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and environment variables
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── agent.py            # Agent data models
│   │   ├── crew.py             # Crew data models
│   │   ├── flow.py             # Flow data models
│   │   └── task.py             # Task data models
│   ├── api/                    # API route definitions
│   │   ├── __init__.py
│   │   ├── agents.py           # Agent endpoints
│   │   ├── crews.py            # Crew endpoints
│   │   ├── flows.py            # Flow endpoints
│   │   └── tasks.py            # Task endpoints
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── agent_service.py    # Agent operations
│   │   ├── crew_service.py     # Crew operations
│   │   ├── flow_service.py     # Flow operations
│   │   └── task_service.py     # Task operations
│   └── repositories/           # Data access
│       ├── __init__.py
│       ├── agent_repository.py
│       ├── crew_repository.py
│       └── task_repository.py
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── test_agents.py
│   ├── test_crews.py
│   └── test_tasks.py
├── .env                        # Environment variables
├── .gitignore
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip (Python package installer)
- CrewAI framework
- Virtual environment tool (venv or conda)

### Installation

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install required packages:
   ```bash
   pip install fastapi uvicorn pydantic crewai python-dotenv sqlalchemy
   ```

3. Create a `.env` file with the following variables:
   ```
   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   DEBUG=True
   
   # Security
   SECRET_KEY=your_secret_key_here
   
   # Database (if using)
   DATABASE_URL=sqlite:///./crewsummit.db
   
   # LLM Configuration
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Core Data Models

The API uses Pydantic models that align with the frontend data structures:

### Agent Model

```python
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime


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


class AgentCreate(BaseModel):
    name: str
    role: AgentRole
    description: str
    llm: str
    tools: List[str]
    memory: Optional[str] = None


class Agent(AgentCreate):
    id: UUID = Field(default_factory=uuid4)
    status: AgentStatus = AgentStatus.IDLE
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

### Crew Model

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime


class TaskExecutionStrategy(str, Enum):
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"


class CrewStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"


class CrewConfig(BaseModel):
    verbose: bool = True
    max_iterations: int = 5
    task_execution_strategy: TaskExecutionStrategy = TaskExecutionStrategy.SEQUENTIAL


class CrewCreate(BaseModel):
    name: str
    description: str
    agent_ids: List[UUID]
    config: CrewConfig = Field(default_factory=CrewConfig)


class Crew(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    agent_ids: List[UUID]
    task_ids: List[UUID] = []
    status: CrewStatus = CrewStatus.IDLE
    created_at: datetime = Field(default_factory=datetime.now)
    last_run: Optional[datetime] = None
    config: CrewConfig
```

### Task Model

```python
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskCreate(BaseModel):
    description: str
    assigned_to: UUID  # Agent ID


class Task(TaskCreate):
    id: UUID = Field(default_factory=uuid4)
    status: TaskStatus = TaskStatus.PENDING
    output: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
```

## API Endpoints

### Agent Endpoints

| Method | Endpoint             | Description           | Request Body  | Response          |
|--------|----------------------|-----------------------|---------------|-------------------|
| GET    | /agents              | Get all agents        | -             | List[Agent]       |
| GET    | /agents/{agent_id}   | Get agent by ID       | -             | Agent             |
| POST   | /agents              | Create a new agent    | AgentCreate   | Agent             |
| PUT    | /agents/{agent_id}   | Update an agent       | AgentUpdate   | Agent             |
| DELETE | /agents/{agent_id}   | Delete an agent       | -             | 204 No Content    |

### Crew Endpoints

| Method | Endpoint             | Description          | Request Body  | Response          |
|--------|----------------------|----------------------|---------------|-------------------|
| GET    | /crews               | Get all crews        | -             | List[Crew]        |
| GET    | /crews/{crew_id}     | Get crew by ID       | -             | Crew              |
| POST   | /crews               | Create a new crew    | CrewCreate    | Crew              |
| PUT    | /crews/{crew_id}     | Update a crew        | CrewUpdate    | Crew              |
| DELETE | /crews/{crew_id}     | Delete a crew        | -             | 204 No Content    |
| POST   | /crews/{crew_id}/run | Execute a crew       | -             | Crew              |

### Task Endpoints

| Method | Endpoint             | Description          | Request Body  | Response          |
|--------|----------------------|----------------------|---------------|-------------------|
| GET    | /tasks               | Get all tasks        | -             | List[Task]        |
| GET    | /tasks/{task_id}     | Get task by ID       | -             | Task              |
| POST   | /tasks               | Create a new task    | TaskCreate    | Task              |
| PUT    | /tasks/{task_id}     | Update a task        | TaskUpdate    | Task              |
| DELETE | /tasks/{task_id}     | Delete a task        | -             | 204 No Content    |

### Flow Endpoints

| Method | Endpoint              | Description          | Request Body   | Response          |
|--------|------------------------|---------------------|----------------|-------------------|
| GET    | /flows                 | Get all flows       | -              | List[Flow]        |
| GET    | /flows/{flow_id}       | Get flow by ID      | -              | Flow              |
| POST   | /flows                 | Create a new flow   | FlowCreate     | Flow              |
| PUT    | /flows/{flow_id}       | Update a flow       | FlowUpdate     | Flow              |
| DELETE | /flows/{flow_id}       | Delete a flow       | -              | 204 No Content    |
| POST   | /flows/{flow_id}/run   | Execute a flow      | -              | Flow              |

## Implementation Examples

### Main Application

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import agents, crews, tasks, flows

app = FastAPI(title="CrewSUMMIT API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/api/v1")
app.include_router(crews.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(flows.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to CrewSUMMIT API"}
```

### Agent Router Implementation

```python
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from uuid import UUID

from app.models.agent import Agent, AgentCreate, AgentUpdate
from app.services.agent_service import AgentService

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("/", response_model=List[Agent])
async def get_agents(
    agent_service: AgentService = Depends()
):
    return agent_service.get_all_agents()

@router.get("/{agent_id}", response_model=Agent)
async def get_agent(
    agent_id: UUID,
    agent_service: AgentService = Depends()
):
    agent = agent_service.get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("/", response_model=Agent, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_create: AgentCreate,
    agent_service: AgentService = Depends()
):
    return agent_service.create_agent(agent_create)

@router.put("/{agent_id}", response_model=Agent)
async def update_agent(
    agent_id: UUID,
    agent_update: AgentUpdate,
    agent_service: AgentService = Depends()
):
    updated_agent = agent_service.update_agent(agent_id, agent_update)
    if not updated_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return updated_agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    agent_service: AgentService = Depends()
):
    deleted = agent_service.delete_agent(agent_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Agent not found")
    return None
```

## CrewAI Integration

### Agent Service Integration

```python
from crewai import Agent as CrewAIAgent
from app.models.agent import Agent, AgentCreate
from typing import Optional
import openai

class AgentService:
    def _create_crewai_agent(self, agent: Agent) -> CrewAIAgent:
        return CrewAIAgent(
            name=agent.name,
            role=agent.role.value,
            goal=agent.description,
            backstory=agent.description,
            llm=self._get_llm_for_agent(agent.llm),
            tools=self._get_tools_for_agent(agent.tools)
        )

    def _get_llm_for_agent(self, llm_name: str):
        if llm_name.startswith('gpt'):
            return openai.ChatCompletion
        # Add other LLM implementations as needed
        raise ValueError(f"Unsupported LLM: {llm_name}")

    def _get_tools_for_agent(self, tool_names: List[str]):
        # Implement tool loading logic
        pass
```

### Crew Service Integration

```python
from crewai import Crew as CrewAICrew
from app.models.crew import Crew, CrewCreate
from typing import Optional

class CrewService:
    def _create_crewai_crew(self, crew: Crew) -> CrewAICrew:
        agents = [
            self.agent_service._create_crewai_agent(agent)
            for agent in self._get_agents_for_crew(crew)
        ]
        
        return CrewAICrew(
            agents=agents,
            tasks=self._get_tasks_for_crew(crew),
            process=crew.config.task_execution_strategy.value,
            verbose=crew.config.verbose
        )

    def _get_agents_for_crew(self, crew: Crew):
        return [
            self.agent_service.get_agent_by_id(agent_id)
            for agent_id in crew.agent_ids
        ]

    def _get_tasks_for_crew(self, crew: Crew):
        return [
            self.task_service.get_task_by_id(task_id)
            for task_id in crew.task_ids
        ]
```

## Error Handling

Implement comprehensive error handling using FastAPI's exception handlers:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"message": str(exc)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "An unexpected error occurred",
            "detail": str(exc)
        },
    )
```

## Authentication

Implement JWT-based authentication:

```python
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception
```

## WebSocket Support

Add real-time updates using WebSocket connections:

```python
from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

## Advanced Features

### File Upload Support

```python
from fastapi import UploadFile, File

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    # Process file contents
    return {"filename": file.filename}
```

### Rate Limiting

```python
from fastapi import Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=lambda: "global")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/limited")
@limiter.limit("5/minute")
async def rate_limited_route():
    return {"message": "This is rate limited"}
```

## Deployment

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Configuration

Use environment variables for configuration:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False
    database_url: str
    secret_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CORS middleware configuration
   - Check allowed origins in settings

2. **Authentication Issues**
   - Validate JWT token format
   - Check token expiration
   - Verify secret key configuration

3. **Database Connection Problems**
   - Confirm database URL is correct
   - Check database credentials
   - Verify network connectivity

### Logging

Implement comprehensive logging:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response
```

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

