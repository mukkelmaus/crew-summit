
# CrewSUMMIT API Documentation

Welcome to the CrewSUMMIT API documentation. This guide provides comprehensive information about the API that powers the CrewSUMMIT platform, enabling the management and orchestration of AI agent crews.

## Documentation Sections

1. [Overview](./overview.md) - High-level introduction to the API architecture
2. [Project Structure](./project-structure.md) - Directory organization and file responsibilities
3. [Setup Instructions](./setup-instructions.md) - Installation and configuration steps
4. [Core Data Models](./data-models.md) - Key data structures used in the API
5. [API Endpoints](./endpoints.md) - Available REST endpoints and their behavior
6. [CrewAI Integration](./crewai-integration.md) - Integration with the CrewAI framework
7. [Error Handling](./error-handling.md) - Error handling patterns and strategies
8. [Authentication](./authentication.md) - Security and access control
9. [Deployment](./deployment.md) - Deployment options and considerations
10. [Advanced Features](./advanced-features.md) - WebSockets, file uploads, and more
11. [Troubleshooting](./troubleshooting.md) - Common issues and their solutions

## Getting Started

If you're new to the CrewSUMMIT API, we recommend starting with the [Overview](./overview.md) and [Setup Instructions](./setup-instructions.md) sections. These will provide a solid foundation for understanding the API architecture and getting your development environment ready.

For developers looking to integrate with the API, the [API Endpoints](./endpoints.md) and [Core Data Models](./data-models.md) sections will be most relevant.

## API Features

The CrewSUMMIT API provides comprehensive functionality for managing AI agent crews:

- **Agent Management** - Create, configure, and monitor AI agents
- **Crew Orchestration** - Assemble agents into crews for collaborative task execution
- **Task Assignment** - Define and assign specific tasks to agents
- **Flow Visualization** - Design and visualize agent interaction flows
- **Real-time Monitoring** - Track crew performance through WebSocket connections
- **Resource Management** - Upload and process files for AI analysis
- **Security** - Robust authentication and authorization mechanisms

## Sample Code

Here's a simple example of how to interact with the API using JavaScript:

```javascript
// Fetch all agents
async function getAgents() {
  const response = await fetch('https://api.crewsummit.com/api/v1/agents', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}

// Create a new agent
async function createAgent(agentData) {
  const response = await fetch('https://api.crewsummit.com/api/v1/agents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(agentData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create agent: ${error.error.message}`);
  }
  
  return await response.json();
}
```

## Contributing

The CrewSUMMIT API is constantly evolving. If you encounter issues or have suggestions for improvement, please submit them to our issue tracker.

## Support

If you need assistance with the API, please check the [Troubleshooting](./troubleshooting.md) section first. If you can't find a solution to your problem, contact our support team at support@crewsummit.com.
