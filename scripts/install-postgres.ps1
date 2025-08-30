param(
  [string]$Namespace = 'ecommerce',
  [string]$Release = 'postgres'
)

Write-Host 'Adding Bitnami repo...' -ForegroundColor Cyan
helm repo add bitnami https://charts.bitnami.com/bitnami | Out-Null
helm repo update | Out-Null

Write-Host 'Installing/Upgrading PostgreSQL...' -ForegroundColor Cyan
helm upgrade --install $Release bitnami/postgresql `
  --namespace $Namespace `
  --create-namespace `
  --set auth.postgresPassword=postgres `
  --set primary.persistence.size=1Gi

Write-Host 'Creating headless alias service for compatibility...' -ForegroundColor Cyan
kubectl apply -f k8s/base/postgres-headless-alias.yaml

Write-Host 'Run the DB init job if needed:' -ForegroundColor Yellow
Write-Host '  kubectl apply -f k8s/tools/init-db-job.yaml' -ForegroundColor Yellow
