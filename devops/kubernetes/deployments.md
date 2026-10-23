---
layout: default
description: "Deployments no Kubernetes: criação, réplicas e gerenciamento de atualizações de aplicações."
title: Deployments
---

# Deployments no Kubernetes
{:.no_toc}

Um **Deployment** no Kubernetes é o recurso usado para criar, atualizar e manter aplicações rodando em Pods.

Ele controla a quantidade de réplicas, faz atualizações sem derrubar tudo de uma vez e permite voltar para uma versão anterior caso algo dê errado.

Na prática, o Deployment gerencia um **ReplicaSet**, e o ReplicaSet mantém os **Pods** na quantidade desejada.

```text
Deployment
└── ReplicaSet
    ├── Pod
    ├── Pod
    └── Pod
```

---


<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Pré-requisitos

Antes de aplicar um Deployment, valide se o `kubectl` está apontando para o cluster correto:

```bash
kubectl config current-context
```

Verifique se o namespace existe:

```bash
kubectl get ns
```

Se for usar imagens privadas, confirme se o Secret de pull da imagem existe:

```bash
kubectl get secret -n default
```

---

## Quando usar um Deployment?

Use um Deployment quando você precisa rodar uma aplicação de forma contínua, como:

- APIs
- aplicações web
- microsserviços
- backends
- workers
- aplicações stateless

Exemplos comuns:

```bash
nginx
apache
tomcat
nodejs
spring boot
python flask
```

---

## Estrutura básica de um Deployment

Exemplo simples usando Nginx:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
```

---

## Explicando o YAML

### apiVersion

Define a versão da API usada pelo recurso.

```yaml
apiVersion: apps/v1
```

Para Deployment, normalmente usamos:

```yaml
apps/v1
```

---

### kind

Define o tipo de recurso Kubernetes.

```yaml
kind: Deployment
```

---

### metadata

Contém informações de identificação do recurso.

```yaml
metadata:
  name: nginx-deployment
  namespace: default
```

- `name`: nome do Deployment
- `namespace`: namespace onde o recurso será criado

---

### replicas

Define quantos Pods devem ficar rodando.

```yaml
replicas: 2
```

Nesse exemplo, o Kubernetes tentará manter sempre 2 Pods ativos.

---

### selector

Define quais Pods pertencem a esse Deployment.

```yaml
selector:
  matchLabels:
    app: nginx
```

O `selector` precisa bater com os labels definidos no template do Pod.

---

### template

Define como os Pods serão criados.

```yaml
template:
  metadata:
    labels:
      app: nginx
```

Esse label será usado pelo Deployment e também pode ser usado por um Service.

---

### containers

Define os containers que vão rodar dentro do Pod.

```yaml
containers:
  - name: nginx
    image: nginx:latest
    ports:
      - containerPort: 80
```

- `name`: nome do container
- `image`: imagem usada
- `containerPort`: porta exposta dentro do container

---

## Aplicando o Deployment

Salve o arquivo como:

```bash
deployment-nginx.yaml
```

Aplique no cluster:

```bash
kubectl apply -f deployment-nginx.yaml
```

Para validar o manifesto antes de aplicar:

```bash
kubectl apply -f deployment-nginx.yaml --dry-run=client
```

Verifique se o Deployment foi criado:

```bash
kubectl get deployment
```

Verifique os Pods:

```bash
kubectl get pods
```

Verifique mais detalhes:

```bash
kubectl describe deployment nginx-deployment
```

---

## Verificando logs

Para ver os logs de um Pod:

```bash
kubectl logs nome-do-pod
```

Exemplo:

```bash
kubectl logs nginx-deployment-xxxxxxxxxx-yyyyy
```

Para acompanhar os logs em tempo real:

```bash
kubectl logs -f nome-do-pod
```

---

## Atualizando a imagem

Para alterar a imagem diretamente pelo comando:

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.25
```

Verifique o andamento do rollout:

```bash
kubectl rollout status deployment/nginx-deployment
```

