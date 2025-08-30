param(
  [string]$Namespace = 'kube-system'
)

Write-Host 'Adding Traefik Helm repo...' -ForegroundColor Cyan
helm repo add traefik https://traefik.github.io/charts | Out-Null
helm repo update | Out-Null

Write-Host 'Installing/Upgrading Traefik (NodePort)...' -ForegroundColor Cyan
helm upgrade --install traefik traefik/traefik `
  --namespace $Namespace `
  --create-namespace `
  --set service.type=NodePort `
  --set ports.web.nodePort=30080 `
  --set ports.websecure.nodePort=30443 `
  --set logs.general.level=INFO

Write-Host 'Traefik installed. IngressClass "traefik" will be used by resources.' -ForegroundColor Green
