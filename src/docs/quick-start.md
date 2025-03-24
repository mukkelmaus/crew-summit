
# CrewSUMMIT Quick Start Guide

This guide will help you get CrewSUMMIT up and running in the fastest way possible.

## 5-Minute Setup

### Prerequisites

- Node.js 16+ and npm 7+
- A modern web browser

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/crewsummit.git

# Navigate to project directory
cd crewsummit

# Install dependencies
npm install

# Start the development server
npm run dev
```

Your CrewSUMMIT instance will be running at http://localhost:5173

## Essential Configuration

Create a `.env` file in the project root with these minimum required settings:

```
VITE_OPENAI_API_KEY=your_openai_api_key
```

## First Steps (2-Minute Tour)

### 1. Create Your First Agent (30 seconds)

1. Go to **Agents** tab
2. Click **New Agent**
3. Enter:
   - Name: "Researcher"
   - Role: "Researcher"
   - Select OpenAI as the LLM
4. Click **Create**

### 2. Create Your First Crew (30 seconds)

1. Go to **Crews** tab
2. Click **New Crew**
3. Enter:
   - Name: "Research Team"
   - Add your "Researcher" agent
4. Click **Create**

### 3. Build a Simple Flow (60 seconds)

1. Go to **Flows** tab
2. Click **New Flow**
3. Drag an agent node from the sidebar
4. Select your "Researcher" agent
5. Add a task node and connect it to the agent
6. Enter a simple task: "Research quantum computing basics"
7. Click **Save**

## Run Your First Job

1. Select your flow
2. Click **Run**
3. Watch the execution in real-time in the **Monitoring** tab

## Next Steps

- Explore more complex flows with multiple agents
- Check out [Complete Documentation](./README.md) for advanced features
- See [API Documentation](./api/index.md) for integration options

## Troubleshooting

If you encounter any issues:

1. Check the **Console** for any errors
2. Ensure your API keys are correctly set in `.env`
3. Verify network connectivity for API calls
4. See [Troubleshooting](./troubleshooting.md) for common issues
