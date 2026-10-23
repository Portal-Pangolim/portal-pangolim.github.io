---
layout: default
title: Nmap — Comandos
description: Referência completa de comandos Nmap para inventário, diagnóstico, auditoria de firewall e validação defensiva.
---

# Nmap: Comandos e Referência Operacional
{:.no_toc}

Referência para executar varreduras previsíveis, limitadas e úteis em ativos autorizados.

> **Uso autorizado:** execute varreduras apenas em redes, hosts e serviços próprios ou formalmente autorizados. Defina escopo, janela, responsáveis e critério de parada. Este material prioriza inventário, diagnóstico, auditoria de firewall e hardening; não cobre exploração, força bruta, falsificação de origem, evasão de controles ou negação de serviço.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## 1. Estrutura

```bash
nmap [descoberta] [tipo-de-scan] [portas] [detecção] [NSE] [tempo] [saída] ALVO
```

Exemplo:

```bash
nmap -n -sT -sV --version-light -p 22,443   -oA evidencias/servidor-01   192.168.56.20
```

Ordem das opções não importa; a legibilidade sim. Mantenha um padrão em runbooks e scripts.

### Privilégios necessários

| Situação | Requer root/Administrador (ou `CAP_NET_RAW`)? |
| --- | --- |
| `-sT` (TCP connect) | Não |
| `-sS`, `-sU`, `-sA`, `-sW`, `-sN/-sF/-sX`, `-sO`, `-sY` | Sim (pacotes brutos) |
| `-O` (detecção de SO) | Sim |
| `-sn` em rede local (ARP) | Sim para ARP; sem root usa TCP connect |
| `--traceroute` | Sim |

Sem privilégios o Nmap faz fallback para `-sT`. Para forçar o comportamento, use `--privileged` ou `--unprivileged`.

### Estados de porta

| Estado | Significado |
| --- | --- |
| `open` | Aplicação aceitando conexões |
| `closed` | Alcançável, mas sem serviço escutando |
| `filtered` | Pacotes descartados por firewall/filtro; Nmap não consegue determinar |
| `unfiltered` | Alcançável, mas aberto/fechado indeterminado (scan ACK) |
| `open\|filtered` | Não foi possível distinguir (comum em UDP, FIN, NULL, Xmas) |
| `closed\|filtered` | Não foi possível distinguir (scan Idle) |

## 2. Alvos

| Opção | Exemplo | Uso |
| --- | --- | --- |
| Host único | `192.168.56.20` | Diagnóstico individual |
| Nome DNS | `servidor01.exemplo.local` | Alvo por FQDN |
| Intervalo | `192.168.56.20-30` | Grupo pequeno e aprovado |
| Octetos múltiplos | `192.168.1-3.10-20` | Faixas em mais de um octeto |
| CIDR | `192.168.56.0/28` | Laboratório ou segmento limitado |
| Arquivo | `-iL alvos.txt` | Lista revisada e auditável |
| Exclusão | `--exclude 192.168.56.1,192.168.56.2` | Retirar gateway ou ativo sensível |
| Arquivo de exclusão | `--excludefile exclusoes.txt` | Lista permanente de ativos protegidos |
| Apenas listar | `-sL` | Conferir o que seria varrido, sem enviar pacotes ao alvo |
| IPv6 | `-6 2001:db8::10` | Alvos IPv6 |
| Sem DNS | `-n` | Evitar resolução reversa e atrasos |

```bash
nmap -n -sT -p 22,443 -iL alvos-aprovados.txt
```

```bash
# Conferir o escopo antes de varrer (não envia sondas aos alvos)
nmap -sL -n -iL alvos-aprovados.txt --excludefile exclusoes.txt
```

Boa prática: sempre valide o escopo com `-sL` e mantenha um `exclusoes.txt` para ativos críticos (gateways, equipamentos médicos/industriais, sistemas legados frágeis).

## 3. Descoberta de hosts

