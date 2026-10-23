---
layout: default
sanitization: review-required
description: "Coleta de logs e geração do pacote de diagnóstico do WatchGuard NDR Collection Agent."
title: WatchGuard_Collection
---

# Coleta de Logs do WatchGuard NDR Collection Agent (Linux)
{:.no_toc}

> **Exemplos fictícios:** use seu host autorizado no lugar de collector.example.com e substitua <ARQUIVO-DIAGNOSTICO> pelo nome realmente gerado. A captura operacional foi retirada da versão atual; o bloco abaixo é apenas ilustrativo.

Este procedimento descreve como gerar o pacote oficial de diagnóstico do **WatchGuard NDR Collection Agent** em servidores Linux. O pacote é utilizado pelo suporte da WatchGuard para análise de falhas de comunicação, heartbeat, captura de fluxos e conectividade.


> **Importante**
>
> O script **não coleta logs de uma data específica**. Ele gera um pacote contendo o estado atual do Collection Agent, incluindo logs existentes, configurações, testes de conectividade e uma captura temporária de rede.<br>
 <br>
 
---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## 1. Acessar o servidor

Conecte-se via SSH ao servidor desejado.

```bash
ssh root@collector.example.com
```

---

## 3. Gerar o pacote de diagnóstico

Execute:

```bash
sudo /opt/collector/scripts/collectorDiagnostics.sh
```

O script executa automaticamente:

- Verificação do firewall
- Verificação dos serviços Nfcapd e Sfcapd
- Teste de conectividade com a WatchGuard
- Captura temporária de pacotes (`tcpdump`)
- Coleta dos logs do Collection Agent
- Geração do pacote oficial de diagnóstico

Saída:

```text
SAIDA ILUSTRATIVA - NAO E CAPTURA DE UM AMBIENTE
collector.example.com
sudo /opt/collector/scripts/collectorDiagnostics.sh
Pacote gerado: /opt/collector/staging/<ARQUIVO-DIAGNOSTICO>.lzo
```

---

## 4. Localizar o pacote gerado

Liste os arquivos mais recentes:

```bash
ls -lht /opt/collector/staging/ | head
```

O arquivo será semelhante a:

```text
<ARQUIVO-DIAGNOSTICO>.lzo
```

Esse é o arquivo que deverá ser enviado ao suporte da WatchGuard.

---

## 5. Baixar o arquivo para o computador

No PowerShell do Windows execute:

```powershell
scp root@collector.example.com:/opt/collector/staging/<ARQUIVO-DIAGNOSTICO>.lzo "$env:USERPROFILE\Downloads\"
```

---

## Verificações opcionais

### Verificar os processos do Collection Agent:

```bash
ps -ef | grep -Ei 'nfcapd|sfcapd|ndr_' | grep -v grep
```

```text
/opt/collector/bin/nfcapd
/opt/collector/bin/sfcapd
/opt/collector/bin/ndr_nf_aggregator
```

---

### Verificar o Heartbeat

```bash
tail -50 /opt/collector/logs/ndr_heartbeat.log
```

```text
Sending Heartbeat
heartbeat upload status 0
```

O código **status 0** indica envio realizado com sucesso.

---

### Procurar erros de Heartbeat

```bash
grep -nEi 'status [^0]$|error|fail|timeout|unable|refused' \
/opt/collector/logs/ndr_heartbeat.log
```

Caso o comando não retorne nenhuma saída, significa que não foram encontrados erros no log de heartbeat.

---

### Verificar os logs disponíveis

```bash
ls -lht /opt/collector/logs/
```

Os principais arquivos são:

- `ndr_heartbeat.log`
- `ndr_nf_aggregator.log`
- `ndr_s3upload.log`
- `collection.log`
- `ndr_monitor_capture.log`
- `syslog_cross_check.log`

---

## Checklist

- [ ] Conectar via SSH ao servidor.
- [ ] Executar `collectorDiagnostics.sh`.
- [ ] Localizar o arquivo em `/opt/collector/staging/`.
- [ ] Baixar o arquivo via `scp`.
- [ ] Anexar o arquivo `.lzo` ao chamado da WatchGuard.

---

## Referências

- WatchGuard NDR Collection Agent for Linux
- WatchGuard Support – Troubleshoot Collection Agent
- Documentação oficial do WatchGuard NDR
