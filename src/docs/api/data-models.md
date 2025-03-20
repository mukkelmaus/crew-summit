
# API Core Data Models

This document describes the key data models used in the CrewSUMMIT API.

## Overview

The API uses Pydantic models for data validation, serialization, and documentation. These models define the structure of requests and responses for all API endpoints.

## Agent Models

Agents are AI assistants with specific roles and capabilities.

```python
from pydantic import BaseModel, Field
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


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[AgentRole] = None
    description: Optional[str] = None
    llm: Optional[str] = None
    tools: Optional[List[str]] = None
    memory: Optional[str] = None
```

## Crew Models

Crews are collections of agents organized to accomplish tasks through collaboration.

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


class CrewUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    agent_ids: Optional[List[UUID]] = None
    config: Optional[CrewConfig] = None
```

## Task Models

Tasks represent individual work items assigned to agents.

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


class TaskUpdate(BaseModel):
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    status: Optional[TaskStatus] = None
    output: Optional[str] = None
```

## Flow Models

Flows provide a visual workflow representation.

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime


class NodeType(str, Enum):
    TASK = "task"
    CONDITION = "condition"
    TRIGGER = "trigger"
    OUTPUT = "output"


class EdgeType(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    DEFAULT = "default"


class Position(BaseModel):
    x: float
    y: float


class FlowNode(BaseModel):
    id: str
    type: NodeType
    label: str
    data: Dict[str, Any]
    position: Position


class FlowEdge(BaseModel):
    id: str
    source: str
    target: str
    type: EdgeType = EdgeType.DEFAULT


class FlowStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"


class FlowCreate(BaseModel):
    name: str
    description: str
    crew_id: UUID
    nodes: List[FlowNode]
    edges: List[FlowEdge]


class Flow(FlowCreate):
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    last_run: Optional[datetime] = None
    status: FlowStatus = FlowStatus.IDLE


class FlowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[FlowNode]] = None
    edges: Optional[List[FlowEdge]] = None
```

## Response Models

Standardized response models for consistent API responses.

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List, Dict, Any

T = TypeVar('T')


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    issue: str


class ErrorResponse(BaseModel):
    type: str
    message: str
    details: Optional[List[ErrorDetail]] = None


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    pages: int


class DataResponse(BaseModel, Generic[T]):
    data: T
    meta: Optional[Dict[str, Any]] = None


class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationMeta
    meta: Optional[Dict[str, Any]] = None
```

## Usage Examples

### Creating an Agent

```python
agent_data = {
    "name": "Research Assistant",
    "role": "researcher",
    "description": "Gathers information from various sources",
    "llm": "gpt-4",
    "tools": ["web-search", "document-analysis"]
}

agent_create = AgentCreate(**agent_data)
```

### Creating a Crew

```python
crew_data = {
    "name": "Research Team",
    "description": "Researches and summarizes information",
    "agent_ids": ["uuid1", "uuid2"],
    "config": {
        "verbose": True,
        "max_iterations": 3,
        "task_execution_strategy": "sequential"
    }
}

crew_create = CrewCreate(**crew_data)
```

### Converting API Models to CrewAI Objects

When integrating with CrewAI, you'll need to convert API models to CrewAI objects:

```python
from crewai import Agent as CrewAIAgent
from crewai import Crew as CrewAICrew
from crewai import Task as CrewAITask

def convert_to_crewai_agent(agent: Agent) -> CrewAIAgent:
    return CrewAIAgent(
        name=agent.name,
        role=agent.role.value,
        goal=agent.description,
        backstory=agent.description,
        llm=get_llm_for_agent(agent.llm),
        tools=get_tools_for_agent(agent.tools)
    )

def convert_to_crewai_crew(crew: Crew, agents: List[Agent], tasks: List[Task]) -> CrewAICrew:
    crewai_agents = [convert_to_crewai_agent(agent) for agent in agents]
    crewai_tasks = [convert_to_crewai_task(task) for task in tasks]
    
    return CrewAICrew(
        agents=crewai_agents,
        tasks=crewai_tasks,
        process=crew.config.task_execution_strategy.value,
        verbose=crew.config.verbose
    )
```
