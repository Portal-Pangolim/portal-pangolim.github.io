---
layout: default
description: "Ingress no Kubernetes: publicação de aplicações HTTP e relação entre regras, serviços e controlador."
title: Ingress
---

# Ingress no Kubernetes
{:.no_toc}

Um **Ingress** no Kubernetes é o recurso usado para expor aplicações HTTP e HTTPS para fora do cluster usando nomes de domínio e regras de roteamento.

Ele normalmente fica na frente de um **Service** e permite acessar aplicações por URLs amigáveis, como:

```text
https://app.exemplo.com.br
https://api.exemplo.com.br
```

Fluxo comum:

```text
Usuário externo
   |
   v
DNS
   |
   v
Ingress Controller
   |
   v
Ingress
   |
   v
Service
   |
   v
Pods
```

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Para que serve um Ingress?

Use um Ingress quando você precisa:

- expor aplicações web por domínio
- usar HTTPS com certificado TLS
- rotear múltiplas aplicações pelo mesmo IP
- criar regras por host
- criar regras por caminho
- centralizar entrada HTTP/HTTPS do cluster
- evitar criar um LoadBalancer para cada aplicação

Exemplo:

```text
app.exemplo.com.br  --> service-app
api.exemplo.com.br  --> service-api
site.exemplo.com.br --> service-site
```

---

## Ingress não funciona sozinho

O recurso Ingress precisa de um **Ingress Controller** instalado no cluster.

O Ingress é apenas a regra. O Ingress Controller é o componente que lê essa regra e recebe o tráfego externo.

Exemplos comuns de Ingress Controller:

- NGINX Ingress Controller
- Traefik
- HAProxy Ingress
- Kong Ingress Controller
- AWS Load Balancer Controller
- Azure Application Gateway Ingress Controller
- GKE Ingress Controller

Sem Ingress Controller, o manifesto de Ingress pode até ser criado, mas não haverá componente processando as regras.

---

## Ingress, Service e Deployment

O Ingress não envia tráfego diretamente para Pods.

O caminho correto normalmente é:

```text
Ingress --> Service --> Pods
```

Exemplo:

```text
Deployment cria Pods com label app=nginx
Service encontra os Pods pelo selector app=nginx
Ingress aponta para o Service nginx-service
```

---

## Exemplo básico

Antes do Ingress, precisamos de um Deployment e um Service.

Arquivo:

```bash
nginx-com-ingress.yaml
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
---
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

Aplicando:

```bash
kubectl apply -f nginx-com-ingress.yaml
```

Verificando:

```bash
kubectl get deployment
kubectl get svc
kubectl get ingress
```

---

## Explicando o YAML do Ingress

### apiVersion

Define a versão da API do recurso.

```yaml
apiVersion: networking.k8s.io/v1
```

Para Ingress, a versão atual mais comum é:

```text
networking.k8s.io/v1
```

---

### kind

Define o tipo de recurso.

```yaml
kind: Ingress
```

---

### metadata

Define nome, namespace e metadados do Ingress.

```yaml
metadata:
  name: nginx-ingress
  namespace: default
```

---

### rules

Define as regras de roteamento.

```yaml
rules:
  - host: nginx.exemplo.com.br
```

Nesse exemplo, o Ingress só atende requisições para:

```text
nginx.exemplo.com.br
```

---

### paths

Define o caminho da URL.

```yaml
paths:
  - path: /
    pathType: Prefix
```

O caminho `/` representa a raiz da aplicação.

---

### backend

Define para qual Service o tráfego será enviado.

```yaml
backend:
  service:
    name: nginx-service
    port:
      number: 80
```

Nesse caso, o Ingress encaminha para o Service `nginx-service` na porta `80`.

---

## pathType

O campo `pathType` define como o caminho será interpretado.

| Tipo | Descrição |
| --- | --- |
| `Prefix` | Combina com o prefixo da URL |
| `Exact` | Combina somente com o caminho exato |
| `ImplementationSpecific` | Depende do Ingress Controller |

Exemplo com `Prefix`:

```yaml
path: /api
pathType: Prefix
```

Pode atender:

```text
/api
/api/v1
/api/users
```

Exemplo com `Exact`:

```yaml
path: /admin
pathType: Exact
```

Atende somente:

```text
/admin
```

---

## Roteamento por host

É possível expor aplicações diferentes por domínios diferentes.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multiplos-hosts
  namespace: default
spec:
  rules:
    - host: app.exemplo.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
    - host: api.exemplo.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

Fluxo:

```text
app.exemplo.com.br --> app-service
api.exemplo.com.br --> api-service
```

---

## Roteamento por caminho

Também é possível usar o mesmo domínio com caminhos diferentes.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: caminhos
  namespace: default
spec:
  rules:
    - host: sistema.exemplo.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

Fluxo:

```text
sistema.exemplo.com.br/     --> frontend-service
sistema.exemplo.com.br/api  --> api-service
```

---

## Ingress com TLS

Para usar HTTPS, o Ingress precisa de um Secret TLS no mesmo namespace.

Criando um Secret TLS:

```bash
kubectl create secret tls nginx-tls \
  --cert=certificado.crt \
  --key=chave.key \
  -n default
