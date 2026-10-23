---
layout: default
title: Nutanix
description: Fundamentos, arquitetura, armazenamento, volumes, Nutanix Files, Data Lens e procedimentos de clone de máquinas virtuais.
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
  </svg>
  Nutanix
</h1>

---

## Introdução

Nutanix é uma plataforma de infraestrutura hiperconvergente que integra computação, armazenamento e virtualização em um único cluster.

Esta seção apresenta os fundamentos da plataforma, a configuração de volumes, o Data Lens e o procedimento de configuração de máquinas virtuais após o clone.

---

## Conteúdo

Siga a sequência dos fundamentos para compreender a plataforma, da arquitetura ao diagnóstico inicial. Depois, avance para volumes, Data Lens e clone de VMs.

### Fundamentos

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/01-introducao-ao-nutanix.html' | relative_url }}">
    <span class="wiki-topic-title">Introdução ao Nutanix</span>
    <span class="wiki-topic-description">Visão geral da plataforma e de seus componentes.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/02-arquitetura-hiperconvergente.html' | relative_url }}">
    <span class="wiki-topic-title">Arquitetura Hiperconvergente</span>
    <span class="wiki-topic-description">Como computação e armazenamento se combinam nos nós.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/03-prism-element-e-prism-central.html' | relative_url }}">
    <span class="wiki-topic-title">Prism Element e Prism Central</span>
    <span class="wiki-topic-description">Interfaces de gerenciamento de um cluster e de vários clusters.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/04-ahv-aos-e-cvm.html' | relative_url }}">
    <span class="wiki-topic-title">AHV, AOS e CVM</span>
    <span class="wiki-topic-description">Hypervisor, sistema da plataforma e máquina virtual de controle.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/05-storage-pool-container-e-vdisk.html' | relative_url }}">
    <span class="wiki-topic-title">Storage Pool, Container e vDisk</span>
    <span class="wiki-topic-description">Organização lógica do armazenamento.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/06-resiliencia-rf2-rf3-e-localidade.html' | relative_url }}">
    <span class="wiki-topic-title">Resiliência, RF2, RF3 e Localidade</span>
    <span class="wiki-topic-description">Replicação de dados, tolerância a falhas e localidade.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/07-nutanix-files-e-fsvm.html' | relative_url }}">
    <span class="wiki-topic-title">Nutanix Files e FSVM</span>
    <span class="wiki-topic-description">Serviço de arquivos e suas máquinas virtuais.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/08-smb-nfs-e-active-directory.html' | relative_url }}">
    <span class="wiki-topic-title">SMB, NFS e Active Directory</span>
    <span class="wiki-topic-description">Protocolos de compartilhamento e integração com o AD.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/fundamentos/09-fluxos-e-diagnostico-inicial.html' | relative_url }}">
    <span class="wiki-topic-title">Fluxos e Diagnóstico Inicial</span>
    <span class="wiki-topic-description">Fluxos de acesso e primeiros passos de diagnóstico.</span>
  </a>

</div>

### Volumes

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'nutanix/volumes/configurando-volumes-nutanix.html' | relative_url }}">
    <span class="wiki-topic-title">Configurando Volumes Nutanix</span>
    <span class="wiki-topic-description">Passo a passo para configurar volumes.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/volumes/questionario-volumes-nutanix.html' | relative_url }}">
    <span class="wiki-topic-title">Questionário de Volumes Nutanix</span>
    <span class="wiki-topic-description">Perguntas para revisar o conteúdo de volumes.</span>
  </a>

</div>

### Data Lens

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'nutanix/data-lens/index.html' | relative_url }}">
    <span class="wiki-topic-title">Visão Geral</span>
    <span class="wiki-topic-description">Introdução ao Nutanix Data Lens.</span>
  </a>

</div>

### Clone de VM

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'nutanix/clone/configuracao-vm-apos-clone.html' | relative_url }}">
    <span class="wiki-topic-title">Configuração de VM Linux após clone</span>
    <span class="wiki-topic-description">Hostname, rede, identificadores, discos, horário, firewall e preparação para o Commvault.</span>
  </a>

</div>

---

> Esta seção reúne conceitos, arquitetura e procedimentos relacionados ao Nutanix.