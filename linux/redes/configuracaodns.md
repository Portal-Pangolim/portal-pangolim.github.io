---
layout: default
description: "Configuração de resolução DNS no Linux e comandos para verificar servidores, consultas e conectividade."
title: Configuração DNS
---

> **Exemplo fictício:** nomes sob example.com e endereços reservados para documentação; adapte e valide em laboratório antes do uso. Estes endereços não são destinos para testes na Internet.


# Configuração de DNS com BIND, Forwarders Corporativos e Zona Interna no Rocky Linux
{:.no_toc}

Este tutorial documenta a configuração de um servidor **BIND (named)** no Rocky Linux para funcionar como:

* DNS interno da rede `192.0.2.0/24`
* DNS autoritativo para `lab.example.com`
* Resolver/cache DNS para nomes externos
* Forwarder para os DNS corporativos `198.51.100.34`, `198.51.100.23` e `198.51.100.3`
* DNS utilizado pelas VMs do laboratório
* Base para ambientes Kubernetes, containerd e outros serviços

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
### 1. Cenário

#### Servidores

| Host              |                IP | Função           |
| ----------------- | ----------------: | ---------------- |
| `dns-server`      |      `192.0.2.22` | BIND DNS         |
| `rocky-lab`       |      `192.0.2.24` | VM cliente       |
| Gateway           |     `192.0.2.254` | Gateway da rede  |
| DNS corporativo 1 |      `198.51.100.34` | Forwarder        |
| DNS corporativo 2 |      `198.51.100.23` | Forwarder        |
| DNS corporativo 3 |       `198.51.100.3` | Forwarder        |
| Proxy/Squid       | `192.0.2.57:3128` | Proxy HTTP/HTTPS |

Topologia:

```text
                         INTERNET
                            |
                     Rede corporativa
                            |
              +-------------+-------------+
              |                           |
      DNS corporativo              Proxy Squid
  198.51.100.34/.23/.3              192.0.2.57:3128
              ^
              |
        forward only
              |
      +-------+-------+
      |               |
192.0.2.22       192.0.2.24
 dns-server       rocky-lab
   BIND              VM
```

---

## 2. Objetivo

Fazer com que as VMs utilizem:

```text
192.0.2.22
```

como DNS.

Para nomes internos:

```text
dns-server.lab.example.com
rocky-lab.lab.example.com
```

o BIND responde diretamente.

Para nomes externos:

```text
google.com
github.com
registry-1.docker.io
```

o BIND encaminha as consultas para os DNS corporativos:

```text
198.51.100.34
198.51.100.23
198.51.100.3
```

---

## 3. Instalar o BIND

No servidor DNS:

```bash
dnf install -y bind bind-utils
```

Verificar:

```bash
rpm -qa | grep '^bind'
```

---

## 4. Verificar o serviço

```bash
systemctl status named
```

Habilitar no boot:

```bash
systemctl enable named
```

Iniciar:

```bash
systemctl start named
```

Ou:

```bash
systemctl enable --now named
```

---

## 5. Verificar a conectividade de rede

Confirmar IP:

```bash
ip addr show
```

Confirmar rota:

```bash
ip route
```

Verificar a rota para os DNS corporativos:

```bash
ip route get 198.51.100.34
ip route get 198.51.100.23
ip route get 198.51.100.3
```

Verificar gateway:

```bash
ip route get 8.8.8.8
```

Resultado esperado:

```text
8.8.8.8 via 192.0.2.254 dev enp0s3 src 192.0.2.22
```

---

## 6. Testar os DNS corporativos

Antes de configurar o BIND, confirme que o servidor consegue consultar os DNS corporativos.

```bash
dig @198.51.100.34 google.com
```

```bash
dig @198.51.100.23 google.com
```

```bash
dig @198.51.100.3 google.com
```

Todos devem retornar:

```text
status: NOERROR
```

Teste resumido:

```bash
for dns in 198.51.100.34 198.51.100.23 198.51.100.3; do
    echo "===== $dns ====="
    dig @"$dns" google.com +short
done
```

Exemplo:

```text
===== 198.51.100.34 =====
142.251.129.238

===== 198.51.100.23 =====
142.251.129.238

===== 198.51.100.3 =====
142.250.78.206
```

---

## 7. Importante: DNS público direto pode estar bloqueado

Teste:

```bash
dig @8.8.8.8 google.com +time=3 +tries=1
```

Se retornar:

```text
connection timed out
```

isso não significa necessariamente que o BIND está com problema.

Em redes corporativas é comum bloquear:

```text
UDP/53
TCP/53
```

para servidores DNS públicos.

Por exemplo:

```bash
dig @1.1.1.1 google.com
```

também pode falhar.

Nesse cenário, utilize os DNS corporativos como `forwarders`.

---

## 8. Configurar o BIND

Arquivo principal:

```bash
vim /etc/named.conf
```

Configuração utilizada:

```conf
options {
        listen-on port 53 { 127.0.0.1; 192.0.2.22; };
        listen-on-v6 port 53 { ::1; };

        directory "/var/named";

        dump-file "/var/named/data/cache_dump.db";
        statistics-file "/var/named/data/named_stats.txt";
        memstatistics-file "/var/named/data/named_mem_stats.txt";
        secroots-file "/var/named/data/named.secroots";
        recursing-file "/var/named/data/named.recursing";

        allow-query {
                localhost;
                192.0.2.0/24;
        };

        forwarders {
                198.51.100.34;
                198.51.100.23;
                198.51.100.3;
        };

        forward only;

        recursion yes;

        dnssec-validation no;

        managed-keys-directory "/var/named/dynamic";
        geoip-directory "/usr/share/GeoIP";

        pid-file "/run/named/named.pid";
        session-keyfile "/run/named/session.key";

        include "/etc/crypto-policies/back-ends/bind.config";
};

logging {
        channel default_debug {
                file "data/named.run";
                severity dynamic;
        };
};

zone "." IN {
        type hint;
        file "named.ca";
};

zone "lab.example.com" IN {
        type master;
        file "lab.example.com.zone";

        allow-query {
                localhost;
                192.0.2.0/24;
        };
};

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";
```

---

## 9. Entendendo os principais parâmetros

### `listen-on`

```conf
listen-on port 53 {
    127.0.0.1;
    192.0.2.22;
};
```

Faz o BIND escutar DNS em:

```text
127.0.0.1:53
192.0.2.22:53
```

---

### `allow-query`

```conf
allow-query {
    localhost;
    192.0.2.0/24;
};
```

Permite consultas apenas:

* localmente
* pela rede `192.0.2.0/24`

Isso evita transformar o servidor em um resolver DNS aberto.

---

### `forwarders`

```conf
forwarders {
    198.51.100.34;
    198.51.100.23;
    198.51.100.3;
};
```

Define os DNS que receberão as consultas externas.

---

### `forward only`

```conf
forward only;
```

Este parâmetro é importante no ambiente corporativo.

Ele determina que o BIND deve encaminhar consultas para os `forwarders`.

Ele **não deve tentar resolver diretamente pela Internet** caso os forwarders não respondam.

Isso evita situações como:

```text
BIND
 |
 +---> 198.51.100.34
 |
 +---> 198.51.100.23
 |
 +---> 198.51.100.3
```

em vez de:

```text
BIND
 |
 +---> DNS corporativo
 |
 +---> Internet diretamente
```

---

## 10. Criar a zona interna

Criar:

```bash
vim /var/named/lab.example.com.zone
```

Exemplo:

```dns
$TTL 86400

@       IN      SOA     dns-server.lab.example.com. root.lab.example.com. (
                        2026082101
                        3600
                        900
                        604800
                        86400
)

        IN      NS      dns-server.lab.example.com.

dns-server      IN      A       192.0.2.22
rocky-lab       IN      A       192.0.2.24
```

---

## 11. Verificar permissões da zona

```bash
ls -l /var/named/lab.example.com.zone
```

Exemplo:

```text
-rw-r-----. 1 root named ... lab.example.com.zone
```

Isso é aceitável.

Caso necessário:

```bash
chown root:named /var/named/lab.example.com.zone
chmod 640 /var/named/lab.example.com.zone
```