Para reiniciar os Pods sem alterar a imagem:

```bash
kubectl rollout restart deployment/nginx-deployment
```

---

## Histórico de versões

Veja o histórico do Deployment:

```bash
kubectl rollout history deployment/nginx-deployment
```

Para ver detalhes de uma revisão:

```bash
kubectl rollout history deployment/nginx-deployment --revision=2
```

---

## Rollback

Caso a nova versão tenha problema, volte para a versão anterior:

```bash
kubectl rollout undo deployment/nginx-deployment
```

Para voltar para uma revisão específica:

```bash
kubectl rollout undo deployment/nginx-deployment --to-revision=2
```

---

## Pausar e retomar rollout

Em mudanças maiores, é possível pausar o rollout antes de continuar a atualização:

```bash
kubectl rollout pause deployment/nginx-deployment
```

Retomar:

```bash
kubectl rollout resume deployment/nginx-deployment
```

Verificar status:

```bash
kubectl rollout status deployment/nginx-deployment
```

---

## Escalando réplicas

Para aumentar ou diminuir a quantidade de Pods:

```bash
kubectl scale deployment nginx-deployment --replicas=4
```

Verifique:

```bash
kubectl get pods
```

---

## Removendo o Deployment

Para remover:

```bash
kubectl delete deployment nginx-deployment
```

Ou, se foi criado por arquivo:

```bash
kubectl delete -f deployment-nginx.yaml
```

---

## Exemplo mais completo

Abaixo um exemplo mais parecido com ambiente real, usando:

- Deployment
- Service
- recursos de CPU/memória
- probes de saúde
- variável de ambiente

---

### Deployment completo

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minha-aplicacao
  namespace: default
  labels:
    app: minha-aplicacao
spec:
  replicas: 2
  selector:
    matchLabels:
      app: minha-aplicacao
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: minha-aplicacao
    spec:
      containers:
        - name: minha-aplicacao
          image: nginx:1.25
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80

          env:
            - name: AMBIENTE
              value: "homologacao"

          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"

          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10

          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 20
```

---

### Service

O Deployment cria os Pods, mas o acesso interno normalmente é feito por um Service.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: minha-aplicacao-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: minha-aplicacao
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
```

---

### Ingress

Se o cluster tiver Ingress Controller configurado, é possível expor a aplicação por URL.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: minha-aplicacao-ingress
  namespace: default
spec:
  rules:
    - host: minha-aplicacao.exemplo.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: minha-aplicacao-service
                port:
                  number: 80
```

---

## Arquivo único com Deployment, Service e Ingress

Também é possível colocar tudo em um único arquivo YAML, separando os recursos com `---`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minha-aplicacao
  namespace: default
  labels:
    app: minha-aplicacao
spec:
  replicas: 2
  selector:
    matchLabels:
      app: minha-aplicacao
  template:
    metadata:
      labels:
        app: minha-aplicacao
    spec:
      containers:
        - name: minha-aplicacao
          image: nginx:1.25
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: minha-aplicacao-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: minha-aplicacao
  ports:
    - port: 80
      targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: minha-aplicacao-ingress
  namespace: default
spec:
  rules:
    - host: minha-aplicacao.exemplo.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: minha-aplicacao-service
                port:
                  number: 80
```

Aplicando:

```bash
kubectl apply -f minha-aplicacao.yaml
```

---

## Comandos úteis

### Listar recursos

```bash
kubectl get deployments
kubectl get pods
kubectl get svc
kubectl get ingress
```

---

### Listar tudo no namespace

```bash
kubectl get all -n default
```

---

### Ver detalhes de um Pod

```bash
kubectl describe pod nome-do-pod
```

---

### Ver eventos do namespace

```bash
kubectl get events -n default --sort-by=.metadata.creationTimestamp
```

---

### Acessar shell dentro do Pod

```bash
kubectl exec -it nome-do-pod -- /bin/bash
```

Se a imagem não tiver bash:

