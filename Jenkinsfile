pipeline {
  agent any
  environment {
    REGISTRY = 'docker.io/riyaji'
    // Set by Jenkins credentials
    DOCKERHUB = credentials('dockerhub-cred')
    // Kubeconfig content credential (secret text) or use Kubernetes plugin
    KUBECONFIG_CONTENT = credentials('kubeconfig-local')
  }
  options {
    timestamps()
    ansiColor('xterm')
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Prepare') {
      steps {
        script {
          // Write kubeconfig so kubectl works in later steps
          writeFile file: 'kubeconfig', text: KUBECONFIG_CONTENT
          env.KUBECONFIG = pwd() + '/kubeconfig'
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
    stage('Deploy to K8s') {
      steps {
        script {
          def overlay = (env.BRANCH_NAME == 'local-main') ? 'k8s/overlays/local-main' : 'k8s/overlays/local-dev'
          sh "kubectl apply -k ${overlay}"
        }
      }
    }
  }
  post {
    always { cleanWs() }
  }
}