| Opção | Uso | Quando usar |
| --- | --- | --- |
| `-sn` | Descoberta sem varredura de portas | Inventário inicial |
| `-Pn` | Considera todos os hosts ativos | Somente quando a descoberta é bloqueada e há justificativa |
| `-PE` | ICMP echo request | Redes que permitem ping |
| `-PP` | ICMP timestamp | Alternativa quando echo é filtrado |
| `-PM` | ICMP address mask | Alternativa rara |
| `-PS<portas>` | TCP SYN ping | Hosts que filtram ICMP (ex.: `-PS22,443`) |
| `-PA<portas>` | TCP ACK ping | Testar filtros stateless |
| `-PU<portas>` | UDP ping | Quando só UDP responde (ex.: `-PU53`) |
| `-PY<portas>` | SCTP INIT ping | Ambientes SCTP |
| `-PR` | ARP ping | Padrão em rede local (mais confiável) |
| `--disable-arp-ping` | Desativa ARP na LAN | Diagnóstico de comportamento |
| `-n` / `-R` | Nunca / sempre resolver DNS | Controle de DNS |
| `--dns-servers` | Define servidores DNS | Resolver nomes por DNS interno específico |
| `--system-dns` | Usa o resolvedor do SO | Consistência com o host |
| `--traceroute` | Mostra o caminho até o alvo | Diagnóstico de roteamento |

```bash
# Descoberta simples em segmento local
nmap -sn -n 192.168.56.0/28

# Descoberta combinando ICMP e TCP (redes que filtram ping)
nmap -sn -n -PE -PS22,443 -PA80 192.168.56.0/28

# Descoberta apenas via ARP (LAN)
nmap -sn -n -PR 192.168.56.0/24

# Listar hosts ativos de forma parseável
nmap -sn -n 192.168.56.0/24 -oG - | awk '/Up$/{print $2}'

# DNS interno específico
nmap -sL --dns-servers 192.168.56.53 192.168.56.0/28

# Caminho de rede até o host
nmap -sn --traceroute 192.168.56.20
```

Evite `-Pn` em faixas grandes: ele trata todos os endereços como ativos, gera tráfego contra todos eles e aumenta muito o tempo do scan.

## 4. Tipos de varredura

### TCP

| Opção | Nome | Descrição | Observação |
| --- | --- | --- | --- |
| `-sT` | TCP connect | Conexão completa via SO | Não exige privilégios; mais visível em logs |
| `-sS` | TCP SYN (half-open) | Envia SYN e analisa a resposta | Padrão com root; rápido e eficiente |
| `-sA` | TCP ACK | Mapeia regras de firewall | Não detecta porta aberta; mostra `filtered`/`unfiltered` |
| `-sW` | TCP Window | Variante do ACK | Depende do comportamento da pilha TCP |
| `-sM` | TCP Maimon | Sonda FIN/ACK | Uso de laboratório; resultado depende do SO |
| `-sN` | TCP NULL | Sem flags | Auditoria de pilhas/filtros; resultado ambíguo |
| `-sF` | TCP FIN | Flag FIN | Idem |
| `-sX` | TCP Xmas | FIN+PSH+URG | Idem |
| `--scanflags` | Flags customizadas | Ex.: `--scanflags SYNFIN` | Testes de firewall em laboratório |

### Outros protocolos

| Opção | Descrição |
| --- | --- |
| `-sU` | UDP (lento; limite as portas) |
| `-sY` | SCTP INIT |
| `-sZ` | SCTP COOKIE-ECHO |
| `-sO` | Varredura de protocolos IP (ICMP, TCP, UDP, GRE, ESP etc.) |

```bash
# TCP connect (sem root)
nmap -sT -p 22,443 192.168.56.20

# SYN scan (com root)
sudo nmap -sS -p 22,443 192.168.56.20

# UDP controlado
sudo nmap -sU -p 53,123,161 192.168.56.53

# TCP e UDP juntos
sudo nmap -sS -sU -p T:53,U:53 192.168.56.53

# Protocolos IP suportados pelo host
sudo nmap -sO -n 192.168.56.20

# SCTP
sudo nmap -sY -p 2905,3868 192.168.56.20
```

Dica: use `-sT` quando precisar de resultados sem privilégios ou quando o objetivo for simular o comportamento de uma aplicação cliente normal.

## 5. Especificação de portas

