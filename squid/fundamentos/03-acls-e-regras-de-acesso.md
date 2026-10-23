---
layout: default
title: ACLs e Regras de Acesso
description: "Criação e organização de ACLs e regras de acesso no Squid."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 5h16"/>
    <path d="M4 12h16"/>
    <path d="M4 19h16"/>
    <circle cx="8" cy="5" r="1"/>
    <circle cx="14" cy="12" r="1"/>
    <circle cx="10" cy="19" r="1"/>
  </svg>
  ACLs e Regras de Acesso
</h1>

---

## O que são ACLs

ACL significa **Access Control List**.

No Squid, uma ACL define uma condição que pode ser utilizada por uma regra de acesso.

Exemplo:

```conf
acl rede_interna src 10.0.0.0/8
```

Nesse caso, `rede_interna` representa a rede `10.0.0.0/8`.

---

## Tipos comuns de ACL

Alguns tipos utilizados com frequência:

| Tipo | Utilização |
|---|---|
| `src` | Endereço IP ou rede de origem |
| `dst` | Destino |
| `dstdomain` | Domínio de destino |
| `url_regex` | Expressão regular aplicada à URL |
| `time` | Controle por horário |
| `proxy_auth` | Usuário autenticado |

---

## ACL por rede

Exemplo:

```conf
acl rede_interna src 10.0.0.0/8
```

Depois, a ACL pode ser utilizada:

```conf
http_access allow rede_interna
```

---

## ACL por domínio

É possível criar uma ACL baseada em domínio:

```conf
acl sites_permitidos dstdomain .infraero.gov.br
```

E permitir o acesso:

```conf
http_access allow sites_permitidos
```

---

## ACL utilizando arquivo

Uma abordagem útil para grandes listas é utilizar um arquivo externo.

Exemplo:

```conf
acl urls_liberadas dstdomain "/squid/regras/url.liberadas"
```

Outro exemplo:

```conf
acl urls_bloqueadas dstdomain "/squid/regras/url.bloqueadas"
```

Dessa forma, a lista de domínios pode ser alterada sem precisar concentrar todas as entradas diretamente no `squid.conf`.

---

## Ordem das regras

A ordem das regras `http_access` é importante.

Exemplo:

```conf
http_access allow urls_liberadas
http_access deny urls_bloqueadas
http_access deny all
```

O Squid processa as regras na ordem configurada.

Por isso, uma regra posicionada antes de outra pode determinar o resultado da requisição.

---

## Negação padrão

Uma configuração comum termina com:

```conf
http_access deny all
```

Isso evita que uma requisição não contemplada pelas regras anteriores seja liberada acidentalmente.

---

## Validando alterações

Depois de modificar as ACLs:

```bash
squid -k parse
```

Se não houver erros:

```bash
squid -k reconfigure
```

---

## Cuidados

Ao trabalhar com ACLs:

- verifique a ordem das regras;
- valide a configuração antes de aplicar;
- mantenha listas organizadas;
- evite regras duplicadas;
- registre alterações importantes;
- analise os logs quando o comportamento não for o esperado.


> **Próximo:** [Gerenciamento de URLs]({{ 'squid/fundamentos/04-gerenciamento-de-urls.html' | relative_url }})