---
layout: default
description: "Fundamentos de integração e entrega contínuas: pipelines, etapas de validação e automação de entregas."
title: Fundamentos de CI/CD
---

# Fundamentos de CI/CD
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## 1. Introdução

CI/CD é um conjunto de práticas utilizadas para automatizar o processo de desenvolvimento, validação, entrega e implantação de aplicações.

A ideia central é transformar um processo que normalmente seria manual:

```text
Desenvolvedor
     ↓
Código
     ↓
Build manual
     ↓
Testes manuais
     ↓
Gerar pacote/imagem
     ↓
Copiar para servidor
     ↓
Configurar aplicação
     ↓
Iniciar aplicação
```

em um fluxo automatizado:

```text
Código
  ↓
Build
  ↓
Testes
  ↓
Imagem/Artefato
  ↓
Deploy
  ↓
Monitoramento
```

Com CI/CD, cada alteração no código pode passar automaticamente por uma sequência de validações antes de chegar a um ambiente de execução.

Isso reduz tarefas repetitivas, aumenta a rastreabilidade e ajuda a identificar problemas mais cedo.

---

## 2. O que significa CI/CD?

CI/CD é normalmente dividido em:

* **CI — Continuous Integration**
* **CD — Continuous Delivery**
* **CD — Continuous Deployment**

Embora os termos sejam relacionados, eles representam etapas diferentes do processo.

---

## 3. Continuous Integration — CI

**Continuous Integration**, ou **Integração Contínua**, é a prática de integrar alterações de código frequentemente em um repositório compartilhado.

Cada alteração pode disparar automaticamente:

* checkout do código;
* instalação de dependências;
* análise estática;
* compilação;
* testes;
* validações de segurança;
* geração de artefatos.

Exemplo:

```text
Desenvolvedor
     ↓
git push
     ↓
Repositório Git
     ↓
Pipeline CI
     ↓
Build
     ↓
Testes
     ↓
Resultado
```

Se os testes falharem, a pipeline deve informar que aquela alteração possui um problema.

### Objetivo do CI

O objetivo principal é detectar problemas rapidamente.

Quanto mais tempo uma alteração permanece sem ser integrada ao restante do projeto, maior pode ser a dificuldade para identificar e corrigir conflitos.

---

## 4. Continuous Delivery — Entrega Contínua

**Continuous Delivery**, ou **Entrega Contínua**, amplia o conceito de CI.

Depois que o código passa pelas validações, ele fica preparado para ser disponibilizado em um ambiente.

Exemplo:

```text
Código
  ↓
Build
  ↓
Testes
  ↓
Artefato
  ↓
Ambiente de homologação
  ↓
Aprovação
  ↓
Produção
```

A característica importante é que a aplicação está sempre em uma condição adequada para ser implantada.

O deploy em produção pode depender de uma aprovação manual.

---

## 5. Continuous Deployment — Implantação Contínua

**Continuous Deployment**, ou **Implantação Contínua**, vai além da entrega contínua.

Depois que a alteração passa pelas validações, o sistema pode realizar automaticamente o deploy em produção.

```text
Código
  ↓
Build
  ↓
Testes
  ↓
Imagem
  ↓
Deploy
  ↓
Produção
```

Nesse modelo, não existe necessariamente uma aprovação manual antes da produção.

Por isso, os testes e mecanismos de segurança precisam ser confiáveis.

---

## 6. CI, Continuous Delivery e Continuous Deployment

Podemos representar os três conceitos assim:

```text
                    CI
                    │
                    ▼
              Build + Testes
                    │
                    ▼
             Artefato válido
                    │
                    ▼
          Continuous Delivery
                    │
                    ▼
        Pronto para produção
                    │
                    ▼
        Continuous Deployment
                    │
                    ▼
             Produção
```

Uma forma simples de lembrar:

| Conceito              | Objetivo                               |
| --------------------- | -------------------------------------- |
| CI                    | Integrar e validar alterações          |
| Continuous Delivery   | Manter a aplicação pronta para entrega |
| Continuous Deployment | Implantar automaticamente              |

---

## 7. O pipeline CI/CD

Um **pipeline** é uma sequência automatizada de etapas executadas para transformar código-fonte em uma aplicação implantada.

Um pipeline pode ser representado assim:

```text
Código
  ↓
Checkout
  ↓
Build
  ↓
Testes
  ↓
Análise de qualidade
  ↓
Build da imagem
  ↓
Push da imagem
  ↓
Deploy
  ↓
Smoke Test
  ↓
Monitoramento
```

