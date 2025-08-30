# Local Production-like Setup

This repository provides two local branches and Kubernetes overlays that mirror production practices while running entirely on your machine.

- local-dev: fast iteration, single replica, image tag `dev`.
- local-main: simulated production, two replicas, conservative rollout, image tag `main`.

## Prerequisites
- Docker Desktop or Docker Engine
- Minikube (or a local K8s cluster)
- kubectl, kustomize
- mkcert (self-signed local CA)
- Jenkins (optional if you wish to use the provided pipeline)

## TLS with mkcert
1. Install mkcert and trust local CA:
   - Windows: `choco install mkcert nss`; `mkcert -install`
2. Generate a certificate for your local domain:
   - `mkcert api.chat-ai-store.local`
3. Create a Kubernetes TLS secret:
   - `kubectl -n ecommerce create secret tls api-chat-ai-store-local-tls --cert=api.chat-ai-store.local.pem --key=api.chat-ai-store.local-key.pem`

## Minikube
1. Start: `minikube start --cpus=4 --memory=8g`
2. Point your hosts file to Minikube IP:
   - `minikube ip` -> add `api.chat-ai-store.local` to `C:\Windows\System32\drivers\etc\hosts`.

## Secrets
Populate `k8s/overlays/local-dev/secrets.env` and `k8s/overlays/local-main/secrets.env` using the corresponding `.example` files.

## Deploy
```powershell
# Dev overlay
kubectl apply -k k8s/overlays/local-dev

# Simulated prod overlay
kubectl apply -k k8s/overlays/local-main
```

## Jenkins CI/CD
The Jenkinsfile builds Docker images for each service and deploys the appropriate overlay based on branch (`local-dev` or `local-main`). Configure these credentials in Jenkins:
- dockerhub-cred: Username/Password (or token)
- kubeconfig-local: Secret text containing your kubeconfig content

## Security Practices Included
- TLS everywhere: Traefik Ingress uses mkcert TLS secret.
- Secrets: Managed via Kustomize secretGenerator from local `.env`.
- Network Policies: Default deny; only allow traffic from Traefik, Postgres, RabbitMQ, and DNS egress.
- Rollouts: local-main uses conservative rolling update with 2 replicas.
