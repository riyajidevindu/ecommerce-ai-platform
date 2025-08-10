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

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ecommerce-ai-platform
    ```

2.  **Run backend services:**
    All backend services can be started using Docker Compose.
    ```bash
    docker-compose up -d
    ```

3.  **Run the frontend:**
    Navigate to the `frontend` directory and install dependencies, then start the development server.
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

The frontend will be available at `http://localhost:3000`, and the backend services will be accessible at their respective ports as defined in `docker-compose.yaml`.

## Frontend Development

The frontend was generated using Lovable. You can edit the code in the following ways:

*   **Use Lovable**: Visit the [Lovable Project](https://lovable.dev/projects/1dee1898-bc01-41b4-9477-f6e69e46792b) and start prompting.
*   **Use your preferred IDE**: Clone this repo and push changes.
*   **Edit a file directly in GitHub**
*   **Use GitHub Codespaces**
