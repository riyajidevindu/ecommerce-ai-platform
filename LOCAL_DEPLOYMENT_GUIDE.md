# Local Deployment Guide

This guide provides comprehensive instructions for setting up and running the E-commerce AI Platform locally.

## Overview

The project now focuses exclusively on local development and deployment, with cloud-specific components removed for simplicity. The local deployment supports two main approaches:

1. **Docker Compose**: Quick setup for development
2. **Local Kubernetes**: Production-like environment with Jenkins CI/CD

## Removed Cloud Components

The following files and directories were removed to focus on local deployment:

### Removed Files:
- `terraform.tfstate` - Terraform state file
- `infrastructure/terraform/` - All Terraform cloud infrastructure code
- `k8s/overlays/prod/` - Production Kubernetes overlay for cloud
- `.github/workflows/` - GitHub Actions for cloud CI/CD
- `DEPLOYMENT_GUIDE.md` - AWS EKS deployment guide
- `kubeconfig-jenkins-*.yaml` - Jenkins cloud kubeconfig files
- `kubeconfig-temp.yaml` - Temporary kubeconfig

### Kept Files:
- `kubeconfig-local.yaml` - Local minikube configuration
- `kubeconfig-host.yaml` - Local host configuration  
- `Jenkinsfile` - Jenkins pipeline for local deployment
- `k8s/overlays/local-dev/` - Local development overlay
- `k8s/overlays/local-main/` - Local production-like overlay

## Deployment Options

### 1. Docker Compose (Recommended for Development)

**Quick Start:**
```powershell
# Clone and setup
git clone <repo-url>
cd ecommerce-ai-platform
cp .env.example .env
# Edit .env with your values

# Start all services
cd infrastructure
docker-compose up -d
```

**Services Available:**
- Frontend: http://localhost:3000
- API Gateway (Traefik): http://localhost:80
- Traefik Dashboard: http://localhost:8081
- RabbitMQ Management: http://localhost:15672

### 2. Local Kubernetes with Jenkins

**Prerequisites:**
```powershell
# Install required tools
choco install minikube kubernetes-cli mkcert nss

# Start minikube
minikube start --cpus=4 --memory=8g
```

**TLS Setup:**
```powershell
# Setup local CA and certificates
mkcert -install
mkcert api.chat-ai-store.local

# Create K8s namespace and TLS secret
kubectl create namespace ecommerce
kubectl -n ecommerce create secret tls api-chat-ai-store-local-tls --cert=api.chat-ai-store.local.pem --key=api.chat-ai-store.local-key.pem
```

**Deploy:**
```powershell
# Development environment
kubectl apply -k k8s/overlays/local-dev

# Production-like environment
kubectl apply -k k8s/overlays/local-main
```

## Jenkins Pipeline Configuration

### Required Jenkins Credentials:
- `dockerhub-cred`: Docker Hub username/password for image registry
- `kubeconfig-local`: Kubeconfig file content for local cluster access
- `platform-secrets-local-main`: Environment variables for secrets

### Pipeline Behavior:
- **local-dev branch**: Builds with `dev` tag, deploys to local-dev overlay
- **local-main branch**: Builds with `main` tag, deploys to local-main overlay with rolling updates

### Build Process:
1. Checkout code
2. Determine image tag based on branch
3. Build and push Docker images to Docker Hub
4. Deploy to appropriate Kubernetes overlay
5. Clean workspace

## Environment Configuration

### Docker Compose Environment:
- Uses Docker Hub images: `riyaji/<service>:latest`
- Local PostgreSQL databases on ports 5433-5436
- RabbitMQ on port 5672
- All services behind Traefik proxy

### Kubernetes Environment:
- **local-dev**: Single replicas, fast deployment, `dev` image tag
- **local-main**: Multiple replicas, rolling updates, `main` image tag
- TLS termination at ingress level
- Network policies for security
- Kustomize for configuration management

## Security Features

### Local TLS:
- mkcert for trusted local certificates
- HTTPS everywhere via Traefik ingress
- Host file configuration for custom domains

### Network Security:
- Kubernetes network policies
- Default deny with explicit allow rules
- Service-to-service authentication via JWT

### Secrets Management:
- Environment variables via .env files
- Kubernetes secrets via Kustomize
- Jenkins credentials for CI/CD

## Development Workflow

1. **Feature Development:**
   - Work on `local-dev` branch
   - Use Docker Compose for rapid iteration
   - Test changes locally

2. **Integration Testing:**
   - Merge to `local-dev` branch
   - Jenkins builds and deploys to local-dev K8s
   - Validate in production-like environment

3. **Release Preparation:**
   - Merge to `local-main` branch
   - Jenkins performs rolling deployment
   - Final testing in local-main environment

## Troubleshooting

### Common Issues:

**Docker Compose:**
- Port conflicts: Check if ports 80, 5432, 5672 are available
- Permission issues: Ensure Docker daemon is running
- Build failures: Clear Docker cache with `docker system prune`

**Kubernetes:**
- minikube not starting: Check virtualization is enabled
- Images not pulling: Verify Docker Hub access
- TLS issues: Regenerate certificates with mkcert

**Jenkins:**
- Credential errors: Verify all required credentials are configured
- Deployment failures: Check kubeconfig and cluster connectivity
- Build failures: Verify Docker daemon access in Jenkins

### Useful Commands:

```powershell
# Docker Compose
docker-compose ps                    # Check service status
docker-compose logs <service>        # View service logs
docker-compose down -v              # Stop and remove volumes

# Kubernetes
kubectl get pods -n ecommerce       # Check pod status
kubectl logs -f <pod> -n ecommerce  # Follow pod logs
kubectl describe ingress -n ecommerce # Check ingress configuration

# Minikube
minikube status                     # Check cluster status
minikube ip                        # Get cluster IP
minikube dashboard                 # Open K8s dashboard
```

## Next Steps

1. **Development Setup**: Choose Docker Compose for daily development
2. **CI/CD Setup**: Configure Jenkins for automated deployments
3. **Testing**: Set up integration tests in the pipeline
4. **Monitoring**: Add local observability stack (Prometheus/Grafana)
5. **Documentation**: Create service-specific development guides

This local-focused setup provides a complete development and testing environment without the complexity of cloud deployment, while still maintaining production-like practices through Kubernetes and CI/CD.