| Opção | Descrição | Observação |
| --- | --- | --- |
| `-p 22,80,443` | Lista explícita | Preferida |
| `-p 8000-8010` | Intervalo | Justifique o intervalo |
| `-p-` | Todas as 65535 portas TCP | Use com escopo reduzido e janela aprovada |
| `-p T:22,U:53` | Por protocolo | Combine com `-sS -sU` |
| `-p http,https,ssh` | Por nome de serviço | Usa `nmap-services` |
| `-p 'http*'` | Curinga por nome | Entre aspas |
| `-F` | Modo rápido (top 100) | Triagem |
| `--top-ports N` | N portas mais frequentes | Triagem, não baseline completo |
| `--port-ratio 0.1` | Portas com frequência maior que o valor | Alternativa ao top-ports |
| `-r` | Portas em ordem sequencial | Padrão é ordem aleatória |
| `--exclude-ports` | Exclui portas da lista | Ex.: `-p- --exclude-ports 9100` (impressoras) |

```bash
# Triagem
nmap -n -sT --top-ports 100 192.168.56.20

# Baseline completo em janela aprovada
sudo nmap -n -sS -p- --reason -T3 -oA evidencias/full-tcp 192.168.56.20

# Excluir portas sensíveis (ex.: impressoras em 9100)
nmap -n -sT -p- --exclude-ports 9100 192.168.56.20

# Portas por nome de serviço
nmap -n -sT -p http,https,ssh 192.168.56.20
```

## 6. Detecção de serviço e sistema operacional

| Opção | Efeito | Uso recomendado |
| --- | --- | --- |
| `-sV` | Detecta serviço e versão | Inventário e troubleshooting |
| `--version-intensity 0-9` | Define o número de sondas | `0` mínimo, `9` máximo |
| `--version-light` | Equivale a intensidade 2 | Primeira coleta em produção |
| `--version-all` | Equivale a intensidade 9 | Laboratório ou janela autorizada |
| `--version-trace` | Mostra a atividade de detecção | Depuração |
| `-O` | Infere o sistema operacional | Escopo restrito; resultado pode ser impreciso |
| `--osscan-limit` | Só tenta SO em hosts promissores | Reduz tráfego |
| `--osscan-guess` | Palpite mais agressivo | Resultado menos confiável |
| `-A` | `-sV -O -sC --traceroute` | Somente após revisão; prefira opções explícitas |

```bash
nmap -sT -sV --version-light -p 22,80,443 192.168.56.20

# Intensidade controlada
nmap -sT -sV --version-intensity 5 -p 1-1024 192.168.56.20

# Sistema operacional em um único host
sudo nmap -O --osscan-limit -p 22,443 192.168.56.20
```

## 7. NSE (Nmap Scripting Engine)

Veja a página [NSE](nmap-nse.html) para documentação completa. Para uma coleta inicial, prefira scripts explícitos:

```bash
nmap -sT -sV --version-light   -p 22,80,443   --script ssh-hostkey,http-title,http-headers,ssl-cert   192.168.56.20
```

### Opções principais

| Opção | Descrição |
| --- | --- |
| `-sC` | Executa scripts da categoria `default` |
| `--script <nome\|categoria\|arquivo>` | Seleciona scripts (aceita vírgula, curinga e expressões booleanas) |
| `--script-args k=v,k2=v2` | Argumentos para scripts |
| `--script-args-file arq` | Argumentos a partir de arquivo |
| `--script-help <nome\|categoria>` | Documentação do script |
| `--script-trace` | Mostra comunicação dos scripts |
| `--script-updatedb` | Atualiza o índice de scripts |
| `--script-timeout` | Tempo máximo por script |

### Categorias

| Categoria | Perfil de uso |
| --- | --- |
| `safe` | Não deve afetar o alvo; indicada para início |
| `default` | Conjunto padrão, geralmente seguro e rápido |
| `discovery` | Coleta informações sobre rede e serviços |
| `version` | Complementa a detecção de versão |
| `vuln` | Verificações de vulnerabilidades conhecidas; use com autorização e janela |
| `auth` | Verificações de autenticação (ex.: acesso anônimo) |
| `broadcast` | Descobre hosts por broadcast/multicast |
| `external` | Consulta serviços de terceiros; pode vazar informações |
| `intrusive` | Pode afetar o alvo; exige aprovação |
| `fuzzer`, `brute`, `dos`, `exploit`, `malware` | Fora do escopo desta referência; não use sem contrato e aprovação formal específica |

