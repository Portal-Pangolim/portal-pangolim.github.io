---
layout: default
description: "Comandos e verificações para diagnosticar Pods, nós e falhas de operação no Kubernetes."
title: Troubleshooting Kubernetes
---

# Troubleshooting Kubernetes
{:.no_toc}

Troubleshooting no Kubernetes é o processo de investigar falhas em aplicações, Pods, Services, Ingress, DNS, permissões, recursos e comunicação dentro do cluster.

O objetivo é descobrir onde o problema está acontecendo:

```text
Usuário
   |
   v
Ingress / LoadBalancer
   |
   v
Service
   |
   v
Pod
   |
   v
Container / Aplicação
```

Em problemas reais, é importante seguir uma ordem lógica para não perder tempo investigando o lugar errado.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}


---
## Fluxo rápido de diagnóstico

Use este fluxo como primeira análise:

```bash
# 1. Validar contexto atual
kubectl config current-context

# 2. Ver namespaces
kubectl get ns

# 3. Ver recursos principais
kubectl get all -n default

# 4. Ver Pods
kubectl get pods -n default

# 5. Ver detalhes do Pod com problema
kubectl describe pod NOME_DO_POD -n default

# 6. Ver logs
kubectl logs NOME_DO_POD -n default

# 7. Ver eventos
kubectl get events -n default --sort-by=.metadata.creationTimestamp
```

Se a aplicação for exposta externamente, continue:

```bash
kubectl get svc -n default
kubectl get ep -n default
kubectl get ingress -n default
kubectl describe ingress NOME_DO_INGRESS -n default
```

---

## Comandos essenciais

### Ver contexto atual

```bash
kubectl config current-context
```

### Ver informações do cluster

```bash
kubectl cluster-info
```

### Ver Nodes

```bash
kubectl get nodes
kubectl get nodes -o wide
```

### Ver recursos de um namespace

```bash
kubectl get all -n default
```

### Ver eventos ordenados

```bash
kubectl get events -n default --sort-by=.metadata.creationTimestamp
```

### Ver Pods com labels

```bash
kubectl get pods -n default --show-labels
```

### Ver YAML de um recurso

```bash
kubectl get deployment minha-app -n default -o yaml
```

---

## Pod em Pending

O status `Pending` indica que o Pod foi criado, mas ainda não conseguiu iniciar.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
```

Causas comuns:

- falta de CPU ou memória no cluster
- Node indisponível
- `nodeSelector` incorreto
- taint no Node sem toleration no Pod
- PersistentVolumeClaim sem volume disponível
- imagem ainda sendo baixada
- problema de agendamento

Comandos úteis:

```bash
kubectl get nodes
kubectl describe node NOME_DO_NODE
kubectl get pvc -n default
kubectl describe pvc NOME_DO_PVC -n default
```

Procure mensagens como:

```text
Insufficient cpu
Insufficient memory
pod has unbound immediate PersistentVolumeClaims
node(s) had taint
```

---

## ImagePullBackOff

O status `ImagePullBackOff` indica que o Kubernetes não conseguiu baixar a imagem do container.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
```

Veja a seção `Events`.

Causas comuns:

- nome da imagem incorreto
- tag inexistente
- registry privado sem Secret
- Secret de pull incorreto
- problema de rede
- proxy ou firewall bloqueando acesso ao registry
- autenticação expirada

Exemplo:

```text
Failed to pull image
pull access denied
repository does not exist
unauthorized
```

Verifique o nome da imagem no Deployment:

```bash
kubectl get deployment minha-app -n default -o yaml
```

Verifique Secrets:

```bash
kubectl get secret -n default
```

---

## ErrImagePull

