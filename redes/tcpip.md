---

layout: default
description: "Conceitos de TCP/IP para entender endereçamento, protocolos e comunicação entre hosts."
title: TCP/IP
---

# 1. TCP/IP
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

#### 1. TCP/IP

#### O que é
{:.no_toc}
TCP/IP (Transmission Control Protocol / Internet Protocol) é uma **pilha de protocolos** utilizada para comunicação entre dispositivos em redes de computadores.

Não se trata de um único protocolo. O TCP/IP é formado por vários protocolos que trabalham em conjunto, organizados em camadas. Cada camada possui responsabilidades específicas e utiliza os serviços fornecidos pelas camadas inferiores.

O nome TCP/IP vem de dois dos seus principais protocolos:

* **IP (Internet Protocol)**: responsável pelo endereçamento lógico e pelo encaminhamento dos pacotes entre redes.
* **TCP (Transmission Control Protocol)**: fornece comunicação orientada a conexão, com entrega confiável e ordenada dos dados.

Outros protocolos importantes fazem parte da pilha, como:

* UDP;
* ICMP;
* DNS;
* DHCP;
* ARP;
* HTTP/HTTPS;
* SSH;
* SMTP.

#### O modelo em camadas
{:.no_toc}
Uma forma comum de representar o TCP/IP utiliza quatro camadas:

| Camada        | Função                                           | Exemplos                    |
| ------------- | ------------------------------------------------ | --------------------------- |
| Aplicação     | Fornece serviços utilizados pelas aplicações     | HTTP, HTTPS, DNS, SSH, SMTP |
| Transporte    | Comunicação entre processos e aplicações         | TCP, UDP                    |
| Internet      | Endereçamento e roteamento entre redes           | IPv4, IPv6, ICMP            |
| Acesso à Rede | Comunicação no enlace local e transmissão física | Ethernet, Wi-Fi             |

O modelo TCP/IP não deve ser confundido com o **modelo OSI**, que possui sete camadas e é principalmente utilizado como modelo conceitual.

#### Encapsulamento
{:.no_toc}
Quando uma aplicação envia dados, cada camada adiciona informações de controle ao conteúdo recebido da camada superior.

Esse processo é chamado de **encapsulamento**.

```text
Aplicação
   │
   ▼
Dados
   │
   ▼
[TCP/UDP] + Dados
   │
   ▼
Segmento TCP / Datagrama UDP
   │
   ▼
[IP] + Segmento/Datagrama
   │
   ▼
Pacote IP
   │
   ▼
[Ethernet/Wi-Fi] + Pacote IP
   │
   ▼
Quadro (Frame)
   │
   ▼
Bits
```

No destino ocorre o processo inverso, chamado **desencapsulamento**.

#### Termos importantes
{:.no_toc}
| Camada     | Unidade de dados             |
| ---------- | ---------------------------- |
| Aplicação  | Dados                        |
| Transporte | Segmento TCP / Datagrama UDP |
| Internet   | Pacote IP                    |
| Enlace     | Quadro (Frame)               |
| Física     | Bits                         |

#### Exemplo prático: acessar um site
{:.no_toc}
Ao acessar:

```text
https://www.exemplo.com
```

Um fluxo simplificado é:

1. O sistema precisa descobrir o endereço IP do domínio através do DNS.
2. A aplicação estabelece a comunicação necessária com o servidor.
3. HTTPS tradicionalmente utiliza TCP na porta 443.
4. HTTP/3 utiliza **QUIC sobre UDP**, também normalmente na porta 443.
5. O IP verifica se o destino está na mesma rede local.
6. Se estiver em outra rede, o pacote é enviado para o gateway.
7. Em IPv4, o ARP pode ser utilizado para descobrir o MAC do próximo salto no enlace local.
8. Os dados são encapsulados em segmentos, pacotes e quadros.
9. Os roteadores encaminham o pacote até o destino.

---

#### 2. Endereço IP

Um endereço IP identifica logicamente uma interface de rede dentro de um determinado contexto de rede.

É importante diferenciar **interface de rede** de **dispositivo**: um mesmo computador pode possuir várias interfaces e, portanto, vários endereços IP.

O endereço IP é utilizado principalmente para:

* identificar a origem do tráfego;
* identificar o destino;
* determinar em qual rede o endereço está;
* permitir o roteamento entre redes.

---

#### IPv4
{:.no_toc}
O IPv4 (Internet Protocol version 4) utiliza **32 bits**.

Normalmente é representado em quatro octetos decimais:

```text
192.168.0.10
```

Cada octeto possui 8 bits e pode assumir valores de `0` a `255`.

Exemplo:

```text
192.168.0.10
```

Em binário:

```text
11000000.10101000.00000000.00001010
```

Como existem 32 bits:

```text
2^32 = 4.294.967.296
```

existem pouco mais de 4,29 bilhões de combinações possíveis.