### Scripts úteis para inventário e hardening

| Objetivo | Script |
| --- | --- |
| Chave de host SSH | `ssh-hostkey` |
| Algoritmos SSH | `ssh2-enum-algos` |
| Certificado TLS | `ssl-cert` |
| Cifras TLS aceitas | `ssl-enum-ciphers` |
| Título/cabeçalhos HTTP | `http-title`, `http-headers`, `http-security-headers` |
| Métodos HTTP | `http-methods` |
| Servidor/tecnologia web | `http-server-header`, `http-generator` |
| SMB protocolos/assinatura | `smb-protocols`, `smb2-security-mode`, `smb-security-mode` |
| SMB SO/nome | `smb-os-discovery` |
| DNS recursivo aberto | `dns-recursion` |
| NTP | `ntp-info` |
| SNMP | `snmp-info` |
| FTP anônimo | `ftp-anon` |
| Banner de serviço | `banner` |
| MySQL/PostgreSQL info | `mysql-info` |
| RDP | `rdp-enum-encryption` |

```bash
# Auditoria de TLS
nmap -n -sT -p 443 --script ssl-cert,ssl-enum-ciphers 192.168.56.20

# Auditoria de SSH
nmap -n -sT -p 22 --script ssh-hostkey,ssh2-enum-algos 192.168.56.20

# Postura SMB
nmap -n -sT -p 445 --script smb-protocols,smb2-security-mode,smb-os-discovery 192.168.56.20

# HTTP: métodos e cabeçalhos de segurança
nmap -n -sT -p 80,443 --script http-methods,http-security-headers 192.168.56.20

# Resolver DNS aberto
sudo nmap -n -sU -p 53 --script dns-recursion 192.168.56.53

# Categoria segura + descoberta
nmap -n -sT -p 22,80,443 --script "safe and discovery" 192.168.56.20

# Excluir categorias arriscadas de uma seleção
nmap -n -sT -p 22,80,443 --script "default and not intrusive" 192.168.56.20

# Ajuda e depuração
nmap --script-help ssh-hostkey
nmap --script-trace --script ssl-cert -p 443 192.168.56.20
```

Não use `--script all`, categorias agressivas ou scripts de terceiros sem revisão e autorização. Para listar os scripts instalados: `ls /usr/share/nmap/scripts/` (o caminho pode variar; consulte `nmap --version` e `--datadir`).

## 8. Tempo, desempenho e estabilidade

### Templates de tempo

| Opção | Nome | Aplicação |
| --- | --- | --- |
| `-T0` | Paranoid | Intervalos muito longos; casos muito específicos |
| `-T1` | Sneaky | Muito lento |
| `-T2` | Polite | Ambiente sensível |
| `-T3` | Normal | Padrão equilibrado; recomendação inicial |
| `-T4` | Aggressive | Redes locais estáveis e confiáveis |
| `-T5` | Insane | Evitar; perda de precisão e risco operacional |

### Ajustes finos

| Opção | Aplicação | Observação |
| --- | --- | --- |
| `--max-retries N` | Limita retransmissões | Pode reduzir detecção em rede instável |
| `--host-timeout 2m` | Limita tempo por host | Evita travar toda a execução |
| `--scan-delay 500ms` | Atraso entre sondas | Protege dispositivos frágeis |
| `--max-scan-delay` | Teto para o atraso adaptativo | Controle fino |
| `--min-rate N` / `--max-rate N` | Pacotes por segundo (mínimo/máximo) | Use `--max-rate` para limitar impacto |
| `--min-parallelism` / `--max-parallelism` | Sondas simultâneas | Controle de concorrência |
| `--min-hostgroup` / `--max-hostgroup` | Hosts varridos em paralelo | Útil em redes grandes |
| `--initial-rtt-timeout`, `--min-rtt-timeout`, `--max-rtt-timeout` | Tempo de espera por resposta | Redes de alta latência |
| `--defeat-rst-ratelimit` | Contorna limitação de RST do alvo | Acelera, mas pode reduzir a precisão |
| `--defeat-icmp-ratelimit` | Contorna limitação de ICMP em UDP | Idem |
| `--stats-every 30s` | Estatísticas periódicas | Acompanhar scans longos |
| `--reason` | Explica o motivo do estado | Excelente para troubleshooting |

