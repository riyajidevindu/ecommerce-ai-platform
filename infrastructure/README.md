# Infrastructure

This directory contains the infrastructure-as-code for the E-commerce AI Platform.

## Docker Compose

The `docker-compose.yaml` file is used for local development. It sets up all the backend services, a PostgreSQL database, and a RabbitMQ message broker.

To start all services, run:
```bash
docker-compose up -d
```

To stop all services, run:
```bash
docker-compose down
```

## Terraform

The `terraform/` directory contains the Terraform configuration for provisioning cloud infrastructure. The current setup is a skeleton and needs to be filled out with the details of your cloud provider (e.g., AWS, GCP, Azure).

### Usage

1.  **Initialize Terraform:**
    ```bash
    cd terraform
    terraform init
    ```

2.  **Plan the deployment:**
    ```bash
    terraform plan
    ```

3.  **Apply the configuration:**
    ```bash
    terraform apply
