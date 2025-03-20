
# API Setup Instructions

This document provides detailed instructions for setting up and configuring the CrewSUMMIT API.

## Prerequisites

- Python 3.8+
- pip (Python package installer)
- CrewAI framework
- Virtual environment tool (venv or conda)

## Installation

### 1. Create a Virtual Environment

It's recommended to use a virtual environment to isolate dependencies:

```bash
# Using venv
python -m venv venv

# Activate the environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Required Packages

```bash
pip install fastapi uvicorn pydantic crewai python-dotenv sqlalchemy
```

For development, add testing dependencies:

```bash
pip install pytest pytest-asyncio httpx
```

### 3. Create Environment Configuration

Create a `.env` file in the project root with the following variables:

```
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Security
SECRET_KEY=your_secret_key_here

# Database (if using)
DATABASE_URL=sqlite:///./crewsummit.db

# LLM Configuration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

For production, update these settings accordingly:

```
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your_production_secret_key
DATABASE_URL=postgresql://user:password@localhost/crewsummit
```

### 4. Generate Requirements File

After installing all dependencies, generate a requirements file:

```bash
pip freeze > requirements.txt
```

## Running the API

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The `--reload` flag enables auto-reloading when code changes are detected.

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

For production, consider using Gunicorn as a process manager:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## API Documentation

Once the API is running, automatic documentation is available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Setup

### SQLite (Development)

SQLite is configured by default for development. No additional setup is required.

### PostgreSQL (Production)

For PostgreSQL:

1. Install PostgreSQL and create a database:
   ```bash
   createdb crewsummit
   ```

2. Update the `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost/crewsummit
   ```

## Testing

Run tests with pytest:

```bash
pytest
```

For test coverage:

```bash
pytest --cov=app tests/
```

## Troubleshooting

### Common Issues

1. **Environment Variables**:
   If you encounter errors related to missing environment variables, check that your `.env` file is properly configured and loaded.

2. **Database Connection**:
   For database connection issues, verify the database URL and credentials. Ensure the database server is running.

3. **Port Already in Use**:
   If the port is already in use, either stop the existing process or change the port in your `.env` file.

4. **Dependencies**:
   If you encounter missing dependencies, make sure you've activated your virtual environment and installed all required packages.

### Logs

Check the API logs for detailed error information. Adjust the log level in `main.py` if needed:

```python
import logging

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```
