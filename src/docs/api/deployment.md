
# API Deployment Guide

This document provides instructions for deploying the CrewSUMMIT API to various environments.

## Deployment Options

The CrewSUMMIT API can be deployed in several ways:

1. **Traditional Server**: Deploy to a virtual machine or bare-metal server
2. **Docker**: Containerize the application
3. **Kubernetes**: Deploy as a Kubernetes service
4. **Serverless**: Deploy to a serverless platform
5. **PaaS**: Deploy to a Platform-as-a-Service provider

## Prerequisites

Regardless of deployment method, ensure you have:

- Python 3.8+ installed
- Required dependencies in requirements.txt
- Environment variables configured
- Database setup and configured

## Docker Deployment

### Dockerfile

Create a Dockerfile in the project root:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Set environment variables
ENV API_HOST=0.0.0.0
ENV API_PORT=8000
ENV DEBUG=false

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

For local development with Docker, create a docker-compose.yml file:

```yaml
version: '3'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - API_HOST=0.0.0.0
      - API_PORT=8000
      - DEBUG=true
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/crewsummit
      - SECRET_KEY=development-secret-key
    depends_on:
      - db
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=crewsummit
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Building and Running with Docker

```bash
# Build the Docker image
docker build -t crewsummit-api .

# Run the container
docker run -p 8000:8000 -e SECRET_KEY=your-secret-key crewsummit-api

# Using Docker Compose
docker-compose up -d
```

## Traditional Server Deployment

### Gunicorn with Uvicorn Workers

For production deployment on a traditional server, use Gunicorn with Uvicorn workers:

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Systemd Service

Create a systemd service file:

```ini
[Unit]
Description=CrewSUMMIT API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/crewsummit-api
Environment="PATH=/path/to/venv/bin"
Environment="DATABASE_URL=postgresql://user:password@localhost/crewsummit"
Environment="SECRET_KEY=your-secret-key"
Environment="DEBUG=false"
ExecStart=/path/to/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable crewsummit-api
sudo systemctl start crewsummit-api
```

### Nginx Configuration

Use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name api.crewsummit.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS with Let's Encrypt:

```bash
sudo certbot --nginx -d api.crewsummit.com
```

## Kubernetes Deployment

### Kubernetes Manifests

Create Kubernetes deployment manifests:

#### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crewsummit-api
  namespace: crewsummit
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crewsummit-api
  template:
    metadata:
      labels:
        app: crewsummit-api
    spec:
      containers:
      - name: api
        image: crewsummit/api:latest
        ports:
        - containerPort: 8000
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "500m"
            memory: "256Mi"
        env:
        - name: API_HOST
          value: "0.0.0.0"
        - name: API_PORT
          value: "8000"
        - name: DEBUG
          value: "false"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: crewsummit-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: crewsummit-secrets
              key: secret-key
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 20
```

#### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: crewsummit-api
  namespace: crewsummit
spec:
  selector:
    app: crewsummit-api
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

#### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: crewsummit-api
  namespace: crewsummit
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  rules:
  - host: api.crewsummit.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: crewsummit-api
            port:
              number: 80
  tls:
  - hosts:
    - api.crewsummit.com
    secretName: crewsummit-api-tls
```

#### Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: crewsummit-secrets
  namespace: crewsummit
type: Opaque
data:
  database-url: <base64-encoded-db-url>
  secret-key: <base64-encoded-secret-key>
```

### Applying Kubernetes Manifests

```bash
# Create namespace
kubectl create namespace crewsummit

# Apply secrets
kubectl apply -f k8s/secrets.yaml

# Apply deployment, service, and ingress
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## Serverless Deployment

### AWS Lambda with API Gateway

#### Requirements

Install the Mangum adapter for AWS Lambda:

```bash
pip install mangum
```

#### Update Main Application

```python
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

# ... API routes and configuration ...

# Lambda handler
handler = Mangum(app)
```

#### Serverless Framework Configuration

Create a serverless.yml file:

```yaml
service: crewsummit-api

provider:
  name: aws
  runtime: python3.9
  region: us-east-1
  environment:
    DATABASE_URL: ${ssm:/crewsummit/database-url}
    SECRET_KEY: ${ssm:/crewsummit/secret-key}
    DEBUG: false

functions:
  api:
    handler: app.main.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
      - http:
          path: /
          method: ANY
    timeout: 30
    memorySize: 512

plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true
```

#### Deploy with Serverless Framework

```bash
# Install Serverless Framework
npm install -g serverless

# Install plugins
npm install serverless-python-requirements

# Deploy
serverless deploy
```

## Platform-as-a-Service (PaaS) Deployment

### Heroku Deployment

#### Procfile

Create a Procfile in the project root:

```
web: uvicorn app.main:app --host=0.0.0.0 --port=${PORT:-8000}
```

#### runtime.txt

Specify the Python version:

```
python-3.9.7
```

#### Deploy to Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create a Heroku app
heroku create crewsummit-api

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=false

# Add a PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev

# Deploy to Heroku
git push heroku main
```

## Scaling Considerations

### Horizontal Scaling

For high-availability and load balancing:

1. **Stateless Design**: Ensure the API is stateless
2. **Connection Pooling**: Implement database connection pooling
3. **Caching**: Use Redis or Memcached for caching
4. **Load Balancing**: Configure load balancers for multiple instances

### Database Scaling

For database performance:

1. **Read Replicas**: Set up read replicas for read-heavy workloads
2. **Connection Pooling**: Use PgBouncer for PostgreSQL
3. **Query Optimization**: Index and optimize database queries
4. **Sharding**: Consider sharding for very large datasets

## Monitoring and Logging

### Prometheus and Grafana

Setup metrics monitoring:

```python
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

# Setup Prometheus metrics
Instrumentator().instrument(app).expose(app)
```

### Logging Configuration

Setup structured logging:

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        if hasattr(record, 'request_id'):
            log_record["request_id"] = record.request_id
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    logger = logging.getLogger("api")
    logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)
    
    # File handler
    file_handler = logging.FileHandler("api.log")
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)
    
    return logger

logger = setup_logging()
```

## Backup and Disaster Recovery

### Database Backups

Schedule regular database backups:

```bash
# PostgreSQL backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_NAME="crewsummit"
DB_USER="postgres"

# Create backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME\_$TIMESTAMP.sql.gz

# Rotate backups (keep last 30 days)
find $BACKUP_DIR -name "$DB_NAME*.sql.gz" -mtime +30 -delete
```

### Continuous Integration/Continuous Deployment (CI/CD)

Example GitHub Actions workflow:

```yaml
name: Deploy API

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run tests
        run: |
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1
      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          push: true
          tags: crewsummit/api:latest
      - name: Deploy to Kubernetes
        uses: actions-hub/kubectl@master
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
        with:
          args: rollout restart deployment crewsummit-api -n crewsummit
```
