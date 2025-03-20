
# API Advanced Features

This document describes advanced features and extensions for the CrewSUMMIT API.

## WebSocket Support

Real-time updates are crucial for monitoring agent and crew activities. WebSockets provide a bidirectional communication channel between the client and server.

### WebSocket Implementation

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_ids: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if client_id:
            self.connection_ids[client_id] = websocket
            
    def disconnect(self, websocket: WebSocket, client_id: str = None):
        self.active_connections.remove(websocket)
        if client_id and client_id in self.connection_ids:
            del self.connection_ids[client_id]
            
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)
        
    async def send_to_client(self, message: dict, client_id: str):
        if client_id in self.connection_ids:
            await self.connection_ids[client_id].send_json(message)
            
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)
            
manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "subscribe":
                # Handle subscription to specific resources
                resource_type = message.get("resource_type")
                resource_id = message.get("resource_id")
                
                # Add to subscription list (implementation not shown)
                await manager.send_personal_message(
                    {"type": "subscribed", "resource_type": resource_type, "resource_id": resource_id},
                    websocket
                )
            else:
                # Echo the message back (for debugging)
                await manager.send_personal_message(message, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
```

### Broadcasting Events

When agents or crews change state, broadcast updates to connected clients:

```python
async def broadcast_event(event_type: str, data: dict):
    """Broadcast an event to all connected WebSocket clients."""
    message = {
        "type": "event",
        "event_type": event_type,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }
    await manager.broadcast(message)

# Example usage in a service
class AgentService:
    async def update_agent_status(self, agent_id: str, status: str):
        # Update agent status in database
        agent = await self.repository.update_status(agent_id, status)
        
        # Broadcast event
        await broadcast_event("agent_status_changed", {
            "agent_id": str(agent_id),
            "status": status
        })
        
        return agent
```

### Client Implementation

Example TypeScript client for WebSocket connectivity:

```typescript
class EventService {
  private socket: WebSocket | null = null;
  private clientId: string;
  private baseUrl: string;
  private subscriptions: Map<string, (data: any) => void> = new Map();
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.clientId = this.generateClientId();
  }
  
  private generateClientId(): string {
    return `client_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/ws/${this.clientId}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect();
      };
      
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };
    });
  }
  
  private reconnect() {
    setTimeout(() => {
      console.log('Attempting to reconnect WebSocket');
      this.connect()
        .catch(() => this.reconnect());
    }, 5000);
  }
  
  private handleMessage(message: any) {
    if (message.type === 'event') {
      // Notify subscribers of this event type
      const callback = this.subscriptions.get(message.event_type);
      if (callback) {
        callback(message.data);
      }
      
      // Notify subscribers of all events
      const allCallback = this.subscriptions.get('all');
      if (allCallback) {
        allCallback(message);
      }
    }
  }
  
  subscribe(eventType: string, callback: (data: any) => void) {
    this.subscriptions.set(eventType, callback);
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        event_type: eventType
      }));
    }
  }
  
  unsubscribe(eventType: string) {
    this.subscriptions.delete(eventType);
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
```

## File Upload and Processing

Many AI tasks require processing files such as documents, images, or datasets.

### File Upload Endpoint

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from uuid import uuid4
from typing import List

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/v1/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: str = None
):
    # Generate a unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
        
    # Save file metadata to database
    file_size = os.path.getsize(file_path)
    file_record = {
        "id": str(uuid4()),
        "original_filename": file.filename,
        "stored_filename": unique_filename,
        "file_path": file_path,
        "content_type": file.content_type,
        "size_bytes": file_size,
        "description": description,
        "uploaded_at": datetime.now().isoformat()
    }
    
    # Save to database (implementation not shown)
    file_id = await save_file_metadata(file_record)
    
    return {
        "data": {
            "file_id": file_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": file_size
        }
    }

@app.post("/api/v1/files/uploads")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    description: str = None
):
    results = []
    for file in files:
        result = await upload_file(file, description)
        results.append(result["data"])
        
    return {
        "data": results
    }
