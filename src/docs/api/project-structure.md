
# API Project Structure

This document outlines the recommended directory structure and file organization for the CrewSUMMIT API implementation.

## Directory Structure

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

## File Responsibilities

### Entry Point

- **main.py**: Configures and initializes the FastAPI application, includes routers, and sets up middleware.

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

### Configuration

- **config.py**: Manages environment variables and application settings.

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

### API Routes

Each route file (e.g., **agents.py**) defines endpoints for a specific resource:

```python
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("/")
async def get_agents():
    # Implementation...
    pass

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_agent():
    # Implementation...
    pass

# Additional routes...
```

### Services

Service files (e.g., **agent_service.py**) contain business logic for manipulating resources:

```python
class AgentService:
    def __init__(self, repository):
        self.repository = repository
        
    def get_all_agents(self):
        # Implementation...
        pass
        
    def create_agent(self, agent_data):
        # Implementation...
        pass
        
    # Additional methods...
```

### Repositories

Repository files (e.g., **agent_repository.py**) handle data persistence:

```python
class AgentRepository:
    def __init__(self, db_session):
        self.db_session = db_session
        
    def get_all(self):
        # Implementation...
        pass
        
    def create(self, agent_data):
        # Implementation...
        pass
        
    # Additional methods...
```

## Best Practices

1. **Separation of Concerns**: Keep API routes, business logic, and data access in separate layers.
2. **Dependency Injection**: Use FastAPI's dependency injection system to manage dependencies.
3. **Type Annotations**: Use Python type hints throughout the codebase.
4. **Docstrings**: Document all functions and classes.
5. **Testing**: Write unit and integration tests for all components.