```bash
# Conservador para produção sensível
nmap -n -sT -T2 --reason --max-retries 2   -p 22,443 192.168.56.20

# Limitar a taxa de pacotes
nmap -n -sT --max-rate 50 -p 1-1024 192.168.56.20

# Scan longo com acompanhamento e timeout por host
nmap -n -sT -p- --host-timeout 10m --stats-every 60s   -oA evidencias/longo 192.168.56.20

# Protege equipamentos frágeis com atraso entre sondas
nmap -n -sT --scan-delay 1s -p 22,80,443 -iL frageis.txt
```

Não acelere scans de produção por conveniência. Primeiro reduza escopo, portas e intensidade.

## 9. Auditoria de firewall e regras de filtragem

Use estas opções para validar **seus próprios** firewalls, ACLs e grupos de segurança.

| Objetivo | Opções |
| --- | --- |
| Mapear regras (stateful vs stateless) | `-sA` |
| Ver o motivo da classificação | `--reason` |
| Ver cada pacote enviado/recebido | `--packet-trace` |
| Testar regra por porta de origem | `--source-port <n>` / `-g <n>` |
| Testar inspeção de checksum | `--badsum` |
| Testar tamanho de payload | `--data-length <n>` |
| Testar comportamento por TTL | `--ttl <n>` |
| Escolher interface | `-e eth0` |

```bash
# Quais portas o firewall deixa passar (sem depender de serviço aberto)
sudo nmap -n -sA -p 22,80,443,3389 192.168.56.20

# Ver cada pacote e o motivo do estado
sudo nmap -n -sS -p 443 --reason --packet-trace 192.168.56.20

# Regra baseada em porta de origem (ex.: DNS/53 liberado indevidamente)
sudo nmap -n -sS --source-port 53 -p 1-1024 192.168.56.20

# Checksum inválido: um host alcançado indica firewall/IPS que responde sem validar
sudo nmap -n -sS --badsum -p 80 192.168.56.20

# Comparar visão de dentro vs fora (execute de ambos os pontos e compare com ndiff)
sudo nmap -n -sS -p 1-1024 -oX dentro.xml 192.168.56.20
```

Interpretação: `unfiltered` no `-sA` indica que o pacote chegou ao host (regra permissiva ou firewall stateless); `filtered` indica descarte ou bloqueio no caminho.

## 10. Interface e rede

| Opção | Descrição |
| --- | --- |
| `-e <interface>` | Força a interface de saída |
| `--iflist` | Lista interfaces e rotas conhecidas pelo Nmap |
| `--send-eth` | Força envio em camada 2 |
| `--send-ip` | Força envio em camada 3 |
| `--privileged` / `--unprivileged` | Define o modo de privilégio |
| `-6` | Habilita IPv6 |
| `-4` | Força IPv4 (implícito) |

```bash
# Ver interfaces e rotas
nmap --iflist

# Escolher interface em host multihomed
sudo nmap -e eth1 -sn -n 10.10.10.0/28

# IPv6
nmap -6 -sT -p 22,443 2001:db8::10
nmap -6 -sn -n fe80::1%eth0
```

## 11. Saída e evidências

| Opção | Resultado |
| --- | --- |
| `-oN arquivo.txt` | Texto legível |
| `-oX arquivo.xml` | XML para integração |
| `-oG arquivo.gnmap` | Formato legado grepável |
| `-oA prefixo` | Gera os três formatos |
| `-oN -` / `-oG -` | Envia para a saída padrão |
| `--append-output` | Anexa em vez de sobrescrever |
| `-v` / `-vv` | Mais detalhes no terminal |
| `-d` / `-dd` | Depuração |
| `--open` | Mostra apenas portas abertas |
| `--reason` | Inclui o motivo do estado |
| `--packet-trace` | Mostra pacotes |
| `--resume arquivo` | Retoma um scan interrompido (a partir de `-oN` ou `-oG`) |
| `--stylesheet` / `--webxml` | Estilo XSL para o XML |
| `--no-stylesheet` | Remove a referência de estilo |

