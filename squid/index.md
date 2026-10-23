---
layout: default
title: Squid
description: "Proxy Squid: instalação, ACLs, autenticação, regras e logs."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M16 3h5v5"/>
    <path d="M4 20 21 3"/>
    <path d="M21 16v5h-5"/>
    <path d="m15 15 6 6"/>
    <path d="m4 4 5 5"/>
  </svg>
  Squid
</h1>

---

## Conteúdo

Siga a sequência dos fundamentos para compreender o Squid, da configuração inicial ao gerenciamento e diagnóstico do proxy.

### Fundamentos

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'squid/fundamentos/01-introducao-ao-squid.html' | relative_url }}">
    <span class="wiki-topic-title">Introdução ao Squid</span>
    <span class="wiki-topic-description">Visão geral do proxy, funcionamento e principais componentes.</span>
  </a>

  <a class="wiki-topic" href="{{ 'squid/fundamentos/02-instalacao-e-configuracao.html' | relative_url }}">
    <span class="wiki-topic-title">Instalação e Configuração</span>
    <span class="wiki-topic-description">Instalação do Squid e configuração inicial do serviço.</span>
  </a>

  <a class="wiki-topic" href="{{ 'squid/fundamentos/03-acls-e-regras-de-acesso.html' | relative_url }}">
    <span class="wiki-topic-title">ACLs e Regras de Acesso</span>
    <span class="wiki-topic-description">Como controlar acessos utilizando ACLs e regras do Squid.</span>
  </a>

  <a class="wiki-topic" href="{{ 'squid/fundamentos/04-gerenciamento-de-urls.html' | relative_url }}">
    <span class="wiki-topic-title">Gerenciamento de URLs</span>
    <span class="wiki-topic-description">Organização e gerenciamento de URLs permitidas e bloqueadas.</span>
  </a>

  <a class="wiki-topic" href="{{ 'squid/fundamentos/05-automacao-do-gerenciamento-de-urls.html' | relative_url }}">
    <span class="wiki-topic-title">Automação do Gerenciamento de URLs</span>
    <span class="wiki-topic-description">Automação da inclusão, remoção e aplicação de regras de URLs com Ansible.</span>
  </a>

  <a class="wiki-topic" href="{{ 'squid/fundamentos/06-autenticacao.html' | relative_url }}">
    <span class="wiki-topic-title">Autenticação</span>
    <span class="wiki-topic-description">Conceitos e configurações de autenticação de usuários.</span>
  </a>

  <a class="wiki-topic" href="{{ 'squid/fundamentos/07-logs-e-diagnosticos.html' | relative_url }}">
    <span class="wiki-topic-title">Logs e Diagnóstico</span>
    <span class="wiki-topic-description">Análise de logs e procedimentos para identificar problemas de acesso.</span>
  </a>

</div>

---

> Esta seção reúne conceitos, configurações e procedimentos relacionados ao Squid.