Isso **não significa que existam 4,29 bilhões de endereços públicos utilizáveis**, pois existem endereços reservados, privados, multicast, loopback e outras finalidades.

O IPv4 utiliza uma máscara ou prefixo para determinar qual parte do endereço representa a rede.

Por exemplo:

```text
192.168.10.37/24
```

O `/24` indica que os primeiros 24 bits pertencem ao prefixo da rede.

---

#### IP Público
{:.no_toc}
Um IP público é um endereço globalmente roteável na Internet.

Exemplo:

```text
203.0.113.10
```

A faixa `203.0.113.0/24`, entretanto, é reservada para documentação e exemplos.

Um IP público não significa automaticamente que o equipamento esteja acessível pela Internet. Firewall, NAT, ACLs e outras políticas podem bloquear conexões.

---

#### IP Privado
{:.no_toc}
Os endereços privados definidos pela RFC 1918 são:

| Faixa                             | CIDR             |
| --------------------------------- | ---------------- |
| `10.0.0.0` – `10.255.255.255`     | `10.0.0.0/8`     |
| `172.16.0.0` – `172.31.255.255`   | `172.16.0.0/12`  |
| `192.168.0.0` – `192.168.255.255` | `192.168.0.0/16` |

Esses endereços não são roteados diretamente na Internet pública.

É possível que várias redes diferentes utilizem:

```text
192.168.1.10
```

simultaneamente, pois o endereço só precisa ser único dentro do contexto de roteamento em que está sendo utilizado.

Para acessar a Internet, normalmente o tráfego passa por NAT/PAT.

---

#### Loopback
{:.no_toc}
A faixa IPv4 de loopback é:

```text
127.0.0.0/8
```

O endereço mais conhecido é:

```text
127.0.0.1
```

Também chamado de:

```text
localhost
```

O tráfego destinado ao loopback permanece no próprio sistema.

É muito utilizado para:

* testar serviços;
* desenvolver aplicações;
* disponibilizar serviços apenas localmente;
* diagnosticar problemas.

Exemplo:

```bash
ping -c 4 127.0.0.1
```

---

#### Endereço link-local IPv4
{:.no_toc}
A faixa:

```text
169.254.0.0/16
```

é utilizada para endereços IPv4 link-local.

Um computador pode receber automaticamente um endereço dessa faixa quando não consegue obter uma configuração IPv4 adequada através do DHCP.

Exemplo:

```text
169.254.73.152
```

Esse endereço normalmente indica que a comunicação está limitada ao enlace local e **não substitui uma configuração IPv4 normal para acesso a outras redes**.

---

#### `0.0.0.0`
{:.no_toc}
`0.0.0.0` possui diferentes significados dependendo do contexto.

Pode representar:

* endereço IPv4 não especificado;
* origem ainda não configurada;
* todas as interfaces quando utilizado em uma aplicação;
* rota padrão quando aparece como destino:

```text
0.0.0.0/0
```

---

#### Exemplo prático
{:.no_toc}
Linux:

```bash
ip address
```

ou:

```bash
ip -br address
```

Windows PowerShell:

```powershell
Get-NetIPAddress -AddressFamily IPv4
```

---

#### 3. Máscara de Rede

A máscara de rede determina quais bits de um endereço IPv4 representam a **rede** e quais representam o **host**.

Exemplo:

```text
IP:       192.168.10.37
Máscara:  255.255.255.0
```

Em binário:

```text
IP:
11000000.10101000.00001010.00100101

Máscara:
11111111.11111111.11111111.00000000
```

Os bits `1` representam a parte da rede.

Os bits `0` representam a parte do host.

Nesse exemplo:

```text
Rede: 192.168.10.0
```

O host é identificado pelos últimos 8 bits.

#### Como o host sabe se precisa usar o gateway?
{:.no_toc}
Quando um computador precisa enviar um pacote, ele compara o endereço de destino com sua própria rede.

Exemplo:

```text
IP local:     192.168.10.37/24
Destino:      192.168.10.50
```

O destino está na mesma rede:

```text
192.168.10.0/24
```

Portanto, o computador pode tentar entregar o quadro diretamente ao destino.

Agora:

```text
IP local:     192.168.10.37/24
Destino:      8.8.8.8
```

O destino está em outra rede.

Nesse caso, o host envia o pacote para o **gateway padrão**.

---

#### 4. CIDR

CIDR (Classless Inter-Domain Routing) é uma forma de representar o prefixo de rede.

Formato:

```text
endereço/prefixo
```

Exemplo:

```text
192.168.10.0/24
```

O `/24` significa que os primeiros 24 bits pertencem à rede.

Equivale a:

```text
255.255.255.0
```