```

### File Processing with AI

Process uploaded files with AI tools:

```python
@app.post("/api/v1/files/{file_id}/analyze")
async def analyze_file(
    file_id: str,
    analysis_type: str = "text_extraction",
    current_user = Depends(get_current_active_user)
):
    # Get file metadata
    file_metadata = await get_file_metadata(file_id)
    if not file_metadata:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Check file access permissions
    if not has_file_access(current_user, file_metadata):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Process file based on analysis type
    file_path = file_metadata["file_path"]
    content_type = file_metadata["content_type"]
    
    try:
        if analysis_type == "text_extraction":
            if content_type.startswith("image/"):
                # Extract text from image
                from PIL import Image
                import pytesseract
                
                image = Image.open(file_path)
                text = pytesseract.image_to_string(image)
                return {"data": {"text": text}}
                
            elif content_type == "application/pdf":
                # Extract text from PDF
                import pypdf
                
                text = ""
                with open(file_path, "rb") as f:
                    pdf = pypdf.PdfReader(f)
                    for page in pdf.pages:
                        text += page.extract_text()
                return {"data": {"text": text}}
                
            else:
                # Handle other file types
                raise HTTPException(status_code=400, detail=f"Unsupported content type for text extraction: {content_type}")
                
        elif analysis_type == "image_classification":
            if not content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="File is not an image")
            
            # Perform image classification (implementation not shown)
            # This would typically call an ML model
            classifications = await classify_image(file_path)
            return {"data": {"classifications": classifications}}
            
        elif analysis_type == "document_summary":
            # Generate a summary of the document
            text = await extract_text(file_path, content_type)
            summary = await generate_summary(text)
            return {"data": {"summary": summary}}
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown analysis type: {analysis_type}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
```

## Batch Processing

For processing multiple tasks or requests efficiently:

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List
import asyncio

app = FastAPI()

class BatchTaskRequest(BaseModel):
    tasks: List[str]
    timeout: int = 300  # Timeout in seconds

@app.post("/api/v1/batch")
async def process_batch(
    request: BatchTaskRequest,
    background_tasks: BackgroundTasks
):
    # Generate batch ID
    batch_id = str(uuid4())
    
    # Initialize batch status
    await initialize_batch_status(batch_id, len(request.tasks))
    
    # Process tasks in background
    background_tasks.add_task(
        process_tasks_in_batch,
        batch_id,
        request.tasks,
        request.timeout
    )
    
    return {
        "data": {
            "batch_id": batch_id,
            "task_count": len(request.tasks),
            "status": "processing"
        }
    }

async def process_tasks_in_batch(batch_id: str, tasks: List[str], timeout: int):
    """Process multiple tasks concurrently."""
    # Create task coroutines
    coroutines = [process_single_task(batch_id, index, task) for index, task in enumerate(tasks)]
    
    # Run tasks concurrently with timeout
    try:
        await asyncio.wait_for(asyncio.gather(*coroutines), timeout=timeout)
        
        # Update batch status to completed
        await update_batch_status(batch_id, "completed")
        
    except asyncio.TimeoutError:
        # Handle timeout
        await update_batch_status(batch_id, "timeout")
        
    except Exception as e:
        # Handle other errors
        await update_batch_status(batch_id, "error", str(e))

async def process_single_task(batch_id: str, task_index: int, task: str):
    """Process a single task within a batch."""
    try:
        # Update task status to processing
        await update_task_status(batch_id, task_index, "processing")
        
        # Process the task (implementation depends on task type)
        result = await execute_task(task)
        
        # Update task status to completed
        await update_task_status(batch_id, task_index, "completed", result)
        
    except Exception as e:
        # Update task status to error
        await update_task_status(batch_id, task_index, "error", str(e))
        raise

@app.get("/api/v1/batch/{batch_id}")
async def get_batch_status(batch_id: str):
    """Get the status of a batch job."""
    batch = await get_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    return {
        "data": batch
    }
```

## Rate Limiting

Protect the API from abuse with rate limiting:

```python
from fastapi import FastAPI, Request, Response, Depends
import time
import asyncio
from typing import Dict, List, Tuple, Callable

app = FastAPI()

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_duration = 60  # seconds
        self.client_requests: Dict[str, List[float]] = {}
        
    async def cleanup_old_requests(self):
        """Periodically cleanup old request timestamps."""
        while True:
            now = time.time()
            for client_id, timestamps in list(self.client_requests.items()):
                # Remove timestamps older than the window
                self.client_requests[client_id] = [
                    ts for ts in timestamps if now - ts < self.window_duration
                ]
                # Remove empty lists
                if not self.client_requests[client_id]:
                    del self.client_requests[client_id]
            await asyncio.sleep(60)  # Cleanup every minute
            
    def is_rate_limited(self, client_id: str) -> Tuple[bool, int, int]:
        """Check if a client is rate limited."""
        now = time.time()
        
        # Get request timestamps for this client
        timestamps = self.client_requests.get(client_id, [])
        
        # Remove timestamps outside the current window
        current_window = [ts for ts in timestamps if now - ts < self.window_duration]
        
        # Check if limit is exceeded
        is_limited = len(current_window) >= self.requests_per_minute
        
        # Add current request timestamp
        current_window.append(now)
        self.client_requests[client_id] = current_window
        
        # Calculate remaining requests and reset time
        remaining = max(0, self.requests_per_minute - len(current_window))
        reset_time = int(now + self.window_duration - (now % self.window_duration))
        
        return is_limited, remaining, reset_time

rate_limiter = RateLimiter()

@app.on_event("startup")
async def start_cleanup_task():
    asyncio.create_task(rate_limiter.cleanup_old_requests())

def rate_limit(requests_per_minute: int = 60):
    """Dependency for rate limiting endpoints."""
    limiter = RateLimiter(requests_per_minute)
    
    async def apply_rate_limit(request: Request, response: Response):
        # Get client identifier (IP address or API key)
        client_id = request.client.host
        if "X-API-Key" in request.headers:
            client_id = request.headers["X-API-Key"]
        
        # Check rate limit
        is_limited, remaining, reset_time = limiter.is_rate_limited(client_id)
        
        # Set rate limit headers
        response.headers["X-RateLimit-Limit"] = str(requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        
        if is_limited:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded",
                headers={
                    "Retry-After": str(reset_time - int(time.time()))
                }
            )
            
    return apply_rate_limit

@app.get("/api/v1/agents", dependencies=[Depends(rate_limit(100))])
async def get_agents():
    # Implementation
    pass
```

