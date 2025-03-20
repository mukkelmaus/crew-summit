
# CrewAI Integration

This document details how to integrate the CrewSUMMIT API with the CrewAI framework.

## Overview

CrewAI is a framework for orchestrating role-playing autonomous AI agents. The CrewSUMMIT API serves as a bridge between the frontend application and CrewAI, providing:

1. Conversion between API data models and CrewAI objects
2. Execution of CrewAI processes
3. Result processing and storage
4. Real-time status updates

## CrewAI Dependencies

First, ensure the CrewAI framework is installed:

```bash
pip install crewai
```

Depending on your LLM choices, you may also need:

```bash
pip install openai langchain langchain-openai anthropic
```

## Creating CrewAI Agents

Convert API Agent models to CrewAI Agent objects:

```python
from crewai import Agent as CrewAIAgent
from typing import List
import openai
from anthropic import Anthropic

def get_llm_for_agent(llm_name: str):
    """Get the appropriate LLM based on the agent configuration."""
    if llm_name.startswith('gpt'):
        return openai.ChatCompletion.create
    elif llm_name.startswith('claude'):
        client = Anthropic()
        return client.completions.create
    else:
        raise ValueError(f"Unsupported LLM: {llm_name}")
    
def get_tools_for_agent(tool_names: List[str]):
    """Load tools based on their names."""
    tools = []
    for tool_name in tool_names:
        if tool_name == 'web-search':
            from crewai_tools import WebSearchTool
            tools.append(WebSearchTool())
        elif tool_name == 'document-analysis':
            from crewai_tools import DocumentAnalysisTool
            tools.append(DocumentAnalysisTool())
        # Add more tool mappings as needed
    return tools

def create_crewai_agent(agent):
    """Convert an API Agent model to a CrewAI Agent."""
    return CrewAIAgent(
        name=agent.name,
        role=agent.role.value,
        goal=agent.description,
        backstory=f"You are a specialized {agent.role.value} with expertise in your domain.",
        verbose=True,
        llm=get_llm_for_agent(agent.llm),
        tools=get_tools_for_agent(agent.tools)
    )
```

## Creating CrewAI Tasks

Convert API Task models to CrewAI Task objects:

```python
from crewai import Task as CrewAITask

def create_crewai_task(task, agent):
    """Convert an API Task model to a CrewAI Task."""
    return CrewAITask(
        description=task.description,
        agent=agent,
        expected_output="Detailed results of the task",
        async_execution=False
    )
```

## Creating CrewAI Crews

Assemble agents and tasks into a CrewAI Crew:

```python
from crewai import Crew as CrewAICrew

def create_crewai_crew(crew, agents, tasks):
    """Create a CrewAI Crew from API models."""
    crewai_agents = [create_crewai_agent(agent) for agent in agents]
    crewai_tasks = []
    
    # Map tasks to the correct agents
    for task in tasks:
        agent = next((a for a in agents if str(a.id) == str(task.assigned_to)), None)
        if agent:
            crewai_agent = next((ca for ca in crewai_agents if ca.name == agent.name), None)
            if crewai_agent:
                crewai_tasks.append(create_crewai_task(task, crewai_agent))
    
    return CrewAICrew(
        agents=crewai_agents,
        tasks=crewai_tasks,
        verbose=crew.config.verbose,
        process=crew.config.task_execution_strategy.value,
        manager_llm=get_llm_for_agent("gpt-4")  # Manager LLM can be configurable
    )
```

## Executing CrewAI Processes

Run CrewAI crews and handle results:

