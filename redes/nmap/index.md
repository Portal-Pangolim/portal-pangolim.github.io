---
layout: default
title: Nmap
description: Conceitos, instalação, funcionamento e primeiros passos com Nmap.
---

# Nmap: Conceitos, Instalação e Funcionamento
{:.no_toc}

O **Nmap** (Network Mapper) é uma ferramenta de descoberta de rede, inventário e auditoria de segurança. Em um ambiente autorizado, ele ajuda a responder quais hosts estão alcançáveis, quais portas estão expostas, quais serviços respondem e quais controles de filtragem podem estar no caminho.

> **Uso autorizado:** execute varreduras apenas em redes, hosts e serviços próprios ou formalmente autorizados. Defina escopo, janela, responsáveis e critério de parada. Este material prioriza inventário, diagnóstico e hardening; não cobre exploração, força bruta, evasão ou negação de serviço.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## 1. Objetivo

Use Nmap para criar inventário técnico, validar exposição após mudanças, investigar conectividade e apoiar hardening. O resultado é uma observação de rede: valide sempre com configuração do host, firewall, DNS, CMDB e logs.

| Pergunta | Exemplo de evidência |
| --- | --- |
| O host está alcançável? | Resposta à descoberta de host ou conexão TCP |
| Uma porta está exposta? | Estado `open`, `closed` ou `filtered` |
| Qual serviço responde? | Banner e detecção de versão com `-sV` |
| A exposição é esperada? | Comparação com baseline e owner do serviço |
| A correção funcionou? | Scan comparativo antes e depois da mudança |

## 2. Cenário de laboratório

| Host | IP | Papel |
| --- | --- | --- |
| `admin-lab` | `192.168.56.10` | Estação de administração com Nmap |
| `web-lab` | `192.168.56.20` | Servidor web e SSH autorizado |
| `dns-lab` | `192.168.56.53` | Resolver DNS de laboratório |
| Rede | `192.168.56.0/24` | Segmento isolado de testes |

```text
admin-lab                         web-lab
192.168.56.10  ----------------  192.168.56.20
       |                                 |
       +---------- 192.168.56.0/24 ------+
                         |
                      dns-lab
                   192.168.56.53
```

Comece em laboratório ou homologação. Em produção, use lista explícita de alvos, pouca quantidade de portas e janela aprovada.

## 3. Instalação

### Rocky Linux, RHEL, AlmaLinux e Fedora

```bash
dnf install -y nmap
rpm -q nmap
nmap --version
```

### Debian e Ubuntu

```bash
sudo apt update
sudo apt install -y nmap
nmap --version
```

### Verificações úteis

```bash
command -v nmap
man nmap
nmap --help | less
```

## 4. Como o Nmap funciona

Uma execução costuma seguir estas etapas:

```text
Escopo aprovado
      |
      v
Resolução de nome e rota
      |
      v
Descoberta de host
      |
      v
Varredura de portas TCP/UDP
      |
      v
Detecção de serviço e versão
      |
      v
Scripts NSE, quando autorizados
      |
      v
Validação no ativo e relatório
```

Por padrão, o Nmap tenta descobrir hosts antes de varrer portas. Use `-sn` quando quiser somente descoberta; use `-Pn` apenas com justificativa, pois ele assume os alvos como ativos e pode ampliar a duração da execução.

## 5. Estados de porta

| Estado | Interpretação prática | Próxima validação |
| --- | --- | --- |
| `open` | Há serviço aceitando conexões | Confirmar processo, owner e necessidade |
| `closed` | Host respondeu, mas não há serviço na porta | Conferir se serviço deveria estar ativo |
| `filtered` | Filtro impediu conclusão | Conferir ACL, firewall, rota e security group |
| `unfiltered` | A porta é alcançável, mas o método não define aberta/fechada | Repetir com técnica apropriada e validar no host |
| `open|filtered` | Sem resposta suficiente para distinguir | Verificar UDP, firewall e timeout |
| `closed|filtered` | Resultado ambíguo em técnicas específicas | Confirmar com outro método autorizado |

