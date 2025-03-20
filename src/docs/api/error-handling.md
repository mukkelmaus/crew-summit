
# API Error Handling

This document describes the error handling patterns used in the CrewSUMMIT API.

## Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "type": "ERROR_TYPE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "specific_field",
        "issue": "Description of the issue with this field"
      }
    ]
  }
}
```

## Error Types

The API uses standard error types:

| Error Type          | HTTP Status | Description                                     |
|---------------------|-------------|-------------------------------------------------|
| `VALIDATION_ERROR`  | 400         | Invalid input data                              |
| `AUTHENTICATION_ERROR` | 401      | Authentication required or failed               |
| `AUTHORIZATION_ERROR` | 403       | Authenticated but not authorized                |
| `NOT_FOUND`         | 404         | Resource not found                              |
| `CONFLICT`          | 409         | Request conflicts with resource state           |
| `RATE_LIMIT`        | 429         | Too many requests                               |
| `INTERNAL_ERROR`    | 500         | Server error                                    |
| `SERVICE_ERROR`     | 503         | External service error (e.g., LLM API error)    |

## Global Exception Handler

Implement an exception handler to ensure consistent error responses:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError
from pydantic import ValidationError
from typing import Optional, List, Dict, Any

class AppError(Exception):
    def __init__(
        self, 
        message: str, 
        type: str = "INTERNAL_ERROR", 
        status_code: int = 500,
        details: Optional[List[Dict[str, Any]]] = None
    ):
        self.message = message
        self.type = type
        self.status_code = status_code
        self.details = details or []
        super().__init__(message)

app = FastAPI()

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": exc.type,
                "message": exc.message,
                "details": exc.details
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "API_ERROR",
                "message": exc.detail,
                "details": []
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error['loc'] if loc != 'body')
        details.append({
            "field": field,
            "issue": error['msg']
        })
    
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "type": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": details
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log the exception here
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "type": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": []
            }
        }
    )
```

## Service-Level Error Handling

Implement error handling in service components:

```python
class AgentService:
    async def create_agent(self, agent_data):
        try:
            # Validate agent data
            if not agent_data.name:
                raise AppError(
                    message="Agent name is required",
                    type="VALIDATION_ERROR",
                    status_code=400,
                    details=[{
                        "field": "name",
                        "issue": "Name cannot be empty"
                    }]
                )
            
            # Check for existing agent with same name
            existing_agent = await self.repository.get_by_name(agent_data.name)
            if existing_agent:
                raise AppError(
                    message="Agent with this name already exists",
                    type="CONFLICT",
                    status_code=409,
                    details=[{
                        "field": "name",
                        "issue": "Agent name must be unique"
                    }]
                )
            
            # Create agent
            return await self.repository.create(agent_data)
            
        except AppError:
            # Re-raise AppError instances
            raise
        except Exception as e:
            # Convert other exceptions to AppError
            raise AppError(
                message=f"Failed to create agent: {str(e)}",
                type="INTERNAL_ERROR",
                status_code=500
            )
```

## Handling External Service Errors

For errors from external services like LLM providers:

```python
async def call_llm_service(prompt, model):
    try:
        if model.startswith('gpt'):
            return await call_openai_api(prompt, model)
        elif model.startswith('claude'):
            return await call_anthropic_api(prompt, model)
        else:
            raise AppError(
                message=f"Unsupported LLM model: {model}",
                type="VALIDATION_ERROR",
                status_code=400
            )
    except openai.error.RateLimitError:
        raise AppError(
            message="OpenAI rate limit exceeded",
            type="RATE_LIMIT",
            status_code=429
        )
    except openai.error.APIError as e:
        raise AppError(
            message=f"OpenAI API error: {str(e)}",
            type="SERVICE_ERROR",
            status_code=503
        )
    except Exception as e:
        raise AppError(
            message=f"LLM service error: {str(e)}",
            type="SERVICE_ERROR",
            status_code=503
        )
```

## Database Error Handling

Handle database errors consistently:

```python
class AgentRepository:
    async def create(self, agent_data):
        try:
            # Create agent in database
            return await self.db_session.execute(...)
        except sqlalchemy.exc.IntegrityError as e:
            if "unique constraint" in str(e).lower():
                raise AppError(
                    message="Agent with this identifier already exists",
                    type="CONFLICT",
                    status_code=409
                )
            raise AppError(
                message=f"Database integrity error: {str(e)}",
                type="INTERNAL_ERROR",
                status_code=500
            )
        except sqlalchemy.exc.SQLAlchemyError as e:
            raise AppError(
                message=f"Database error: {str(e)}",
                type="INTERNAL_ERROR",
                status_code=500
            )
```

## Error Logging

Implement comprehensive error logging:

```python
import logging
import json
from datetime import datetime

logger = logging.getLogger("api")

class ErrorLogger:
    @staticmethod
    async def log_error(request: Request, error, status_code: int):
        error_data = {
            "timestamp": datetime.now().isoformat(),
            "path": request.url.path,
            "method": request.method,
            "status_code": status_code,
            "error_type": getattr(error, "type", "UNKNOWN"),
            "message": str(error),
            "details": getattr(error, "details", None)
        }
        
        # Add request information when possible
        try:
            body = await request.json()
            error_data["request_body"] = body
        except:
            pass
        
        # Add client information
        error_data["client_ip"] = request.client.host
        error_data["user_agent"] = request.headers.get("user-agent")
        
        # Log the error
        logger.error(json.dumps(error_data))
```

## Validation Middleware

Add request validation middleware:

```python
@app.middleware("http")
async def validate_request(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except ValidationError as e:
        details = []
        for error in e.errors():
            field = ".".join(str(loc) for loc in error['loc'])
            details.append({
                "field": field,
                "issue": error['msg']
            })
            
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "type": "VALIDATION_ERROR",
                    "message": "Invalid input data",
                    "details": details
                }
            }
        )
```

## Client Error Handling

Example of error handling in a TypeScript client:

```typescript
interface ApiError {
  error: {
    type: string;
    message: string;
    details?: Array<{
      field: string;
      issue: string;
    }>;
  };
}

async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      
      // Handle specific error types
      switch (errorData.error.type) {
        case 'AUTHENTICATION_ERROR':
          // Redirect to login
          window.location.href = '/login';
          break;
          
        case 'VALIDATION_ERROR':
          // Format validation errors for display
          const formattedErrors = errorData.error.details?.map(detail => 
            `${detail.field}: ${detail.issue}`
          ).join('\n');
          throw new Error(formattedErrors || errorData.error.message);
          
        default:
          throw new Error(errorData.error.message);
      }
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

## Testing Error Responses

Unit tests for error handling:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_validation_error():
    response = client.post(
        "/api/v1/agents",
        json={"role": "researcher"}  # Missing required 'name' field
    )
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["type"] == "VALIDATION_ERROR"
    assert any(detail["field"] == "name" for detail in data["error"]["details"])

def test_not_found_error():
    response = client.get("/api/v1/agents/non-existent-id")
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["type"] == "NOT_FOUND"
    assert data["error"]["message"] == "Agent not found"
```

## Error Documentation

Document possible errors in API endpoints using FastAPI:

```python
from fastapi import APIRouter, HTTPException, Path
from typing import List, Optional

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get(
    "/{agent_id}",
    responses={
        200: {"description": "Successful operation"},
        401: {"description": "Authentication required"},
        404: {"description": "Agent not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_agent(
    agent_id: str = Path(..., description="The unique identifier of the agent")
):
    # Implementation
    pass
```
