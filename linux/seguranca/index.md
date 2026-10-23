---
layout: default
title: Segurança
description: "Autenticação por chave SSH e atualização de certificados SSL."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
  Segurança
</h1>

---

## Introdução

Segurança reúne os procedimentos de autenticação e de proteção das comunicações em servidores Linux.

Esta seção apresenta a configuração de chaves SSH e a atualização de certificados SSL em aplicações com Docker.

---

## Conteúdo

Os tutoriais estão agrupados por tecnologia.

### SSH

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'linux/seguranca/ssh/ssh_key.html' | relative_url }}">
    <span class="wiki-topic-title">Chave pública</span>
    <span class="wiki-topic-description">Configurar autenticação por chave no Linux.</span>
  </a>

</div>

### Certificados SSL

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'linux/seguranca/ssl/certificadossl.html' | relative_url }}">
    <span class="wiki-topic-title">Atualização — Harbor</span>
    <span class="wiki-topic-description">Renovação do certificado no Harbor com Docker.</span>
  </a>

  <a class="wiki-topic" href="{{ 'linux/seguranca/ssl/atualizarSSLwiki.html' | relative_url }}">
    <span class="wiki-topic-title">Atualização — WikiJS</span>
    <span class="wiki-topic-description">Renovação do certificado no WikiJS com Docker e Nginx.</span>
  </a>

</div>

---

> Esta seção reúne procedimentos de segurança relacionados ao Linux.