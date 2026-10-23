---
layout: default
description: "Referência de portas e protocolos de rede para consulta durante configuração e diagnóstico de serviços."
title: Redes-portas-e-protocolos
---

> **Exemplo fictício:** nomes sob example.com e endereços reservados para documentação; adapte e valide em laboratório antes do uso. Estes endereços não são destinos para testes na Internet.


# Portas e Protocolos
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
### Introdução

Portas e protocolos permitem que diferentes serviços se comuniquem pela rede.

Um endereço IP identifica **qual dispositivo/host** queremos alcançar. A porta identifica **qual serviço** queremos acessar nesse host.

Por exemplo:

```text
198.51.100.23:53
│          │
│          └── Porta do serviço DNS
└───────────── IP do servidor
```

Já o protocolo define **como essa comunicação será realizada**.

Os principais protocolos de transporte são:

* **TCP** — orientado à conexão e confiável.
* **UDP** — mais simples, rápido e sem garantia de entrega.

---

## 1. O que é uma porta?

Uma porta é um número utilizado para identificar um serviço de rede.

As portas vão de:

```text
0 a 65535
```

Elas são divididas em três grupos:

| Faixa         | Nome              | Uso                                                 |
| ------------- | ----------------- | --------------------------------------------------- |
| `0–1023`      | Well-known        | Serviços conhecidos                                 |
| `1024–49151`  | Registered        | Aplicações e serviços registrados                   |
| `49152–65535` | Dynamic/Ephemeral | Portas temporárias, normalmente usadas por clientes |

Exemplos:

```text
22   → SSH
53   → DNS
80   → HTTP
443  → HTTPS
445  → SMB
3389 → RDP
```

---

## 2. O que é um protocolo?

O protocolo define as regras utilizadas na comunicação.

Por exemplo:

```text
HTTP  → comunicação web
HTTPS → HTTP protegido por TLS
DNS   → resolução de nomes
SSH   → acesso remoto seguro
SMTP  → envio de e-mails
```

Uma comunicação pode ser representada assim:

```text
Cliente
   │
   │ TCP
   │
   ▼
Servidor:443
   │
   └── HTTPS
```

Por isso, saber apenas o IP não é suficiente para testar um serviço.

---

## 3. TCP

O **TCP (Transmission Control Protocol)** é orientado à conexão.

Antes de transmitir os dados, cliente e servidor estabelecem uma conexão.

O processo básico é conhecido como **Three-Way Handshake**:

```text
Cliente                  Servidor
   │                        │
   │────── SYN ────────────>│
   │<──── SYN/ACK ──────────│
   │────── ACK ────────────>│
   │                        │
   │==== conexão TCP =======│
```

O TCP oferece recursos como:

* confirmação de recebimento;
* retransmissão de pacotes;
* controle de fluxo;
* controle de congestionamento;
* entrega ordenada dos dados.

É utilizado por serviços como:

```text
SSH      22/TCP
HTTP     80/TCP
HTTPS    443/TCP
SMTP     25/TCP
RDP      3389/TCP
```

---

## 4. UDP

O **UDP (User Datagram Protocol)** não estabelece uma conexão antes de enviar os dados.

É mais simples e possui menor overhead que o TCP.

```text
Cliente
   │
   │────── datagrama ──────> Servidor
   │
```

Não existe garantia de:

* entrega;
* ordem dos pacotes;
* retransmissão.

Isso não significa que UDP seja "ruim". Ele é adequado para aplicações onde velocidade e baixa latência são importantes.

Exemplos:

```text
DNS       53/UDP
DHCP      67/68 UDP
NTP       123/UDP
SNMP      161/UDP
```

Alguns serviços podem utilizar **TCP e UDP**, dependendo da situação.

---

## 5. TCP x UDP

