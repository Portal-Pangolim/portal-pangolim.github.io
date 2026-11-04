---
layout: default
description: "Instalação, configuração e validação do Zabbix Agent 2 no Rocky Linux 9."
title: Instalação do Zabbix Agent no Linux
---

# Instalação do Zabbix Agent no Linux
{:.no_toc}

Instalação e configuração do **Zabbix Agent 2** no Rocky Linux 9 e distribuições compatíveis.

Pré-requisito: Zabbix Server ou Proxy disponível. Consulte [Instalação do Zabbix Server]({{ 'monitoramento/instalacao-zabbix-server.html' | relative_url }}).

<div class="toc-title">Sumário</div>
* Sumário
{:toc}

---

## 1. Instalar o agente

Exemplo utilizando o repositório Zabbix 7.0 para RHEL 9:

```bash
rpm -Uvh https://repo.zabbix.com/zabbix/7.0/rhel/9/x86_64/zabbix-release-latest-7.0.el9.noarch.rpm
dnf clean all
dnf install -y zabbix-agent2
```

Utilize a versão do repositório compatível com o ambiente.

## 2. Configurar o agente

Faça backup e edite a configuração:

```bash
cp -a /etc/zabbix/zabbix_agent2.conf /etc/zabbix/zabbix_agent2.conf.bak
vi /etc/zabbix/zabbix_agent2.conf
```

Configuração para monitoramento passivo:

```ini
Server=IP_DO_ZABBIX_SERVER_OU_PROXY
ListenPort=10050
ServerActive=
Hostname=nome-do-host-linux
```

Para verificações ativas, configure também `ServerActive` e garanta que `Hostname` corresponda ao nome técnico cadastrado no Zabbix.

Se a porta 10050 estiver ocupada, utilize outra porta disponível e configure o mesmo valor na interface do host no Zabbix.

## 3. Iniciar o serviço

```bash
systemctl enable --now zabbix-agent2
systemctl status zabbix-agent2 --no-pager
```

## 4. Verificar firewall

Para monitoramento passivo, permita TCP/10050 a partir do Zabbix Server ou Proxy autorizado.

Exemplo com firewalld ativo:

```bash
firewall-cmd --permanent \
  --add-rich-rule='rule family="ipv4" source address="IP_DO_ZABBIX_SERVER_OU_PROXY" port port="10050" protocol="tcp" accept'

firewall-cmd --reload
```

Caso utilize outra porta, ajuste a regra. Verifique também os firewalls e ACLs da rede.

## 5. Validar o agente

No host Linux:

```bash
zabbix_agent2 -t agent.ping
ss -lntp | grep ':10050'
journalctl -u zabbix-agent2 -n 20 --no-pager
```

No Zabbix Server ou Proxy:

```bash
zabbix_get -s IP_DO_HOST_LINUX -p 10050 -k agent.ping
```

**Resultado esperado:** `1`.

No frontend, confirme o IP, a porta da interface Agent, o Server ou Proxy responsável e o template associado ao host.