#### Tabela de referência
{:.no_toc}
| CIDR  | Máscara         | Endereços | Hosts utilizáveis* |
| ----- | --------------- | --------: | -----------------: |
| `/24` | 255.255.255.0   |       256 |                254 |
| `/25` | 255.255.255.128 |       128 |                126 |
| `/26` | 255.255.255.192 |        64 |                 62 |
| `/27` | 255.255.255.224 |        32 |                 30 |
| `/28` | 255.255.255.240 |        16 |                 14 |
| `/29` | 255.255.255.248 |         8 |                  6 |
| `/30` | 255.255.255.252 |         4 |                  2 |

* Para sub-redes IPv4 tradicionais em que o primeiro endereço é o endereço de rede e o último é o broadcast.

A fórmula geral é:

```text
Hosts = 2^h - 2
```

onde `h` é o número de bits destinados aos hosts.

Existem exceções, como `/31`, utilizado em determinados enlaces ponto a ponto, e `/32`, que representa um único endereço.

---

#### 5. Rede, Host e Broadcast

Dentro de uma sub-rede IPv4 tradicional existem endereços com funções especiais.

#### Endereço de rede
{:.no_toc}
Possui todos os bits de host em `0`.

Exemplo:

```text
192.168.10.0/24
```

#### Endereços de host
{:.no_toc}
São os endereços normalmente atribuídos às interfaces dos dispositivos.

```text
192.168.10.1
192.168.10.2
...
192.168.10.254
```

#### Broadcast
{:.no_toc}
Possui todos os bits de host em `1`.

```text
192.168.10.255
```

Exemplo completo:

| Tipo          | Endereço         |
| ------------- | ---------------- |
| Rede          | `192.168.10.0`   |
| Primeiro host | `192.168.10.1`   |
| Último host   | `192.168.10.254` |
| Broadcast     | `192.168.10.255` |

---

#### 6. Sub-redes (Subnetting)

**Subnetting** é o processo de dividir uma rede em sub-redes menores.

Principais objetivos:

* organização;
* redução do domínio de broadcast;
* melhor utilização dos endereços;
* separação de ambientes;
* facilitar o gerenciamento;
* permitir aplicação de políticas de segurança.

Exemplo:

```text
192.168.0.0/24
```

dividido em quatro redes `/26`.

| Sub-rede           | Hosts         | Broadcast |
| ------------------ | ------------- | --------- |
| `192.168.0.0/26`   | `.1 – .62`    | `.63`     |
| `192.168.0.64/26`  | `.65 – .126`  | `.127`    |
| `192.168.0.128/26` | `.129 – .190` | `.191`    |
| `192.168.0.192/26` | `.193 – .254` | `.255`    |

Cada `/26` possui:

```text
64 endereços
62 hosts utilizáveis
```

#### Exemplo: rede para até 30 hosts
{:.no_toc}
Precisamos de 5 bits para hosts:

```text
2^5 = 32
```

Em uma sub-rede IPv4 tradicional:

```text
32 - 2 = 30 hosts
```

Portanto:

```text
Prefixo: /27
Máscara: 255.255.255.224
```

O incremento é:

```text
256 - 224 = 32
```

As redes serão:

```text
192.168.10.0/27
192.168.10.32/27
192.168.10.64/27
192.168.10.96/27
192.168.10.128/27
192.168.10.160/27
192.168.10.192/27
192.168.10.224/27
```

#### Subnetting não é segurança por si só
{:.no_toc}
Criar sub-redes reduz o domínio de broadcast, mas **não significa automaticamente isolamento de segurança**.

Para controlar comunicação entre redes podem ser utilizados:

* ACLs;
* firewall;
* regras de roteamento;
* políticas de segurança;
* VLANs;
* controles de acesso.

---

#### 7. MAC Address

MAC (Media Access Control) é um endereço utilizado na camada de enlace para identificar interfaces de rede em um determinado domínio de comunicação.

Um MAC Ethernet tradicional possui **48 bits**.

Exemplo:

```text
00:1A:2B:3C:4D:5E
```

Representação hexadecimal:

```text
00:1A:2B:3C:4D:5E
```

Os primeiros bits podem identificar características como o fabricante através do **OUI (Organizationally Unique Identifier)**.

Entretanto, o MAC não deve ser considerado uma identidade permanente e inviolável.

Ele pode ser:

* alterado por software;
* virtualizado;
* randomizado em redes Wi-Fi;
* substituído por mecanismos específicos de virtualização.

O MAC é utilizado principalmente para comunicação no **enlace local**.

O IP, por outro lado, é utilizado para comunicação lógica e roteamento entre redes.

#### Exemplo
{:.no_toc}
Linux:

```bash
ip link
```

ou:

```bash
ip -br link
```

Windows:

```powershell
Get-NetAdapter
```

---

#### 8. ARP

ARP (Address Resolution Protocol) é utilizado no IPv4 para descobrir o endereço MAC associado a um endereço IP dentro do enlace local.

Imagine:

```text
Meu IP:       192.168.10.20
Destino:      192.168.10.30
```