```bash
mkdir -p evidencias
nmap -n -sT -sV --version-light -p 22,443   -oA evidencias/ssh-https-$(date +%F)   192.168.56.20

# Somente portas abertas
nmap -n -sT --open -p 1-1024 192.168.56.20

# Retomar um scan interrompido
nmap --resume evidencias/longo.nmap
```

### Processando resultados

```bash
# Hosts ativos a partir do formato grepável
grep "Status: Up" evidencias/rede.gnmap | awk '{print $2}'

# Hosts com 443 aberta
grep "443/open" evidencias/rede.gnmap | awk '{print $2}'

# Relatório HTML a partir do XML (requer xsltproc)
xsltproc evidencias/rede.xml -o evidencias/rede.html

# Extrair IP e portas abertas do XML (requer xmllint)
xmllint --xpath '//host[ports/port/state[@state="open"]]/address/@addr' evidencias/rede.xml
```

### Comparação entre varreduras com Ndiff

```bash
# Gere dois scans em datas diferentes e compare
nmap -n -sT -p 22,80,443 -oX base.xml  192.168.56.0/28
nmap -n -sT -p 22,80,443 -oX atual.xml 192.168.56.0/28

ndiff base.xml atual.xml
ndiff -v base.xml atual.xml      # inclui detalhes
ndiff --text base.xml atual.xml  # formato texto
ndiff --xml  base.xml atual.xml  # formato XML
```

Use Ndiff para detectar portas novas, serviços alterados e hosts que apareceram ou sumiram entre execuções.

## 12. Perfis prontos

### Descoberta em laboratório

```bash
nmap -sn -n 192.168.56.0/24
```

### Descoberta resiliente a filtro de ICMP

```bash
nmap -sn -n -PE -PS22,80,443 -PA80 -PU53 192.168.56.0/24
```

### Inventário de Linux

```bash
nmap -n -sT -sV --version-light   -p 22,80,443   -iL linux-aprovados.txt
```

### Inventário de Windows

```bash
nmap -n -sT -sV --version-light   -p 135,139,445,3389,5985   --script smb-os-discovery,smb2-security-mode,rdp-enum-encryption   -iL windows-aprovados.txt
```

### Validação de exposição pós-mudança

```bash
nmap -n -sT --reason   -p 22,80,443,3306,5432   192.168.56.20
```

### Servidor DNS interno

```bash
sudo nmap -n -sT -sU -sV --version-light   -p T:53,U:53   192.168.56.53
```

### HTTPS com certificado e cabeçalhos

```bash
nmap -n -sT -p 443   --script ssl-cert,http-title,http-headers,http-security-headers   192.168.56.20
```

### Auditoria de cifras TLS

```bash
nmap -n -sT -p 443,8443,993,995,465   --script ssl-cert,ssl-enum-ciphers   192.168.56.20
```

### Serviços de gerência expostos

```bash
nmap -n -sT --reason   -p 22,23,161,2375,3389,5900,5985,5986,8080,8443   -iL ativos-aprovados.txt
```

### Bancos de dados

```bash
nmap -n -sT -sV --version-light   -p 1433,1521,3306,5432,6379,9200,27017   -iL db-aprovados.txt
```

### SNMP e NTP (UDP)

```bash
sudo nmap -n -sU -p 123,161   --script ntp-info,snmp-info   192.168.56.20
```

### Baseline completo em janela aprovada

```bash
sudo nmap -n -sS -p- -sV --version-light   -T3 --reason --max-retries 2 --host-timeout 30m   --stats-every 60s   -oA evidencias/baseline-$(date +%F)   192.168.56.20
```

### Varredura recorrente com comparação

```bash
#!/usr/bin/env bash
set -euo pipefail
DIR=evidencias
mkdir -p "$DIR"
HOJE="$DIR/scan-$(date +%F).xml"
nmap -n -sT --open -p 22,80,443,3389   -iL alvos-aprovados.txt   -oX "$HOJE"
ANTERIOR=$(ls -1 "$DIR"/scan-*.xml | grep -v "$HOJE" | tail -n1 || true)
[ -n "$ANTERIOR" ] && ndiff "$ANTERIOR" "$HOJE" || echo "Primeira execução."
```

### Rede IPv6

```bash
nmap -6 -n -sT -p 22,80,443 2001:db8::10
```

