---
layout: default
description: "Índice de Kubernetes: kubeconfig, kubectl, workloads, serviços e roteiros de instalação com seus limites de validação."
title: Kubernetes
---
# Kubernetes
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---


## Introdução

O Kubernetes é uma plataforma de orquestração de containers utilizada para automatizar implantação, escalabilidade e gerenciamento de aplicações.

Atualmente é uma das principais tecnologias utilizadas em ambientes corporativos, nuvem e arquiteturas de microsserviços.

Permite executar aplicações de forma distribuída, resiliente e altamente disponível.

> Execute comandos `kubectl` somente após confirmar o contexto com `kubectl config current-context`. Em produção, valide namespace, recurso e impacto antes de aplicar ou remover manifestos.

---
## Conteúdo

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'devops/kubernetes/kubeconfig.html' | relative_url }}">
    <span class="wiki-topic-title">KUBECONFIG</span>
    <span class="wiki-topic-description">Configuração de acesso e gerenciamento de clusters Kubernetes.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/kubectl.html' | relative_url }}">
    <span class="wiki-topic-title">Kubectl</span>
    <span class="wiki-topic-description">Comandos essenciais para administrar e interagir com o Kubernetes.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/instalacao-cluster-rocky-containerd-calico.html' | relative_url }}">
    <span class="wiki-topic-title">Instalação de Cluster Kubernetes com Rocky Linux, containerd e Calico</span>
    <span class="wiki-topic-description">Roteiro pendente de homologação em laboratório; confira a matriz de compatibilidade.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/tutorial-kubernetes-rocky-linux.html' | relative_url }}">
    <span class="wiki-topic-title">Kubernetes 1.31 no Rocky Linux (histórico)</span>
    <span class="wiki-topic-description">Registro histórico, sem suporte para novas instalações.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/pods.html' | relative_url }}">
    <span class="wiki-topic-title">Pods</span>
    <span class="wiki-topic-description">Criação, execução e diagnóstico de Pods.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/deployments.html' | relative_url }}">
    <span class="wiki-topic-title">Deployments</span>
    <span class="wiki-topic-description">Réplicas e atualizações de aplicações.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/services.html' | relative_url }}">
    <span class="wiki-topic-title">Services</span>
    <span class="wiki-topic-description">Descoberta e exposição de serviços.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/ingress.html' | relative_url }}">
    <span class="wiki-topic-title">Ingress</span>
    <span class="wiki-topic-description">Regras de acesso HTTP e controladores.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/kubernetes/troubleshooting.html' | relative_url }}">
    <span class="wiki-topic-title">Troubleshooting Kubernetes</span>
    <span class="wiki-topic-description">Verificações de workloads, nós e eventos.</span>
  </a>
</div>

---
## Fluxo recomendado de estudo

```text
KUBECONFIG --> Kubectl --> Instalação do Cluster --> Pods --> Deployments --> Services --> Ingress --> Troubleshooting
```

---
> Recomenda-se iniciar pelos tópicos KUBECONFIG, Kubectl e Pods antes de avançar para Deployments, Services, Ingress e Troubleshooting.
