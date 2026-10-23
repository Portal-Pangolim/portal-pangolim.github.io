---
layout: default
description: "Instalação do Zabbix Agent no Windows e configuração da comunicação com o servidor de monitoramento."
title: Instalação do Zabbix Agent no Windows
---

# Instalação do Zabbix Agent no Windows
{:.no_toc}

Este tutorial instala o Zabbix Agent 2 em uma máquina Windows utilizando o pacote MSI oficial.

Pré-requisito: um Zabbix Server em funcionamento. Veja [Instalação do Zabbix Server]({{ 'monitoramento/instalacao-zabbix-server.html' | relative_url }}).

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## Baixar o instalador

Baixe o instalador correspondente à arquitetura do Windows na página oficial:

```text
https://www.zabbix.com/download_agents
```

Escolha:

- versão compatível com o Zabbix Server;
- Windows;
- arquitetura x86_64;
- Zabbix Agent 2;
- pacote MSI.

Salve o arquivo, por exemplo, em:

```text
C:\Temp\zabbix_agent2.msi
```

---

## Instalar pelo PowerShell

Abra o PowerShell como Administrador e execute:

```powershell
msiexec.exe /i C:\Temp\zabbix_agent2.msi /qn `
  SERVER=IP_DO_ZABBIX_SERVER `
  SERVERACTIVE=IP_DO_ZABBIX_SERVER `
  HOSTNAME=nome-do-host-windows `
  /l*v C:\Temp\zabbix-agent2-install.log
```

Se a instalação silenciosa não for desejada, abra o arquivo MSI pelo Explorer e informe os mesmos parâmetros no assistente.

---

## Conferir a configuração

O arquivo normalmente fica em:

```text
C:\Program Files\Zabbix Agent 2\zabbix_agent2.conf
```

Confira se os parâmetros principais estão corretos:

```text
Server=IP_DO_ZABBIX_SERVER
ServerActive=IP_DO_ZABBIX_SERVER
Hostname=nome-do-host-windows
```

---

## Verificar o serviço

No PowerShell como Administrador:

```powershell
Get-Service -Name "Zabbix Agent 2"
Start-Service -Name "Zabbix Agent 2"
Set-Service -Name "Zabbix Agent 2" -StartupType Automatic
```

---

## Liberar o firewall do Windows

Para permitir verificações passivas do Zabbix Server:

```powershell
New-NetFirewallRule `
  -DisplayName "Zabbix Agent 2" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 10050 `
  -Action Allow
```

---

## Validar a comunicação

No Zabbix Server, teste a porta do host Windows:

```bash
nc -zv IP_DO_HOST_WINDOWS 10050
```

No Windows, consulte eventos e logs do agente. O arquivo de log depende da configuração usada, mas pode ser configurado no `zabbix_agent2.conf` com:

```text
LogFile=C:\Program Files\Zabbix Agent 2\zabbix_agent2.log
```

Depois de alterar a configuração, reinicie o serviço:

```powershell
Restart-Service -Name "Zabbix Agent 2"
```

No frontend do Zabbix, cadastre o host Windows usando o mesmo valor definido em `Hostname`, informe o IP correto e associe um template Windows compatível.