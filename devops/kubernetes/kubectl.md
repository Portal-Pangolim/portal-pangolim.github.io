---
layout: default
description: "Comandos kubectl para consultar recursos, examinar workloads e administrar objetos Kubernetes."
title: kubectl
---

# kubectl - Guia Prático
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Introdução

O `kubectl` é a principal ferramenta de linha de comando para administração de clusters Kubernetes.

Com ele é possível:

* Consultar recursos
* Criar objetos
* Aplicar configurações
* Verificar logs
* Executar comandos em containers
* Realizar troubleshooting

---

## Pré-requisitos

Verificar se o KUBECONFIG está carregado:

```bash
echo $KUBECONFIG
```

Verificar o contexto atual:

```bash
kubectl config current-context
```

Verificar conectividade com o cluster:

```bash
kubectl get nodes
```

---

## Informações do Cluster

Listar nodes:

```bash
kubectl get nodes
```

Exibir mais detalhes:

```bash
kubectl get nodes -o wide
```

Listar namespaces:

```bash
kubectl get ns
```

Verificar versão:

```bash
kubectl version
```

Informações do cluster:

```bash
kubectl cluster-info
```

---

## Trabalhando com Pods

Listar pods do namespace atual:

```bash
kubectl get pods
```

Listar pods de todos os namespaces:

```bash
kubectl get pods -A
```

Exibir mais informações:

```bash
kubectl get pods -o wide
```

Descrever um pod:

```bash
kubectl describe pod <pod>
```

Exemplo:

```bash
kubectl describe pod nginx-6c8b7d4d9b-j7l9h
```

---

## Logs

Visualizar logs:

```bash
kubectl logs <pod>
```

Acompanhar logs em tempo real:

```bash
kubectl logs -f <pod>
```

Logs de um container específico:

```bash
kubectl logs <pod> -c <container>
```

Últimas 100 linhas:

```bash
kubectl logs --tail=100 <pod>
```

---

## Acesso ao Container

Abrir shell:

```bash
kubectl exec -it <pod> -- bash
```

Caso o container não possua bash:

```bash
kubectl exec -it <pod> -- sh
```

Exemplo:

```bash
kubectl exec -it nginx-6c8b7d4d9b-j7l9h -- bash
```

---

## Deployments

Listar deployments:

```bash
kubectl get deployments
```

Descrever deployment:

```bash
kubectl describe deployment <deployment>
```

Verificar rollout:

```bash
kubectl rollout status deployment/<deployment>
```

Reiniciar deployment:

```bash
kubectl rollout restart deployment/<deployment>
```

Exemplo:

```bash
kubectl rollout restart deployment/frontend
```

---

## Services

Listar services:

```bash
kubectl get svc
```

Detalhar service:

```bash
kubectl describe svc <service>
```

---

## Ingress

Listar ingress:

```bash
kubectl get ingress
```

Detalhar ingress:

```bash
kubectl describe ingress <ingress>
```

---

## Aplicando Alterações

Aplicar manifesto:

```bash
kubectl apply -f deployment.yaml
```

Aplicar diretório inteiro:

```bash
kubectl apply -f manifests/
```

Remover recursos:

```bash
kubectl delete -f deployment.yaml
```

---

## Troubleshooting

### Verificar eventos

```bash
kubectl get events
```

Ordenar eventos por data:

```bash
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

### Pod não inicia

Verificar status:

```bash
kubectl get pods
```

Detalhar pod:

```bash
kubectl describe pod <pod>
```

Verificar logs:

```bash
kubectl logs <pod>
```

---

### ImagePullBackOff

Possíveis causas:

* Imagem inexistente
* Imagem privada
* Credenciais incorretas
* Harbor indisponível

Verificar:

```bash
kubectl describe pod <pod>
```

---

### CrashLoopBackOff

Possíveis causas:

* Aplicação falhando na inicialização
* Variáveis de ambiente incorretas
* Banco de dados indisponível
* ConfigMap ou Secret inválido

Verificar:

```bash
kubectl logs <pod>
```

---

### Pending

Possíveis causas:

* Falta de recursos
* Node indisponível
* Problemas de scheduling

Verificar:

```bash
kubectl describe pod <pod>
```

---

## Comandos Mais Utilizados

```bash
kubectl get pods -A
kubectl get nodes
kubectl get ns
kubectl get svc -A
kubectl get ingress -A
kubectl describe pod <pod>
kubectl logs -f <pod>
kubectl exec -it <pod> -- bash
kubectl rollout restart deployment/<deployment>
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## Referências

Documentação oficial:

https://kubernetes.io/docs/reference/kubectl/

---

> Em atividades de troubleshooting, normalmente a sequência mais eficiente é: get → describe → logs → exec.