Cada etapa pode depender do sucesso da etapa anterior.

Por exemplo:

```text
Build
  │
  ├── sucesso → Testes
  │
  └── falha → Pipeline interrompida
```

---

## 8. Código-fonte

O primeiro elemento do pipeline é o código.

Normalmente ele fica armazenado em um sistema de controle de versão, como Git.

Exemplo:

```bash
git clone https://github.com/pangolimbr/projeto.git
cd projeto
```

Depois de realizar uma alteração:

```bash
git add .
git commit -m "Atualiza aplicação"
git push
```

O `push` pode disparar automaticamente a pipeline.

---

## 9. Git no CI/CD

Git é uma das principais tecnologias utilizadas em ambientes CI/CD.

Um fluxo comum é:

```text
Developer
    │
    ▼
Feature Branch
    │
    ▼
Pull Request
    │
    ▼
CI
    │
    ├── Build
    ├── Testes
    └── Análises
    │
    ▼
Merge
    │
    ▼
main
    │
    ▼
CD
```

Isso permite associar uma alteração de código aos resultados da pipeline.

---

## 10. Branches e CI/CD

Branches permitem trabalhar em alterações diferentes sem modificar diretamente a versão principal do projeto.

Exemplo:

```text
main
 │
 ├── feature/login
 │
 ├── feature/api
 │
 └── fix/database
```

Uma prática comum é executar a CI em todas as Pull Requests.

Exemplo:

```text
Pull Request
      ↓
Pipeline CI
      ↓
Build
      ↓
Testes
      ↓
Análise
      ↓
Aprovado
      ↓
Merge
```

---

## 11. Build

O **build** transforma o código-fonte em uma versão que pode ser executada ou distribuída.

Dependendo da tecnologia, pode envolver:

```text
Código
  ↓
Compilação
  ↓
Dependências
  ↓
Pacote
```

Exemplos:

### Java

```bash
mvn clean package
```

### Node.js

```bash
npm install
npm run build
```

### Python

Dependendo do projeto, o build pode envolver:

```bash
pip install -r requirements.txt
```

ou a criação de um pacote distribuível.

---

## 12. Testes

Os testes verificam se a aplicação continua funcionando conforme esperado.

Alguns tipos comuns:

* testes unitários;
* testes de integração;
* testes funcionais;
* testes de API;
* testes de segurança;
* testes de regressão.

Exemplo:

```text
Build
  ↓
Testes unitários
  ↓
Testes de integração
  ↓
Testes funcionais
```

Se uma etapa crítica falhar:

```text
Teste
  ↓
FALHA
  ↓
Pipeline interrompida
```

---

## 13. Análise de código

Uma pipeline também pode realizar verificações automáticas no código.

Exemplos:

* análise estática;
* lint;
* vulnerabilidades;
* secrets expostos;
* qualidade do código;
* dependências vulneráveis.

O objetivo é identificar problemas antes da implantação.

---

## 14. Artefatos

Um **artefato** é um resultado produzido durante a pipeline.

Exemplos:

```text
arquivo .jar
arquivo .war
pacote .deb
pacote .rpm
arquivo .zip
imagem Docker
```

Exemplo:

```text
Código
   ↓
Build
   ↓
app.jar
```

O artefato pode ser armazenado em um repositório para ser utilizado posteriormente.

---

## 15. Containers e CI/CD

Containers são muito utilizados em pipelines modernas.

O Docker permite empacotar a aplicação juntamente com suas dependências.

Exemplo:

```text
Código
  ↓
Dockerfile
  ↓
docker build
  ↓
Imagem
```

Exemplo de `Dockerfile`:

```dockerfile
FROM nginx:alpine

COPY ./site /usr/share/nginx/html

EXPOSE 80
```

Construção:

```bash
docker build -t minha-aplicacao:1.0 .
```

Execução:

```bash
docker run -d -p 8080:80 minha-aplicacao:1.0
```

---

## 16. Tags de imagens

As imagens devem possuir versões identificáveis.

Exemplo:

```text
minha-aplicacao:1.0
minha-aplicacao:1.1
minha-aplicacao:1.2
```

Também é possível utilizar o commit do Git:

```text
minha-aplicacao:a81f93c
```

Isso melhora a rastreabilidade.

Podemos descobrir exatamente qual código originou uma imagem.

---

## 17. Container Registry

