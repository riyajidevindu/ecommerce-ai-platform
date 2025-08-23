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

### Secure RDS password handling

Avoid putting the password value in `terraform.tfvars`. Choose one of:

1) Environment variable injection (local-only):
	- Leave `rds_password` unset in tfvars; pass it at apply time:
	  - Linux/macOS: `TF_VAR_rds_password=$(aws secretsmanager get-secret-value --secret-id my/secret --query SecretString --output text) terraform apply`
	  - PowerShell: `$env:TF_VAR_rds_password = (aws secretsmanager get-secret-value --secret-id my/secret | ConvertFrom-Json).SecretString; terraform apply`

2) AWS Secrets Manager (recommended):
	- Set `use_rds_password_from_secrets_manager = true` and `rds_password_secret_id = "my/secret"` in tfvars.
	- If the secret is JSON like `{ "password": "..." }`, set `rds_password_is_json = true` and `rds_password_secret_json_key = "password"`.

In both cases, the `rds_password` variable remains sensitive and never stored in state logs. Do not commit secrets.

