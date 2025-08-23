# Traefik API Gateway Guide

This document explains how to work with the Traefik API Gateway in our local development environment.

## Overview

All API traffic from the frontend is routed through the Traefik API Gateway. Traefik is a modern reverse proxy that automatically discovers and routes traffic to the correct backend service based on a set of rules.

- **Gateway URL**: `http://localhost`
- **Traefik Dashboard**: `http://localhost:8081`

The dashboard provides a real-time view of all configured routes and services.

## How it Works

We use Traefik's **Docker Provider**, which means Traefik listens to Docker's events. When a service is started, Traefik inspects its "labels" to see if it should be added to the gateway.

The configuration is done entirely within the `docker-compose.yaml` file.

## Adding a New Service to the Gateway

To add a new backend service to the API gateway, you only need to add a `labels` section to that service's definition in `infrastructure/docker-compose.yaml`.

### Step-by-Step Instructions

1.  **Expose the Port**: Make sure your service's port is exposed to the Docker network. **Do not** map it to the host. Use `expose` instead of `ports`.

    ```yaml
    services:
      your-new-service:
        # ... your other service config
        expose:
          - "8006" # The port your service runs on inside the container
    ```

2.  **Add Traefik Labels**: Add a `labels` section with three key labels:
    -   `traefik.enable=true`: Tells Traefik to manage this service.
    -   `traefik.http.routers.your-new-service.rule`: This is the routing rule. It tells Traefik which incoming paths to forward to your service. The most common rule is `PathPrefix`.
    -   `traefik.http.services.your-new-service.loadbalancer.server.port`: This tells Traefik which port your service is listening on inside the container.

### Example

Here is a complete example for a hypothetical `order-service` running on port `8006` that should handle all requests to `/api/v1/orders`.

```yaml
services:
  # ... other services

  order-service:
    build: ../services/order-service
    image: your-docker-repo/order-service:latest
    expose:
      - "8006"
    volumes:
      - ../services/order-service/app:/app/app
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.order-service.rule=PathPrefix(`/api/v1/orders`)"
      - "traefik.http.services.order-service.loadbalancer.server.port=8006"

  # ... other services
```

### Applying the Changes

After adding these labels to `docker-compose.yaml`, simply restart the environment to apply the new routing rules:

```bash
docker-compose -f infrastructure/docker-compose.yaml up -d --build
```

Traefik will automatically detect the new service and start routing traffic to it. You can confirm this by checking the Traefik dashboard.