O `ErrImagePull` geralmente aparece antes do `ImagePullBackOff`.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
```

Causas comuns:

- erro temporário ao baixar imagem
- tag errada
- registry indisponível
- autenticação inválida

Se o problema continuar, o status pode evoluir para `ImagePullBackOff`.

---

## CrashLoopBackOff

O status `CrashLoopBackOff` indica que o container inicia, falha e o Kubernetes tenta reiniciar repetidamente.

Verifique logs:

```bash
kubectl logs NOME_DO_POD -n default
```

Se o container reiniciou, veja os logs da execução anterior:

```bash
kubectl logs NOME_DO_POD -n default --previous
```

Verifique detalhes:

```bash
kubectl describe pod NOME_DO_POD -n default
```

Causas comuns:

- erro na aplicação
- variável de ambiente ausente
- Secret ou ConfigMap ausente
- comando de inicialização incorreto
- aplicação não consegue conectar ao banco
- porta incorreta
- falta de permissão em arquivo ou volume
- livenessProbe derrubando o container

Procure por:

```text
Exit Code
Reason
Last State
Restart Count
```

---

## Pod em Running, mas aplicação não responde

Um Pod pode estar `Running` e mesmo assim a aplicação não estar funcionando.

Verifique logs:

```bash
kubectl logs NOME_DO_POD -n default
```

Acesse o container:

```bash
kubectl exec -it NOME_DO_POD -n default -- /bin/sh
```

Teste localmente dentro do Pod:

```bash
curl localhost:8080
```

Verifique portas:

```bash
kubectl describe pod NOME_DO_POD -n default
```

Causas comuns:

- aplicação escutando em outra porta
- aplicação escutando apenas em `127.0.0.1`
- readinessProbe falhando
- configuração incorreta
- dependência externa indisponível
- erro de DNS interno

---

## ReadinessProbe falhando

Quando a `readinessProbe` falha, o Pod pode ficar rodando, mas não recebe tráfego pelo Service.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
```

Causas comuns:

- path HTTP incorreto
- porta incorreta
- aplicação demora mais para iniciar
- endpoint de health check retorna erro
- timeout muito baixo
- dependência externa indisponível

Exemplo:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

Teste dentro do Pod:

```bash
curl localhost:8080/health
```

---

## LivenessProbe derrubando o container

Quando a `livenessProbe` falha, o Kubernetes reinicia o container.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
kubectl logs NOME_DO_POD -n default --previous
```

Causas comuns:

- probe configurada com path errado
- tempo inicial muito curto
- aplicação demora para subir
- endpoint de health check instável
- timeout muito agressivo

Em aplicações que demoram para iniciar, ajuste:

```yaml
initialDelaySeconds: 30
timeoutSeconds: 5
failureThreshold: 3
```

---

## Deployment não cria Pods

Verifique o Deployment:

```bash
kubectl get deployment -n default
kubectl describe deployment NOME_DO_DEPLOYMENT -n default
```

Verifique ReplicaSet:

```bash
kubectl get rs -n default
kubectl describe rs NOME_DO_REPLICASET -n default
```

Causas comuns:

- `replicas: 0`
- selector incorreto
- erro no template do Pod
- falta de recursos
- namespace errado
- política de quota bloqueando criação

Verifique quotas:

```bash
kubectl get resourcequota -n default
kubectl describe resourcequota -n default
```

---

## Rollout travado

Verifique o status:

```bash
kubectl rollout status deployment/NOME_DO_DEPLOYMENT -n default
```

Ver histórico:

```bash
kubectl rollout history deployment/NOME_DO_DEPLOYMENT -n default
```

Causas comuns:

- nova imagem com erro
- Pods novos não passam na readinessProbe
- falta de recursos
- `maxUnavailable` e `maxSurge` inadequados
- aplicação nova quebra na inicialização

Se precisar voltar:

```bash
kubectl rollout undo deployment/NOME_DO_DEPLOYMENT -n default
```

---

## Service sem Endpoints

Quando um Service não possui Endpoints, ele não encontrou Pods para receber tráfego.

Verifique:

```bash
kubectl get svc -n default
kubectl get ep -n default
kubectl describe svc NOME_DO_SERVICE -n default
kubectl get pods -n default --show-labels
```

Causas comuns:

- selector do Service não bate com labels dos Pods
- Pods estão em outro namespace
- Pods não estão prontos
- Deployment não criou Pods
- labels foram alterados

Exemplo:

Service:

```yaml
selector:
  app: nginx
```

Pod:

```yaml
labels:
  app: nginx-app
```

Nesse caso, o Service não encontra o Pod.

---

## Service responde na porta errada

Verifique Service e Deployment:

```bash
kubectl describe svc NOME_DO_SERVICE -n default
kubectl describe pod NOME_DO_POD -n default
```

Causas comuns:

- `targetPort` incorreto
- aplicação escutando em outra porta
- porta nomeada incorretamente
- container não expõe a porta esperada

Exemplo correto:

```yaml
ports:
  - port: 80
    targetPort: 8080
