---
layout: default
description: "Documentação de DNS: resolução de nomes e encaminhamento de consultas com BIND."
title: DNS e BIND
---

# DNS

Documentação e estudos sobre **DNS (Domain Name System)**, com foco em administração e troubleshooting em ambientes Linux.

---

## Conteúdo

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'redes/dns/bind-encaminhamentodns.html' | relative_url }}">
    <span class="wiki-topic-title">BIND — Guia Completo de Encaminhamento Condicional</span>
    <span class="wiki-topic-description">Guia detalhado com conceitos, configuração, exemplos e validação de encaminhamentos condicionais de DNS no BIND.</span>
  </a>

  <a class="wiki-topic" href="{{ 'redes/dns/bindencaminhamento.html' | relative_url }}">
    <span class="wiki-topic-title">BIND — Encaminhamento Condicional: Procedimento Rápido</span>
    <span class="wiki-topic-description">Passo a passo direto para configurar um encaminhamento condicional de DNS no BIND.</span>
  </a>

</div>

---

## Conceitos

* Resolução de nomes
* Registros DNS
* Zonas DNS
* Forwarders
* Diagnóstico e troubleshooting

---

## Comandos principais

```bash
dig
nslookup
host
named-checkconf
rndc
```