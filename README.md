
# CrewSUMMIT

A comprehensive system for unified management, monitoring, integration & tasks for AI agent crews.

![CrewSUMMIT Dashboard](public/placeholder.svg)

## Overview

CrewSUMMIT is a modern web application designed for creating, managing, and monitoring AI agent crews. It provides a robust platform for AI orchestration, enabling users to define agents with specific roles, assemble them into collaborative crews, assign tasks, and monitor their real-time execution.

## Features

- **Agent Management**: Create and configure AI agents with customizable roles and capabilities
- **Crew Creation**: Assemble agents into crews for collaborative task execution
- **Task Assignment**: Define and assign specific tasks to agents with detailed descriptions
- **Real-time Monitoring**: Track crew performance and agent status through an intuitive dashboard
- **Flow Visualization**: Design and visualize agent interaction flows with an interactive editor
- **Dark/Light Mode**: User-friendly interface with theme support
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Robust Error Handling**: Comprehensive error capturing and reporting system

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **State Management**: React Query, Context API
- **Visualization**: XY Flow for flow diagrams
- **Testing**: Vitest, React Testing Library
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/crewsummit.git
   cd crewsummit
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
# App Configuration
VITE_APP_NAME=CrewSUMMIT
VITE_APP_URL=http://localhost:5173

# LLM API Configurations
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional configurations
VITE_STORAGE_TYPE=local
```

## Usage

### Creating an Agent

1. Navigate to the Agents section
2. Click "New Agent"
3. Configure the agent with:
   - Name and description
   - Role (researcher, writer, analyst, etc.)
   - LLM model selection
   - Available tools and capabilities

### Creating a Crew

1. Navigate to the Crews section
2. Click "New Crew"
3. Define crew details and purpose
4. Add agents to your crew
5. Configure execution strategy and parameters

### Managing Flows

1. Access the Flow Editor
2. Create nodes representing agents or processes
3. Connect nodes to establish workflows
4. Configure event triggers and conditions
5. Test and monitor flow execution

## Testing

Run the test suite to ensure everything is working correctly:

```bash
npm test
```

For development with continuous test running:

```bash
npm run test:watch
```

Generate test coverage reports:

```bash
npm run test:coverage
```

## Documentation

For comprehensive documentation, please refer to the `/docs` directory:

- [Getting Started](./src/docs/getting-started.md)
- [User Guide](./src/docs/user-guide.md)
- [Developer Guide](./src/docs/developer-guide.md)
- [API Reference](./src/docs/api-reference.md)
- [Architecture Overview](./src/docs/architecture.md)
- [Testing Guide](./src/docs/testing-guide.md)
- [Troubleshooting](./src/docs/troubleshooting.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- [CrewAI](https://github.com/joaomdmoura/crewAI) - Framework for orchestrating role-playing autonomous AI agents
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [XY Flow](https://reactflow.dev/) - Library for building node-based editors and interactive diagrams
