---

layout: default
description: "Uso de KUBECONFIG para selecionar clusters, contextos e credenciais de acesso ao Kubernetes."
title: KUBECONFIG
---

# KUBECONFIG - Guia Rápido
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Introdução

O KUBECONFIG é um arquivo utilizado pelo Kubernetes para armazenar informações de acesso aos clusters.

Ele contém dados como:

* Endereço da API do cluster
* Certificados
* Contextos
* Usuários
* Tokens de autenticação

Sem um KUBECONFIG válido, o `kubectl` não consegue se conectar ao cluster.

---

## Estrutura de um KUBECONFIG

Exemplo simplificado:

```yaml
apiVersion: v1
kind: Config

clusters:
- name: empresa-exemplo-hml
  cluster:
    server: https://cluster.corp.example.com

contexts:
- name: empresa-exemplo-hml
  context:
    cluster: empresa-exemplo-hml
    user: empresa-exemplo-hml

current-context: empresa-exemplo-hml
```

---

## Definindo o KUBECONFIG

### NKE

#### Desenvolvimento

```bash
export KUBECONFIG=/home/operador/empresa-exemplo-dev.yaml
```

#### Homologação

```bash
export KUBECONFIG=/home/operador/empresa-exemplo-hml.yaml
```

#### Produção

```bash
export KUBECONFIG=/home/operador/empresa-exemplo-prd.yaml
```

#### Infraestrutura

```bash
export KUBECONFIG=/home/operador/empresa-exemplo-infra.yaml
```

---

### RKE

#### Desenvolvimento

```bash
export KUBECONFIG=/home/operador/desenvolvimentorke.yaml
```

#### Homologação

```bash
export KUBECONFIG=/home/operador/homologacaorke.yaml
```

#### Produção

```bash
export KUBECONFIG=/home/operador/producaorke.yaml
```

---

## Verificando o contexto atual

```bash
kubectl config current-context
```

Exemplo:

```text
empresa-exemplo-hml
```

---

## Listando os contextos

```bash
kubectl config get-contexts
```

Exemplo:

```text
CURRENT   NAME
*         empresa-exemplo-hml
          empresa-exemplo-prd
          empresa-exemplo-dev
```

---

## Testando acesso ao cluster

Listar namespaces:

```bash
kubectl get ns
```

Listar nodes:

```bash
kubectl get nodes
```

Verificar versão:

```bash
kubectl version
```

---

## Comandos úteis

Listar pods de todos os namespaces:

```bash
kubectl get pods -A
```

Listar serviços:

```bash
kubectl get svc -A
```

Listar ingress:

```bash
kubectl get ingress -A
```

Descrever um pod:

```bash
kubectl describe pod <pod>
```

Visualizar logs:

```bash
kubectl logs <pod>
```

Acessar um container:

```bash
kubectl exec -it <pod> -- bash
```

---

## Troubleshooting

### Verificar KUBECONFIG carregado

```bash
echo $KUBECONFIG
```

---

### Erro: Forbidden

Exemplo:

```text
Error from server (Forbidden)
```

Possíveis causas:

* Token inválido
* Token expirado
* Permissões insuficientes
* Usuário sem acesso ao cluster

---

### Erro: system:unauthenticated

Exemplo:

```text
User "system:unauthenticated" cannot get resource
```

#### Causa

O cluster recebeu uma requisição sem autenticação válida.

#### Caso real

Durante um deploy via Jenkins foi retornado:

```text
User "system:unauthenticated" cannot get resource "clusters"
```

A causa foi uma credencial/token incorreto configurado no Jenkins.

#### Solução

* Gerar novo token no Rancher
* Atualizar a credencial utilizada pelo Jenkins
* Executar novamente o pipeline

---

## Referências

Documentação oficial Kubernetes:

https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/

---

> Sempre valide o KUBECONFIG carregado antes de iniciar qualquer operação em homologação ou produção.