Se o destino estiver na mesma rede, o host precisa descobrir o MAC correspondente.

O processo simplificado é:

1. O host envia um **ARP Request** em broadcast.
2. O dispositivo que possui `192.168.10.30` responde.
3. A resposta informa seu MAC.
4. O host armazena temporariamente a informação no cache de vizinhos.

Exemplo conceitual:

```text
192.168.10.30 → AA:BB:CC:DD:EE:FF
```

#### ARP e gateway
{:.no_toc}
Se o destino estiver em outra rede:

```text
Origem: 192.168.10.20
Destino: 8.8.8.8
```

O host **não precisa descobrir o MAC de `8.8.8.8`**.

Ele precisa descobrir o MAC do gateway:

```text
192.168.10.1 → AA:BB:CC:DD:EE:01
```

O pacote IP continua tendo como destino:

```text
8.8.8.8
```

Mas o quadro Ethernet é enviado para o MAC do gateway.

#### Linux
{:.no_toc}
```bash
ip neigh
```

Exemplo:

```text
192.168.10.1 dev eth0 lladdr aa:bb:cc:dd:ee:01 REACHABLE
```

O Linux moderno utiliza a tabela de **neighbor entries**, que também é usada pelo IPv6.

---

#### 9. Gateway

O **default gateway** é o próximo salto utilizado quando o sistema não possui uma rota mais específica para o destino.

Exemplo:

```text
IP:       192.168.10.20
Máscara:  255.255.255.0
Gateway:  192.168.10.1
```

Para:

```text
192.168.10.30
```

o host pode realizar comunicação diretamente.

Para:

```text
8.8.8.8
```

o tráfego é encaminhado para:

```text
192.168.10.1
```

O gateway não precisa necessariamente ser um roteador físico dedicado. Pode ser:

* roteador;
* firewall;
* switch de camada 3;
* equipamento virtual;
* outro sistema configurado para encaminhamento.

#### Linux
{:.no_toc}
```bash
ip route show default
```

Exemplo:

```text
default via 192.168.10.1 dev eth0
```

---

#### 10. Rotas

Uma rota informa ao sistema **onde e como alcançar determinado destino**.

Uma entrada de rota pode conter:

* destino;
* prefixo;
* próximo salto;
* interface;
* métrica;
* origem da rota.

Exemplo:

```text
10.0.0.0/8 via 192.168.10.1 dev eth0
```

Significa aproximadamente:

> Para alcançar a rede `10.0.0.0/8`, envie o tráfego para o próximo salto `192.168.10.1` através da interface `eth0`.

#### Tipos comuns
{:.no_toc}
###### Rota conectada
{:.no_toc}
Criada automaticamente quando uma interface recebe um endereço.

```text
192.168.10.0/24 dev eth0
```

###### Rota estática
{:.no_toc}
Configurada manualmente:

```text
10.0.0.0/8 via 192.168.10.1
```

###### Rota dinâmica
{:.no_toc}
Aprendida através de protocolos como:

* OSPF;
* BGP;
* RIP;
* IS-IS.

###### Rota padrão
{:.no_toc}
Representada em IPv4 por:

```text
0.0.0.0/0
```

Ela é utilizada quando não existe uma rota mais específica.

#### Longest Prefix Match
{:.no_toc}
Quando várias rotas correspondem ao mesmo destino, normalmente é escolhida a rota com o **prefixo mais específico**.

Exemplo:

```text
10.0.0.0/8
10.10.0.0/16
10.10.20.0/24
```

Para:

```text
10.10.20.50
```

a rota `/24` é mais específica que `/16` e `/8`.

#### Linux
{:.no_toc}
```bash
ip route
```

Para descobrir qual rota o Linux usaria:

```bash
ip route get 8.8.8.8
```

Esse comando é extremamente útil em troubleshooting.

---

#### 11. ICMP

ICMP (Internet Control Message Protocol) é utilizado para mensagens de controle, diagnóstico e sinalização de erros relacionados ao IP.

Ele não é um protocolo de transporte como TCP ou UDP.

#### Ping
{:.no_toc}
O `ping` normalmente utiliza:

```text
ICMP Echo Request
ICMP Echo Reply
```

Exemplo:

```bash
ping -c 4 192.168.10.1
```

O ping permite verificar, entre outras coisas:

* alcance de um destino;
* latência aproximada;
* perda de pacotes.

Entretanto:

> Falhar no ping não significa necessariamente que o host ou serviço esteja indisponível.

Um firewall pode bloquear ICMP enquanto permite:

```text
TCP/443
```

#### Traceroute
{:.no_toc}
O traceroute tenta descobrir os saltos intermediários entre origem e destino.

Linux:

```bash
traceroute example.com
```

Também existem variantes utilizando diferentes protocolos:

```bash
traceroute -I example.com
```

ou:

```bash
traceroute -T -p 443 example.com
```

No Windows:

```powershell
tracert example.com
```

O diagnóstico utiliza principalmente o comportamento do campo **TTL (Time To Live)** do IPv4 ou do **Hop Limit** no IPv6.

Quando um pacote excede o TTL permitido, um roteador pode responder com:

```text
ICMP Time Exceeded
```

Isso permite identificar os saltos intermediários.

---

#### 12. TCP e UDP

TCP e UDP pertencem à camada de Transporte.

#### TCP
{:.no_toc}
TCP (Transmission Control Protocol) fornece comunicação orientada a conexão.

Características:

* orientado a conexão;
* entrega confiável;
* entrega ordenada;
* retransmissão de dados perdidos;
* controle de fluxo;
* controle de congestionamento;
* controle através de números de sequência e confirmações.

#### Three-Way Handshake
{:.no_toc}
O estabelecimento tradicional de uma conexão TCP ocorre através de três etapas:

```text
Cliente                         Servidor

   SYN ---------------------------->

       <--------------------- SYN-ACK

   ACK ---------------------------->
```

Depois disso, a comunicação pode começar.

#### TCP é utilizado em
{:.no_toc}
Exemplos:

* SSH;
* HTTP/1.1;
* HTTP/2;
* SMTP;
* FTP;
* muitos outros protocolos.

HTTPS não significa necessariamente TCP: **HTTP/3 utiliza QUIC sobre UDP**.

---

#### UDP
{:.no_toc}
UDP (User Datagram Protocol) é um protocolo de transporte simples e sem conexão.

Ele não fornece, por si só:

* retransmissão;
* ordenação;
* confirmação de entrega;
* controle de congestionamento equivalente ao TCP.

Isso não significa que aplicações UDP sejam necessariamente não confiáveis.

A própria aplicação pode implementar mecanismos de:

* confirmação;
* retransmissão;
* ordenação;
* controle de congestionamento.

O **QUIC**, por exemplo, utiliza UDP como transporte e implementa mecanismos avançados acima dele.

#### Comparação
{:.no_toc}
| Característica    | TCP         | UDP             |
| ----------------- | ----------- | --------------- |
| Conexão           | Sim         | Não             |
| Entrega confiável | Sim         | Não             |
| Ordenação         | Sim         | Não             |
| Retransmissão     | Sim         | Não             |
| Controle de fluxo | Sim         | Não             |
| Overhead          | Maior       | Menor           |
| Exemplos          | SSH, HTTP/2 | DNS, QUIC, VoIP |

#### Linux
{:.no_toc}
```bash
ss -tulpen
```

Exemplo de opções:

```text
-t  TCP
-u  UDP
-l  listening
-p  processos
-n  não resolver nomes
-e  informações adicionais
```

---

#### 13. Portas

Portas identificam processos ou serviços dentro de um host.

O endereço IP identifica a interface/endereço de rede.

A porta ajuda a identificar **qual serviço deve receber o tráfego**.

Exemplo:

```text
192.168.10.20:22
```

significa:

```text
IP:    192.168.10.20
Porta: 22
```

Portas vão de:

```text
0 a 65535
```

#### Faixas
{:.no_toc}
| Faixa           | Classificação   |
| --------------- | --------------- |
| `0 – 1023`      | Well-known      |
| `1024 – 49151`  | Registered      |
| `49152 – 65535` | Dynamic/Private |

Os limites de portas efêmeras podem variar conforme o sistema operacional.

#### Portas conhecidas
{:.no_toc}
| Porta | Protocolo | Serviço |
| ----: | --------- | ------- |
| 20/21 | TCP       | FTP     |
|    22 | TCP       | SSH     |
|    25 | TCP       | SMTP    |
|    53 | TCP/UDP   | DNS     |
|    80 | TCP       | HTTP    |
|   443 | TCP       | HTTPS   |
|  3389 | TCP       | RDP     |

#### Socket
{:.no_toc}
Uma comunicação TCP é identificada pelo conjunto:

```text
IP origem
Porta origem
IP destino
Porta destino
Protocolo
```

Exemplo:

```text
10.0.0.10:51500
        ↓
10.0.0.20:443
```

A porta `51500` pode ser uma porta efêmera escolhida pelo cliente.

#### Verificando portas no Linux
{:.no_toc}
```bash
ss -lntp
```

Para UDP:

```bash
ss -lnup
```

Para testar uma porta:

```bash
nc -vz servidor.exemplo 443
```

---

#### 14. IPv6

IPv6 (Internet Protocol version 6) utiliza endereços de **128 bits**.

Isso fornece:

```text
2^128
```

combinações possíveis.

Um endereço IPv6 pode ser representado como:

