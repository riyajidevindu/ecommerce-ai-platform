# E-commerce AI Platform - Local Development

This project is a microservices application for an AI-powered e-commerce assistant, designed for local development and deployment. It includes a React-based frontend, several Python FastAPI backend services, and local infrastructure using Docker Compose and Kubernetes.

## Project Structure

- `frontend/`: Contains the React frontend application, built with Vite, TypeScript, shadcn-ui, and Tailwind CSS.
- `services/`: Houses all the backend microservices, each with its own containerized environment.
- `infrastructure/`: Includes Docker Compose setup for local development.
- `k8s/`: Kubernetes manifests with overlays for local-dev and local-main environments.
- `scripts/`: PowerShell scripts for local setup and installation.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and npm
- Python 3.11+ and Poetry (or pip)
- Minikube or Docker Desktop with Kubernetes (for K8s deployment)
- Jenkins (optional, for CI/CD pipeline)

### Local Development Options

**Option 1: Docker Compose (Recommended for quick setup)**

This is the easiest way to get started with all services running locally.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ecommerce-ai-platform
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example` file:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your own secret keys and database credentials.

3.  **Run the services:**
    ```bash
    cd infrastructure
    docker-compose up -d
    ```
    This will pull the images from Docker Hub and start all the services.

**Option 2: Local Kubernetes with Jenkins CI/CD**

This option provides a production-like local environment with CI/CD pipeline.

1.  **Prerequisites Setup:**
    - Install Minikube: `choco install minikube` (Windows)
    - Install kubectl: `choco install kubernetes-cli`
    - Install mkcert: `choco install mkcert nss`
    - Start Minikube: `minikube start --cpus=4 --memory=8g`

2.  **TLS Certificate Setup:**
    ```bash
    mkcert -install
    mkcert api.chat-ai-store.local
    kubectl create namespace ecommerce
    kubectl -n ecommerce create secret tls api-chat-ai-store-local-tls --cert=api.chat-ai-store.local.pem --key=api.chat-ai-store.local-key.pem
    ```

3.  **Hosts File Configuration:**
    Add the following to your hosts file (`C:\Windows\System32\drivers\etc\hosts`):
    ```
    <minikube-ip> api.chat-ai-store.local
    ```
    Get Minikube IP with: `minikube ip`

4.  **Deploy using kubectl:**
    ```bash
    # For development environment
    kubectl apply -k k8s/overlays/local-dev

    # For production-like environment
    kubectl apply -k k8s/overlays/local-main
    ```

5.  **Jenkins Pipeline (Optional):**
    - Configure Jenkins with credentials:
      - `dockerhub-cred`: Docker Hub username/password
      - `kubeconfig-local`: Kubeconfig file content
      - `platform-secrets-local-main`: Environment secrets
    - The pipeline will automatically build and deploy based on branch:
      - `local-dev` branch → development overlay
      - `local-main` branch → production-like overlay

**Option 3: Building from Source**

Use this option if you want to build the Docker images from the source code.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ecommerce-ai-platform
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example` file:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your own secret keys and database credentials.

3.  **Build and run the services:**
    ```bash
    cd infrastructure
    docker-compose up -d --build
    ```
    This will build the Docker images for all the services and then start them.

### Frontend Development

Navigate to the `frontend` directory and install dependencies, then start the development server.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`, and the backend services will be accessible at their respective ports as defined in `docker-compose.yaml`.

## Local Architecture

### Docker Compose Services
- **Traefik**: Reverse proxy and load balancer (http://localhost:80, dashboard: http://localhost:8081)
- **Backend Services**: 
  - Auth Service (port 8000) - `/api/v1/auth`, `/api/v1/users`
  - Stock Service (port 8001) - `/api/v1/products`
  - WhatsApp Connector (port 8002) - `/api/v1/whatsapp`
  - AI Orchestrator (port 8003) - `/api/v1/ai`
  - Notification Service (port 8004) - `/api/v1/notifications`
  - File Storage Service (port 8005) - `/upload`, `/images`
- **Databases**: 
  - PostgreSQL instances for each service (ports 5433-5436)
  - RabbitMQ for messaging (port 5672, management: http://localhost:15672)

### Kubernetes Local Deployment
- **local-dev**: Fast iteration, single replica, `dev` image tag
- **local-main**: Production-like, multiple replicas, `main` image tag, rolling updates
- **TLS**: Uses mkcert for local HTTPS via Traefik ingress
- **Networking**: Network policies restrict traffic between services
- **Secrets**: Managed via Kustomize secretGenerator

## Branch Strategy
- `local-dev`: Development branch, deploys to local-dev K8s overlay
- `local-main`: Production-like branch, deploys to local-main K8s overlay

## Jenkins CI/CD Pipeline
The Jenkins pipeline automatically:
1. Builds Docker images for all services
2. Pushes images to Docker Hub with appropriate tags (`dev` or `main`)
3. Deploys to the corresponding Kubernetes overlay based on branch
4. Uses rolling updates for zero-downtime deployments

## Scripts
- `scripts/setup-local.ps1`: Complete local environment setup
- `scripts/install-postgres.ps1`: PostgreSQL installation
- `scripts/install-traefik.ps1`: Traefik installation

## Security Features
- TLS everywhere with mkcert certificates
- Network policies with default deny
- Secrets management via Kustomize
- JWT-based authentication
- CORS protection

For detailed local setup instructions, see `README-LOCAL.md`.


