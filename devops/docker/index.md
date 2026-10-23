---
layout: default
description: "Índice Docker com guias de imagens e containers e identificação dos capítulos ainda planejados."
title: Docker
---

# Docker
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## Introdução

Docker é uma plataforma para criar, empacotar e executar aplicações em **containers**.

Ele ajuda a padronizar ambientes, reduzir diferenças entre desenvolvimento e produção e facilitar a distribuição de aplicações com suas dependências.

> **Atenção:** antes de remover containers, imagens ou volumes, confirme o ambiente e o recurso-alvo. Volumes podem conter dados persistentes e sua recuperação pode não ser simples.

---

## Conteúdo

Esta seção reúne os principais conceitos e procedimentos relacionados ao Docker:

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'devops/docker/docker-image.html' | relative_url }}">
    <span class="wiki-topic-title">Imagens Docker</span>
    <span class="wiki-topic-description">Criação, gerenciamento e utilização de imagens Docker.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/docker/docker-container.html' | relative_url }}">
    <span class="wiki-topic-title">Containers</span>
    <span class="wiki-topic-description">Criação, execução, gerenciamento e troubleshooting de containers.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/docker/dockerfile.html' | relative_url }}">
    <span class="wiki-topic-title">Dockerfile (planejado)</span>
    <span class="wiki-topic-description">Criação de imagens Docker utilizando Dockerfiles.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/docker/docker-volume.html' | relative_url }}">
    <span class="wiki-topic-title">Volumes (planejado)</span>
    <span class="wiki-topic-description">Persistência e gerenciamento de dados utilizados por containers.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/docker/docker-network.html' | relative_url }}">
    <span class="wiki-topic-title">Redes Docker (planejado)</span>
    <span class="wiki-topic-description">Configuração e comunicação de containers através das redes Docker.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/docker/docker-compose.html' | relative_url }}">
    <span class="wiki-topic-title">Docker Compose (planejado)</span>
    <span class="wiki-topic-description">Definição e gerenciamento de aplicações com múltiplos containers.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/docker/docker-registry.html' | relative_url }}">
    <span class="wiki-topic-title">Registries privados (planejado)</span>
    <span class="wiki-topic-description">Armazenamento, gerenciamento e utilização de imagens em registries privados.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/docker/docker-troubleshooting.html' | relative_url }}">
    <span class="wiki-topic-title">Troubleshooting de containers (planejado)</span>
    <span class="wiki-topic-description">Diagnóstico e resolução de problemas comuns em containers Docker.</span>
  </a>

</div>

---

## Comandos de consulta rápida

### Containers

```bash

docker ps
docker ps -a
docker start nome-do-container
docker stop nome-do-container
docker restart nome-do-container
docker rm nome-do-container
```

### Imagens

```bash
docker images
docker pull nome-da-imagem
docker rmi nome-da-imagem
```

### Logs e diagnóstico

```bash
docker logs nome-do-container
docker logs -f nome-do-container
docker inspect nome-do-container
docker stats
```

### Execução de comandos

```bash
docker exec -it nome-do-container /bin/sh
```

---

## Fluxo recomendado de estudo

A sequência recomendada para estudar Docker é:

```text
Imagens
   ↓
Containers
   ↓
Volumes
   ↓
Redes
   ↓
Docker Compose
   ↓
Registries
   ↓
Troubleshooting
```

### Progressão prática

1. Entender o que são **imagens Docker**.
2. Criar, iniciar, parar e remover **containers**.
3. Trabalhar com **Dockerfile** e construir imagens.
4. Entender persistência de dados com **volumes**.
5. Configurar comunicação entre containers com **redes Docker**.
6. Orquestrar aplicações com **Docker Compose**.
7. Trabalhar com **registries privados**.
8. Diagnosticar problemas em containers e serviços.

---

## Boas práticas

* Use tags de imagem fixas em ambientes de produção.
* Evite executar containers como `root` quando possível.
* Separe dados persistentes utilizando volumes.
* Documente portas, variáveis de ambiente, volumes e dependências.
* Utilize `.dockerignore` para evitar o envio de arquivos desnecessários durante o build.
* Mantenha as imagens o mais enxutas possível.
* Remova containers e imagens que não são mais utilizados.
* Evite armazenar credenciais diretamente em imagens ou arquivos versionados.
* Monitore logs, consumo de CPU, memória e armazenamento.
* Antes de executar comandos destrutivos, confirme o container, imagem ou volume alvo.

---

## Próximos passos

Comece pelo estudo de **imagens Docker** e, em seguida, avance para:

* [Containers](docker-container.md)

A sequência recomendada é seguir o fluxo apresentado nesta página.