| Característica      | TCP            | UDP            |
| ------------------- | -------------- | -------------- |
| Conexão             | Sim            | Não            |
| Handshake           | Sim            | Não            |
| Garantia de entrega | Sim            | Não            |
| Ordenação           | Sim            | Não            |
| Retransmissão       | Sim            | Não            |
| Overhead            | Maior          | Menor          |
| Velocidade/latência | Maior overhead | Menor overhead |
| Exemplo             | HTTPS          | DNS            |

Uma regra prática:

> **TCP prioriza confiabilidade; UDP prioriza simplicidade e menor overhead.**

---

## 6. IP + porta + protocolo

Uma comunicação de rede normalmente envolve:

```text
IP + protocolo + porta
```

Por exemplo:

```text
198.51.100.23:53/UDP
```

significa:

```text
IP       → 198.51.100.23
Porta    → 53
Protocolo → UDP
```

Outro exemplo:

```text
10.0.19.20:443/TCP
```

significa acesso HTTPS ao servidor `10.0.19.20`.

---

## 7. Como verificar portas abertas no Linux

O principal comando é o `ss`.

#### Mostrar portas TCP e UDP em escuta
{:.no_toc}
```bash
ss -tuln
```

Exemplo:

```text
Netid State  Local Address:Port
tcp   LISTEN 0.0.0.0:22
tcp   LISTEN 0.0.0.0:80
udp   UNCONN 0.0.0.0:53
```

#### Entendendo as opções
{:.no_toc}
```text
-t → TCP
-u → UDP
-l → listening
-n → não resolver nomes
```

---

## 8. Descobrir qual processo utiliza uma porta

Use:

```bash
ss -tulnp
```

Exemplo:

```text
tcp LISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=1234))
```

Nesse caso:

```text
Porta → 22
Processo → sshd
PID → 1234
```

Outra opção:

```bash
lsof -i :443
```

---

## 9. Testar uma porta TCP

Uma das ferramentas mais úteis é o `nc` (Netcat):

```bash
nc -vz 10.0.19.20 443
```

Exemplo de sucesso:

```text
Connection to 10.0.19.20 443 port [tcp/https] succeeded!
```

Isso significa que existe conectividade TCP até a porta `443`.

#### Importante
{:.no_toc}
Um teste de porta **não significa que a aplicação está funcionando corretamente**.

Ele apenas confirma que uma conexão TCP pode ser estabelecida.

---

## 10. Testar TCP com Telnet

Também podemos utilizar:

```bash
telnet 10.0.19.20 443
```

Se conectar:

```text
Connected to 10.0.19.20.
```

Isso indica que a porta TCP está acessível.

Porém, `telnet` é uma ferramenta antiga e normalmente o `nc` é mais conveniente para testes.

---

## 11. Testar UDP

UDP é diferente.

Por não existir handshake, um teste simples de conexão não possui a mesma garantia que no TCP.

Por exemplo:

```bash
nc -vzu 198.51.100.23 53
```

Mas cuidado:

> Um "succeeded" do `nc` em UDP **não prova sozinho** que o serviço respondeu.

Para testar DNS, é melhor utilizar a própria ferramenta do protocolo:

```bash
dig @198.51.100.23 google.com
```

Assim verificamos efetivamente se o servidor DNS respondeu.

---

## 12. Portas comuns de infraestrutura

| Serviço        | Porta | Protocolo |
| -------------- | ----: | --------- |
| SSH            |    22 | TCP       |
| DNS            |    53 | UDP/TCP   |
| DHCP Server    |    67 | UDP       |
| DHCP Client    |    68 | UDP       |
| HTTP           |    80 | TCP       |
| HTTPS          |   443 | TCP       |
| NTP            |   123 | UDP       |
| SNMP           |   161 | UDP       |
| LDAP           |   389 | TCP/UDP   |
| LDAPS          |   636 | TCP       |
| SMB            |   445 | TCP       |
| SMTP           |    25 | TCP       |
| RDP            |  3389 | TCP       |
| PostgreSQL     |  5432 | TCP       |
| MySQL          |  3306 | TCP       |
| Kubernetes API |  6443 | TCP       |

