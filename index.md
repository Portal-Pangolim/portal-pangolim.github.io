---
layout: default
title: Portal Pangolim
description: Base de conhecimento técnico sobre infraestrutura e tecnologia.
---

<section class="home-dashboard-hero">
  <div class="home-dashboard-hero-content">
    <span class="home-eyebrow">Base de conhecimento técnico</span>

  <h1 class="home-title">
    <span>Portal Pangolim</span>
  </h1>

  <p>
    Documentação prática para estudo, consulta e administração de ambientes de TI.
  </p>

  </div>

  <div class="home-dashboard-stats">
    <div class="home-stat">
      <span class="home-stat-number">{{ site.pages | where: 'layout', 'default' | size }}</span>
      <span class="home-stat-label">Páginas</span>
    </div>
  </div>
</section>

<section class="home-tech" aria-labelledby="principais-tecnologias">
  <div class="home-section-heading">
    <span class="home-eyebrow">Tecnologias</span>

<h2 id="principais-tecnologias">Principais áreas</h2>

<p>
  Conteúdos organizados por tecnologias, plataformas e áreas de infraestrutura.
</p>

  </div>
</section>

<div class="wiki-topic-list" id="areas-documentadas">

  <a class="wiki-topic" href="{{ 'devops/' | relative_url }}">
    <span class="wiki-topic-title">DevOps</span>
    <span class="wiki-topic-description">Git, CI/CD, Jenkins, Ansible, Docker, Kubernetes e automação.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/' | relative_url }}">
    <span class="wiki-topic-title">Programação</span>
    <span class="wiki-topic-description">JavaScript, HTML, CSS, Markdown, Jekyll e guias de estudo.</span>
  </a>

  <a class="wiki-topic" href="{{ 'linux/' | relative_url }}">
    <span class="wiki-topic-title">Linux</span>
    <span class="wiki-topic-description">Administração, comandos, armazenamento, serviços e certificações.</span>
  </a>

  <a class="wiki-topic" href="{{ 'redes/' | relative_url }}">
    <span class="wiki-topic-title">Redes</span>
    <span class="wiki-topic-description">DNS, TCP/IP, proxy, conectividade e diagnóstico.</span>
  </a>

  <a class="wiki-topic" href="{{ 'squid/' | relative_url }}">
    <span class="wiki-topic-title">Squid</span>
    <span class="wiki-topic-description">Proxy, ACLs, autenticação, regras e logs.</span>
  </a>

  <a class="wiki-topic" href="{{ 'monitoramento/' | relative_url }}">
    <span class="wiki-topic-title">Monitoramento</span>
    <span class="wiki-topic-description">Zabbix, Grafana, métricas, alertas e observabilidade.</span>
  </a>

  <a class="wiki-topic" href="{{ 'nutanix/' | relative_url }}">
    <span class="wiki-topic-title">Nutanix</span>
    <span class="wiki-topic-description">Virtualização, Prism e administração de infraestrutura.</span>
  </a>

  <a class="wiki-topic" href="{{ 'vmware/' | relative_url }}">
    <span class="wiki-topic-title">VMware</span>
    <span class="wiki-topic-description">ESXi, hosts, armazenamento e infraestrutura.</span>
  </a>

  <a class="wiki-topic" href="{{ 'watchguard/' | relative_url }}">
    <span class="wiki-topic-title">WatchGuard</span>
    <span class="wiki-topic-description">Firewall, políticas, VPN e troubleshooting.</span>
  </a>

  <a class="wiki-topic" href="{{ 'windows/' | relative_url }}">
    <span class="wiki-topic-title">Windows</span>
    <span class="wiki-topic-description">Administração, ferramentas e integração com ambientes de TI.</span>
  </a>

  <a class="wiki-topic" href="{{ 'troubleshooting/' | relative_url }}">
    <span class="wiki-topic-title">Troubleshooting</span>
    <span class="wiki-topic-description">Diagnóstico, investigação de problemas e soluções práticas.</span>
  </a>

</div>
