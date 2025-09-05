# E-commerce AI Platform - Simple Setup Commands

## Prerequisites
- Docker Desktop running
- Jenkins and Minikube containers created
- ngrok installed
- mkcert installed (for HTTPS certificates)

## 🚀 Complete Setup Commands

### 1. Start Docker Containers
```powershell
# Start Jenkins and Minikube containers
docker start jenkins minikube

# Verify containers are running
docker ps
```

### 2. Configure Minikube & Kubernetes
```powershell
# Set minikube profile and start cluster
minikube profile minikube
minikube start --driver=docker

# Verify cluster is accessible
kubectl cluster-info

# Create ecommerce namespace
kubectl create namespace ecommerce
```

### 3. Setup TLS Certificates (One-time)
```powershell
# Generate local certificates with mkcert
mkcert -install
mkcert api.chat-ai-store.local

# Create TLS secret in Kubernetes
kubectl -n ecommerce create secret tls api-chat-ai-store-local-tls --cert=api.chat-ai-store.local.pem --key=api.chat-ai-store.local-key.pem

# Add to hosts file (run as Administrator)
$minikubeIP = minikube ip
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "$minikubeIP api.chat-ai-store.local"
```

### 4. Install Infrastructure (One-time)
```powershell
# Install Traefik ingress controller
cd scripts
.\install-traefik.ps1

# Install PostgreSQL 
.\install-postgres.ps1 -Namespace ecommerce

# Or run the complete setup
.\setup-local.ps1
```

### 5. Start ngrok
```powershell
# Start ngrok tunnel to expose Jenkins
ngrok http 8080
```
Copy the public URL (e.g., `https://abc123.ngrok.io`)

### 6. Configure GitHub Webhook (One-time)
1. Go to GitHub repository → Settings → Webhooks → Add webhook
2. **Payload URL**: `https://your-ngrok-url.ngrok.io/github-webhook/`
3. **Content type**: `application/json`  
4. **Events**: Push events, Pull request events
5. **Active**: ✓

### 7. Configure Jenkins (One-time)
Access Jenkins at http://localhost:8080

#### Required Credentials:
- **dockerhub-cred** (Username/Password): Your Docker Hub credentials
- **kubeconfig-local** (Secret file): Upload `kubeconfig-local.yaml` 
- **platform-secrets-local-main** (Secret text): Environment variables

#### Sample Environment Secrets:
```
rabbitmq_url=amqp://guest:guest@rabbitmq:5672/
database_url=postgresql://postgres:postgres@postgres:5432/auth_db
secret_key=your-secret-key-here
stock_database_url=postgresql://postgres:postgres@postgres:5432/stock_db
whatsapp_database_url=postgresql://postgres:postgres@postgres:5432/whatsapp_db
ai_database_url=postgresql://postgres:postgres@postgres:5432/ai_db
gemini_api_key=your-gemini-api-key
groq_api_key=your-groq-api-key
CORS_ALLOW_ORIGINS=https://api.chat-ai-store.local
whatsapp_access_token=your-whatsapp-token
whatsapp_phone_number_id=your-phone-number-id
whatsapp_api_version=v17.0
whatsapp_verify_token=your-verify-token
google_client_id=your-google-client-id
google_client_secret=your-google-client-secret
```

## 🔄 Daily Workflow

### Start Development Environment
```powershell
# 1. Start containers
docker start jenkins minikube

# 2. Start ngrok (in separate terminal)
ngrok http 8080

# 3. That's it! Ready to code and push
```

### Automated CI/CD
Once setup is complete, just push code:
```powershell
# Development deployment
git push origin local-dev

# Production-like deployment  
git push origin local-main
```

Jenkins automatically:
- Builds Docker images for all services
- Pushes to Docker Hub with appropriate tags (`dev` or `main`)
- Deploys to corresponding Kubernetes overlay
- Performs rolling updates

## 📊 Monitoring Commands

### Check Status
```powershell
# Check containers
docker ps

# Check Kubernetes pods
kubectl get pods -n ecommerce

# Check deployments  
kubectl get deployments -n ecommerce

# Check ingress
kubectl get ingress -n ecommerce
```

### View Logs
```powershell
# Jenkins logs
docker logs jenkins

# Application logs
kubectl logs deployment/auth-service -n ecommerce
kubectl logs deployment/stock-service -n ecommerce

# All pods logs
kubectl logs -l app=auth-service -n ecommerce --tail=50
```

### Restart Services
```powershell
# Restart a deployment
kubectl rollout restart deployment/auth-service -n ecommerce

# Scale a deployment
kubectl scale deployment/auth-service --replicas=2 -n ecommerce
```

## 🌐 Access URLs

- **Jenkins**: http://localhost:8080
- **ngrok Dashboard**: http://localhost:4040
- **Application** (after deployment): https://api.chat-ai-store.local
- **Minikube Dashboard**: `minikube dashboard`

## 🔧 Branch Strategy

- **local-dev**: Development branch → single replicas, fast deployment, `dev` image tag
- **local-main**: Production-like branch → multiple replicas, rolling updates, `main` image tag

## 🛠️ Troubleshooting

### Container Issues
```powershell
# Restart containers
docker restart jenkins minikube

# Check container logs
docker logs jenkins
docker logs minikube
```

### Kubernetes Issues  
```powershell
# Reset minikube if needed
minikube delete
minikube start --driver=docker

# Redeploy applications
kubectl delete namespace ecommerce
kubectl create namespace ecommerce
# Re-run setup steps
```

### Jenkins Issues
```powershell
# Reset Jenkins (if needed)
docker stop jenkins
docker rm jenkins
# Create new Jenkins container and reconfigure
```

---
**That's it!** 🎉 Simple commands for a complete local CI/CD environment.
