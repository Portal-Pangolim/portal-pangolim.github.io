---
layout: default
title: Gerenciamento de URLs
description: "Organização e gerenciamento de URLs permitidas e bloqueadas no Squid."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a14 14 0 0 1 0 18"/>
    <path d="M12 3a14 14 0 0 0 0 18"/>
  </svg>
  Gerenciamento de URLs
</h1>

---

## Organização

Em um ambiente corporativo, manter as URLs em arquivos separados facilita a administração das regras.

Um exemplo de organização:

```text
/squid/regras/
├── url.liberadas
└── url.bloqueadas
```

Cada arquivo possui uma finalidade específica.

---

## URLs liberadas

O arquivo:

```text
/squid/regras/url.liberadas
```

pode conter os domínios que devem ser permitidos.

Exemplo:

```text
.exemplo.com
.exemplo.org
.infraero.gov.br
```

---

## URLs bloqueadas

O arquivo:

```text
/squid/regras/url.bloqueadas
```

pode conter os domínios que devem ser bloqueados.

Exemplo:

```text
.exemplo-bloqueado.com
.exemplo-restrito.org
```

---

## Configuração no Squid

As listas podem ser associadas a ACLs:

```conf
acl urls_liberadas dstdomain "/squid/regras/url.liberadas"
acl urls_bloqueadas dstdomain "/squid/regras/url.bloqueadas"
```

As regras de acesso podem então utilizar essas ACLs.

---

## Adicionando uma URL manualmente

Para adicionar uma URL à lista de liberadas:

```bash
echo ".exemplo.com" >> /squid/regras/url.liberadas
```

Para adicionar uma URL à lista de bloqueadas:

```bash
echo ".exemplo.com" >> /squid/regras/url.bloqueadas
```

Depois, valide:

```bash
squid -k parse
```

E aplique:

```bash
squid -k reconfigure
```

---

## Removendo uma URL

Antes de remover uma entrada, localize-a:

```bash
grep -n ".exemplo.com" /squid/regras/url.liberadas
```

Depois, remova ou edite a entrada conforme a necessidade.

Também é importante verificar se o domínio não está presente simultaneamente nas listas de liberadas e bloqueadas.

---

## Verificando duplicidades

Para identificar entradas repetidas:

```bash
sort /squid/regras/url.liberadas | uniq -d
```

E:

```bash
sort /squid/regras/url.bloqueadas | uniq -d
```

---

## Verificando uma URL

Para procurar um domínio:

```bash
grep -n "exemplo.com" /squid/regras/url.liberadas
```

Ou:

```bash
grep -n "exemplo.com" /squid/regras/url.bloqueadas
```

---

## Por que automatizar?

Em uma infraestrutura com vários proxies, realizar essas alterações manualmente em cada servidor aumenta o risco de:

- esquecer algum servidor;
- aplicar configurações diferentes;
- cometer erros de digitação;
- esquecer o `reconfigure`;
- gerar inconsistências entre os proxies.

A automação resolve esse problema centralizando a alteração e aplicando-a nos servidores definidos no inventário.

> **Próximo:** [Automação do Gerenciamento de URLs]({{ 'squid/fundamentos/05-automacao-do-gerenciamento-de-urls.html' | relative_url }})