```python
async def execute_crew(crew_id, run_id):
    """Execute a CrewAI crew asynchronously."""
    try:
        # 1. Retrieve crew, agents, and tasks from the database
        crew = await get_crew(crew_id)
        agents = await get_agents_for_crew(crew)
        tasks = await get_tasks_for_crew(crew)
        
        # 2. Update status to running
        await update_crew_status(crew_id, "running")
        await create_run_log(run_id, "Starting crew execution")
        
        # 3. Create CrewAI objects
        crewai_crew = create_crewai_crew(crew, agents, tasks)
        
        # 4. Execute the crew
        result = crewai_crew.kickoff()
        
        # 5. Process results
        await update_task_outputs(tasks, result)
        await update_crew_status(crew_id, "completed")
        await update_run_status(run_id, "completed", result)
        
        return result
        
    except Exception as e:
        # Handle errors
        await update_crew_status(crew_id, "error")
        await update_run_status(run_id, "failed", str(e))
        await create_run_log(run_id, f"Error: {str(e)}")
        raise
```

## Handling CrewAI Callbacks

Monitor and react to CrewAI events:

```python
from crewai.callbacks import BaseCallback

class APICallback(BaseCallback):
    """Callback handler for CrewAI events."""
    
    def __init__(self, run_id):
        self.run_id = run_id
        
    async def on_task_start(self, agent, task):
        await create_run_log(
            self.run_id,
            f"Agent '{agent.name}' starting task: {task.description}"
        )
        
    async def on_task_end(self, agent, task, output):
        await create_run_log(
            self.run_id,
            f"Agent '{agent.name}' completed task: {task.description}"
        )
        
    async def on_agent_action(self, agent, action, input_data):
        await create_run_log(
            self.run_id,
            f"Agent '{agent.name}' performing action: {action}"
        )
        
    async def on_chain_start(self, agent, chain):
        await create_run_log(
            self.run_id,
            f"Agent '{agent.name}' starting chain: {chain}"
        )
        
    async def on_agent_stream(self, agent, token):
        # For real-time streaming, consider using WebSockets
        pass
```

## Integration with API Endpoints

Implement API endpoints that utilize the CrewAI integration:

```python
from fastapi import APIRouter, HTTPException, BackgroundTasks
from uuid import UUID, uuid4
from datetime import datetime

router = APIRouter(prefix="/crews", tags=["crews"])

@router.post("/{crew_id}/run")
async def run_crew(
    crew_id: UUID,
    background_tasks: BackgroundTasks
):
    # Check if crew exists
    crew = await get_crew(crew_id)
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    
    # Check if crew is already running
    if crew.status == "running":
        raise HTTPException(status_code=409, detail="Crew is already running")
    
    # Create a run record
    run_id = uuid4()
    run = {
        "id": run_id,
        "crew_id": crew_id,
        "flow_id": None,
        "status": "starting",
        "started_at": datetime.now(),
        "completed_at": None,
        "duration_seconds": None,
        "result": None,
        "logs": []
    }
    await create_run(run)
    
    # Execute crew in background
    background_tasks.add_task(execute_crew, crew_id, run_id)
    
    # Return immediate response
    return {
        "data": {
            "id": crew_id,
            "status": "running",
            "run_id": run_id
        }
    }
```

## Flow Execution

For more complex workflows using the Flow model:

```python
async def execute_flow(flow_id, run_id):
    """Execute a flow with multiple agents and tasks."""
    flow = await get_flow(flow_id)
    crew = await get_crew(flow.crew_id)
    
    # Update statuses
    await update_flow_status(flow_id, "running")
    await create_run_log(run_id, "Starting flow execution")
    
    try:
        # Create a graph of tasks based on flow nodes and edges
        task_graph = build_task_graph(flow)
        
        # Execute tasks in the correct order
        results = await execute_task_graph(task_graph, crew, run_id)
        
        # Process results
        await update_flow_status(flow_id, "completed")
        await update_run_status(run_id, "completed", results)
        
        return results
        
    except Exception as e:
        await update_flow_status(flow_id, "error")
        await update_run_status(run_id, "failed", str(e))
        await create_run_log(run_id, f"Error: {str(e)}")
        raise
```

## Human-in-the-Loop Integration

For flows with human intervention points:

