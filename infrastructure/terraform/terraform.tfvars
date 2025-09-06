name               = "ecommerce-ai"
region             = "ap-south-1"
cluster_name       = "ecommerce-eks-cluster"
kubernetes_version = "1.29"

# Use slightly larger instances for higher pod density
node_instance_type        = "t3.small"
# Step 1: keep desired <= current max (1) to allow raising max first
node_group_min_size       = 1
node_group_desired_size   = 3
node_group_max_size       = 5

# Networking (match existing VPC)
vpc_cidr        = "10.0.0.0/16"
azs             = ["ap-south-1a", "ap-south-1b"]
public_subnets  = ["10.0.0.0/24", "10.0.1.0/24"]
private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]

# Optional features
create_rds            = true
create_frontend_cdn   = false

# Per-service databases (one per backend service)
rds_db_names = [
  "auth_db",
  "stock_db",
  "whatsapp_db",
  "ai_db",
  "notification_db",
  "file_storage_db",
]

# Grant CI/CD role admin access to EKS
eks_admin_arns = [
  "arn:aws:iam::398128644108:role/GitHubActionsRole-ecommerce-ai-platform"
]
