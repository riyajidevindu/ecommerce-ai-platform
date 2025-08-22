variable "name" {
	description = "Base name/prefix for resources"
	type        = string
	default     = "ecommerce-ai"
}

variable "region" {
	description = "AWS region"
	type        = string
	default     = "us-east-1"
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
	default     = "t3.medium"
}

variable "vpc_cidr" {
	description = "VPC CIDR"
	type        = string
	default     = "10.0.0.0/16"
}

variable "azs" {
	description = "Availability zones"
	type        = list(string)
	default     = ["us-east-1a", "us-east-1b"]
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
		"file-storage-service",
		"frontend",
	]
}

variable "create_rds" {
	description = "Create RDS PostgreSQL instance"
	type        = bool
	default     = false
}

variable "rds_engine_version" {
	description = "RDS engine version"
	type        = string
	default     = "15.5"
}

variable "rds_instance_class" {
	description = "RDS instance class"
	type        = string
	default     = "db.t4g.micro"
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

variable "rds_db_name" {
	description = "Initial database name"
	type        = string
	default     = "appdb"
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

