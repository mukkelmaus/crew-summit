
# CrewSUMMIT Testing Guide

This guide outlines the testing strategy and practices for the CrewSUMMIT application, providing developers with guidance on how to implement and run tests.

## Testing Philosophy

The CrewSUMMIT testing approach is based on the following principles:

1. **Tests as Documentation**: Tests should serve as living documentation of the system's behavior.
2. **Fast Feedback**: The test suite should run quickly to provide developers with immediate feedback.
3. **Coverage Balance**: Aim for appropriate coverage without over-testing.
4. **Maintainability**: Tests should be easy to understand and maintain.
5. **Confidence**: The test suite should give developers confidence to make changes.

## Testing Stack

CrewSUMMIT uses the following testing technologies:

- **Vitest**: As the test runner and assertion library
- **React Testing Library**: For testing React components
- **jsdom**: For simulating a browser environment
- **Mock Service Worker (MSW)**: For API mocking (when using external APIs)

## Test Types

### Unit Tests

Unit tests focus on testing individual functions, hooks, or small components in isolation.

**Location**: Files adjacent to the code they test with a `.test.ts` or `.test.tsx` extension.

**Example**:

```tsx
// src/components/ui/alert.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert Component', () => {
  it('renders alert with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-background');
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders destructive variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50');
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests focus on how multiple components or functions work together.

**Location**: Files in a `__tests__` directory near the components being tested.

**Example**:

```tsx
// src/components/__tests__/AgentCreation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AgentCreationForm } from '../AgentCreationForm';
import { saveAgent } from '@/lib/localDatabase';

// Mock dependencies
vi.mock('@/lib/localDatabase', () => ({
  saveAgent: vi.fn().mockResolvedValue({ id: 'test-agent-id' }),
}));

describe('Agent Creation Flow', () => {
  it('creates a new agent when form is submitted with valid data', async () => {
    render(<AgentCreationForm onSuccess={vi.fn()} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Agent' },
    });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'This is a test agent' },
    });
    
    fireEvent.click(screen.getByLabelText(/researcher/i));
    
    fireEvent.click(screen.getByText(/create agent/i));
    
    // Verify saveAgent was called with correct data
    await waitFor(() => {
      expect(saveAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Agent',
          description: 'This is a test agent',
          role: 'researcher',
        })
      );
    });
  });
  
  it('displays validation errors for invalid form submission', async () => {
    render(<AgentCreationForm onSuccess={vi.fn()} />);
    
    // Submit without filling form
    fireEvent.click(screen.getByText(/create agent/i));
    
    // Verify validation errors
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/role is required/i)).toBeInTheDocument();
    
    // Verify saveAgent was not called
    expect(saveAgent).not.toHaveBeenCalled();
  });
});
```

### End-to-End Tests

End-to-end tests verify entire user flows and application behavior from start to finish.

**Location**: Files in the `e2e` directory with a `.spec.ts` extension.

Note: E2E tests require additional setup with a tool like Playwright or Cypress. This guide focuses on unit and integration tests using Vitest.

## Test Setup

### Setup File

The `src/setupTests.ts` file configures the testing environment for all tests:

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(() => ({
    onupgradeneeded: vi.fn(),
    onsuccess: vi.fn(),
    onerror: vi.fn(),
  })),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
});
```

### Test Configuration

The `vitest.config.ts` file configures Vitest:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Writing Tests

### Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it.
2. **Use Descriptive Test Names**: Clear test names help understand failures.
3. **Arrange-Act-Assert Pattern**: Structure tests with setup, action, and verification phases.
4. **Avoid Testing Implementation Details**: Test from the user's perspective.
5. **Isolate Tests**: Tests should be independent and not affect each other.

### Testing React Components

When testing React components, follow these guidelines:

1. **Use React Testing Library**: It encourages testing from a user perspective.
2. **Query by Accessibility Roles**: Use `getByRole` when possible.
3. **Query by Text Content**: Use `getByText` for text visible to users.
4. **Query by Label Text**: Use `getByLabelText` for form elements.
5. **Use `screen`**: The `screen` object provides access to the virtual DOM.

### Example Component Test

```tsx
// src/components/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: 'task-1',
    description: 'Test Task',
    assignedTo: 'agent-1',
    status: 'pending' as const,
    createdAt: '2023-01-01T00:00:00Z',
  };
  
  const mockAgent = {
    id: 'agent-1',
    name: 'Test Agent',
    role: 'researcher' as const,
    description: 'Test agent description',
    status: 'idle' as const,
    llm: 'gpt-4',
    tools: ['web-search'],
  };
  
  it('renders task details correctly', () => {
    render(<TaskCard task={mockTask} agent={mockAgent} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/created/i)).toHaveTextContent('Created: Jan 1, 2023');
  });
  
  it('calls onStatusChange when status is changed', () => {
    const handleStatusChange = vi.fn();
    
    render(
      <TaskCard 
        task={mockTask} 
        agent={mockAgent} 
        onStatusChange={handleStatusChange}
      />
    );
    
    fireEvent.click(screen.getByText(/pending/i));
    fireEvent.click(screen.getByText(/in progress/i));
    
    expect(handleStatusChange).toHaveBeenCalledWith(
      'task-1',
      'in_progress'
    );
  });
});
```

