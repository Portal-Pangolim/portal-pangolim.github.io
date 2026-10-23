---
layout: default
description: "Services no Kubernetes: descoberta e exposição de Pods e diferenças entre tipos de serviço."
title: Services
---

# Services no Kubernetes
{:.no_toc}

Um **Service** no Kubernetes é o recurso usado para expor Pods de forma estável dentro ou fora do cluster.

Pods são efêmeros: podem ser recriados, trocar de IP ou mudar de Node. O Service resolve esse problema criando um ponto fixo de acesso para a aplicação.

Na prática, o Service encontra os Pods usando **labels** e encaminha o tráfego para eles.

```text
Cliente
   |
   v
Service
   |
   +--> Pod
   +--> Pod
   +--> Pod
```

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Por que usar um Service?

Use um Service quando você precisa:

- acessar Pods de forma estável
- balancear tráfego entre réplicas
- expor uma aplicação dentro do cluster
- expor uma aplicação para fora do cluster
- permitir que outros Deployments acessem sua aplicação
- conectar Ingress a uma aplicação

Sem Service, seria necessário acessar diretamente o IP do Pod, o que não é recomendado porque esse IP pode mudar.

---

## Relação entre Deployment, Pod e Service

Normalmente o fluxo é:

```text
Deployment cria Pods
Pods recebem labels
Service usa selector para encontrar os Pods
Ingress ou outros sistemas acessam o Service
```

Exemplo:

```text
Deployment
  label: app=nginx

Pods
  label: app=nginx

Service
  selector: app=nginx
```

O ponto mais importante é:

> O `selector` do Service precisa bater com o `label` dos Pods.

---

## Tipos de Service

O Kubernetes possui alguns tipos principais de Service.

| Tipo | Uso principal |
| --- | --- |
| `ClusterIP` | Acesso interno dentro do cluster |
| `NodePort` | Acesso externo usando IP do Node e uma porta fixa |
| `LoadBalancer` | Acesso externo usando balanceador de carga da nuvem |
| `ExternalName` | Apelido interno para um DNS externo |

---

## ClusterIP

O `ClusterIP` é o tipo padrão de Service.

Ele expõe a aplicação apenas dentro do cluster.

Use quando:

- uma API precisa ser acessada por outro serviço interno
- o acesso externo será feito por Ingress
- a aplicação não precisa ficar pública diretamente

Exemplo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
```

Aplicando:

```bash
kubectl apply -f service-nginx.yaml
```

Verificando:

```bash
kubectl get svc
```

Saída esperada:

```text
NAME            TYPE        CLUSTER-IP      PORT(S)
nginx-service   ClusterIP   10.96.123.10    80/TCP
```

---

## NodePort

O `NodePort` expõe o Service em uma porta fixa nos Nodes do cluster.

Use quando:

- você está em laboratório
- não existe LoadBalancer disponível
- precisa testar acesso externo rapidamente

Exemplo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
  namespace: default
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
      protocol: TCP
```

Nesse exemplo:

- `port: 80` é a porta do Service
- `targetPort: 80` é a porta do container
- `nodePort: 30080` é a porta exposta no Node

Acesso:

```bash
curl http://IP_DO_NODE:30080
```

Se o `nodePort` não for informado, o Kubernetes escolhe uma porta automaticamente dentro da faixa configurada no cluster, normalmente entre `30000` e `32767`.

---

## LoadBalancer

O `LoadBalancer` expõe a aplicação usando um balanceador externo.

É muito comum em clusters na nuvem, como:

- AWS
- Azure
- Google Cloud
- Oracle Cloud
- DigitalOcean

Exemplo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
  namespace: default
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
```

Verificando:

```bash
kubectl get svc nginx-loadbalancer
```

Exemplo de saída:

```text
NAME                 TYPE           EXTERNAL-IP      PORT(S)
nginx-loadbalancer   LoadBalancer   203.0.113.10     80:31500/TCP
```

Se o campo `EXTERNAL-IP` ficar como `pending`, pode indicar que o cluster não possui integração com um provedor de LoadBalancer.

---

## ExternalName

O `ExternalName` cria um nome interno no Kubernetes apontando para um DNS externo.

Use quando uma aplicação dentro do cluster precisa acessar um serviço externo por um nome padronizado.

Exemplo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: banco-externo
  namespace: default
spec:
  type: ExternalName
  externalName: banco.exemplo.com.br
```

