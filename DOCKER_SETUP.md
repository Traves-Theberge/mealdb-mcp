# 🐳 Docker Setup Guide for MealDB MCP Server

This guide explains how to set up and run the MealDB MCP Server using Docker containers.

## 📋 Prerequisites

1. **Install Docker Desktop**
   - **Windows**: Download from [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - **macOS**: Download from [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - **Linux**: Follow [Docker Engine installation guide](https://docs.docker.com/engine/install/)

2. **Install Docker Compose** (usually included with Docker Desktop)

3. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

## 🚀 Quick Start

### Option 1: Production Deployment
```bash
# Clone the repository
git clone <your-repo-url>
cd mealdb-mcp

# Start production containers
npm run docker:prod

# Or use docker-compose directly
docker-compose up -d
```

### Option 2: Development Environment
```bash
# Start development with hot reload
npm run docker:dev

# Or use docker-compose directly
docker-compose -f docker-compose.dev.yml up
```

## 📁 Docker Files Overview

### `Dockerfile`
- **Multi-stage build** for optimized production images
- **Builder stage**: Installs dependencies and builds TypeScript
- **Production stage**: Minimal runtime image with only necessary files
- **Security**: Runs as non-root user
- **Health checks**: Built-in container health monitoring

### `docker-compose.yml`
- **Production setup** with optimized containers
- **Port mapping**: Exposes port 3000
- **Health checks**: Monitors container health
- **Networks**: Isolated container networking
- **Restart policy**: Automatic restart on failure

### `docker-compose.dev.yml`
- **Development setup** with hot reload
- **Volume mounting**: Live code changes
- **Debug friendly**: Interactive terminal support

### `.dockerignore`
- Excludes unnecessary files from Docker build context
- Reduces image size and build time
- Improves security by excluding sensitive files

## 🛠️ Available Commands

### NPM Scripts (Recommended)
```bash
npm run docker:build    # Build Docker image
npm run docker:run      # Run container from built image
npm run docker:dev      # Start development environment
npm run docker:prod     # Start production environment
npm run docker:stop     # Stop all containers
npm run docker:logs     # View container logs
npm run docker:clean    # Clean up containers and images
```

### Direct Docker Commands
```bash
# Build image
docker build -t mealdb-mcp-server .

# Run production container
docker run -d -p 3000:3000 --name mealdb-mcp mealdb-mcp-server

# View logs
docker logs -f mealdb-mcp

# Execute shell in container
docker exec -it mealdb-mcp /bin/sh

# Stop and remove container
docker stop mealdb-mcp
docker rm mealdb-mcp
```

### Docker Compose Commands
```bash
# Production
docker-compose up -d                    # Start in background
docker-compose down                     # Stop and remove
docker-compose logs -f                  # Follow logs
docker-compose ps                       # List containers

# Development
docker-compose -f docker-compose.dev.yml up      # Start dev environment
docker-compose -f docker-compose.dev.yml down    # Stop dev environment
```

## 🔧 Configuration

### Environment Variables
Set these in your `docker-compose.yml` or pass to `docker run`:

```bash
NODE_ENV=production     # Environment mode (development/production)
PORT=3000              # Server port
```

### Port Configuration
- **Production**: `localhost:3000`
- **Development**: `localhost:3001`

### Volume Mounts
- **Development**: Source code is mounted for hot reload
- **Production**: Only necessary runtime files included

## 🏗️ Architecture

### Multi-Stage Build Process
1. **Builder Stage**:
   - Uses Node.js 18 Alpine
   - Installs all dependencies
   - Compiles TypeScript to JavaScript
   - Optimizes for build performance

2. **Production Stage**:
   - Uses Node.js 18 Alpine
   - Creates non-root user for security
   - Copies only production dependencies
   - Copies built application from builder stage
   - Minimal attack surface

### Security Features
- **Non-root user**: Container runs as `mcp` user (UID 1001)
- **Minimal base image**: Alpine Linux for reduced attack surface
- **Read-only filesystem**: Application files owned by non-root user
- **Health checks**: Automatic monitoring and restart
- **Network isolation**: Dedicated Docker networks

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use different host port
   ```

2. **Permission denied**
   ```bash
   # On Linux, add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs mealdb-mcp-server
   
   # Check health
   docker inspect mealdb-mcp-server | grep Health
   ```

4. **Development hot reload not working**
   ```bash
   # Ensure volumes are mounted correctly
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Debugging Commands
```bash
# Enter running container
docker exec -it mealdb-mcp-server /bin/sh

# Check container resources
docker stats mealdb-mcp-server

# Inspect container configuration
docker inspect mealdb-mcp-server

# View container processes
docker top mealdb-mcp-server
```

## 🚀 Production Deployment

### Docker Swarm (Single Node)
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mealdb-stack

# List services
docker service ls

# Scale service
docker service scale mealdb-stack_mealdb-mcp-server=3
```

### Kubernetes Deployment
```yaml
# k8s-deployment.yaml (example)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mealdb-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mealdb-mcp-server
  template:
    metadata:
      labels:
        app: mealdb-mcp-server
    spec:
      containers:
      - name: mealdb-mcp-server
        image: mealdb-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

## 📊 Monitoring

### Health Checks
The container includes built-in health checks:
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3 attempts
- **Start period**: 5 seconds

### Logging
```bash
# Follow logs
docker-compose logs -f

# Export logs
docker-compose logs > mealdb-mcp.log

# Log rotation (production)
# Configure in docker-compose.yml:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Or use the npm script
npm run docker:prod
```

### Cleanup
```bash
# Remove unused containers, networks, images
docker system prune -f

# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -f

# Complete cleanup (use with caution)
npm run docker:clean
```

## 📝 Best Practices

1. **Use multi-stage builds** for smaller production images
2. **Run as non-root user** for security
3. **Use .dockerignore** to exclude unnecessary files
4. **Implement health checks** for monitoring
5. **Use specific image tags** instead of `latest` in production
6. **Set resource limits** for containers
7. **Use secrets management** for sensitive data
8. **Regular security updates** of base images

---

**Happy Dockerizing! 🐳** 