## 13. Troubleshooting

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Todas as portas `filtered` | Firewall descartando pacotes | `--reason`, `--packet-trace`, `-sA` para mapear regras |
| Host aparece como `down` | ICMP bloqueado | `-PS22,443 -PA80`, ou `-Pn` em escopo mínimo e justificado |
| Scan muito lento | Retransmissões, DNS, UDP | `-n`, `--max-retries 2`, `--host-timeout`, limitar portas |
| `open\|filtered` em UDP | Sem resposta a sondas genéricas | Use `-sV` e scripts específicos do protocolo |
| Resultados diferentes a cada execução | Rede instável ou IPS/rate limit | Reduza `-T`, use `--max-rate`, repita e compare com `ndiff` |
| "Operation not permitted" | Falta de privilégio | Execute com `sudo` ou use `-sT` |
| Versão do serviço não detectada | Poucas sondas | Aumente `--version-intensity` em janela autorizada |
| SO não identificado | Poucas portas abertas/fechadas conhecidas | Inclua uma porta aberta e uma fechada no scan com `-O` |
| Nome não resolve | DNS interno indisponível | `--dns-servers` ou `-n` e use IPs |
| Scan interrompido | Queda de sessão | `--resume`; use `tmux`/`screen` para scans longos |

## 14. Quando evitar opções

| Opção ou padrão | Por que evitar como padrão |
| --- | --- |
| `-Pn` em rede ampla | Trata todos os IPs como ativos |
| `-p-` em produção | Amplia tráfego, tempo e superfície de impacto |
| `-sU` sem limitar portas | Pode ser lento e ambíguo |
| `-T4` ou `-T5` | Pode aumentar perda, alertas e impacto operacional |
| `-A` sem revisão | Combina múltiplas técnicas; prefira parâmetros explícitos |
| `--script all` | Pode incluir scripts inadequados ao escopo |
| Categorias `intrusive`, `vuln`, `brute`, `dos`, `exploit`, `fuzzer` | Podem afetar serviços; exigem aprovação específica |
| `--version-all` em produção | Mais sondas e mais ruído |
| `--min-rate` alto | Pode sobrecarregar firewalls e equipamentos frágeis |
| `-iR` (alvos aleatórios) | Fora de qualquer escopo autorizado |

## 15. Ferramentas relacionadas

| Ferramenta | Função |
| --- | --- |
| `ncat` | Cliente/servidor de rede para testes de conectividade e banners |
| `nping` | Geração de pacotes para diagnóstico e testes de firewall |
| `ndiff` | Comparação de resultados XML do Nmap |
| `zenmap` | Interface gráfica do Nmap (quando disponível) |
| `xsltproc` / `xmllint` | Conversão e consulta de XML |

```bash
# Testar conectividade e banner com ncat
ncat -v 192.168.56.20 22

# Teste de caminho TCP com nping
nping --tcp -p 443 -c 3 192.168.56.20
```

## 16. Consulta rápida

```bash
# Ajuda geral
nmap --help

# Manual completo
man nmap

# Versão e opções de compilação
nmap --version

# Ajuda de script NSE
nmap --script-help ssl-cert

# Detalhar por que cada estado foi atribuído
nmap --reason -sT -p 22,443 192.168.56.20

# Sem resolução DNS
nmap -n -sT -p 22,443 192.168.56.20

# Conferir escopo sem enviar sondas
nmap -sL -n -iL alvos-aprovados.txt

# Descoberta de hosts
nmap -sn -n 192.168.56.0/28

# Serviços e versões (leve)
nmap -n -sT -sV --version-light -p 22,80,443 192.168.56.20

# Todas as portas TCP (janela aprovada)
sudo nmap -n -sS -p- --reason 192.168.56.20

# UDP controlado
sudo nmap -n -sU -p 53,123,161 192.168.56.20

# Mapear firewall
sudo nmap -n -sA -p 22,80,443 192.168.56.20

# Scripts seguros
nmap -n -sT -p 443 --script ssl-cert,ssl-enum-ciphers 192.168.56.20

# Salvar em todos os formatos
nmap -n -sT -p 22,443 -oA evidencias/alvo 192.168.56.20

# Comparar duas execuções
ndiff base.xml atual.xml
```