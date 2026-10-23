---
layout: default
title: Armazenamento
description: "Gerenciamento de discos e volumes com LVM e compartilhamento de arquivos com NFS."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="22" y1="12" x2="2" y2="12"/>
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    <line x1="6" y1="16" x2="6.01" y2="16"/>
    <line x1="10" y1="16" x2="10.01" y2="16"/>
  </svg>
  Armazenamento
</h1>

---

## Introdução

Armazenamento reúne os procedimentos para gerenciar discos, volumes e compartilhamentos de arquivos em servidores Linux.

Esta seção apresenta a expansão de volumes com LVM e a configuração de NFS, em servidor e clientes.

---

## Conteúdo

Os tutoriais estão agrupados por tecnologia.

### LVM

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'linux/armazenamento/expandir-lvm.html' | relative_url }}">
    <span class="wiki-topic-title">Adicionar novo disco</span>
    <span class="wiki-topic-description">Expandir volumes com um disco adicional.</span>
  </a>

</div>

### NFS

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'linux/armazenamento/nfs/index.html' | relative_url }}">
    <span class="wiki-topic-title">Visão Geral</span>
    <span class="wiki-topic-description">Introdução ao NFS e ordem recomendada de leitura.</span>
  </a>

  <a class="wiki-topic" href="{{ 'linux/armazenamento/nfs/servidor-nfs-rocky-linux-9.html' | relative_url }}">
    <span class="wiki-topic-title">Servidor (Rocky Linux 9)</span>
    <span class="wiki-topic-description">Instalação e configuração do servidor NFS.</span>
  </a>

  <a class="wiki-topic" href="{{ 'linux/armazenamento/nfs/cliente-nfs-rocky-linux-9.html' | relative_url }}">
    <span class="wiki-topic-title">Cliente (Rocky Linux 9)</span>
    <span class="wiki-topic-description">Montagem de compartilhamentos no Linux.</span>
  </a>

  <a class="wiki-topic" href="{{ 'linux/armazenamento/nfs/cliente-nfs-windows-10-11.html' | relative_url }}">
    <span class="wiki-topic-title">Cliente (Windows 10/11)</span>
    <span class="wiki-topic-description">Acesso ao NFS a partir do Windows.</span>
  </a>

  <a class="wiki-topic" href="{{ 'linux/armazenamento/nfs/troubleshooting-nfs.html' | relative_url }}">
    <span class="wiki-topic-title">Troubleshooting</span>
    <span class="wiki-topic-description">Diagnóstico de problemas em Rocky/Linux e Windows.</span>
  </a>

</div>

---

> Esta seção reúne procedimentos de armazenamento relacionados ao Linux.