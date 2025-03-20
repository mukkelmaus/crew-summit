# CrewSUMMIT Developer Guide

This guide provides comprehensive information for developers working with the CrewSUMMIT codebase.

## Architecture Overview

CrewSUMMIT is built as a React single-page application with the following key technologies:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context and Hooks
- **Routing**: React Router
- **Data Fetching**: TanStack Query
- **Testing**: Vitest with React Testing Library
- **Local Storage**: IndexedDB (via custom wrapper)

## Project Structure

```
crewsummit/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI components from Shadcn
│   │   └── ...             # Application-specific components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and types
│   ├── pages/              # Top-level page components
│   ├── docs/               # Documentation files
│   ├── setupTests.ts       # Test configuration
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── .env                    # Environment variables
├── vitest.config.ts        # Vitest configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## Core Concepts

### Agents

Agents are the fundamental building blocks of CrewSUMMIT. The `Agent` interface defines their structure:

```typescript
export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  status: AgentStatus;
  llm: string;
  tools: string[];
  memory?: string;
  parentAgentId?: string;
  subordinateAgentIds?: string[];
}
```

Key agent operations are defined in the codebase:
- Creation/modification (see `AgentCard.tsx`)
- Status tracking
- Tool assignment
- Agent hierarchy management

### Crews

Crews are collections of agents organized to accomplish tasks through collaboration:

```typescript
export interface Crew {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  tasks: Task[];
  status: CrewStatus;
  createdAt: string;
  lastRun?: string;
  config: {
    verbose: boolean;
    maxIterations: number;
    taskExecutionStrategy: 'sequential' | 'parallel';
  };
  parentCrewId?: string;
  subCrewIds?: string[];
}
```

The crew orchestration logic handles:
- Agent coordination
- Task distribution
- Execution strategy implementation
- Result aggregation

### Flows

Flows provide a visual workflow representation:

```typescript
export interface Flow {
  id: string;
  name: string;
  description: string;
  crewId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  updatedAt?: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  humanInterventionPoints?: {
    nodeId: string;
    type: 'approval' | 'input';
    status: 'pending' | 'completed';
  }[];
  dataStorage?: {
    type: 'local' | 'external';
    connection?: string;
  };
}
```

The flow system provides:
- Visual workflow editor
- Flow execution engine
- Node and edge management
- Human-in-the-loop integration

## Data Management

### Local Database

The application uses IndexedDB for local storage through a custom wrapper:

```typescript
// Example usage of the local database
import { localDB, saveAgent, getAgents } from '@/lib/localDatabase';

// Saving an agent
const agent = { 
  id: 'agent-1', 
  name: 'Researcher', 
  // ... other properties
};
await saveAgent(agent);

// Retrieving all agents
const agents = await getAgents();
```

Key files:
- `src/lib/localDatabase.ts`: Core database functionality
- `src/lib/types.ts`: Type definitions

### Error Handling

The application implements a comprehensive error handling system:

```typescript
// Example of error handling
import { AppError, ErrorType, handleError } from '@/lib/errorHandler';

try {
  // Risky operation
} catch (error) {
  throw handleError(error, true); // Second parameter controls toast display
}

// Creating a specific error
const error = new AppError('Connection failed', ErrorType.NETWORK);
```

## Component Development

### UI Components

The application uses Shadcn UI for core components. When extending or creating new components:

1. Follow the existing pattern in `src/components/ui/`
2. Use the Shadcn class variance authority approach
3. Ensure components are properly typed with TypeScript
4. Include appropriate accessibility attributes
5. Create tests for all new components

Example of a well-structured component:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    danger: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <Button
      className={cn(variantClasses[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </Button>
  );
};
```

### Testing Components

Use the following pattern for testing components:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  it('renders correctly with default props', () => {
    render(<CustomButton>Click me</CustomButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<CustomButton onClick={handleClick}>Click me</CustomButton>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading state correctly', () => {
    render(<CustomButton isLoading>Click me</CustomButton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## State Management

The application uses React context and hooks for state management:

1. Create context files in `src/contexts/`
2. Use the pattern of separating context definition from provider implementation
3. Create custom hooks to access context state and actions

Example context pattern:

```tsx
// src/contexts/AgentContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { Agent } from '@/lib/types';

type AgentState = {
  agents: Agent[];
  loading: boolean;
  error: Error | null;
};

type AgentAction = 
  | { type: 'FETCH_AGENTS_START' }
  | { type: 'FETCH_AGENTS_SUCCESS', payload: Agent[] }
  | { type: 'FETCH_AGENTS_ERROR', payload: Error }
  | { type: 'ADD_AGENT', payload: Agent }
  | { type: 'UPDATE_AGENT', payload: Agent }
  | { type: 'DELETE_AGENT', payload: string };

const AgentContext = createContext<{
  state: AgentState;
  dispatch: React.Dispatch<AgentAction>;
} | undefined>(undefined);

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case 'FETCH_AGENTS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_AGENTS_SUCCESS':
      return { ...state, agents: action.payload, loading: false };
    case 'FETCH_AGENTS_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_AGENT':
      return { ...state, agents: [...state.agents, action.payload] };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map(agent => 
          agent.id === action.payload.id ? action.payload : agent
        )
      };
    case 'DELETE_AGENT':
      return {
        ...state,
        agents: state.agents.filter(agent => agent.id !== action.payload)
      };
    default:
      return state;
  }
}

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, {
    agents: [],
    loading: false,
    error: null
  });

  return (
    <AgentContext.Provider value={{ state, dispatch }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};
```

## API Integration

For external API integration, follow this pattern:

1. Define API endpoints and types in `src/lib/api.ts`
2. Use TanStack Query for data fetching and caching
3. Handle authentication and error states consistently

Example API integration:

```tsx
// Example API hook with TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Agent } from '@/lib/types';
import { handleError } from '@/lib/errorHandler';

const fetchAgents = async (): Promise<Agent[]> => {
  try {
    const response = await fetch('https://api.example.com/agents');
    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }
    return await response.json();
  } catch (error) {
    throw handleError(error, false);
  }
};

export const useAgentsQuery = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAgent: Omit<Agent, 'id'>) => {
      try {
        const response = await fetch('https://api.example.com/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAgent),
        });
        if (!response.ok) {
          throw new Error('Failed to create agent');
        }
        return await response.json();
      } catch (error) {
        throw handleError(error, false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
```

## Deployment

### Build Process

To build the application for production:

```bash
npm run build
```

This generates optimized files in the `dist` directory.

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, etc.):
   ```bash
   npm run build
   # Deploy the dist folder to your static hosting provider
   ```

2. **Docker Deployment**:
   ```bash
   # Build the Docker image
   docker build -t crewsummit .
   
   # Run the container
   docker run -p 3000:80 crewsummit
   ```

3. **Self-Hosted**:
   - Deploy `dist` to a web server like Nginx
   - Configure proper caching and compression
   - Set up HTTPS

## Performance Optimization

To maintain optimal performance:

1. Use React.memo for expensive component renders
2. Implement virtualization for long lists
3. Optimize large state objects
4. Lazy-load components for code splitting
5. Enable proper caching policies

## Security Considerations

When extending the application:

1. Store sensitive data (API keys) in environment variables
2. Implement proper authentication if connecting to backend services
3. Validate all user inputs
4. Follow OWASP security guidelines
5. Consider implementing Content Security Policy (CSP)

## Contributing

See the [Contributing Guide](./contributing.md) for guidelines on:
- Code style and formatting
- Pull request process
- Testing requirements
- Documentation standards