Depois de criar uma imagem, ela pode ser enviada para um **Container Registry**.

Exemplo:

```text
Pipeline
   ↓
docker build
   ↓
Imagem
   ↓
docker push
   ↓
Registry
```

Exemplos de registries:

* GitHub Container Registry;
* Docker Hub;
* GitLab Container Registry;
* Amazon ECR;
* Google Artifact Registry;
* Azure Container Registry;
* registries privados.

Exemplo:

```bash
docker tag minha-aplicacao:1.0 registry.exemplo.com/minha-aplicacao:1.0

docker push registry.exemplo.com/minha-aplicacao:1.0
```

---

## 18. Deploy

**Deploy** é o processo de disponibilizar uma aplicação em um ambiente.

Pode ocorrer em:

* servidor Linux;
* máquina virtual;
* container;
* Kubernetes;
* cloud;
* ambiente on-premises.

Exemplo simples:

```text
Pipeline
   ↓
Imagem
   ↓
Servidor
   ↓
Container
```

---

## 19. CI/CD com Kubernetes

Em ambientes Kubernetes, o pipeline pode gerar uma imagem e depois atualizar o Deployment.

Fluxo:

```text
Git
 ↓
CI
 ↓
Build
 ↓
Docker Image
 ↓
Registry
 ↓
Kubernetes
 ↓
Deployment
 ↓
Pod
```

Exemplo:

```bash
kubectl set image deployment/minha-aplicacao \
  minha-aplicacao=registry.exemplo.com/minha-aplicacao:1.2
```

O Kubernetes então pode criar novos Pods com a versão atualizada.

---

## 20. Rolling Update

Uma das vantagens do Kubernetes é realizar atualizações graduais.

Exemplo:

```text
Versão 1.0

Pod 1 → v1.0
Pod 2 → v1.0
Pod 3 → v1.0
```

Durante o deploy:

```text
Pod 1 → v1.1
Pod 2 → v1.0
Pod 3 → v1.0
```

Depois:

```text
Pod 1 → v1.1
Pod 2 → v1.1
Pod 3 → v1.0
```

Finalmente:

```text
Pod 1 → v1.1
Pod 2 → v1.1
Pod 3 → v1.1
```

Isso reduz a necessidade de interromper toda a aplicação durante uma atualização.

---

## 21. Jenkins

O **Jenkins** é uma das ferramentas tradicionais de automação de CI/CD.

Ele permite criar pipelines compostas por diferentes etapas.

Exemplo:

```text
Jenkins
   │
   ├── Checkout
   ├── Build
   ├── Test
   ├── Docker Build
   ├── Docker Push
   └── Deploy
```

Um pipeline Jenkins pode ser definido através de um arquivo chamado:

```text
Jenkinsfile
```

---

## 22. Exemplo de Jenkinsfile

Exemplo básico:

```groovy
pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'echo "Executando build"'
            }
        }

        stage('Test') {
            steps {
                sh 'echo "Executando testes"'
            }
        }

        stage('Deploy') {
            steps {
                sh 'echo "Executando deploy"'
            }
        }
    }
}
```

A estrutura pode ser entendida assim:

```text
pipeline
   │
   ├── agent
   │
   └── stages
        │
        ├── Checkout
        ├── Build
        ├── Test
        └── Deploy
```

---

## 23. GitHub Actions

Outra alternativa bastante utilizada é o **GitHub Actions**.

Nesse modelo, os workflows ficam dentro do próprio repositório:

```text
.github/
└── workflows/
    └── ci.yml
```

Exemplo:

```yaml
name: CI

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build
        run: |
          echo "Executando build"

      - name: Test
        run: |
          echo "Executando testes"
```

Nesse exemplo, um `push` para `main` ou uma Pull Request pode iniciar automaticamente a pipeline.

---

## 24. Jenkins x GitHub Actions

As duas ferramentas podem executar tarefas semelhantes.

| Característica         | Jenkins                                   | GitHub Actions      |
| ---------------------- | ----------------------------------------- | ------------------- |
| Pipeline como código   | Jenkinsfile                               | YAML                |
| Execução               | Agents                                    | Runners             |
| Integração com GitHub  | Sim                                       | Nativa              |
| Hospedagem             | Normalmente administrada pela organização | Integrada ao GitHub |
| Plugins                | Grande ecossistema                        | Actions             |
| Infraestrutura própria | Comum                                     | Opcional            |

A escolha depende do ambiente, requisitos de infraestrutura, segurança, integração e modelo operacional.

