
# CrewSUMMIT API Reference

This document provides a high-level overview of the CrewSUMMIT API. For detailed documentation, please refer to the `src/docs/api` directory.

## API Documentation Structure

The API documentation has been organized into focused sections:

1. [API Overview](src/docs/api/overview.md)
2. [Project Structure](src/docs/api/project-structure.md)
3. [Setup Instructions](src/docs/api/setup-instructions.md)
4. [Core Data Models](src/docs/api/data-models.md)
5. [API Endpoints](src/docs/api/endpoints.md)
6. [CrewAI Integration](src/docs/api/crewai-integration.md)
7. [Error Handling](src/docs/api/error-handling.md)
8. [Authentication](src/docs/api/authentication.md)
9. [Deployment](src/docs/api/deployment.md)
10. [Advanced Features](src/docs/api/advanced-features.md)
11. [Troubleshooting](src/docs/api/troubleshooting.md)

## Overview

The CrewSUMMIT API serves as a bridge between the frontend application and the CrewAI framework implementation. It provides:

1. RESTful endpoints for managing agents, crews, flows, and tasks
2. Data conversion between frontend models and CrewAI objects
3. State persistence and synchronization
4. Real-time updates for monitoring crew operations

## Core Features

- **Agent Management**: Create and configure AI agents with customizable roles and capabilities
- **Crew Orchestration**: Assemble agents into collaborative crews for task execution
- **Task Assignment**: Define and assign specific tasks to agents with detailed descriptions
- **Flow Visualization**: Design and visualize agent interaction flows with an interactive editor
- **Real-time Monitoring**: Track crew performance and agent status through WebSocket connections
- **Authentication**: Secure API access with JWT, API Keys, and OAuth2 integration
- **File Handling**: Upload and process files for AI analysis
- **Internationalization**: Support for multiple languages

## Technology Stack

- **FastAPI**: Modern, high-performance web framework
- **Pydantic**: Data validation and settings management
- **SQLAlchemy**: ORM for database interactions (optional)
- **WebSockets**: For real-time updates
- **CrewAI**: Core framework for AI agent orchestration

## Getting Started

For detailed setup instructions, please refer to the [Setup Instructions](src/docs/api/setup-instructions.md) document.

For a complete list of API endpoints and their usage, see the [API Endpoints](src/docs/api/endpoints.md) document.

## Sample Endpoint Usage

```python
# Example: Creating an agent
import requests

api_url = "https://api.example.com/api/v1"
token = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

agent_data = {
    "name": "Research Assistant",
    "role": "researcher",
    "description": "Performs web research and information gathering",
    "llm": "gpt-4",
    "tools": ["web-search", "document-analysis"],
    "memory": "short-term"
}

response = requests.post(
    f"{api_url}/agents",
    json=agent_data,
    headers=headers
)

if response.status_code == 201:
    agent = response.json()["data"]
    print(f"Created agent: {agent['name']} with ID: {agent['id']}")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```
