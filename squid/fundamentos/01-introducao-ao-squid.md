---
layout: default
title: Introdução ao Squid
description: "Conceitos fundamentais, funcionamento e componentes do Squid."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 4h16v16H4z"/>
    <path d="M8 8h8"/>
    <path d="M8 12h8"/>
    <path d="M8 16h5"/>
  </svg>
  Introdução ao Squid
</h1>

---

## Visão geral

O **Squid** é um servidor proxy utilizado principalmente para intermediar o acesso a recursos web.

Em ambientes corporativos, ele pode ser utilizado para:

- controlar o acesso à Internet;
- permitir ou bloquear URLs;
- aplicar regras por rede, endereço IP ou usuário;
- registrar acessos;
- utilizar autenticação;
- realizar cache de conteúdo;
- centralizar políticas de acesso.

O cliente não acessa diretamente o destino. A requisição passa pelo proxy, que avalia as regras configuradas antes de permitir ou negar o acesso.

---

## Funcionamento básico

O fluxo simplificado de uma requisição é:

```text
Cliente
   |
   v
Squid
   |
   +----> Regras / ACLs
   |
   +----> Permitir
   |        |
   |        v
   |      Internet
   |
   +----> Bloquear
            |
            v
         Acesso negado
```

Quando uma requisição chega ao Squid, o serviço analisa as regras configuradas e determina se o acesso será permitido ou bloqueado.

---

## Principais componentes

### squid.conf

O arquivo `squid.conf` contém a configuração principal do serviço.

É nele que normalmente são definidos:

- portas;
- ACLs;
- regras de acesso;
- autenticação;
- logs;
- cache;
- arquivos utilizados pelas regras.

Um exemplo simples:

```conf
http_port 3128

acl rede_interna src 10.0.0.0/8

http_access allow rede_interna
http_access deny all
```

---

### ACL

As **ACLs (Access Control Lists)** identificam condições utilizadas pelas regras do Squid.

Podem representar, por exemplo:

- endereços IP;
- redes;
- domínios;
- URLs;
- horários;
- usuários;
- métodos HTTP.

Exemplo:

```conf
acl rede_interna src 10.0.0.0/8
```

---

### http_access

A diretiva `http_access` determina se uma requisição será permitida ou negada.

Exemplo:

```conf
http_access allow rede_interna
http_access deny all
```

A ordem das regras é importante.

---

### Arquivos de regras

Em ambientes maiores, as URLs podem ser mantidas em arquivos separados.

Exemplo:

```text
/squid/regras/url.liberadas
/squid/regras/url.bloqueadas
```

Isso permite separar o conteúdo das regras da configuração principal do Squid.

---

## Proxy direto

No modelo mais comum, o cliente está configurado para utilizar o Squid diretamente:

```text
Cliente
   |
   | HTTP/HTTPS
   v
Squid
   |
   v
Internet
```

O navegador ou sistema operacional conhece o endereço do proxy.

---

## Proxy transparente

Em determinadas arquiteturas, o tráfego pode ser redirecionado para o proxy sem que o cliente tenha uma configuração explícita.

Nesse modelo:

```text
Cliente
   |
   v
Firewall / Roteador
   |
   v
Squid
   |
   v
Internet
```

A implementação depende da arquitetura de rede e dos mecanismos de redirecionamento utilizados.

---

## Onde o Squid se encaixa

Em uma infraestrutura corporativa, o Squid normalmente fica entre os usuários e a Internet:

```text
+-------------+
|   Usuários  |
+------+------+
       |
       v
+-------------+
|    Squid    |
+------+------+
       |
       v
+-------------+
|  Firewall   |
+------+------+
       |
       v
+-------------+
|  Internet   |
+-------------+
```

---

## Próximos passos

Depois de compreender o funcionamento básico, o próximo passo é instalar o Squid e realizar sua configuração inicial.

> **Próximo:** [Instalação e Configuração]({{ 'squid/fundamentos/02-instalacao-e-configuracao.html' | relative_url }})