```text
2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

Os zeros podem ser abreviados.

```text
2001:db8:85a3::8a2e:370:7334
```

O `::` pode aparecer **uma única vez** em um endereço.

#### Loopback
{:.no_toc}
```text
::1
```

Equivale conceitualmente ao:

```text
127.0.0.1
```

#### Link-local
{:.no_toc}
```text
fe80::/10
```

Endereços link-local são utilizados para comunicação no enlace local.

#### Unique Local Address
{:.no_toc}
```text
fc00::/7
```

é a faixa definida para Unique Local Addresses (ULA).

Na prática, prefixos dentro de:

```text
fd00::/8
```

são comumente utilizados para redes locais.

#### Documentação
{:.no_toc}
```text
2001:db8::/32
```

é reservado para documentação e exemplos.

#### Diferenças importantes
{:.no_toc}
IPv6:

* não utiliza ARP;
* utiliza **ICMPv6 Neighbor Discovery**;
* não possui broadcast tradicional;
* utiliza multicast e anycast;
* possui SLAAC;
* utiliza endereços muito maiores;
* normalmente utiliza `/64` em segmentos LAN IPv6.

#### IPv6 e segurança
{:.no_toc}
IPv6 não significa automaticamente tráfego criptografado.

IPsec é suportado pelo ecossistema IPv6, mas:

> IPv6 não significa que todo tráfego esteja automaticamente cifrado.

Firewall continua sendo necessário.

#### Linux
{:.no_toc}
```bash
ip -6 address
```

Teste:

```bash
ping -6 -c 4 ::1
```

Ver vizinhos:

```bash
ip -6 neigh
```

---

#### 15. NAT

NAT (Network Address Translation) altera endereços IP durante o encaminhamento dos pacotes.

O uso mais comum em redes domésticas e corporativas é permitir que vários endereços privados compartilhem um endereço público.

#### PAT / NAT Overload
{:.no_toc}
Além do endereço IP, a porta pode ser traduzida.

Exemplo:

```text
Origem interna:

192.168.0.10:51500
        ↓
NAT
        ↓
203.0.113.20:40001
```

O equipamento mantém uma associação para saber que:

```text
203.0.113.20:40001
```

corresponde a:

```text
192.168.0.10:51500
```

Quando a resposta chega, o NAT realiza a tradução inversa.

#### Port forwarding
{:.no_toc}
Para publicar um serviço interno, pode existir uma regra como:

```text
IP público:443
      ↓
192.168.0.20:443
```

Isso normalmente envolve:

* NAT;
* firewall;
* roteamento;
* DNS;
* política de segurança.

#### NAT não é firewall
{:.no_toc}
NAT e firewall são mecanismos diferentes.

Um firewall decide o que deve ser permitido ou bloqueado.

O NAT modifica informações dos pacotes.

#### Linux
{:.no_toc}
Em sistemas que utilizam nftables:

```bash
sudo nft list ruleset
```

Para descobrir o IP público percebido externamente:

```bash
curl https://api.ipify.org
```

---

#### 16. DNS

DNS (Domain Name System) é um sistema distribuído utilizado para associar nomes a informações, principalmente endereços IP.

Exemplo:

```text
www.exemplo.com
       ↓
192.0.2.10
```

DNS também pode armazenar:

* servidores de e-mail;
* aliases;
* informações de autenticação;
* políticas;
* outros dados.

#### Resolvedor DNS
{:.no_toc}
O cliente normalmente consulta um **resolvedor recursivo**.

Exemplo:

```text
Cliente
   ↓
DNS Resolver
   ↓
Internet DNS
```

O resolvedor pode:

* consultar seu cache;
* consultar outros servidores;
* seguir a hierarquia DNS;
* retornar a resposta ao cliente.

#### Hierarquia DNS
{:.no_toc}
De forma simplificada:

```text
Root
 │
 ├── .com
 │
 └── .br
       │
       └── exemplo.com
```

Em uma consulta recursiva que não esteja em cache, o processo pode envolver:

```text
Root
  ↓
TLD
  ↓