```

Nesse caso:

```text
Service porta 80 --> Container porta 8080
```

---

## Ingress retorna 404

Erro 404 geralmente indica que o Ingress Controller recebeu a requisição, mas nenhuma regra bateu.

Verifique:

```bash
kubectl get ingress -n default
kubectl describe ingress NOME_DO_INGRESS -n default
```

Causas comuns:

- domínio acessado diferente do `host` configurado
- path incorreto
- `ingressClassName` errado
- teste com IP sem header `Host`
- regra criada em namespace errado

Teste com header:

```bash
curl -H "Host: app.exemplo.com.br" http://IP_DO_INGRESS
```

---

## Ingress retorna 502 ou 503

Erro 502 ou 503 geralmente indica problema entre Ingress, Service e Pods.

Verifique:

```bash
kubectl get ingress -n default
kubectl describe ingress NOME_DO_INGRESS -n default
kubectl get svc -n default
kubectl get ep -n default
kubectl get pods -n default
```

Causas comuns:

- Service sem Endpoints
- Pods não estão prontos
- porta do backend incorreta
- Service errado no Ingress
- aplicação não responde
- readinessProbe falhando

---

## DNS interno não resolve

Problemas de DNS interno afetam comunicação entre aplicações no cluster.

Verifique CoreDNS:

```bash
kubectl get pods -n kube-system
```

Teste DNS com um Pod temporário:

```bash
kubectl run teste-dns --image=busybox:1.36 -it --rm -- nslookup kubernetes.default
```

Teste um Service:

```bash
kubectl run teste-dns --image=busybox:1.36 -it --rm -- nslookup nginx-service.default.svc.cluster.local
```

Causas comuns:

- CoreDNS indisponível
- Service não existe
- namespace errado
- NetworkPolicy bloqueando tráfego
- problema no plugin de rede do cluster

---

## DNS externo não resolve

Se o problema for acesso externo por domínio:

```bash
nslookup app.exemplo.com.br
```

Ou:

```bash
dig app.exemplo.com.br
```

Causas comuns:

- registro DNS não criado
- DNS apontando para IP errado
- propagação DNS pendente
- entrada incorreta no arquivo hosts
- domínio diferente do host configurado no Ingress

---

## Falha de comunicação entre Pods

Teste origem e destino.

Entre no Pod de origem:

```bash
kubectl exec -it POD_ORIGEM -n default -- /bin/sh
```

Teste o Service:

```bash
curl http://NOME_DO_SERVICE:PORTA
```

Verifique:

```bash
kubectl get svc -n default
kubectl get ep -n default
kubectl get networkpolicy -n default
```

Causas comuns:

- Service sem Endpoints
- NetworkPolicy bloqueando tráfego
- aplicação escutando na porta errada
- DNS interno com problema
- namespace errado
- firewall ou CNI com falha

---

## Node NotReady

Quando um Node fica `NotReady`, os Pods nele podem ser afetados.

Verifique:

```bash
kubectl get nodes
kubectl describe node NOME_DO_NODE
```

Causas comuns:

- kubelet parado
- falta de CPU, memória ou disco
- problema de rede
- runtime de container com falha
- Node sem comunicação com o control plane
- pressão de disco ou memória

Procure por:

```text
MemoryPressure
DiskPressure
PIDPressure
Ready
```

---

## Evicted Pods

Pods com status `Evicted` foram removidos do Node, normalmente por falta de recursos.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
kubectl describe node NOME_DO_NODE
```

Causas comuns:

- falta de memória
- falta de disco
- excesso de logs
- ausência de requests e limits
- Node sob pressão

Boas ações:

- configurar requests e limits
- limpar imagens antigas no Node
- revisar uso de logs
- aumentar recursos do cluster
- distribuir melhor as cargas

---

## OOMKilled

`OOMKilled` indica que o container foi encerrado por exceder memória.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
kubectl logs NOME_DO_POD -n default --previous
```

Procure por:

```text
Reason: OOMKilled
Exit Code: 137
```

Causas comuns:

- limite de memória muito baixo
- vazamento de memória na aplicação
- pico de carga
- falta de configuração adequada de recursos

Exemplo de resources:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

---

## Forbidden ou erro de permissão

Erros de permissão geralmente estão relacionados a RBAC.

Exemplo:

```text
Error from server (Forbidden)
```

Verifique se o usuário ou ServiceAccount pode executar a ação:

```bash
kubectl auth can-i get pods -n default
kubectl auth can-i create deployment -n default
kubectl auth can-i list secrets -n default
```

Verifique ServiceAccount:

```bash
kubectl get serviceaccount -n default
kubectl get role,rolebinding -n default
kubectl get clusterrole,clusterrolebinding
```

Causas comuns:

- Role sem permissão necessária
- RoleBinding ausente
- ServiceAccount errada no Pod
- usuário autenticado no contexto errado
- namespace errado

---

## ConfigMap ou Secret ausente

Quando ConfigMap ou Secret não existe, o Pod pode falhar ao iniciar.

Verifique:

```bash
kubectl describe pod NOME_DO_POD -n default
kubectl get configmap -n default
kubectl get secret -n default
```

Causas comuns:

- nome incorreto no manifesto
- recurso criado em outro namespace
- Secret não foi aplicado
- chave específica não existe dentro do Secret ou ConfigMap

Exemplo:

```yaml
envFrom:
  - secretRef:
      name: app-secret