---

## 12. Validar a configuração

Antes de reiniciar o BIND:

```bash
named-checkconf
```

Se não aparecer nenhuma mensagem:

```text
OK
```

isso significa que a sintaxe do `named.conf` está correta.

Também é recomendado verificar as zonas:

```bash
named-checkconf -z /etc/named.conf
```

---

## 13. Reiniciar o BIND

```bash
systemctl restart named
```

Verificar:

```bash
systemctl status named
```

Esperado:

```text
Active: active (running)
```

---

## 14. Verificar se o BIND está escutando na porta 53

```bash
ss -lntup | grep ':53'
```

Esperado:

```text
udp   UNCONN ... 192.0.2.22:53
tcp   LISTEN ... 192.0.2.22:53
```

Também pode aparecer:

```text
127.0.0.1:53
```

---

## 15. Testar a zona interna

Testar o próprio DNS:

```bash
dig @192.0.2.22 dns-server.lab.example.com
```

Esperado:

```text
status: NOERROR
```

E:

```text
ANSWER SECTION:

dns-server.lab.example.com. 86400 IN A 192.0.2.22
```

Teste resumido:

```bash
dig @192.0.2.22 dns-server.lab.example.com +short
```

Resultado:

```text
192.0.2.22
```

Testar o `rocky-lab`:

```bash
dig @192.0.2.22 rocky-lab.lab.example.com +short
```

Resultado:

```text
192.0.2.24
```

---

## 16. Configurar o próprio servidor para usar o BIND

No `dns-server`:

```bash
cat /etc/resolv.conf
```

O ideal é:

```text
# Generated by NetworkManager
nameserver 192.0.2.22
```

Assim:

```text
Aplicação
   |
   v
/etc/resolv.conf
   |
   v
192.0.2.22
   |
   v
BIND
   |
   v
DNS corporativo
```

---

## 17. Testar resolução externa

```bash
dig @192.0.2.22 google.com
```

Esperado:

```text
status: NOERROR
```

Teste simplificado:

```bash
dig @192.0.2.22 google.com +short
```

Exemplo:

```text
142.251.129.238
```

---

## 18. Testar através do resolver do sistema

Depois de configurar:

```text
nameserver 192.0.2.22
```

execute:

```bash
getent hosts google.com
```

Exemplo:

```text
142.251.129.238 google.com
```

Também:

```bash
ping -c 2 google.com
```

Se aparecer:

```text
PING google.com (142.251.129.238)
```

a resolução DNS está funcionando.

---

## 19. Testar a partir de outra VM

No `rocky-lab`:

```bash
cat /etc/resolv.conf
```

Configurar:

```text
nameserver 192.0.2.22
```

Depois:

```bash
dig google.com +short
```

```bash
getent hosts google.com
```

```bash
ping -c 2 google.com
```

Testar também a zona interna:

```bash
dig dns-server.lab.example.com +short
```

Resultado:

```text
192.0.2.22
```

E:

```bash
dig rocky-lab.lab.example.com +short
```

Resultado:

```text
192.0.2.24
```

---

## 20. Diagnóstico com `tcpdump`

Para verificar se o BIND realmente está encaminhando consultas:

No `dns-server`:

```bash
tcpdump -ni enp0s3 'port 53'
```

Em outro terminal:

```bash
dig @192.0.2.22 google.com
```

Você deverá observar tráfego semelhante a:

```text
192.0.2.22.xxxxx > 198.51.100.34.53
```

ou:

```text
192.0.2.22.xxxxx > 198.51.100.23.53
```

ou:

```text
192.0.2.22.xxxxx > 198.51.100.3.53
```

---

## 21. Diagnóstico do BIND

Verificar logs:

```bash
journalctl -u named --since "10 minutes ago" --no-pager
```

Em tempo real:

```bash
journalctl -u named -f
```

Verificar erros:

```bash
journalctl -u named --no-pager | grep -Ei \
'error|fail|denied|timeout|servfail|unreachable'
```

---

## 22. Diagnóstico de DNS em uma única sequência

Pode utilizar:

```bash
echo "===== INTERFACE ====="
ip -br addr

echo "===== ROUTES ====="
ip route

echo "===== RESOLV.CONF ====="
cat /etc/resolv.conf

echo "===== BIND ====="
systemctl is-active named

echo "===== LISTEN ====="
ss -lntup | grep ':53'

echo "===== INTERNAL DNS ====="
dig @192.0.2.22 dns-server.lab.example.com +short
dig @192.0.2.22 rocky-lab.lab.example.com +short

echo "===== EXTERNAL DNS ====="
dig @192.0.2.22 google.com +short

echo "===== SYSTEM RESOLUTION ====="
getent hosts google.com
```

---

## 23. Problema encontrado durante a configuração

Inicialmente foi utilizado:

```text
/etc/resolv.conf

nameserver 8.8.8.8
nameserver 1.1.1.1
```

Porém:

```bash
dig @8.8.8.8 google.com
```

retornava:

```text
connection timed out
```

E:

```bash
dig @1.1.1.1 google.com
```

também:

```text
connection timed out
```

Isso indicou que o acesso direto aos DNS públicos estava bloqueado pela rede.

---

## 24. Proxy HTTP não é Proxy DNS

O servidor possui:

```text
HTTP_PROXY=http://192.0.2.57:3128
HTTPS_PROXY=http://192.0.2.57:3128
```

Isso permite que aplicações compatíveis com proxy, como `curl`, acessem a Internet através do Squid.

Por exemplo:

```bash
curl -I https://www.google.com
```

pode funcionar.

Isso **não significa** que:

```text
DNS UDP/53
```

esteja liberado.

O `dig` não utiliza o proxy HTTP:

```text
dig
 |
 +---- X HTTP_PROXY
 |
 +----> UDP/TCP 53
```

Enquanto:

```text
curl
 |
 +----> Squid 192.0.2.57:3128
 |
 +----> Internet
```

---

## 25. Configuração final

A arquitetura final fica:

```text
                     INTERNET
                        |
                REDE CORPORATIVA
                        |
          +-------------+-------------+
          |             |             |
    198.51.100.34     198.51.100.23    198.51.100.3
       DNS             DNS           DNS
          \             |             /
           \            |            /
            +-----------+-----------+
                        ^
                        |
                  forwarders
                        |
                  forward only
                        |
                +---------------+
                |  BIND/named   |
                | 192.0.2.22:53 |
                +-------+-------+
                        |
              +---------+---------+
              |                   |
        192.0.2.22          192.0.2.24
        dns-server            rocky-lab
              |                   |
              +------ DNS --------+
```

---

## 26. Checklist final

### BIND

```bash
systemctl is-active named
```

Esperado:

```text
active
```

### Configuração

```bash
named-checkconf
```

Sem saída = OK.

### Zona

```bash
named-checkconf -z /etc/named.conf
```

Esperado:

```text
zone lab.example.com/IN: loaded serial ...
```

### Porta 53

```bash
ss -lntup | grep ':53'
```

Esperado:

```text
192.0.2.22:53
```

### DNS interno

```bash
dig @192.0.2.22 dns-server.lab.example.com +short
```

Esperado:

```text
192.0.2.22
```

```bash
dig @192.0.2.22 rocky-lab.lab.example.com +short
```

Esperado:

```text
192.0.2.24
```

### DNS externo

```bash
dig @192.0.2.22 google.com +short
```

Esperado:

```text
IP do Google
```

### Resolver do sistema

```bash
getent hosts google.com
```

Deve retornar um endereço.

### Internet

```bash
ping -c 2 google.com
```

Deve resolver o nome e responder, quando ICMP estiver permitido.

---

## 27. Resultado

Ao final, o servidor `dns-server` funciona como um **DNS central do laboratório**:

```text
                 VM / Kubernetes
                       |
                       v
                192.0.2.22:53
                       |
             +---------+---------+
             |                   |
             v                   v
        lab.example.com             Internet
        zona local                |
             |                    v
             |             DNS corporativo
             |          198.51.100.34/.23/.3
             |
             v
       192.0.2.x
```