Servidor autoritativo
```

#### Servidor autoritativo
{:.no_toc}
O servidor autoritativo é aquele que possui autoridade sobre determinada zona DNS.

Exemplo:

```text
exemplo.com
```

pode possuir servidores autoritativos que respondem pelos registros desse domínio.

#### Registros comuns
{:.no_toc}
| Registro | Função                              |
| -------- | ----------------------------------- |
| `A`      | IPv4                                |
| `AAAA`   | IPv6                                |
| `CNAME`  | Alias                               |
| `MX`     | Servidor de e-mail                  |
| `NS`     | Servidor autoritativo               |
| `TXT`    | Texto/políticas                     |
| `PTR`    | Resolução reversa                   |
| `SOA`    | Informações administrativas da zona |

#### DNS reverso
{:.no_toc}
O DNS normalmente é utilizado:

```text
nome → IP
```

O DNS reverso realiza:

```text
IP → nome
```

através de registros `PTR`.

#### DNS não é criptografia
{:.no_toc}
DNS tradicional pode utilizar consultas sem criptografia no transporte.

Tecnologias como:

* DoT (DNS over TLS);
* DoH (DNS over HTTPS);

protegem a comunicação entre cliente e resolvedor, mas não transformam DNS em um mecanismo geral de autenticação.

#### Linux
{:.no_toc}
```bash
dig example.com
```

Consulta IPv4:

```bash
dig example.com A
```

IPv6:

```bash
dig example.com AAAA
```

E-mail:

```bash
dig example.com MX
```

DNS reverso:

```bash
dig -x 8.8.8.8
```

Também pode ser utilizado:

```bash
nslookup example.com
```

---

#### 17. DHCP
{:.no_toc}
DHCP (Dynamic Host Configuration Protocol) permite configurar automaticamente parâmetros de rede nos dispositivos.

Entre os parâmetros que podem ser fornecidos estão:

* endereço IP;
* máscara/prefixo;
* gateway;
* servidores DNS;
* tempo de concessão (lease);
* outras opções de configuração.

#### Processo DORA
{:.no_toc}
O processo clássico de obtenção de um endereço IPv4 através do DHCP é conhecido como:

```text
Discover
Offer
Request
ACK
```

Ou:

```text
Cliente                    Servidor DHCP

DHCP Discover  ------------>

               <------------ DHCP Offer

DHCP Request   ------------>

               <------------ DHCP ACK
```

#### DHCP não é apenas "dar IP"
{:.no_toc}
O DHCP pode fornecer diversas informações necessárias para o funcionamento da rede.

Por exemplo:

```text
IP:       192.168.10.50
Máscara:  255.255.255.0
Gateway:  192.168.10.1
DNS:      192.168.10.53
```

#### Troubleshooting
{:.no_toc}
No Linux:

```bash
ip address
```

Ver rotas:

```bash
ip route
```

Ver DNS:

```bash
resolvectl status
```

Dependendo da distribuição e da configuração, a administração DHCP pode ser feita por NetworkManager, systemd-networkd, dhclient ou outros componentes.

---

#### 18. VLAN

VLAN (Virtual Local Area Network) permite dividir logicamente uma rede Ethernet em diferentes domínios de broadcast.

Exemplo:

```text
VLAN 10 → Usuários
VLAN 20 → Servidores
VLAN 30 → Visitantes
```

Cada VLAN normalmente possui sua própria sub-rede IP.

#### Access
{:.no_toc}
Uma porta **access** normalmente transporta uma única VLAN para o dispositivo conectado.

Exemplo:

```text
Switch
  │
  └── Porta access VLAN 10
          │
          └── Computador
```

#### Trunk
{:.no_toc}
Uma porta **trunk** pode transportar várias VLANs.

As VLANs são identificadas através de tags conforme o padrão:

```text
IEEE 802.1Q
```

Exemplo:

```text
Switch A
   │
   │ trunk
   │ VLAN 10, 20, 30
   │
Switch B
```

#### Inter-VLAN Routing
{:.no_toc}
Dispositivos em VLANs diferentes precisam de roteamento para se comunicar.

Exemplo:

```text
VLAN 10
192.168.10.0/24
       │
       │
   Roteador/L3
       │
       │
VLAN 20
192.168.20.0/24
```

O roteamento pode ser realizado por:

* roteador;
* firewall;
* switch de camada 3;
* equipamento virtual.

#### VLAN não é segurança por si só
{:.no_toc}
Assim como subnetting, VLAN cria separação lógica e de broadcast, mas não deve ser confundida automaticamente com uma política de segurança.

O tráfego entre VLANs pode ser controlado por:

* ACLs;
* firewall;
* políticas de roteamento.

#### Exemplo de planejamento
{:.no_toc}
```text
VLAN 10 - Usuários
192.168.10.0/24

VLAN 20 - Servidores
192.168.20.0/24

