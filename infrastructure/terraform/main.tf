terraform {
	required_version = ">= 1.5.0"
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
		kubernetes = {
			source  = "hashicorp/kubernetes"
			version = ">= 2.23"
		}
		postgresql = {
			source = "cyrilgdn/postgresql"
			version = ">= 1.20"
		}
	}
}

provider "aws" {
	region = var.region
}

# CloudFront requires us-east-1 for ACM certs
provider "aws" {
	alias  = "us_east_1"
	region = "us-east-1"
}

# Remove direct DB management via Terraform to avoid connectivity issues from outside VPC
# provider "postgresql" {
#   host     = var.create_rds ? aws_db_instance.postgres[0].address : "127.0.0.1"
#   port     = var.create_rds ? aws_db_instance.postgres[0].port    : 5432
#   database = var.create_rds ? var.rds_db_names[0]                  : "postgres"
#   username = var.create_rds ? var.rds_username                     : "postgres"
#   password = var.create_rds ? local.rds_password_value             : ""
#   sslmode  = var.create_rds ? "require"                            : "disable"
# }

# Optionally configure remote state manually in a backend {} block here.

# ---------------------
# VPC & Networking
# ---------------------
module "vpc" {
	source  = "terraform-aws-modules/vpc/aws"
	version = "~> 5.0"

	name = var.name
	cidr = var.vpc_cidr

	azs             = var.azs
	private_subnets = var.private_subnets
	public_subnets  = var.public_subnets

	enable_nat_gateway = true
	single_nat_gateway = true

	tags = var.tags
}

# ---------------------
# EKS Cluster
# ---------------------
module "eks" {
	source  = "terraform-aws-modules/eks/aws"
	version = "~> 20.0"

	cluster_name    = var.cluster_name
	cluster_version = var.kubernetes_version

	vpc_id                         = module.vpc.vpc_id
	subnet_ids                     = concat(module.vpc.private_subnets)
	cluster_endpoint_public_access = true

		eks_managed_node_groups = {
			default = {
				min_size     = var.node_group_min_size
				max_size     = var.node_group_max_size
				desired_size = var.node_group_desired_size

				instance_types = [var.node_instance_type]
				ami_type       = var.node_ami_type
				capacity_type  = "ON_DEMAND"
			}
		}

	tags = var.tags
}

# ---------------------
# ECR Repositories (one per service)
# ---------------------
resource "aws_ecr_repository" "repos" {
	for_each = toset(var.ecr_repositories)
	name     = each.value
	image_scanning_configuration { scan_on_push = true }
	tags = var.tags
}

# ---------------------
# Optional: RDS PostgreSQL
# ---------------------
data "aws_secretsmanager_secret_version" "rds_password" {
	count     = var.create_rds && var.use_rds_password_from_secrets_manager ? 1 : 0
	secret_id = var.rds_password_secret_id
}

locals {
	rds_password_value = var.create_rds ? (
		var.use_rds_password_from_secrets_manager
			? (var.rds_password_is_json
					? jsondecode(data.aws_secretsmanager_secret_version.rds_password[0].secret_string)[var.rds_password_secret_json_key]
					: data.aws_secretsmanager_secret_version.rds_password[0].secret_string)
			: var.rds_password
	) : null
}

resource "aws_db_subnet_group" "this" {
	count      = var.create_rds ? 1 : 0
	name       = "${var.name}-db-subnet"
	subnet_ids = module.vpc.private_subnets
	tags       = var.tags
}

resource "aws_db_instance" "postgres" {
	count                     = var.create_rds ? 1 : 0
	identifier                = "${var.name}-postgres"
	engine                    = "postgres"
	engine_version            = var.rds_engine_version != "" ? var.rds_engine_version : null
	instance_class            = var.rds_instance_class
	allocated_storage         = var.rds_allocated_storage
	db_subnet_group_name      = aws_db_subnet_group.this[0].name
	vpc_security_group_ids    = [aws_security_group.rds[0].id]
	username                  = var.rds_username
	password                  = local.rds_password_value
	db_name                   = var.rds_db_names[0] # Create the first DB with the instance
	skip_final_snapshot       = true
	publicly_accessible       = false
	deletion_protection       = false
	backup_retention_period   = 7
	performance_insights_enabled = false
	multi_az                  = false
	tags                      = var.tags
}

# Create the rest of the databases
# resource "postgresql_database" "dbs" {
# 	count      = var.create_rds ? length(var.rds_db_names) : 0
# 	name       = var.rds_db_names[count.index]
# 	owner      = var.rds_username
# 	depends_on = [aws_db_instance.postgres]
# }

# ---------------------
# Optional: S3 + CloudFront for Frontend
# ---------------------
resource "aws_s3_bucket" "frontend" {
	count = var.create_frontend_cdn ? 1 : 0
	bucket = var.frontend_bucket
	force_destroy = true
	tags = var.tags
}

resource "aws_cloudfront_origin_access_control" "oac" {
	count                              = var.create_frontend_cdn ? 1 : 0
	name                               = "${var.name}-oac"
	description                        = "OAC for S3 frontend bucket"
	origin_access_control_origin_type  = "s3"
	signing_behavior                   = "always"
	signing_protocol                   = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
	count = var.create_frontend_cdn ? 1 : 0

	enabled             = true
	default_root_object = "index.html"

	origin {
		domain_name              = aws_s3_bucket.frontend[0].bucket_regional_domain_name
		origin_id                = "s3-frontend"
		origin_access_control_id = aws_cloudfront_origin_access_control.oac[0].id
	}

	default_cache_behavior {
		allowed_methods  = ["GET", "HEAD"]
		cached_methods   = ["GET", "HEAD"]
		target_origin_id = "s3-frontend"

		viewer_protocol_policy = "redirect-to-https"

		forwarded_values {
			query_string = false
			cookies { forward = "none" }
		}
	}

	restrictions {
		geo_restriction {
			restriction_type = "none"
		}
	}

	viewer_certificate {
		cloudfront_default_certificate = true
	}

	tags = var.tags
}

# ---------------------
# Security Group for RDS allowing EKS access
# ---------------------
resource "aws_security_group" "rds" {
	count  = var.create_rds ? 1 : 0
	name   = "${var.name}-rds-sg"
	vpc_id = module.vpc.vpc_id

	description = "Allow PostgreSQL from EKS node and cluster security groups"

	# Ingress from EKS node SG
	ingress {
		from_port       = 5432
		to_port         = 5432
		protocol        = "tcp"
		security_groups = [module.eks.node_security_group_id, module.eks.cluster_security_group_id]
		description     = "PostgreSQL from EKS"
	}

	# Egress all
	egress {
		from_port   = 0
		to_port     = 0
		protocol    = "-1"
		cidr_blocks = ["0.0.0.0/0"]
	}

	tags = var.tags
}

# Grant current IAM user admin access to the cluster
resource "aws_eks_access_entry" "admin_user" {
  cluster_name  = module.eks.cluster_name
  principal_arn = data.aws_caller_identity.current.arn
}

resource "aws_eks_access_policy_association" "admin_user_policy" {
  cluster_name  = module.eks.cluster_name
  principal_arn = data.aws_caller_identity.current.arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  access_scope {
    type = "cluster"
  }
}

data "aws_caller_identity" "current" {}

