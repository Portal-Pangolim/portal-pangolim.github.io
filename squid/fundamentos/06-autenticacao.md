---
layout: default
title: Autenticação
description: "Conceitos e configuração de autenticação de usuários no Squid."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M5 21a7 7 0 0 1 14 0"/>
  </svg>
  Autenticação
</h1>

---

## Visão geral

O Squid pode utilizar autenticação para identificar o usuário que está realizando uma requisição.

Isso permite criar políticas baseadas não apenas no endereço IP, mas também na identidade do usuário.

---

## Fluxo básico

```text
Usuário
   |
   | Credenciais
   v
Squid
   |
   v
Autenticação
   |
   +----> Aceita
   |
   +----> Recusa
```

Depois da autenticação, as informações do usuário podem ser utilizadas pelas ACLs.

---

## ACL de autenticação

Uma ACL de autenticação pode utilizar:

```conf
acl usuarios proxy_auth REQUIRED
```

Nesse exemplo, o acesso exige que o usuário esteja autenticado.

---

## Regra de acesso

A ACL pode ser associada a uma regra:

```conf
http_access allow usuarios
http_access deny all
```

---

## Métodos de autenticação

O Squid suporta diferentes mecanismos de autenticação por meio de programas auxiliares.

A escolha depende da infraestrutura existente.

Entre as possibilidades estão mecanismos baseados em:

- arquivos locais;
- LDAP;
- Active Directory;
- outros sistemas de autenticação compatíveis.

---

## Autenticação e ACLs

A autenticação pode ser combinada com outras condições.

Por exemplo:

```text
Usuário
   +
Rede
   +
Destino
   |
   v
Regra de acesso
```

Isso permite políticas mais específicas.

---

## Exemplo conceitual

Uma política poderia representar:

```conf
acl usuarios proxy_auth REQUIRED
acl rede_interna src 10.0.0.0/8

http_access allow usuarios rede_interna
http_access deny all
```

Nesse cenário, o acesso depende das duas condições.

---

## Diagnóstico

Quando a autenticação não funciona, verifique:

```bash
squid -k parse
```

Depois:

```bash
systemctl status squid
```

E os logs:

```bash
tail -f /var/log/squid/access.log
```

Também é importante verificar o mecanismo externo de autenticação quando utilizado.

---

## Cuidados

Ao configurar autenticação:

- valide as credenciais;
- confirme a comunicação com o serviço externo;
- verifique os logs;
- valide a ordem das ACLs;
- teste com um usuário autorizado;
- mantenha as configurações documentadas.

> **Próximo:** [Logs e Diagnóstico]({{ 'squid/fundamentos/07-logs-e-diagnosticos.html' | relative_url }})