---
layout: default
description: "Pods no Kubernetes: definição, execução de containers e comandos de consulta e diagnóstico."
title: O que é Pod?
---

# Pods no Kubernetes
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## O que é um Pod?

O Pod é a menor unidade de execução do Kubernetes.

Ele representa um ou mais containers que compartilham:

* Endereço IP
* Namespace de rede
* Armazenamento
* Configurações

Na maioria dos casos, um Pod contém apenas um container.

---

## Como funciona um Pod

Quando uma aplicação é criada no Kubernetes, ela é executada dentro de um Pod.

Exemplo:

```text
Pod nginx
└── Container nginx
```

Outro exemplo com múltiplos containers:

```text
Pod aplicação
├── Container app
└── Container log-agent
```

Os containers dentro do mesmo Pod conseguem se comunicar utilizando:

```text
localhost
```

---

## Características dos Pods

### IP próprio

Cada Pod recebe um endereço IP único.

Exemplo:

```text
10.244.1.15
```

Esse IP pode mudar caso o Pod seja recriado.

### Efêmeros

Pods não são permanentes.

Se um Pod for removido:

```text
Pod antigo → excluído
Pod novo → criado
```

O novo Pod terá:

* Novo IP
* Novo ID
* Novo ciclo de vida

### Compartilhamento de recursos

Containers do mesmo Pod compartilham:

* Rede
* Volumes
* Armazenamento temporário

Exemplo:

```text
Pod
├── App
└── Sidecar

localhost:8080
```

O Sidecar consegue acessar a aplicação usando localhost.

---

## Ciclo de Vida de um Pod

### Pending

Pod foi criado mas ainda não está executando.

```text
STATUS: Pending
```

Possíveis causas:

* Imagem sendo baixada
* Falta de recursos
* Problemas de agendamento

### Running

Pod funcionando normalmente.

```text
STATUS: Running
```

### Succeeded

Execução concluída com sucesso.

Muito comum em Jobs.

```text
STATUS: Succeeded
```

### Failed

Execução terminou com erro.

```text
STATUS: Failed
```

### Unknown

Kubernetes perdeu comunicação com o Node.

```text
STATUS: Unknown
```

---

## Criando um Pod Simples

Arquivo:

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: nginx-pod

spec:
  containers:
  - name: nginx
    image: nginx:latest
```

Aplicar:

```bash
kubectl apply -f nginx-pod.yaml
```

---

## Consultando Pods

Listar Pods:

```bash
kubectl get pods
```

Saída:

```text
NAME        READY   STATUS
nginx-pod   1/1     Running
```

---

## Ver Detalhes de um Pod

```bash
kubectl describe pod nginx-pod
```

Exibe:

* Eventos
* Containers
* Recursos
* Endereço IP
* Node onde está executando

---

## Ver Logs de um Pod

```bash
kubectl logs nginx-pod
```

Exemplo:

```text
192.0.2.1 - GET /
```

---

## Acessar um Container Dentro do Pod

```bash
kubectl exec -it nginx-pod -- bash
```

Ou:

```bash
kubectl exec -it nginx-pod -- sh
```

---

## Excluir um Pod

```bash
kubectl delete pod nginx-pod
```

---

## Problemas Comuns

### Pod em Pending

Verificar:

```bash
kubectl describe pod NOME
```

Possíveis causas:

* Falta de CPU
* Falta de memória
* Node indisponível

### CrashLoopBackOff

O container inicia e falha repetidamente.

Verificar:

```bash
kubectl logs NOME
```

### ImagePullBackOff

Erro ao baixar imagem.

Verificar:

```bash
kubectl describe pod NOME
```

Problemas comuns:

* Nome incorreto da imagem
* Repositório privado
* Falha de rede

---

## Boas Práticas

* Evitar criar Pods diretamente em produção.
* Utilizar Deployments para gerenciar Pods.
* Definir limites de CPU e memória.
* Utilizar probes de saúde.
* Monitorar logs e eventos.

---

## Resumo

| Conceito                  | Descrição                            |
| ------------------------- | ------------------------------------ |
| Pod                       | Menor unidade do Kubernetes          |
| Container                 | Processo executado dentro do Pod     |
| IP próprio                | Cada Pod possui um IP                |
| Efêmero                   | Pode ser recriado a qualquer momento |
| Logs                      | kubectl logs                         |
| Acesso                    | kubectl exec                         |
| Detalhes                  | kubectl describe pod                 |
| Gerenciamento recomendado | Deployment                           |

> Importante: Em ambientes reais, raramente criamos Pods diretamente. O mais comum é criar um Deployment, que ficará responsável por criar, monitorar e recriar os Pods automaticamente, garantindo alta disponibilidade e recuperação automática em caso de falhas.