Com isso, aplicações dentro do cluster podem acessar:

```text
banco-externo.default.svc.cluster.local
```

E o Kubernetes encaminha a resolução para:

```text
banco.exemplo.com.br
```

---

## Exemplo completo com Deployment e Service

Arquivo:

```bash
nginx-com-service.yaml
```

Conteúdo:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: default
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
```

Aplicando:

```bash
kubectl apply -f nginx-com-service.yaml
```

Validando:

```bash
kubectl get deployment
kubectl get pods
kubectl get svc
```

---

## Entendendo portas do Service

Um Service pode ter várias portas, mas o caso mais comum possui:

```yaml
ports:
  - port: 80
    targetPort: 8080
```

Nesse exemplo:

- `port` é a porta exposta pelo Service
- `targetPort` é a porta onde o container recebe tráfego

Fluxo:

```text
Service porta 80 --> Container porta 8080
```

Exemplo real:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: minha-app
  ports:
    - name: http
      port: 80
      targetPort: 8080
```

---

## Service com múltiplas portas

Algumas aplicações expõem mais de uma porta.

Exemplo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: minha-app
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: metrics
      port: 9090
      targetPort: 9090
```

É recomendado sempre nomear as portas quando existe mais de uma.

---

## DNS interno do Service

Todo Service recebe um nome DNS interno.

Formato:

```text
nome-do-service.namespace.svc.cluster.local
```

Exemplo:

```text
nginx-service.default.svc.cluster.local
```

Dentro do mesmo namespace, normalmente basta usar:

```text
nginx-service
```

Exemplo de acesso entre aplicações:

```bash
curl http://nginx-service
```

---

## Verificando Endpoints

O Service encaminha tráfego para Endpoints, que representam os Pods encontrados pelo selector.

Verifique os Endpoints:

```bash
kubectl get endpoints
```

Ou:

```bash
kubectl get ep nginx-service
```

Exemplo:

```text
NAME            ENDPOINTS
nginx-service   10.244.1.10:80,10.244.2.15:80
```

Se o campo `ENDPOINTS` estiver vazio, o Service não encontrou nenhum Pod.

---

## Descrevendo um Service

Para ver detalhes:

```bash
kubectl describe svc nginx-service
```

Esse comando mostra:

- tipo do Service
- IP interno
- selector
- portas
- endpoints
- eventos relacionados

---

## Testando acesso interno

Para testar o Service de dentro do cluster, crie um Pod temporário:

```bash
kubectl run teste-curl --image=curlimages/curl -it --rm -- sh
```

Dentro do Pod:

```bash
curl http://nginx-service
```

Ou usando o DNS completo:

```bash
curl http://nginx-service.default.svc.cluster.local
```

---

## Service e Ingress

Em ambientes reais, normalmente o Service do tipo `ClusterIP` é usado junto com Ingress.

Fluxo:

```text
Usuário externo
   |
   v
Ingress
   |
   v
Service ClusterIP
   |
   v
Pods
```

Exemplo de Ingress apontando para um Service:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  namespace: default
spec:
  rules:
    - host: nginx.exemplo.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx-service
                port:
                  number: 80
```

---

## Comandos úteis

Listar Services:

```bash
kubectl get svc
```

Listar Services em um namespace:

```bash
kubectl get svc -n default
```

Ver detalhes:

```bash
kubectl describe svc nginx-service
```

Ver Endpoints:

```bash
kubectl get endpoints
```

Ver Pods com labels:

```bash
kubectl get pods --show-labels
```

Filtrar Pods por label:

```bash
kubectl get pods -l app=nginx
```

Remover Service:

```bash
kubectl delete svc nginx-service
```

Remover pelo arquivo:

```bash
kubectl delete -f service-nginx.yaml
```

---

## Problemas comuns

### Service sem Endpoints

Verifique:

```bash
kubectl get ep nginx-service
kubectl get pods --show-labels
kubectl describe svc nginx-service
```

