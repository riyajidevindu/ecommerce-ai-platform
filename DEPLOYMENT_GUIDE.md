# Deployment Guide (AWS EKS + GitHub Actions + Traefik)

This guide follows the workflow you outlined and ties it to the files in this repo.

## 1) Version Control & Branching
- Use `dev` for active work; `main` for production.
- CI runs on `dev` pushes and PRs; CD runs on `main`.

## 2) Containerization
- Each service has a Dockerfile (under `services/<service>/Dockerfile`).
- Local dev: `docker compose -f infrastructure/docker-compose.yaml up -d`.

## 3) AWS Infrastructure (Terraform)
- Files in `infrastructure/terraform` provision VPC, EKS, ECR; optional RDS and CDN.
- Copy vars and apply:

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -out tfplan
terraform apply tfplan
```

- After apply, configure kubectl:

```bash
aws eks update-kubeconfig --region <region> --name <cluster_name>
```

## 4) CI/CD (GitHub Actions)
- `/.github/workflows/ci.yml`: Lints/builds frontend and does minimal Python checks.
- `/.github/workflows/cd.yml`: Builds/pushes images to ECR, then deploys to EKS (placeholder step to apply k8s manifests).

Required GitHub Secrets:
- `AWS_ROLE_ARN` – role to assume for Actions (with ECR/EKS permissions)
- `EKS_CLUSTER_NAME` – target EKS cluster name

## 5) Kubernetes Deployment
- Base manifests at `k8s/base`, prod overlay at `k8s/overlays/prod`.
- Ingress uses Traefik + cert-manager annotations (ensure both are installed to the cluster).
- Replace `example.com` and `<ECR_REGISTRY>` placeholders.
- Apply overlay (example):

```bash
ECR_REGISTRY=xxxxxxxx.dkr.ecr.<region>.amazonaws.com \
IMAGE_TAG=latest \
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672/ \
STOCK_DATABASE_URL=postgresql://... \
WHATSAPP_DATABASE_URL=postgresql://... \
AI_DATABASE_URL=postgresql://... \
GEMINI_API_KEY=*** \
GROQ_API_KEY=*** \
kubectl kustomize k8s/overlays/prod | envsubst | kubectl apply -f -
```

## 6) Monitoring & Logging
- Install:
  - Prometheus + Grafana (via kube-prometheus-stack Helm chart)
  - Loki + Promtail for logs

## 7) Security & Secrets
- Use AWS Secrets Manager and external-secrets if preferred; or keep kustomize secrets with envsubst for initial setup.
- Ensure only HTTPS via Ingress; add HSTS headers with Traefik if desired.

## 8) Frontend Hosting
- Option A: Serve via Kubernetes Nginx image in `frontend` Deployment (current).* 
- Option B (recommended): Use S3+CloudFront (enable in Terraform) and set `VITE_API_URL` to your API domain.

## 9) GitOps (optional)
- Install ArgoCD and point it at `k8s/overlays/prod`. Then CD job can become a simple Git push.

## 10) Documentation & Team Workflow
- Keep this guide updated.
- Add service-specific READMEs for API and env requirements.

*Note*: The Kubernetes manifests are scaffolding; tailor resources, probes, and autoscaling (HPA) per service.
