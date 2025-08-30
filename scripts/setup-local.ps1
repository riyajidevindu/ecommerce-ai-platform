param(
  [string]$Domain = 'api.chat-ai-store.local',
  [string]$Namespace = 'ecommerce'
)

Write-Host 'Ensuring namespace...' -ForegroundColor Cyan
kubectl get ns $Namespace 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { kubectl create ns $Namespace }

Write-Host 'Install Traefik via Helm...' -ForegroundColor Cyan
./scripts/install-traefik.ps1

Write-Host 'Install PostgreSQL via Helm...' -ForegroundColor Cyan
./scripts/install-postgres.ps1 -Namespace $Namespace

Write-Host 'Generating TLS with mkcert (requires mkcert installed)...' -ForegroundColor Cyan
mkcert -install
mkcert $Domain

Write-Host 'Creating TLS secret...' -ForegroundColor Cyan
$secretName = ($Domain -replace '\\.', '-') + '-tls'
kubectl -n $Namespace delete secret $secretName 2>$null | Out-Null
kubectl -n $Namespace create secret tls $secretName --cert="${Domain}.pem" --key="${Domain}-key.pem"

$ip = (minikube ip)
Write-Host "Minikube IP: $ip" -ForegroundColor Green
Write-Host 'Add the following line to your hosts file if not present:' -ForegroundColor Yellow
Write-Host "$ip `t $Domain" -ForegroundColor Yellow

Write-Host 'Apply local-dev overlay...' -ForegroundColor Cyan
kubectl apply -k k8s/overlays/local-dev