---

## 25. Secrets

Pipelines frequentemente precisam acessar recursos protegidos.

Exemplos:

```text
Senha
Token
Chave SSH
Credencial de Registry
Credencial de banco
API Token
```

Esses valores **não devem ser colocados diretamente no código**.

Evite:

```yaml
password: MinhaSenha123
```

Prefira mecanismos de secrets da plataforma utilizada.

Exemplo conceitual:

```text
Pipeline
   │
   ├── Código
   │
   └── Secret
          ↓
       Serviço
```

Os secrets devem possuir permissões mínimas necessárias.

---

## 26. Variáveis de ambiente

As pipelines também utilizam variáveis de ambiente.

Exemplo:

```bash
export APP_ENV=production
```

Uma aplicação pode utilizar:

```text
APP_ENV
DATABASE_HOST
DATABASE_PORT
API_URL
```

Isso permite separar configurações do código.

Exemplo:

```text
Código
   +
Configuração
   ↓
Aplicação
```

---

## 27. Ambientes

Um processo CI/CD normalmente trabalha com diferentes ambientes.

Exemplo:

```text
Development
      ↓
     CI
      ↓
Homologação
      ↓
    Aprovação
      ↓
Produção
```

Os nomes podem variar:

```text
DEV
HML
PRD
```

ou:

```text
Development
Staging
Production
```

Cada ambiente pode possuir configurações e recursos diferentes.

---

## 28. Estratégia de promoção

Uma aplicação pode ser promovida entre ambientes utilizando o mesmo artefato.

Exemplo:

```text
Build
  ↓
Imagem 1.5
  ↓
DEV
  ↓
HML
  ↓
PRD
```

O ideal é evitar reconstruir o código para cada ambiente quando isso puder alterar o artefato.

O mesmo artefato validado pode ser promovido.

---

## 29. Rollback

Uma pipeline de produção deve considerar a possibilidade de uma implantação apresentar problemas.

Rollback significa retornar para uma versão anterior.

Exemplo:

```text
Produção

v1.2
 ↓
Problema
 ↓
Rollback
 ↓
v1.1
```

No Kubernetes:

```bash
kubectl rollout history deployment/minha-aplicacao
```

Para retornar:

```bash
kubectl rollout undo deployment/minha-aplicacao
```

O rollback depende da forma como o deploy foi implementado e da disponibilidade das versões anteriores.

---

## 30. Health Check

Depois do deploy, é importante verificar se a aplicação está funcionando.

Podemos realizar:

```text
Deploy
  ↓
Health Check
  ↓
HTTP 200?
  ↓
Sim → sucesso
Não → falha
```

Exemplo:

```bash
curl -f http://localhost:8080/health
```

Se o comando retornar erro:

```text
Deploy
  ↓
Health Check
  ↓
FALHA
  ↓
Rollback
```

---

## 31. Smoke Test

O **Smoke Test** é uma validação rápida para verificar se as funções básicas da aplicação estão funcionando.

Exemplo:

```bash
curl -f https://app.exemplo.com/
```

Podemos também testar uma API:

```bash
curl -f https://app.exemplo.com/api/health
```

O objetivo não é substituir toda a suíte de testes, mas verificar rapidamente se o sistema está operacional.

---

## 32. Monitoramento

CI/CD não termina necessariamente no deploy.

Depois da implantação, precisamos observar a aplicação.

Um fluxo mais completo é:

```text
Código
  ↓
Build
  ↓
Testes
  ↓
Imagem
  ↓
Deploy
  ↓
Health Check
  ↓
Monitoramento
```

Ferramentas como:

* Zabbix;
* Prometheus;
* Grafana;
* Loki;
* Elasticsearch;
* sistemas de logs;

podem fazer parte dessa etapa.

---

## 33. Observabilidade

Monitoramento permite verificar se o sistema está funcionando.

Observabilidade amplia essa capacidade através da análise de:

* métricas;
* logs;
* traces.

Exemplo:

```text
Aplicação
   │
   ├── Métricas
   ├── Logs
   └── Traces
          ↓
    Observabilidade
```

Em um ambiente CI/CD, isso ajuda a verificar o comportamento da aplicação após uma implantação.

---

## 34. Pipeline completo

Um pipeline moderno pode ser representado assim:

