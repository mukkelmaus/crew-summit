
# CrewAI Hub

A modern web application for creating, managing, and monitoring AI agent crews.

![CrewAI Hub](public/og-image.png)

## Features

- **Agent Management**: Create and configure AI agents with different roles and capabilities
- **Crew Creation**: Assemble agents into crews for collaborative task execution
- **Task Assignment**: Assign specific tasks to agents and monitor their progress
- **Real-time Monitoring**: Track crew performance and agent status
- **Dark/Light Mode**: Support for different visual themes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React hooks and context
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/crewai-hub.git
   cd crewai-hub
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
VITE_APP_NAME=CrewAI Hub
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
3. Fill in the required details:
   - Name
   - Role (researcher, writer, analyst, etc.)
   - Description
   - LLM model
   - Tools

### Creating a Crew

1. Navigate to the Crews section
2. Click "New Crew"
3. Fill in the crew details
4. Add agents to your crew
5. Configure task execution strategy

### Managing Tasks

1. Select a crew
2. Add tasks with descriptions
3. Assign tasks to specific agents
4. Monitor task status and outputs

## Deployment

### Building for Production

```bash
npm run build
```

This creates optimized production files in the `dist` directory.

### Deployment Options

#### Static Hosting Services

Deploy to services like Netlify, Vercel, or GitHub Pages.

Example for Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Docker Deployment

Create a `Dockerfile` and deploy as a containerized application.

#### Self-hosted Server

Configure a web server like Nginx to serve the static files.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

For questions or support, please open an issue on the GitHub repository.
