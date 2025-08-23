output "vpc_id" {
	value       = module.vpc.vpc_id
	description = "VPC ID"
}

output "private_subnets" {
	value       = module.vpc.private_subnets
	description = "Private subnet IDs"
}

output "cluster_name" {
	value       = module.eks.cluster_name
	description = "EKS cluster name"
}

output "cluster_endpoint" {
	value       = module.eks.cluster_endpoint
	description = "EKS cluster endpoint"
}

output "ecr_repo_urls" {
	description = "Map of ECR repository URLs"
	value = {
		for k, repo in aws_ecr_repository.repos : k => repo.repository_url
	}
}

output "rds_endpoint" {
	value       = try(aws_db_instance.postgres[0].address, null)
	description = "RDS endpoint (if created)"
}

output "cdn_domain_name" {
	value       = try(aws_cloudfront_distribution.cdn[0].domain_name, null)
	description = "CloudFront domain name (if created)"
}