```

Exemplo de Ingress com TLS:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress-tls
  namespace: default
spec:
  tls:
    - hosts:
        - nginx.exemplo.com.br
      secretName: nginx-tls
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

Validando o Secret:

```bash
kubectl get secret nginx-tls -n default
```

---

## IngressClass

Em clusters com mais de um Ingress Controller, é comum definir qual controller deve processar o Ingress.

Exemplo:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  namespace: default
spec:
  ingressClassName: nginx
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

Listar IngressClasses:

```bash
kubectl get ingressclass
```

Exemplo de saída:

```text
NAME    CONTROLLER
nginx   k8s.io/ingress-nginx
```

---

## Annotations

Annotations são usadas para configurar comportamentos específicos do Ingress Controller.

Exemplo com NGINX Ingress Controller:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: nginx.exemplo.com.br
      http:
        paths:
          - path: /app
            pathType: Prefix
            backend:
              service:
                name: nginx-service
                port:
                  number: 80
```

Annotations comuns no NGINX Ingress:

| Annotation | Uso |
| --- | --- |
| `nginx.ingress.kubernetes.io/rewrite-target` | Reescrever caminho da URL |
| `nginx.ingress.kubernetes.io/proxy-body-size` | Ajustar tamanho máximo do corpo da requisição |
| `nginx.ingress.kubernetes.io/ssl-redirect` | Forçar ou desativar redirecionamento HTTPS |
| `nginx.ingress.kubernetes.io/proxy-read-timeout` | Ajustar timeout de leitura |
| `nginx.ingress.kubernetes.io/proxy-send-timeout` | Ajustar timeout de envio |

> As annotations podem variar conforme o Ingress Controller utilizado.

---

## DNS

Para acessar uma aplicação pelo domínio, o DNS precisa apontar para o endereço externo do Ingress Controller.

Verifique o endereço:

```bash
kubectl get svc -n ingress-nginx
```

Exemplo:

```text
NAME                                 TYPE           EXTERNAL-IP
ingress-nginx-controller             LoadBalancer   203.0.113.10
```

O DNS deve apontar para:

```text
203.0.113.10
```

Exemplo de registro:

```text
nginx.exemplo.com.br  A  203.0.113.10
```

Em ambiente local ou laboratório, também é possível testar usando o arquivo `hosts` da máquina.

Exemplo:

```text
203.0.113.10 nginx.exemplo.com.br
```

---

## Testando o Ingress

Teste usando o domínio:

```bash
curl http://nginx.exemplo.com.br
```

Teste informando o header `Host` manualmente:

```bash
curl -H "Host: nginx.exemplo.com.br" http://IP_DO_INGRESS
```

Teste com HTTPS:

```bash
curl -vk https://nginx.exemplo.com.br
```

Verifique o IP externo:

```bash
kubectl get ingress
```

---

## Comandos úteis

Listar Ingress:

```bash
kubectl get ingress
```

Listar em um namespace:

```bash
kubectl get ingress -n default
```

Ver detalhes:

```bash
kubectl describe ingress nginx-ingress
```

Listar IngressClass:

```bash
kubectl get ingressclass
```

Ver Services:

```bash
kubectl get svc
```

Ver Endpoints do Service:

```bash
kubectl get ep nginx-service
```

Ver Pods do Ingress Controller:

```bash
kubectl get pods -n ingress-nginx
```

Ver logs do Ingress Controller:

```bash
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

Remover Ingress:

```bash
kubectl delete ingress nginx-ingress
```

Remover pelo arquivo:

```bash
kubectl delete -f nginx-com-ingress.yaml
```

---

## Troubleshooting

### Ingress não recebe ADDRESS

Verifique:

```bash
kubectl get ingress
kubectl describe ingress nginx-ingress
kubectl get svc -n ingress-nginx
```

Causas comuns:

- Ingress Controller não está instalado
- Service do controller não possui IP externo
- LoadBalancer está pendente
- `ingressClassName` incorreto
- cluster local sem solução de LoadBalancer

---

### Erro 404

O Ingress respondeu, mas não encontrou rota compatível.

Verifique:

```bash
kubectl describe ingress nginx-ingress
```

Causas comuns:

- host diferente do domínio acessado
- caminho incorreto
- regra de path não bate
- header `Host` ausente no teste com IP
- Ingress Controller usando outra classe

Teste com header:

```bash
curl -H "Host: nginx.exemplo.com.br" http://IP_DO_INGRESS/
```

---

### Erro 502 ou 503

O Ingress recebeu a requisição, mas não conseguiu encaminhar corretamente para o backend.

Verifique:

```bash
kubectl get svc
kubectl get ep nginx-service
kubectl describe svc nginx-service
kubectl get pods
```

Causas comuns:

- Service sem Endpoints
- Pods não estão rodando
- porta do Service incorreta
- `targetPort` incorreto
- aplicação não está escutando na porta esperada
- readinessProbe impedindo o Pod de receber tráfego

---

### Certificado TLS não funciona

Verifique:

```bash
kubectl get secret nginx-tls
kubectl describe ingress nginx-ingress-tls
```

Causas comuns:

- Secret TLS em namespace diferente
- `secretName` incorreto
- certificado expirado
- certificado não corresponde ao domínio
- cadeia intermediária ausente
- DNS apontando para IP errado

---

### Domínio não resolve

Verifique DNS:

```bash
nslookup nginx.exemplo.com.br
```

Ou:

```bash
dig nginx.exemplo.com.br
```

Causas comuns:

- registro DNS inexistente
- DNS apontando para IP errado
- propagação DNS ainda em andamento
- entrada incorreta no arquivo hosts

---

### Redirecionamento HTTPS inesperado

Alguns Ingress Controllers podem redirecionar HTTP para HTTPS automaticamente.

Verifique annotations:

```bash
kubectl describe ingress nginx-ingress
```

Exemplo para desativar no NGINX Ingress:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
```

---

## Boas práticas

- Use Ingress para aplicações HTTP e HTTPS.
- Use Service do tipo `ClusterIP` atrás do Ingress.
- Configure `ingressClassName` quando houver mais de um controller.
- Use TLS para aplicações expostas externamente.
- Mantenha certificados válidos e monitorados.
- Padronize nomes de hosts e Services.
- Evite expor aplicações sensíveis sem autenticação.
- Valide DNS antes de investigar a aplicação.
- Verifique Endpoints quando houver erro 502 ou 503.
- Documente domínio, namespace, Service e porta.

---

## Checklist antes de aplicar

Antes de aplicar um Ingress, confira:

- O Ingress Controller está instalado?
- O `ingressClassName` está correto?
- O Service existe no mesmo namespace?
- O Service possui Endpoints?
- A porta do backend está correta?
- O DNS aponta para o IP externo do Ingress Controller?
- O host no YAML bate com o domínio real?
- O path está correto?
- O Secret TLS existe no namespace correto?
- O certificado TLS corresponde ao domínio?

---

## Fluxo recomendado

```bash
# 1. Verificar Ingress Controller
kubectl get pods -n ingress-nginx

# 2. Verificar endereço externo do controller
kubectl get svc -n ingress-nginx

# 3. Aplicar Deployment, Service e Ingress
kubectl apply -f nginx-com-ingress.yaml

# 4. Verificar Service e Endpoints
kubectl get svc
kubectl get ep nginx-service

# 5. Verificar Ingress
kubectl get ingress
kubectl describe ingress nginx-ingress

# 6. Testar com domínio
curl http://nginx.exemplo.com.br

# 7. Testar usando header Host
curl -H "Host: nginx.exemplo.com.br" http://IP_DO_INGRESS
```

---

## Resumo

O Ingress é a porta de entrada HTTP/HTTPS para aplicações no Kubernetes.

Ele permite:

- expor aplicações por domínio
- configurar HTTPS
- rotear tráfego por host
- rotear tráfego por caminho
- reduzir a necessidade de múltiplos LoadBalancers
- centralizar o acesso externo às aplicações

Em ambientes reais, o desenho mais comum é:

```text
Usuário --> DNS --> Ingress Controller --> Ingress --> Service --> Pods
```

> Se o Ingress não funcionar, valide nesta ordem: Ingress Controller, DNS, IngressClass, regra de host/path, Service, Endpoints e Pods.