### Testing Custom Hooks

Custom hooks should be tested with React Testing Library's `renderHook`:

```tsx
// src/hooks/useTaskStatus.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTaskStatus } from './useTaskStatus';
import { updateTask } from '@/lib/localDatabase';

// Mock dependencies
vi.mock('@/lib/localDatabase', () => ({
  updateTask: vi.fn().mockResolvedValue({}),
}));

describe('useTaskStatus', () => {
  it('updates task status correctly', async () => {
    const { result } = renderHook(() => useTaskStatus());
    
    await act(async () => {
      await result.current.updateStatus('task-1', 'completed');
    });
    
    expect(updateTask).toHaveBeenCalledWith(
      'tasks',
      expect.objectContaining({
        id: 'task-1',
        status: 'completed',
        completedAt: expect.any(String),
      })
    );
  });
  
  it('handles errors during status update', async () => {
    // Mock error
    vi.mocked(updateTask).mockRejectedValueOnce(new Error('Update failed'));
    
    const { result } = renderHook(() => useTaskStatus());
    
    await act(async () => {
      await expect(
        result.current.updateStatus('task-1', 'completed')
      ).rejects.toThrow('Update failed');
    });
  });
});
```

### Testing Utilities and Helper Functions

Pure utility functions can be tested directly:

```tsx
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, generateId, groupBy } from './utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-01-15T12:30:45Z');
      expect(formatDate(date)).toBe('Jan 15, 2023');
    });
    
    it('handles invalid dates', () => {
      expect(formatDate(null)).toBe('Invalid date');
      expect(formatDate(undefined)).toBe('Invalid date');
      expect(formatDate(new Date('invalid'))).toBe('Invalid date');
    });
  });
  
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
    
    it('includes prefix in generated ID', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test-/);
    });
  });
  
  describe('groupBy', () => {
    it('groups array items by key', () => {
      const items = [
        { id: 1, category: 'A' },
        { id: 2, category: 'B' },
        { id: 3, category: 'A' },
      ];
      
      const grouped = groupBy(items, 'category');
      
      expect(grouped).toEqual({
        A: [
          { id: 1, category: 'A' },
          { id: 3, category: 'A' },
        ],
        B: [
          { id: 2, category: 'B' },
        ],
      });
    });
    
    it('returns empty object for empty array', () => {
      expect(groupBy([], 'key')).toEqual({});
    });
  });
});
```

### Testing Error Handling

Error handling is a critical aspect to test:

```tsx
// src/lib/errorHandler.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AppError, ErrorType, handleError } from './errorHandler';
import { toast } from '@/hooks/use-toast';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('Error Handling', () => {
  describe('AppError', () => {
    it('creates error with correct properties', () => {
      const error = new AppError(
        'Test error message',
        ErrorType.API,
        { originalData: 'test' }
      );
      
      expect(error.message).toBe('Test error message');
      expect(error.type).toBe(ErrorType.API);
      expect(error.originalError).toEqual({ originalData: 'test' });
    });
  });
  
  describe('handleError', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    
    it('converts generic error to AppError', () => {
      const error = new Error('Generic error');
      const appError = handleError(error, false);
      
      expect(appError).toBeInstanceOf(AppError);
      expect(appError.message).toBe('Generic error');
      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.originalError).toBe(error);
    });
    
    it('correctly identifies network errors', () => {
      const networkError = new TypeError('Network request failed');
      const appError = handleError(networkError, false);
      
      expect(appError.type).toBe(ErrorType.NETWORK);
    });
    
    it('shows toast when showToast is true', () => {
      const error = new Error('Toast error');
      handleError(error, true);
      
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: ErrorType.UNKNOWN,
          description: 'Toast error',
          variant: 'destructive'
        })
      );
    });
    
    it('does not show toast when showToast is false', () => {
      const error = new Error('No toast error');
      handleError(error, false);
      
      expect(toast).not.toHaveBeenCalled();
    });
  });
});
```

## Mocking

### Mocking Functions and Modules

Use Vitest's mocking capabilities:

```tsx
// Basic function mock
const mockFunction = vi.fn().mockReturnValue('mocked result');

// Module mock
vi.mock('@/lib/localDatabase', () => ({
  saveAgent: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  getAgents: vi.fn().mockResolvedValue([]),
}));
```

### Mocking Components

