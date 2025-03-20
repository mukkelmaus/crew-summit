
# Getting Started with CrewSUMMIT

This guide will help you set up and start using CrewSUMMIT for managing AI agent crews.

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

### Development Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crewsummit.git
   cd crewsummit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the project root
   - Add the following variables:
     ```
     VITE_APP_NAME=CrewSUMMIT
     VITE_APP_URL=http://localhost:5173
     VITE_OPENAI_API_KEY=your_openai_api_key
     VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
     VITE_STORAGE_TYPE=local
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

## Quick Start Guide

### Creating Your First Agent

1. Navigate to the Agents section from the dashboard
2. Click "Create New Agent"
3. Fill in the required details:
   - Name: A descriptive name for your agent
   - Role: Select from predefined roles or create a custom one
   - Description: Explain the agent's purpose and capabilities
   - LLM: Choose the language model for this agent
   - Tools: Select the tools this agent can access

4. Click "Create Agent"

### Building Your First Crew

1. Navigate to the Crews section
2. Click "Create New Crew"
3. Provide a name and description for your crew
4. Add agents to your crew by selecting from your existing agents
5. Configure execution parameters:
   - Task execution strategy (sequential or parallel)
   - Maximum iterations
   - Verbose mode (for detailed logging)
6. Click "Create Crew"

### Running Your First Task

1. Select your crew from the Crews dashboard
2. Click "Create Task"
3. Describe the task in detail
4. Assign the task to a specific agent or let the crew manager assign it
5. Click "Run Task" to execute immediately or "Schedule" to run later
6. Monitor the execution in the Flows tab

## Next Steps

- Explore the [User Guide](./user-guide.md) for detailed usage instructions
- Check out [Example Projects](./examples) for inspiration
- Learn about [Advanced Configuration](./advanced-configuration.md) for customizing your setup