```text
                    Git
                     │
                     ▼
                Pull Request
                     │
                     ▼
                   CI
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        Build      Testes    Segurança
          │          │          │
          └──────────┼──────────┘
                     ▼
                  Artefato
                     │
                     ▼
                Docker Build
                     │
                     ▼
               Container Image
                     │
                     ▼
                  Registry
                     │
                     ▼
                  Deploy
                     │
                     ▼
                Kubernetes
                     │
                     ▼
                Health Check
                     │
                     ▼
                Monitoramento
```

Esse fluxo representa uma arquitetura comum, mas cada organização pode adaptá-lo às suas necessidades.

---

## 35. Exemplo prático de pipeline

Considere uma aplicação chamada:

```text
minha-aplicacao
```

O desenvolvedor altera o código:

```bash
git add .
git commit -m "Atualiza aplicação"
git push
```

A pipeline é acionada.

### Etapa 1 — Checkout

```text
Git → Pipeline
```

### Etapa 2 — Build

```text
Código → Aplicação
```

### Etapa 3 — Testes

```text
Aplicação → Testes
```

### Etapa 4 — Imagem

```bash
docker build -t minha-aplicacao:1.0 .
```

### Etapa 5 — Registry

```bash
docker push registry.exemplo.com/minha-aplicacao:1.0
```

### Etapa 6 — Deploy

```bash
kubectl set image deployment/minha-aplicacao \
  minha-aplicacao=registry.exemplo.com/minha-aplicacao:1.0
```

### Etapa 7 — Verificação

```bash
kubectl rollout status deployment/minha-aplicacao
```

### Etapa 8 — Monitoramento

Verificar:

```bash
kubectl get pods
kubectl get deployment
kubectl logs deployment/minha-aplicacao
```

---

## 36. Falhas no pipeline

Uma das principais vantagens do CI/CD é interromper o fluxo quando uma etapa importante falha.

Exemplo:

```text
Checkout
   ↓
Build
   ↓
Testes
   ↓
FALHA
   ↓
Pipeline interrompida
```

Outro exemplo:

```text
Build
   ↓
Testes
   ↓
Imagem
   ↓
Push
   ↓
Deploy
   ↓
Health Check
   ↓
FALHA
```

Nesse caso, pode ser necessário:

```text
Diagnóstico
    ↓
Correção
    ↓
Novo deploy
```

ou:

```text
Falha
  ↓
Rollback
```

---

## 37. Idempotência

Um conceito importante para automação é **idempotência**.

Uma operação idempotente pode ser executada várias vezes sem produzir efeitos inesperados.

Por exemplo, uma automação de configuração deve conseguir verificar:

```text
Estado atual
     ↓
Precisa alterar?
     ↓
Sim → altera
Não → mantém
```

Isso é especialmente importante em:

* Ansible;
* Kubernetes;
* Terraform;
* pipelines de infraestrutura.

---

## 38. Infrastructure as Code

CI/CD também pode ser utilizado para infraestrutura.

Em vez de configurar servidores manualmente:

```text
Administrador
     ↓
Servidor
     ↓
Configuração manual
```

podemos utilizar código:

```text
Git
 ↓
Código de infraestrutura
 ↓
Pipeline
 ↓
Validação
 ↓
Deploy
```

Exemplos de ferramentas:

* Ansible;
* Terraform;
* OpenTofu;
* Kubernetes manifests;
* Helm.

---

## 39. CI/CD e DevOps

CI/CD é uma parte importante da cultura DevOps.

Uma visão simplificada:

```text
Planejar
   ↓
Codificar
   ↓
Build
   ↓
Testar
   ↓
Liberar
   ↓
Implantar
   ↓
Operar
   ↓
Monitorar
   ↓
Feedback
   └──────────────→ Planejar
```

O objetivo é diminuir o intervalo entre uma alteração e sua disponibilização de forma controlada.

---

## 40. CI/CD e Linux

Para um profissional de infraestrutura Linux, conhecer CI/CD significa também entender os componentes que sustentam a pipeline.

É importante conhecer:

### Linux

```text
Processos
Serviços
Permissões
Filesystem
Rede
SSH
Logs
Shell
```

### Git

```text
clone
branch
add
commit
push
pull
merge
rebase
tag
```

### Containers

```text
Docker
Containerd
OCI
Registry
```

### Kubernetes

```text
Pod
Deployment
Service
ConfigMap
Secret
Namespace
Ingress
```

### Automação

```text
Jenkins
GitHub Actions
GitLab CI/CD
Ansible
Terraform/OpenTofu
```

---

## 41. Boas práticas