```

O Secret precisa existir:

```bash
kubectl get secret app-secret -n default
```

---

## PVC Pending

Um PVC em `Pending` indica que o volume solicitado ainda não foi vinculado.

Verifique:

```bash
kubectl get pvc -n default
kubectl describe pvc NOME_DO_PVC -n default
kubectl get storageclass
```

Causas comuns:

- StorageClass inexistente
- provisionador de storage com erro
- volume disponível não atende ao tamanho solicitado
- acesso solicitado incompatível
- ambiente local sem provisionador

---

## Namespace errado

Muitos problemas são apenas recursos criados no namespace errado.

Verifique:

```bash
kubectl get pods --all-namespaces
kubectl get svc --all-namespaces
kubectl get ingress --all-namespaces
```

Use sempre `-n` nos comandos:

```bash
kubectl get pods -n homologacao
```

Ou defina namespace no contexto:

```bash
kubectl config set-context --current --namespace=homologacao
```

---

## Checklist geral

Antes de aprofundar a investigação, confira:

- O contexto do `kubectl` está correto?
- O namespace está correto?
- O Deployment existe?
- O Deployment criou ReplicaSet?
- O ReplicaSet criou Pods?
- Os Pods estão `Running` e `Ready`?
- Os logs indicam erro da aplicação?
- O Service existe?
- O Service possui Endpoints?
- O `targetPort` está correto?
- O Ingress aponta para o Service correto?
- O DNS aponta para o IP correto?
- O Ingress Controller está rodando?
- Existem eventos recentes indicando falha?
- Há falta de CPU, memória ou disco?
- Existe NetworkPolicy bloqueando comunicação?
- O usuário possui permissão RBAC?

---

## Sequência recomendada por sintoma

### Aplicação não abre pelo navegador

```bash
kubectl get ingress -n default
kubectl describe ingress NOME_DO_INGRESS -n default
kubectl get svc -n default
kubectl get ep -n default
kubectl get pods -n default
kubectl logs NOME_DO_POD -n default
```

### Pod não sobe

```bash
kubectl get pods -n default
kubectl describe pod NOME_DO_POD -n default
kubectl logs NOME_DO_POD -n default
kubectl get events -n default --sort-by=.metadata.creationTimestamp
```

### Service não responde

```bash
kubectl describe svc NOME_DO_SERVICE -n default
kubectl get ep NOME_DO_SERVICE -n default
kubectl get pods -n default --show-labels
kubectl describe pod NOME_DO_POD -n default
```

### Deployment travado

```bash
kubectl rollout status deployment/NOME_DO_DEPLOYMENT -n default
kubectl describe deployment NOME_DO_DEPLOYMENT -n default
kubectl get rs -n default
kubectl get pods -n default
```

---

## Boas práticas para facilitar troubleshooting

- Use labels padronizados.
- Defina `requests` e `limits`.
- Configure readinessProbe e livenessProbe com cuidado.
- Evite usar imagem com tag `latest` em produção.
- Documente portas, namespaces, domínios e Services.
- Use logs claros na aplicação.
- Separe ambientes por namespace.
- Monitore eventos do cluster.
- Mantenha o Ingress Controller documentado.
- Use nomes descritivos para Deployments, Services e Ingress.
- Crie dashboards e alertas para CPU, memória, disco e reinícios.

---

## Resumo

Em Kubernetes, a investigação deve seguir o caminho do tráfego e da criação dos recursos.

Para problemas de aplicação:

```text
Ingress --> Service --> Endpoints --> Pods --> Logs
```

Para problemas de criação:

```text
Deployment --> ReplicaSet --> Pod --> Events
```

Para problemas de infraestrutura:

```text
Node --> Recursos --> CNI/DNS --> Storage --> RBAC
```

> Regra prática: se um recurso parece correto, valide o próximo recurso da cadeia. Na maioria dos casos, o erro aparece nos eventos, nos logs ou na ausência de Endpoints.