## Caching

Improve performance with response caching:

```python
from fastapi import FastAPI, Request, Response, Depends
import hashlib
import json
from datetime import datetime, timedelta
from typing import Callable, Dict, Optional

app = FastAPI()

class SimpleCache:
    def __init__(self):
        self.cache: Dict[str, dict] = {}
        
    def get(self, key: str) -> Optional[dict]:
        """Get cached response if it exists and hasn't expired."""
        if key in self.cache:
            item = self.cache[key]
            if datetime.now() < item["expires_at"]:
                return item["data"]
            # Expired item, remove it
            del self.cache[key]
        return None
        
    def set(self, key: str, data: dict, ttl_seconds: int = 60):
        """Cache a response with expiration time."""
        self.cache[key] = {
            "data": data,
            "expires_at": datetime.now() + timedelta(seconds=ttl_seconds)
        }
        
    def clear(self, key_prefix: str = None):
        """Clear cache entries, optionally by prefix."""
        if key_prefix:
            self.cache = {k: v for k, v in self.cache.items() if not k.startswith(key_prefix)}
        else:
            self.cache = {}

cache = SimpleCache()

def cached(ttl_seconds: int = 60):
    """Dependency for caching endpoint responses."""
    def _cached(request: Request, response: Response):
        # Only cache GET requests
        if request.method != "GET":
            return None
            
        # Generate cache key from request
        cache_key = generate_cache_key(request)
        
        # Try to get from cache
        cached_response = cache.get(cache_key)
        if cached_response:
            return cached_response
            
        # Cache miss - will be handled in the endpoint
        return None
            
    return _cached

def generate_cache_key(request: Request) -> str:
    """Generate a unique cache key for a request."""
    # Combine URL path, query params, and headers
    key_parts = [
        request.url.path,
        str(sorted(request.query_params.items())),
    ]
    
    # Generate hash
    key = hashlib.md5("".join(key_parts).encode()).hexdigest()
    return key

@app.get("/api/v1/agents")
async def get_agents(cached_response = Depends(cached(60))):
    # Return cached response if available
    if cached_response:
        return cached_response
        
    # Generate response
    agents = await get_all_agents()
    response = {"data": agents}
    
    # Cache the response
    cache_key = generate_cache_key(request)
    cache.set(cache_key, response, ttl_seconds=60)
    
    return response
```

## Internationalization (i18n)

Support for multiple languages:

```python
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Optional

app = FastAPI()

# Load translations
translations: Dict[str, Dict[str, str]] = {
    "en": {
        "welcome": "Welcome to the CrewSUMMIT API",
        "not_found": "Resource not found",
        "validation_error": "Invalid input data"
    },
    "es": {
        "welcome": "Bienvenido a la API de CrewSUMMIT",
        "not_found": "Recurso no encontrado",
        "validation_error": "Datos de entrada no válidos"
    },
    "fr": {
        "welcome": "Bienvenue sur l'API CrewSUMMIT",
        "not_found": "Ressource non trouvée",
        "validation_error": "Données d'entrée invalides"
    }
}

def get_translator(request: Request):
    """Get a translator function based on Accept-Language header."""
    # Get preferred language from header, default to English
    accept_language = request.headers.get("Accept-Language", "en")
    language_code = accept_language.split(",")[0].strip().lower()
    
    # Fall back to English if language not supported
    if language_code not in translations:
        language_code = "en"
        
    def translate(key: str, default: Optional[str] = None) -> str:
        """Translate a key to the selected language."""
        return translations[language_code].get(key, default or key)
        
    return translate

@app.get("/")
async def root(translate = Depends(get_translator)):
    return {"message": translate("welcome")}

@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request, 
    exc: HTTPException,
    translate = Depends(get_translator)
):
    """Localized HTTP exception handler."""
    if exc.status_code == 404:
        detail = translate("not_found")
    else:
        detail = exc.detail
        
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "API_ERROR",
                "message": detail
            }
        }
    )
```