Algumas práticas importantes para pipelines:

## 41.1 Pipeline como código

Evite depender exclusivamente de configurações manuais.

Prefira arquivos versionados:

```text
Jenkinsfile
.github/workflows/ci.yml
.gitlab-ci.yml
```

---

## 41.2 Falhar cedo

Execute validações importantes o mais cedo possível.

```text
Lint
 ↓
Build
 ↓
Testes
 ↓
Segurança
 ↓
Deploy
```

Se o código possui um erro básico, não faz sentido avançar para etapas caras.

---

## 41.3 Artefatos versionados

Use versões identificáveis:

```text
app:1.0.0
app:1.1.0
app:1.2.0
```

ou:

```text
app:a81f93c
```

---

## 41.4 Não armazenar secrets no Git

Nunca coloque diretamente no repositório:

```text
senhas
tokens
chaves privadas
credenciais
```

Utilize mecanismos apropriados de gerenciamento de secrets.

---

## 41.5 Logs

A pipeline deve produzir logs suficientes para permitir diagnóstico.

Exemplo:

```text
BUILD START
BUILD SUCCESS
TEST START
TEST SUCCESS
IMAGE BUILD
IMAGE PUSH
DEPLOY START
DEPLOY SUCCESS
```

---

## 41.6 Permissões mínimas

A conta utilizada pela pipeline deve possuir apenas as permissões necessárias.

Por exemplo:

```text
Pipeline
   ↓
Registry → push
Kubernetes → atualizar aplicação
```

Não é recomendável conceder privilégios administrativos indiscriminadamente.

---

## 41.7 Reprodutibilidade

Uma pipeline deve produzir resultados previsíveis.

Evite depender de configurações manuais existentes em determinado servidor.

Quanto mais o processo estiver definido em código, mais fácil será reproduzi-lo.

---

## 42. Segurança no CI/CD

CI/CD também precisa ser protegido.

Uma pipeline comprometida pode ter acesso a:

```text
Código
Credenciais
Registry
Servidores
Kubernetes
Cloud
```

Por isso, devem ser considerados:

* controle de acesso;
* secrets;
* RBAC;
* revisão de código;
* proteção de branches;
* auditoria;
* análise de dependências;
* scanning de imagens;
* isolamento dos runners/agents.

---

## 43. Supply Chain

A cadeia de fornecimento de software também precisa ser considerada.

Uma aplicação pode depender de:

```text
Código
 ↓
Dependências
 ↓
Bibliotecas
 ↓
Imagem base
 ↓
Container
 ↓
Registry
 ↓
Produção
```

Uma vulnerabilidade em qualquer componente pode representar um risco.

Por isso, ferramentas de segurança podem verificar:

```text
Código
Dependências
Container Image
Infraestrutura
Secrets
```

---

## 44. Blue/Green Deployment

No modelo **Blue/Green**, dois ambientes podem coexistir.

```text
          Load Balancer
               │
        ┌──────┴──────┐
        ▼             ▼
      Blue          Green
      v1.0           v1.1
```

O tráfego pode inicialmente apontar para Blue.

Depois da validação:

```text
Blue → v1.0
Green → v1.1

       ↓

Tráfego → Green
```

Caso seja necessário retornar:

```text
Tráfego → Blue
```

---

## 45. Canary Deployment

No **Canary Deployment**, a nova versão recebe inicialmente uma pequena parcela do tráfego.

Exemplo:

```text
v1.0 → 90%
v1.1 → 10%
```

Se os indicadores permanecerem adequados:

```text
v1.0 → 50%
v1.1 → 50%
```

Depois:

```text
v1.1 → 100%
```

Esse modelo permite observar a nova versão antes de disponibilizá-la para todos os usuários.

---

## 46. GitOps

**GitOps** utiliza o Git como fonte de verdade para o estado desejado da infraestrutura e das aplicações.

Fluxo simplificado:

```text
Git
 ↓
Manifestos
 ↓
Sistema GitOps
 ↓
Kubernetes
```

Uma alteração pode ser feita no Git:

```yaml
image:
  repository: minha-aplicacao
  tag: "1.2"
```

Um agente GitOps identifica a alteração e sincroniza o ambiente.

Ferramentas conhecidas nesse modelo incluem:

* Argo CD;
* Flux.

---

## 47. CI/CD tradicional x GitOps

Fluxo tradicional:

```text
Pipeline
   ↓
kubectl
   ↓
Kubernetes
```