`filtered` não significa que o host está indisponível: normalmente indica que um filtro bloqueou ou descartou as sondas.

## 6. TCP, UDP e contexto

- **TCP** possui conexão orientada a estado; é comum para SSH, HTTP, HTTPS, bancos de dados e APIs.
- **UDP** não possui sessão da mesma forma; ausência de resposta pode ser normal, por isso resultados UDP tendem a ser mais lentos e ambíguos.
- Firewalls, NAT, proxy reverso, balanceador, VPN, IDS/IPS e rota assimétrica podem modificar a visão do scanner.

Portas frequentes para validação controlada:

| Serviço | TCP | UDP | Observação |
| --- | ---: | ---: | --- |
| SSH | 22 | — | Administração remota |
| DNS | 53 | 53 | UDP e TCP podem ser necessários |
| HTTP | 80 | — | Aplicações web e redirecionamento |
| HTTPS | 443 | — | Aplicações com TLS |
| NTP | — | 123 | Sincronização de horário |
| SNMP | — | 161 | Monitoramento; restringir origem |
| MySQL | 3306 | — | Normalmente interno |
| PostgreSQL | 5432 | — | Normalmente interno |
| Kubernetes API | 6443 | — | Restringir fortemente |

## 7. Primeiros comandos

Descoberta de hosts no laboratório:

```bash
nmap -sn -n 192.168.56.0/24
```

Checar portas necessárias em um host:

```bash
nmap -sT -p 22,80,443 192.168.56.20
```

Identificar serviço e versão com intensidade moderada:

```bash
nmap -sT -sV --version-light -p 22,80,443 192.168.56.20
```

Registrar evidências em arquivos:

```bash
mkdir -p evidencias
nmap -sT -sV --version-light -p 22,80,443   -oA evidencias/web-lab   192.168.56.20
```

## 8. Interpretação responsável

Para cada porta aberta, responda:

1. O serviço é esperado neste host?
2. A porta precisa estar acessível a partir da origem do scan?
3. A regra de firewall está restrita ao menor conjunto de origens?
4. O serviço está atualizado e com configuração de hardening aplicada?
5. Existe dono, ticket, documentação e monitoramento?

Uma porta aberta não confirma vulnerabilidade. Uma versão detectada não prova que uma falha é explorável. Correlacione com pacote instalado, patch do fornecedor, autenticação, segmentação e configuração real.

## 9. Boas práticas

- Use IPs ou listas de alvos explicitamente aprovados.
- Comece por um host e poucas portas.
- Prefira `-sT` para verificações simples sem privilégios especiais.
- Use `-n` quando DNS reverso não for necessário; isso evita atrasos e resultados dependentes de resolução.
- Salve saída em local protegido; ela pode revelar IPs, serviços e versões.
- Pare se houver degradação, alertas inesperados ou solicitação do responsável.
- Faça reteste após cada correção e compare com a linha de base.

## 10. Próximas páginas

| Página | Conteúdo |
| --- | --- |
| [Comandos](nmap-comandos.html) | Referência de parâmetros e perfis de execução |
| [Troubleshooting](nmap-troubleshooting.html) | Diagnóstico de rede, DNS, firewall e serviços |
| [NSE](nmap-nse.html) | Scripts, automação e auditoria defensiva |
| [Segurança](nmap-seguranca.html) | Baselines, hardening, priorização e reteste |
| [Exploração, Força Bruta, Evasão e Negação de Serviço](exploracao-forca-bruta-evasao.html) | Exploração de Força Bruta e Evasão |
| [Pentest Autorizado e Operações Ofensivas](pentest-e-operacoes-ofensivas.html) | Metodologia prática para reconhecimento, validação de vulnerabilidades, exploração controlada e relatório de testes de segurança |