## Metrics and Telemetry

Collect performance metrics for monitoring:

```python
from fastapi import FastAPI, Request
import time
from typing import Callable
import json
import logging

app = FastAPI()

logger = logging.getLogger("api_metrics")

@app.middleware("http")
async def track_metrics(request: Request, call_next: Callable):
    """Middleware for tracking request metrics."""
    # Record request start time
    start_time = time.time()
    
    # Forward the request
    response = await call_next(request)
    
    # Calculate request duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Log metrics
    metrics = {
        "timestamp": time.time(),
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": duration_ms,
        "client_ip": request.client.host,
        "user_agent": request.headers.get("user-agent", "")
    }
    
    logger.info(json.dumps(metrics))
    
    # Add timing header
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
    
    return response
```

## Cross-Origin Resource Sharing (CORS)

Configure CORS for frontend access:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",            # Local development
    "https://app.crewsummit.com",       # Production frontend
    "https://staging.crewsummit.com",   # Staging environment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "X-Response-Time"
    ]
)
```

## API Documentation

Enhance API documentation with rich examples:

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI()

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
        
    openapi_schema = get_openapi(
        title="CrewSUMMIT API",
        version="1.0.0",
        description="API for managing AI agent crews",
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        },
        "apiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key"
        }
    }
    
    # Apply security globally
    openapi_schema["security"] = [
        {"bearerAuth": []}
    ]
    
    # Add examples
    openapi_schema["components"]["examples"] = {
        "AgentCreate": {
            "value": {
                "name": "Research Assistant",
                "role": "researcher",
                "description": "Gathers information from various sources",
                "llm": "gpt-4",
                "tools": ["web-search", "document-analysis"]
            }
        },
        "AgentResponse": {
            "value": {
                "data": {
                    "id": "agent-1",
                    "name": "Research Assistant",
                    "role": "researcher",
                    "description": "Gathers information from various sources",
                    "status": "idle",
                    "llm": "gpt-4",
                    "tools": ["web-search", "document-analysis"],
                    "memory": null,
                    "created_at": "2023-06-01T12:00:00Z",
                    "updated_at": "2023-06-01T12:00:00Z"
                }
            }
        }
    }
    
    # Add tags
    openapi_schema["tags"] = [
        {
            "name": "agents",
            "description": "Operations with AI agents"
        },
        {
            "name": "crews",
            "description": "Operations with agent crews"
        },
        {
            "name": "tasks",
            "description": "Operations with agent tasks"
        },
        {
            "name": "flows",
            "description": "Operations with workflow flows"
        },
        {
            "name": "runs",
            "description": "Operations with execution runs"
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

## Request Validation

Enhance request validation:

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum

app = FastAPI()

class AgentRole(str, Enum):
    RESEARCHER = "researcher"
    WRITER = "writer"
    ANALYST = "analyst"
    DESIGNER = "designer"
    DEVELOPER = "developer"
    REVIEWER = "reviewer"
    CUSTOM = "custom"

class AgentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    role: AgentRole
    description: str = Field(..., min_length=10, max_length=500)
    llm: str = Field(..., regex=r"^(gpt-|claude-|llama-)")
    tools: List[str] = Field(default=[])
    memory: Optional[str] = None
    
    @validator("name")
    def name_must_be_valid(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty or whitespace")
        return v
    
    @validator("tools")
    def validate_tools(cls, v):
        valid_tools = ["web-search", "document-analysis", "data-analysis", "chart-generation", "text-generation", "grammar-check"]
        for tool in v:
            if tool not in valid_tools:
                raise ValueError(f"Invalid tool: {tool}. Valid tools are: {', '.join(valid_tools)}")
        return v
    
    @validator("memory")
    def validate_memory(cls, v):
        if v is not None and v not in ["short-term", "long-term"]:
            raise ValueError("Memory must be either 'short-term', 'long-term', or null")
        return v

@app.exception_handler(HTTPException)
async def validation_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "API_ERROR",
                "message": exc.detail
            }
        }
    )

@app.post("/api/v1/agents")
async def create_agent(agent: AgentCreate):
    # Implementation
    pass
```