> As portas acima são as portas padrão. Um serviço pode ser configurado para utilizar outra porta.

---

## 13. Troubleshooting de uma porta

Quando uma aplicação não consegue acessar um servidor, não comece necessariamente pela aplicação.

Siga uma sequência:

```text
1. DNS
   ↓
2. IP
   ↓
3. Rota
   ↓
4. Firewall
   ↓
5. Porta
   ↓
6. Serviço
   ↓
7. Aplicação
```

Exemplo:

```bash
dig servidor.infraero.gov.br
```

Depois:

```bash
ip route get 10.0.19.20
```

Depois:

```bash
nc -vz 10.0.19.20 443
```

E no servidor:

```bash
ss -lntp
```

---

## 14. Diferenciando os problemas

#### DNS não resolve
{:.no_toc}
```text
dig servidor.exemplo.com
→ NXDOMAIN
```

Problema provavelmente relacionado a **DNS/nome**.

---

#### IP não é alcançável
{:.no_toc}
```bash
ping 10.0.19.20
```

Mas lembre:

> Ping usa ICMP e pode ser bloqueado. Falha no ping não significa necessariamente que o servidor esteja indisponível.

---

#### Porta TCP bloqueada
{:.no_toc}
```bash
nc -vz 10.0.19.20 443
```

Resultado:

```text
Connection timed out
```

Pode indicar:

* firewall;
* ACL;
* rota;
* filtro de rede;
* servidor indisponível.

---

#### Porta recusada
{:.no_toc}
```text
Connection refused
```

É diferente de timeout.

Normalmente significa que **o host foi alcançado, mas não existe serviço aceitando aquela conexão naquela porta**, ou o firewall está rejeitando explicitamente.

---

#### Porta aberta, aplicação com problema
{:.no_toc}
```bash
nc -vz 10.0.19.20 443
```

retorna sucesso, mas:

```bash
curl -vk https://10.0.19.20
```

falha.

Nesse caso, a rede TCP pode estar funcionando, mas o problema pode estar em:

* TLS;
* HTTP;
* autenticação;
* aplicação;
* configuração do servidor.

---

## 15. Exemplo prático

Imagine que um servidor não consiga acessar:

```text
https://pgd.infraero.gov.br
```

Primeiro:

```bash
dig pgd.infraero.gov.br
```

Resultado:

```text
10.0.19.20
```

Agora verificamos a rota:

```bash
ip route get 10.0.19.20
```

Depois a porta:

```bash
nc -vz 10.0.19.20 443
```

E finalmente a aplicação:

```bash
curl -vk https://pgd.infraero.gov.br
```

Assim conseguimos separar:

```text
DNS
 ↓
Rede
 ↓
Rota
 ↓
Firewall
 ↓
Porta 443
 ↓
HTTPS
 ↓
Aplicação
```

---

## 16. Comandos de consulta rápida

#### Linux
{:.no_toc}
```bash
ss -tuln
ss -tulnp
ss -lntp
nc -vz HOST PORT
nc -vzu HOST PORT
telnet HOST PORT
lsof -i :PORTA
```

#### Windows PowerShell
{:.no_toc}
```powershell
Test-NetConnection HOST -Port PORTA
```

Exemplo:

```powershell
Test-NetConnection 10.0.19.20 -Port 443
```

Para verificar portas locais:

```powershell
Get-NetTCPConnection -State Listen
```

---

### Resumo

```text
IP       → identifica o host
Porta    → identifica o serviço
Protocolo → define como a comunicação acontece
TCP      → conexão confiável
UDP      → comunicação sem conexão
```

Para troubleshooting:

```text
DNS → IP → Rota → Firewall → Porta → Serviço → Aplicação
```

> **Regra de ouro:** quando alguém disser "a aplicação está sem acesso", não assuma imediatamente que é problema da aplicação. Primeiro descubra **qual IP, qual porta e qual protocolo** estão envolvidos.