```python
async def execute_task_with_human_approval(task, agent, run_id):
    """Execute a task that requires human approval."""
    # Create a human intervention record
    intervention_id = uuid4()
    intervention = {
        "id": intervention_id,
        "run_id": run_id,
        "type": "approval",
        "status": "pending",
        "task_description": task.description,
        "created_at": datetime.now()
    }
    await create_human_intervention(intervention)
    
    # Wait for human approval
    await create_run_log(run_id, f"Waiting for human approval: {task.description}")
    
    # In a real implementation, this would wait for an API call to approve
    # For demonstration, we'll use a polling approach
    approved = False
    while not approved:
        intervention = await get_human_intervention(intervention_id)
        if intervention.status == "approved":
            approved = True
        elif intervention.status == "rejected":
            raise Exception("Task rejected by human")
        await asyncio.sleep(5)  # Poll every 5 seconds
    
    # Execute the task after approval
    await create_run_log(run_id, f"Human approved task: {task.description}")
    return await execute_task(task, agent, run_id)
```

## Testing CrewAI Integration

For testing, use a mock implementation of CrewAI:

```python
class MockCrewAIAgent:
    def __init__(self, name, role, goal, **kwargs):
        self.name = name
        self.role = role
        self.goal = goal

class MockCrewAITask:
    def __init__(self, description, agent, **kwargs):
        self.description = description
        self.agent = agent

class MockCrewAICrew:
    def __init__(self, agents, tasks, **kwargs):
        self.agents = agents
        self.tasks = tasks
    
    def kickoff(self):
        # Simulate task execution
        results = {}
        for task in self.tasks:
            results[task.description] = f"Mock result for {task.description} by {task.agent.name}"
        return results

# Replace actual implementation with mocks for testing
def create_test_crewai_agent(agent):
    return MockCrewAIAgent(
        name=agent.name,
        role=agent.role.value,
        goal=agent.description
    )

def create_test_crewai_task(task, agent):
    return MockCrewAITask(
        description=task.description,
        agent=agent
    )

def create_test_crewai_crew(crew, agents, tasks):
    crewai_agents = [create_test_crewai_agent(agent) for agent in agents]
    crewai_tasks = []
    
    for task in tasks:
        agent = next((a for a in agents if str(a.id) == str(task.assigned_to)), None)
        if agent:
            crewai_agent = next((ca for ca in crewai_agents if ca.name == agent.name), None)
            if crewai_agent:
                crewai_tasks.append(create_test_crewai_task(task, crewai_agent))
    
    return MockCrewAICrew(
        agents=crewai_agents,
        tasks=crewai_tasks
    )
```

## Advanced CrewAI Integration

For more advanced scenarios, consider these features:

### Agent Memory

```python
from langchain.memory import ConversationBufferMemory

def create_agent_with_memory(agent):
    memory = None
    if agent.memory == "short-term":
        memory = ConversationBufferMemory(return_messages=True)
    elif agent.memory == "long-term":
        # Implement more sophisticated memory
        pass
        
    return CrewAIAgent(
        name=agent.name,
        role=agent.role.value,
        goal=agent.description,
        backstory=f"You are a specialized {agent.role.value} with expertise in your domain.",
        verbose=True,
        llm=get_llm_for_agent(agent.llm),
        tools=get_tools_for_agent(agent.tools),
        memory=memory
    )
```

### Custom Tools

```python
from langchain.tools import BaseTool
from typing import Type

class CustomTool(BaseTool):
    name = "custom_tool"
    description = "A custom tool for specific operations"
    
    def _run(self, query: str) -> str:
        # Implement tool logic
        return f"Result for {query}"
        
    async def _arun(self, query: str) -> str:
        # Async implementation
        return self._run(query)

def register_custom_tool(name: str, description: str, implementation: Type[BaseTool]):
    """Register a custom tool for use with agents."""
    # In a real implementation, this would store the tool in a registry
    pass
```

## Performance Considerations

When implementing CrewAI integration, consider these performance aspects:

1. **Asynchronous Execution**: Use background tasks for long-running operations
2. **Caching**: Cache LLM responses when appropriate
3. **Resource Limits**: Implement timeouts and resource constraints
4. **Monitoring**: Log performance metrics for analysis
5. **Scaling**: Consider horizontal scaling for multiple concurrent crew executions
