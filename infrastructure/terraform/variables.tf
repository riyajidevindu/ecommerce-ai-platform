variable "name" {
	description = "Base name/prefix for resources"
	type        = string
	default     = "ecommerce-ai"
}

variable "region" {
	description = "AWS region"
	type        = string
	default     = "ap-south-1"
}

variable "tags" {
	description = "Common resource tags"
	type        = map(string)
	default     = { project = "ecommerce-ai" }
}

variable "cluster_name" {
	description = "EKS cluster name"
	type        = string
	default     = "ecommerce-ai-eks"
}

variable "kubernetes_version" {
	description = "Kubernetes version"
	type        = string
	default     = "1.29"
}

variable "node_instance_type" {
	description = "EKS worker node instance type"
	type        = string
	default     = "t3.micro"
}

variable "node_ami_type" {
	description = "EKS node AMI type: AL2_x86_64 | AL2_ARM_64 | BOTTLEROCKET_x86_64 | BOTTLEROCKET_ARM_64 | CUSTOM"
	type        = string
	default     = "AL2_x86_64"
}

variable "node_group_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 1
}

variable "node_group_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "node_group_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 1
}

variable "vpc_cidr" {
	description = "VPC CIDR"
	type        = string
	default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnets" {
	description = "Public subnet CIDRs"
	type        = list(string)
	default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnets" {
	description = "Private subnet CIDRs"
	type        = list(string)
	default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "ecr_repositories" {
	description = "List of ECR repository names to create"
	type        = list(string)
	default     = [
		"auth-service",
		"stock-service",
		"whatsapp-connector-service",
		"ai-orchestrator-service",
		"notification-service",
		"file-storage-service"
	]
}

variable "create_rds" {
	description = "Create RDS PostgreSQL instance"
	type        = bool
	default     = false
}

variable "rds_engine_version" {
	description = "RDS engine version (leave empty to use AWS default/latest available)"
	type        = string
	default     = ""
}

variable "rds_instance_class" {
	description = "RDS instance class"
	type        = string
	default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
	description = "RDS storage (GB)"
	type        = number
	default     = 20
}

variable "rds_username" {
	description = "RDS master username"
	type        = string
	default     = "appuser"
}

variable "rds_password" {
	description = "RDS master password"
	type        = string
	sensitive   = true
}

variable "use_rds_password_from_secrets_manager" {
	description = "Fetch RDS password from AWS Secrets Manager instead of tfvars"
	type        = bool
	default     = false
}

variable "rds_password_secret_id" {
	description = "AWS Secrets Manager Secret ID/ARN containing the RDS password"
	type        = string
	default     = ""
}

variable "rds_password_is_json" {
	description = "If true, parse the Secrets Manager secret as JSON"
	type        = bool
	default     = false
}

variable "rds_password_secret_json_key" {
	description = "JSON key to read when rds_password_is_json is true"
	type        = string
	default     = "password"
}

variable "rds_db_names" {
	description = "A list of initial database names to create"
	type        = list(string)
	default     = ["auth_db", "stock_db", "whatsapp_db", "notification_db", "file_storage_db"]
}

variable "create_frontend_cdn" {
	description = "Create S3 + CloudFront for the frontend"
	type        = bool
	default     = false
}

variable "frontend_bucket" {
	description = "S3 bucket name for the frontend"
	type        = string
	default     = "ecommerce-ai-frontend-example"
}

variable "eks_admin_arns" {
	description = "List of IAM Role ARNs to grant EKS cluster admin access (used for CI/CD, etc.)"
	type        = list(string)
	default     = []
}