Fluxo GitOps:

```text
Pipeline
   ↓
Git
   ↓
Argo CD / Flux
   ↓
Kubernetes
```

No segundo modelo, o Git pode representar o estado desejado do ambiente.

---

## 48. Métricas de CI/CD

É possível medir a eficiência do processo.

Algumas métricas importantes:

### Lead Time for Changes

Tempo entre a alteração e sua disponibilização.

```text
Commit → Produção
```

### Deployment Frequency

Frequência de implantações.

```text
Deploys por dia/semana/mês
```

### Change Failure Rate

Percentual de alterações que resultam em falhas.

```text
Deploys com falha / Total de deploys
```

### Mean Time to Recovery — MTTR

Tempo médio necessário para recuperar o serviço após uma falha.

Essas métricas ajudam a identificar gargalos no processo.

---

## 49. Troubleshooting de uma pipeline

Quando uma pipeline falhar, analise etapa por etapa.

### 1. Verificar o gatilho

```text
A pipeline iniciou?
```

### 2. Verificar checkout

```text
O código foi baixado?
```

### 3. Verificar build

```text
O código compilou?
```

### 4. Verificar testes

```text
Algum teste falhou?
```

### 5. Verificar imagem

```text
A imagem foi criada?
```

### 6. Verificar registry

```text
O push funcionou?
```

### 7. Verificar deploy

```text
O recurso foi atualizado?
```

### 8. Verificar aplicação

```text
Os Pods estão funcionando?
```

### 9. Verificar logs

```bash
kubectl logs <pod>
```

### 10. Verificar rollout

```bash
kubectl rollout status deployment/<deployment>
```

---

## 50. Fluxo de troubleshooting

Uma forma prática de investigar:

```text
Pipeline falhou
      ↓
Qual etapa?
      ↓
┌─────┼─────┬─────┬─────┐
Build Test  Image Deploy
```

Depois, analisar os logs da etapa.

Não é recomendável alterar várias coisas simultaneamente.

Uma investigação organizada deve:

```text
Problema
   ↓
Evidência
   ↓
Hipótese
   ↓
Teste
   ↓
Resultado
   ↓
Próximo passo
```

---

## 51. Laboratório sugerido

Para estudar CI/CD na prática, podemos montar um laboratório simples.

## Componentes

```text
GitHub
   ↓
Jenkins
   ↓
Docker
   ↓
Registry
   ↓
Kubernetes
   ↓
Aplicação
```

Uma alternativa mais simples:

```text
GitHub
   ↓
GitHub Actions
   ↓
Docker
   ↓
Registry
```

E posteriormente:

```text
GitHub Actions
      ↓
Docker Registry
      ↓
Kubernetes
```

---

## 52. Laboratório 1 — Pipeline básica

Criar um projeto contendo:

```text
projeto/
├── README.md
├── Dockerfile
└── index.html
```

Exemplo:

```html
<!DOCTYPE html>
<html>
<head>
    <title>CI/CD</title>
</head>
<body>
    <h1>Pangolim</h1>
    <p>Pipeline CI/CD funcionando.</p>
</body>
</html>
```

Dockerfile:

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
```

Build:

```bash
docker build -t infra-linux-cicd:1.0 .
```

Executar:

```bash
docker run -d \
  --name infra-linux-cicd \
  -p 8080:80 \
  infra-linux-cicd:1.0
```

Testar:

```bash
curl http://localhost:8080
```

---

## 53. Laboratório 2 — GitHub Actions

Criar:

```text
.github/
└── workflows/
    └── ci.yml
```

Exemplo:

```yaml
name: CI

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build -t infra-linux-cicd:latest .

      - name: Test
        run: |
          docker run -d \
            --name cicd-test \
            -p 8080:80 \
            infra-linux-cicd:latest

          sleep 5

          curl --fail http://localhost:8080
```

O fluxo será:

```text
git push
   ↓
GitHub
   ↓
GitHub Actions
   ↓
Checkout
   ↓
Docker Build
   ↓
Container
   ↓
curl
   ↓
Resultado
```

---

## 54. Laboratório 3 — Jenkins

Depois de compreender o pipeline básico, podemos reproduzir o processo utilizando Jenkins.

Fluxo:

```text
GitHub
   ↓
Jenkins
   ↓
Checkout
   ↓
Build
   ↓
Test
   ↓
Docker Build
   ↓
