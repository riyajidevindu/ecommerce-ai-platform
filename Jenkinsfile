pipeline {
  agent any
  environment {
    REGISTRY = 'docker.io/riyaji'
    // Set by Jenkins credentials
    DOCKERHUB = credentials('dockerhub-cred')
  }
  options {
    timestamps()
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Prepare') {
      steps {
        script {
          env.IMAGE_TAG = (env.BRANCH_NAME == 'local-main') ? 'main' : 'dev'
        }
      }
    }
    stage('Docker Build & Push') {
      steps {
        withEnv(["DOCKER_BUILDKIT=1"]) {
          script {
            def services = [
              [name: 'auth-service'],
              [name: 'stock-service'],
              [name: 'whatsapp-connector-service'],
              [name: 'ai-orchestrator-service'],
              [name: 'notification-service'],
              [name: 'file-storage-service']
            ]
            sh 'docker login -u ${DOCKERHUB_USR} -p ${DOCKERHUB_PSW}'
            for (svc in services) {
              def img = "${REGISTRY}/${svc.name}:${IMAGE_TAG}"
              sh "docker build -t ${img} services/${svc.name}"
              sh "docker push ${img}"
            }
          }
        }
      }
    }
    stage('Deploy to K8s (CD)') {
      when { branch 'local-main' }
      steps {
        script {
          // Fetch kubeconfig and write secrets.env for kustomize
          withCredentials([
            file(credentialsId: 'kubeconfig-local', variable: 'KUBECONFIG_FILE'),
            string(credentialsId: 'platform-secrets-local-main', variable: 'SECRETS_ENV')
          ]) {
            writeFile file: 'k8s/overlays/local-main/secrets.env', text: SECRETS_ENV
            env.KUBECONFIG = KUBECONFIG_FILE
            sh "kubectl apply -k k8s/overlays/local-main"
          }
        }
      }
    }
  }
  post {
    always { cleanWs() }
  }
}