```bash
kubectl exec -it nome-do-pod -- /bin/sh
```

---

## Checklist antes de aplicar em produção

Antes de aplicar um Deployment em produção, confira:

- O namespace está correto?
- A imagem está com tag fixa e não `latest`?
- O número de réplicas está adequado?
- Existem requests e limits de CPU/memória?
- O Service aponta para o label correto?
- O Ingress aponta para o Service correto?
- As variáveis de ambiente estão corretas?
- As secrets/configmaps existem?
- As probes estão configuradas?
- O rollout foi validado?
- Existe plano de rollback?

---

## Problemas comuns

### Pods não sobem

Verifique:

```bash
kubectl get pods
kubectl describe pod nome-do-pod
kubectl logs nome-do-pod
```

Causas comuns:

- imagem errada
- erro de autenticação no registry
- falta de Secret
- erro na aplicação
- falta de CPU ou memória
- namespace errado

---

### ImagePullBackOff

Esse erro indica problema ao baixar a imagem.

Verifique:

```bash
kubectl describe pod nome-do-pod
```

Causas comuns:

- nome da imagem errado
- tag inexistente
- registry privado sem Secret
- problema de rede
- proxy bloqueando acesso

---

### CrashLoopBackOff

Esse erro indica que o container inicia e depois cai.

Verifique os logs:

```bash
kubectl logs nome-do-pod
```

Também veja a descrição do Pod:

```bash
kubectl describe pod nome-do-pod
```

Causas comuns:

- erro na aplicação
- variável de ambiente ausente
- banco indisponível
- endpoint de dependência fora do ar
- comando de inicialização incorreto

---

### Service não acessa o Pod

Verifique se o selector do Service bate com o label do Pod.

Service:

```yaml
selector:
  app: minha-aplicacao
```

Pod:

```yaml
labels:
  app: minha-aplicacao
```

Se os labels forem diferentes, o Service não encontra os Pods.

---

### Ingress não funciona

Verifique:

```bash
kubectl get ingress
kubectl describe ingress minha-aplicacao-ingress
```

Possíveis causas:

- Ingress Controller ausente
- DNS não aponta para o cluster
- Service errado
- porta errada
- regra de host incorreta
- certificado TLS ausente ou inválido

---

## Boas práticas

- Evite usar `latest` em produção.
- Use tags fixas de imagem.
- Configure requests e limits.
- Configure readinessProbe e livenessProbe.
- Use ConfigMap para configurações não sensíveis.
- Use Secret para senhas, tokens e chaves.
- Separe ambientes por namespace.
- Valide o rollout após o deploy.
- Tenha um plano de rollback.
- Documente o nome da imagem, namespace, porta e URL da aplicação.

---

## Fluxo recomendado de deploy

```bash
# 1. Validar contexto atual
kubectl config current-context

# 2. Validar namespace
kubectl get ns

# 3. Aplicar manifesto
kubectl apply -f minha-aplicacao.yaml

# 4. Acompanhar rollout
kubectl rollout status deployment/minha-aplicacao -n default

# 5. Conferir Pods
kubectl get pods -n default

# 6. Verificar Service
kubectl get svc -n default

# 7. Verificar Ingress
kubectl get ingress -n default

# 8. Testar aplicação
curl http://minha-aplicacao.exemplo.com.br
```

---

## Exemplo com namespace separado

```bash
kubectl create namespace homologacao
```

Aplicando no namespace:

```bash
kubectl apply -f minha-aplicacao.yaml -n homologacao
```

Verificando:

```bash
kubectl get all -n homologacao
```

---

## Resumo

O Deployment é um dos recursos mais importantes do Kubernetes.

Ele permite:

- manter Pods rodando
- controlar réplicas
- atualizar aplicações
- acompanhar rollout
- fazer rollback
- padronizar deploys

Em ambientes corporativos, normalmente ele é usado junto com:

- Service
- Ingress
- ConfigMap
- Secret
- HPA
- pipeline CI/CD