VLAN 30 - Visitantes
192.168.30.0/24
```

Uma política de firewall poderia permitir:

```text
Usuários → Servidores: permitido apenas em portas necessárias
Visitantes → Servidores: bloqueado
Visitantes → Internet: permitido
```

---

## 19. Troubleshooting de rede no Linux

Para administração Linux, conhecer os conceitos anteriores é importante, mas é igualmente importante saber **diagnosticar problemas na prática**.

Uma sequência útil é trabalhar das camadas mais básicas para as mais altas.

#### 19.1 Verificar a interface
{:.no_toc}
```bash
ip link
```

Forma resumida:

```bash
ip -br link
```

Verificar se a interface está:

```text
UP
```

ou:

```text
DOWN
```

---

#### 19.2 Verificar o endereço IP
{:.no_toc}
```bash
ip address
```

ou:

```bash
ip -br address
```

Verifique:

* endereço IP;
* prefixo;
* interface correta;
* existência de IPv4;
* existência de IPv6.

---

#### 19.3 Verificar a rota
{:.no_toc}
```bash
ip route
```

Verifique principalmente:

```text
default via ...
```

Exemplo:

```text
default via 192.168.10.1 dev eth0
```

---

#### 19.4 Verificar a rota para um destino
{:.no_toc}
Uma das ferramentas mais úteis para troubleshooting:

```bash
ip route get 8.8.8.8
```

Isso permite descobrir:

* interface utilizada;
* gateway;
* endereço de origem escolhido;
* rota selecionada.

---

#### 19.5 Verificar vizinhos/ARP
{:.no_toc}
```bash
ip neigh
```

Procure entradas como:

```text
192.168.10.1 dev eth0 lladdr aa:bb:cc:dd:ee:ff REACHABLE
```

Estados comuns incluem:

```text
REACHABLE
STALE
DELAY
PROBE
FAILED
```

Uma entrada `FAILED`, por exemplo, pode indicar problemas para resolver o endereço do próximo salto.

---

#### 19.6 Testar o loopback
{:.no_toc}
```bash
ping -c 4 127.0.0.1
```

Se isso falhar, o problema está no próprio sistema e não na conexão externa.

---

#### 19.7 Testar o gateway
{:.no_toc}
```bash
ping -c 4 192.168.10.1
```

Se o gateway não responder, pode haver problemas em:

* interface;
* VLAN;
* endereço IP;
* máscara;
* ARP;
* cabo/Wi-Fi;
* switch;
* firewall.

---

#### 19.8 Testar um IP externo
{:.no_toc}
```bash
ping -c 4 8.8.8.8
```

Se o gateway responde, mas o IP externo não:

* verificar rota;
* verificar firewall;
* verificar NAT;
* verificar conectividade upstream.

---

#### 19.9 Testar DNS
{:.no_toc}
Primeiro:

```bash
ping -c 4 8.8.8.8
```

Depois:

```bash
ping -c 4 example.com
```

Se o IP funciona, mas o nome não resolve, investigar DNS.

Com `dig`:

```bash
dig example.com
```

Ver o servidor DNS utilizado:

```bash
resolvectl status
```

---

#### 19.10 Testar uma porta TCP
{:.no_toc}
```bash
nc -vz servidor.exemplo 443
```

Ou:

```bash
curl -v https://servidor.exemplo
```

Isso é importante porque:

> Ping funcionando não significa que uma porta TCP específica esteja funcionando.

Por exemplo:

```text
ICMP → permitido
TCP/443 → bloqueado
```

---

#### 19.11 Verificar serviços escutando
{:.no_toc}
```bash
ss -lntp
```

Exemplo:

```text
LISTEN 0 128 0.0.0.0:22
```

Isso indica que existe um processo escutando na porta TCP `22`.

Para descobrir o processo:

```bash
ss -lntp
```

---

#### 19.12 Verificar firewall
{:.no_toc}
Dependendo da distribuição:

```bash
sudo nft list ruleset
```

Em sistemas que utilizam firewalld:

```bash
sudo firewall-cmd --list-all
```

---

#### 19.13 Capturar tráfego
{:.no_toc}
Uma das ferramentas mais importantes para troubleshooting é o `tcpdump`.

Exemplo:

```bash
sudo tcpdump -i eth0
```

Somente ICMP:

```bash
sudo tcpdump -i eth0 icmp
```

Tráfego TCP na porta 443:

```bash
sudo tcpdump -i eth0 tcp port 443
```

Tráfego DNS:

```bash
sudo tcpdump -i eth0 port 53
```

Uma captura de pacotes permite verificar o que **realmente está entrando e saindo da interface**, em vez de depender apenas do resultado de comandos de teste.

---

## Resumo mental para troubleshooting

Quando um servidor Linux não consegue acessar determinado serviço, pense nesta sequência:

```text
1. Interface
      ↓
2. IP
      ↓
3. Máscara / Prefixo
      ↓
4. Rota
      ↓
5. Gateway
      ↓
6. ARP / Neighbor Discovery
      ↓
7. Conectividade IP
      ↓
8. DNS
      ↓
9. Porta TCP/UDP
      ↓
10. Firewall
      ↓
11. Serviço
      ↓
12. Aplicação
```

Uma forma prática de pensar é:

```text
Tenho interface?
      ↓
Tenho IP?
      ↓
Tenho rota?
      ↓
Consigo chegar ao gateway?
      ↓
Consigo chegar ao destino?
      ↓
O DNS resolve?
      ↓
A porta está acessível?
      ↓
Existe um serviço escutando?
      ↓
O firewall permite?
      ↓
A aplicação está funcionando?
```

Esse raciocínio é especialmente útil para diferenciar problemas de:

```text
Camada de rede
        ↓
Roteamento
        ↓
Firewall
        ↓
DNS
        ↓
Transporte
        ↓
Aplicação
```

E evita tentar corrigir um problema de aplicação quando, na realidade, o pacote sequer consegue chegar ao servidor.
