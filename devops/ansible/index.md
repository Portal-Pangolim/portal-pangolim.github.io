---
layout: default
description: "Índice de Ansible: inventários, módulos e playbooks para automação de tarefas de infraestrutura."
title: Ansible
---

# Ansible

> Trilha de estudo: **Índice (você está aqui)** · [Inventários](inventarios.md) · [Módulos](modulos.md) · [Playbooks](playbooks.md)

---

## Conteúdo

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'devops/ansible/inventarios.html' | relative_url }}">
    <span class="wiki-topic-title">Inventários</span>
    <span class="wiki-topic-description">Criação e gerenciamento de inventários para organizar hosts e grupos no Ansible.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/ansible/modulos.html' | relative_url }}">
    <span class="wiki-topic-title">Módulos</span>
    <span class="wiki-topic-description">Principais módulos Ansible e sua utilização na automação de tarefas.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/ansible/playbooks.html' | relative_url }}">
    <span class="wiki-topic-title">Playbooks</span>
    <span class="wiki-topic-description">Criação, estrutura e execução de playbooks para automação de ambientes.</span>
  </a>

</div>

---

## Introdução

Ansible é uma ferramenta de automação utilizada para administrar servidores, configurar sistemas, instalar pacotes, gerenciar serviços e executar tarefas repetitivas em vários hosts.

A comunicação normalmente ocorre por SSH e não exige a instalação de um agente nos servidores gerenciados.

O computador onde o Ansible está instalado é o **Control Node**. Os servidores administrados são os **Managed Nodes**.

---

## Conceitos principais

O Ansible pode ser usado para:

- administrar servidores;
- configurar sistemas;
- instalar pacotes;
- gerenciar serviços;
- distribuir arquivos;
- executar comandos e coletar informações;
- automatizar infraestrutura.

A comunicação normalmente ocorre por SSH e não exige a instalação de um agente nos servidores gerenciados.

```text
Control Node
	│
	│ SSH
	▼
Managed Nodes
```

Um Playbook é uma das principais formas de organizar e executar essas automações de maneira documentada e repetível.

---

## Fluxo recomendado de estudo

```text
Inventário → Módulos → Playbooks → Validação → Automação recorrente
```