Causas comuns:

- selector diferente do label dos Pods
- Pods não estão rodando
- Pods estão em outro namespace
- Deployment ainda não criou réplicas
- label foi alterado no Deployment

Exemplo de erro:

```yaml
selector:
  app: nginx
```

Mas o Pod está com:

```yaml
labels:
  app: nginx-app
```

Nesse caso, o Service não encontra o Pod.

---

### Porta errada

Verifique se o `targetPort` aponta para a porta correta do container.

Service:

```yaml
ports:
  - port: 80
    targetPort: 8080
```

Deployment:

```yaml
ports:
  - containerPort: 8080
```

Se a aplicação escuta na porta `8080`, o `targetPort` também deve apontar para `8080`.

---

### NodePort não acessa externamente

Verifique:

```bash
kubectl get svc
kubectl get nodes -o wide
```

Causas comuns:

- firewall bloqueando a porta
- porta NodePort incorreta
- IP do Node errado
- Service sem Endpoints
- cluster local sem rota externa

---

### LoadBalancer fica pending

Verifique:

```bash
kubectl get svc nginx-loadbalancer
kubectl describe svc nginx-loadbalancer
```

Causas comuns:

- cluster sem integração com provedor de nuvem
- ambiente local sem MetalLB ou solução equivalente
- limite de LoadBalancers atingido na conta da nuvem
- permissão insuficiente para criar balanceador

---

### DNS interno não resolve

Verifique se o CoreDNS está rodando:

```bash
kubectl get pods -n kube-system
```

Teste a resolução:

```bash
kubectl run teste-dns --image=busybox:1.36 -it --rm -- nslookup nginx-service
```

Causas comuns:

- CoreDNS com problema
- Service em outro namespace
- nome do Service errado
- NetworkPolicy bloqueando tráfego

---

## Boas práticas

- Use `ClusterIP` para aplicações internas.
- Use Ingress para expor aplicações HTTP/HTTPS.
- Evite `NodePort` em produção, exceto quando fizer sentido para a arquitetura.
- Garanta que `selector` e `labels` estejam padronizados.
- Nomeie portas quando houver mais de uma porta no Service.
- Use nomes claros, como `api-service`, `frontend-service` ou `nginx-service`.
- Valide Endpoints após criar o Service.
- Documente portas, namespaces e tipo de exposição.
- Evite expor serviços sensíveis diretamente para a internet.
- Use NetworkPolicy quando precisar controlar comunicação interna.

---

## Checklist antes de aplicar

Antes de aplicar um Service, confira:

- O namespace está correto?
- O nome do Service está padronizado?
- O tipo de Service é adequado?
- O selector bate com os labels dos Pods?
- A porta do Service está correta?
- O targetPort aponta para a porta correta do container?
- O Deployment está criando Pods saudáveis?
- O Service precisa ser acessado internamente ou externamente?
- Existe Ingress apontando para o Service?
- Existem regras de firewall ou NetworkPolicy impactando o acesso?

---

## Fluxo recomendado

```bash
# 1. Verificar Pods e labels
kubectl get pods --show-labels

# 2. Aplicar o Service
kubectl apply -f service-nginx.yaml

# 3. Verificar o Service
kubectl get svc

# 4. Verificar Endpoints
kubectl get ep nginx-service

# 5. Descrever o Service
kubectl describe svc nginx-service

# 6. Testar acesso interno
kubectl run teste-curl --image=curlimages/curl -it --rm -- sh
```

Dentro do Pod de teste:

```bash
curl http://nginx-service
```

---

## Resumo

O Service é responsável por criar um ponto de acesso estável para Pods.

Ele permite:

- acessar aplicações por nome fixo
- balancear tráfego entre réplicas
- conectar Deployments entre si
- expor aplicações internamente
- integrar aplicações com Ingress
- expor serviços externamente quando necessário

Em ambientes corporativos, o uso mais comum é:

```text
Deployment + Service ClusterIP + Ingress
```

> Lembre-se: se um Service não funciona, a primeira coisa a verificar é se ele possui Endpoints. Sem Endpoints, normalmente existe problema entre `selector` e `labels`.