Docker Push
```

Criar um:

```text
Jenkinsfile
```

e armazená-lo junto ao código.

---

## 55. Laboratório 4 — Kubernetes

Depois de dominar o pipeline anterior, adicionar Kubernetes.

Fluxo:

```text
GitHub
   ↓
CI
   ↓
Docker Build
   ↓
Registry
   ↓
Kubernetes
   ↓
Deployment
   ↓
Service
```

Exemplo de Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: infra-linux-cicd

spec:
  replicas: 2

  selector:
    matchLabels:
      app: infra-linux-cicd

  template:
    metadata:
      labels:
        app: infra-linux-cicd

    spec:
      containers:
        - name: nginx
          image: nginx:alpine

          ports:
            - containerPort: 80
```

Aplicar:

```bash
kubectl apply -f deployment.yaml
```

Verificar:

```bash
kubectl get deployment
kubectl get pods
```

---

## 56. O que estudar primeiro?

Para aprender CI/CD de forma consistente, uma sequência recomendada é:

```text
1. Linux
   ↓
2. Git
   ↓
3. Shell
   ↓
4. Docker
   ↓
5. CI
   ↓
6. Jenkins / GitHub Actions
   ↓
7. Registry
   ↓
8. Kubernetes
   ↓
9. CD
   ↓
10. GitOps
```

É importante não tentar aprender todas as ferramentas simultaneamente.

Primeiro compreenda o fluxo.

Depois aprenda as ferramentas utilizadas para automatizar cada etapa.

---

## 57. Resumo

CI/CD automatiza o caminho entre o código e a aplicação em execução.

O fluxo básico pode ser lembrado como:

```text
Código
  ↓
Build
  ↓
Testes
  ↓
Artefato
  ↓
Imagem
  ↓
Registry
  ↓
Deploy
  ↓
Health Check
  ↓
Monitoramento
```

CI está relacionado principalmente à integração e validação das alterações.

Continuous Delivery mantém a aplicação preparada para entrega.

Continuous Deployment automatiza também a implantação.

Ferramentas como Jenkins e GitHub Actions podem executar pipelines.

Docker pode ser utilizado para empacotar aplicações.

Registries armazenam imagens.

Kubernetes pode executar e atualizar as aplicações.

Ferramentas de monitoramento permitem acompanhar o comportamento depois do deploy.

O conceito mais importante não é decorar uma ferramenta específica, mas entender o fluxo:

```text
Código
  ↓
Automação
  ↓
Validação
  ↓
Artefato
  ↓
Entrega
  ↓
Implantação
  ↓
Observabilidade
```

---

## 58. Checklist de conhecimento

Antes de avançar para tópicos mais complexos, você deve conseguir explicar:

* [ ] O que é CI.
* [ ] O que é Continuous Delivery.
* [ ] O que é Continuous Deployment.
* [ ] O que é uma pipeline.
* [ ] O que é um artefato.
* [ ] O que é uma imagem Docker.
* [ ] O que é um Container Registry.
* [ ] Como Git participa do CI/CD.
* [ ] Como uma pipeline é disparada.
* [ ] O que é um Jenkinsfile.
* [ ] O que é GitHub Actions.
* [ ] O que são runners e agents.
* [ ] Como secrets são utilizados.
* [ ] Como funciona um deploy.
* [ ] Como verificar um deploy no Kubernetes.
* [ ] O que é rollback.
* [ ] O que é health check.
* [ ] O que é rolling update.
* [ ] O que é Blue/Green Deployment.
* [ ] O que é Canary Deployment.
* [ ] O que é GitOps.
* [ ] Como investigar uma pipeline que falhou.
* [ ] Como CI/CD se relaciona com DevOps.

---

## 59. Próximos estudos

Depois dos fundamentos, os próximos assuntos podem ser estudados nesta ordem:

```text
CI/CD
 │
 ├── GitHub Actions
 │
 ├── Jenkins
 │
 ├── Docker em CI/CD
 │
 ├── Container Registry
 │
 ├── CI/CD com Kubernetes
 │
 ├── Secrets
 │
 ├── Deploy Strategies
 │
 ├── GitOps
 │
 └── Observabilidade
```

O objetivo é evoluir de uma pipeline simples:

```text
Git
 ↓
Build
 ↓
Test
```

para uma pipeline completa:

```text
Git
 ↓
CI
 ↓
Build
 ↓
Test
 ↓
Security
 ↓
Docker
 ↓
Registry
 ↓
Kubernetes
 ↓
Health Check
 ↓
Monitoring
```
