---
layout: default
description: "Instalação e configuração do Zabbix Agent no Linux, com verificação do serviço e da comunicação."
title: Instalação do Zabbix Agent no Linux
---

# Instalação do Zabbix Agent no Linux
{:.no_toc}

Este tutorial instala o Zabbix Agent 2 em um servidor Rocky Linux 9 ou outra distribuição compatível com pacotes RPM.

Pré-requisito: um Zabbix Server em funcionamento. Veja [Instalação do Zabbix Server]({{ 'monitoramento/instalacao-zabbix-server.html' | relative_url }}).

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## Adicionar o repositório

Substitua `7.0` pela versão utilizada pelo seu Zabbix Server, se necessário:

```bash
rpm -Uvh https://repo.zabbix.com/zabbix/7.0/rhel/9/x86_64/zabbix-release-latest-7.0.el9.noarch.rpm
dnf clean all
```

---

## Instalar o agente

```bash
dnf install -y zabbix-agent2
```

---

## Configurar o agente

Edite o arquivo de configuração:

```bash
vi /etc/zabbix/zabbix_agent2.conf
```

Configure pelo menos os parâmetros abaixo. Use o endereço IP ou DNS do Zabbix Server:

```text
Server=IP_DO_ZABBIX_SERVER
ServerActive=IP_DO_ZABBIX_SERVER
Hostname=nome-do-host-linux
```

O valor de `Hostname` deve ser exatamente igual ao nome cadastrado no frontend do Zabbix.

---

## Iniciar e habilitar o serviço

```bash
systemctl enable --now zabbix-agent2
systemctl status zabbix-agent2
```

---

## Liberar a porta do agente

Para monitoramento passivo, libere a porta TCP `10050`:

```bash
firewall-cmd --permanent --add-port=10050/tcp
firewall-cmd --reload
```

---

## Validar a comunicação

No Zabbix Server, teste a porta do agente:

```bash
nc -zv IP_DO_HOST_LINUX 10050
```

Verifique também os logs no host monitorado:

```bash
journalctl -u zabbix-agent2 -n 50 --no-pager
```

No frontend do Zabbix, crie ou abra o host e confirme:

- nome do host igual ao parâmetro `Hostname`;
- interface do tipo Agent apontando para o IP do Linux;
- template compatível com a versão do agente;
- status do host como disponível.