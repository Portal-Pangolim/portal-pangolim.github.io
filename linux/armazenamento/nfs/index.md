---
layout: default
title: NFS
description: "Servidor e clientes NFS no Linux e no Windows, com troubleshooting."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
  NFS
</h1>

---

## Introdução

O NFS (Network File System) permite compartilhar diretórios de um servidor com outras máquinas da rede, que os acessam como se fossem locais.

Esta seção apresenta a instalação do servidor no Rocky Linux 9, a configuração dos clientes Linux e Windows e o diagnóstico de problemas.

---

## Conteúdo

Siga esta sequência: primeiro o servidor, depois os clientes e, por fim, o troubleshooting.

<div class="wiki-topic-list">

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

O fluxo pode ser resumido assim:

```mermaid
flowchart LR
    Servidor["Servidor NFS"] --> Exportacao["Diretório exportado"]
    Exportacao --> Cliente["Cliente (Linux ou Windows)"]
```

---

> Esta seção reúne procedimentos de NFS no Linux e no Windows.