For complex components, create simplified mock versions:

```tsx
// src/__mocks__/FlowEditor.tsx
import React from 'react';

// Simple mock that just renders a placeholder
const MockFlowEditor = ({ flowId }: { flowId: string }) => (
  <div data-testid="mock-flow-editor">
    Mock Flow Editor: {flowId}
  </div>
);

export default MockFlowEditor;

// In test file:
vi.mock('@/components/FlowEditor', () => ({
  default: ({ flowId }: { flowId: string }) => (
    <div data-testid="mock-flow-editor">Mock Flow Editor: {flowId}</div>
  ),
}));
```

### Mocking Browser APIs

Mock browser APIs in `setupTests.ts` or in individual tests:

```typescript
// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({ data: 'mocked data' }),
});
```

## Test Coverage

### Measuring Coverage

Run tests with coverage reporting:

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage` directory.

### Coverage Goals

Aim for these coverage targets:
- **Overall Coverage**: 80%+
- **Critical Business Logic**: 90%+
- **UI Components**: 75%+
- **Utility Functions**: 85%+

Focus on covering:
1. Happy paths (expected behavior)
2. Error handling
3. Edge cases
4. Business-critical functionality

## Testing Asynchronous Code

When testing asynchronous code, use `async/await` with `waitFor`:

```tsx
it('loads data asynchronously', async () => {
  render(<AsyncComponent />);
  
  // Initial loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Data Loaded')).toBeInTheDocument();
  });
  
  // Verify content
  expect(screen.getByText('Item 1')).toBeInTheDocument();
});
```

## Debugging Tests

### Console Output

Use `console.log` or `console.debug` for temporary debugging:

```typescript
it('debug this test', () => {
  const result = someFunction();
  console.log('Result:', result);
  expect(result).toBe(expected);
});
```

### Screen Debug

Use React Testing Library's `screen.debug()` to see the current state of the DOM:

```typescript
it('should render correctly', () => {
  render(<MyComponent />);
  screen.debug(); // Prints the current DOM structure
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## Continuous Integration

### GitHub Actions Workflow

Create a GitHub Actions workflow for running tests on every push and pull request:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Run tests with coverage
      run: npm run test:coverage
    - name: Upload coverage report
      uses: codecov/codecov-action@v3
```

## Running Tests

### Test Commands

Add these scripts to your `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
}
```

### Running Specific Tests

To run specific tests:

```bash
# Run tests in a specific file
npm test -- src/components/Button.test.tsx

# Run tests matching a pattern
npm test -- -t "renders correctly"
```

## Test Documentation

### Component Test Template

Use this template for component tests:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Test data setup
  const defaultProps = {
    // Default props
  };
  
  // Helper function for common render logic
  const renderComponent = (props = {}) => {
    return render(<ComponentName {...defaultProps} {...props} />);
  };
  
  it('renders correctly with default props', () => {
    renderComponent();
    // Assertions
  });
  
  it('handles user interaction', () => {
    const handleClick = vi.fn();
    renderComponent({ onClick: handleClick });
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalled();
  });
  
  // More tests...
});
```

### Hook Test Template

Use this template for hook tests:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHookName } from './useHookName';

describe('useHookName', () => {
  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current.value).toBe(initialValue);
  });
  
  it('updates state correctly', () => {
    const { result } = renderHook(() => useHookName());
    
    act(() => {
      result.current.update('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
  
  // More tests...
});
```

## Common Testing Patterns

### Form Testing

```tsx
it('submits form with valid data', async () => {
  const handleSubmit = vi.fn();
  render(<MyForm onSubmit={handleSubmit} />);
  
  // Fill out form
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'John Doe' },
  });
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'john@example.com' },
  });
  
  // Submit form
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  // Verify submission
  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

### Modal Testing

```tsx
it('opens and closes modal', () => {
  render(<ModalExample />);
  
  // Modal should be closed initially
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  
  // Open modal
  fireEvent.click(screen.getByRole('button', { name: /open modal/i }));
  
  // Modal should be open
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  // Close modal
  fireEvent.click(screen.getByRole('button', { name: /close/i }));
  
  // Modal should be closed again
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### Context Provider Testing

```tsx
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <UserProvider>
      {children}
    </UserProvider>
  </ThemeProvider>
);

it('component uses context correctly', () => {
  render(
    <ComponentUsingContext />,
    { wrapper: TestWrapper }
  );
  
  // Test assertions
});
```

## Conclusion

Following this testing guide will help ensure the CrewSUMMIT application remains robust, maintainable, and reliable. Consistent testing practices across the team will lead to a higher quality product with fewer bugs and regressions.

Remember that tests are an investment in the future maintainability and reliability of the codebase. They may take time to write initially, but they save much more time in the long run by preventing bugs and making refactoring safer.
