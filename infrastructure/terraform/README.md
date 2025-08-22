# Terraform Configuration (AWS)

This Terraform stack provisions core AWS infrastructure for the E-commerce AI Platform:

- VPC (public/private subnets, NAT, routing)
- EKS (Kubernetes control plane and node groups)
- ECR repositories (one per service)
- Optional: RDS PostgreSQL
- Optional: S3 + CloudFront for frontend hosting

## Files

- `main.tf` – Providers, modules/resources, and core infra
- `variables.tf` – Inputs (region, cluster name, toggles, sizing)
- `outputs.tf` – Useful outputs (cluster, ECR URIs, DB endpoint, S3/CF)
- `terraform.tfvars.example` – Example variable values

## Prerequisites

- AWS account and credentials with permission to manage: VPC, EKS, IAM, ECR, RDS, S3, CloudFront
- Terraform >= 1.5

Optional but recommended:
- Remote Terraform state (e.g., S3 backend) and state locking (DynamoDB)

## Usage

1) Copy example vars and edit:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2) Initialize:

```bash
terraform init
```

3) Plan:

```bash
terraform plan -out tfplan
```

4) Apply:

```bash
terraform apply tfplan
```

## Notes

- RDS and S3+CloudFront are disabled by default. Enable via `create_rds = true` and/or `create_frontend_cdn = true` in `terraform.tfvars`.
- CloudFront certificates must be in `us-east-1`. This stack configures a second provider alias for that region when CDN is enabled.
- After EKS is created, configure `kubectl`:

```bash
aws eks update-kubeconfig --region <region> --name <cluster_name>
```

- ECR repos are created for each microservice and the frontend; use the GitHub Actions workflows to build/push.

