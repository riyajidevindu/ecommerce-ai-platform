# E-commerce AI Platform

This project is a cloud-native microservices application for an AI-powered e-commerce assistant. It includes a React-based frontend, several Python FastAPI backend services, and infrastructure-as-code using Terraform and Docker.

## Project Structure

- `frontend/`: Contains the React frontend application, built with Vite, TypeScript, shadcn-ui, and Tailwind CSS.
- `services/`: Houses all the backend microservices, each with its own containerized environment.
- `infrastructure/`: Includes Terraform configurations for cloud resources and a Docker Compose setup for local development.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and npm
- Python 3.11+ and Poetry (or pip)
- Terraform

### Local Development

There are two ways to set up the project for local development:

**Option 1: Running from Docker Hub (Recommended)**

This is the easiest way to get started, as it uses the pre-built Docker images from Docker Hub.

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

**Option 2: Building from Source**

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


