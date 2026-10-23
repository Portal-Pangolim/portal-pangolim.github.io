---
layout: default
description: "Trilha de CI/CD com introdução aos conceitos de integração, entrega e validação automatizada."
title: CI/CD
---

# CI/CD

---


## Introdução

CI/CD é um conjunto de práticas utilizadas para automatizar a integração, validação, entrega e implantação de aplicações.

A automação reduz tarefas manuais, aumenta a rastreabilidade das alterações e permite identificar problemas mais cedo no ciclo de desenvolvimento.

O fluxo fundamental pode ser representado por:

```mermaid
flowchart LR
    Código --> Build
    Build --> Testes
    Testes --> Imagem
    Imagem --> Deploy
    Deploy --> Monitoramento
```

---
## Conteúdo

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'devops/cicd/fundamentos-cicd.html' | relative_url }}">
    <span class="wiki-topic-title">Fundamentos de CI/CD</span>
    <span class="wiki-topic-description">Conceitos fundamentais de integração e entrega contínuas, automação de build, testes e deploy.</span>
  </a>

</div>

---
## Fluxo recomendado de estudo

```mermaid
flowchart LR
    CI/CD --> Git
    Git --> Build
    Build --> Testes
    Testes --> Imagem/Artefato
    Imagem/Artefato --> Deploy
    Deploy --> Kubernetes
    Kubernetes --> Monitoramento
```

A sequência recomendada é:

1. Entender os fundamentos de CI/CD.
2. Revisar Git e branches.
3. Entender build e artefatos.
4. Aprender testes automatizados.
5. Entender Docker e imagens.
6. Criar uma pipeline.
7. Realizar deploy.
8. Integrar com Kubernetes.
9. Implementar monitoramento.
10. Avançar para GitOps e estratégias de deploy.