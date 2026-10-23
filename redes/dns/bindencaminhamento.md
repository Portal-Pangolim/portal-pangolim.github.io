---
layout: default
description: "Encaminhamento condicional no BIND com nomes e endereços fictícios para documentação."
title: BIND - Adicionar Domínio ao Encaminhamento Condicional
---

> **Exemplo fictício:** nomes sob example.com e endereços reservados para documentação; adapte e valide em laboratório antes do uso. Estes endereços não são destinos para testes na Internet.




# BIND — Adicionar Domínio ao Encaminhamento Condicional
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}


## Hosts DNS

**DNS 01**

```text
dns-1.example.com
203.0.113.10
```

**DNS 02**

```text
dns-2.example.com
203.0.113.11
```

---

## Passo 1: confirmar que o serviço é BIND e ver os arquivos em uso

```bash
ps -ef | grep -E '[n]amed|[b]ind'
grep -nE '^(options|zone|forward|forwarders|include)' /etc/named.conf
```

## Passo 2: backup com timestamp

```bash
cp /etc/named/conditional.conf /etc/named/conditional.conf.$(date +%Y%m%d-%H%M%S).bak
```


---

## Passo 3: Editar o arquivo

```bash
vim /etc/named/conditional.conf
```

Adicionar:

```conf
zone "example.com" IN {
        type forward;
        forward only;
        forwarders {
                8.8.8.8;
                8.8.4.4;
        };
};
```
---

## Passo 4: Validar e Recarregar BIND

```bash
named-checkconf
```

Sem retorno = configuração válida.

```bash
rndc reload
```

Resultado esperado:

```text
server reload successful
```

---

## Passo 5: Testar

```bash
dig www.example.com @203.0.113.10
```

Resultado esperado:

```text
status: NOERROR
```

Também pode comparar diretamente com o Google:

```bash
dig www.example.com @8.8.8.8
```
---

## Rollback e erros comuns

### Erros de sintaxe

```text
/etc/named/conditional.conf:9: unknown option 'i'
/etc/named/conditional.conf:9: unexpected token near '}'
```

**Ação:** não execute `rndc reload`. Abra o arquivo na linha indicada, remova caracteres inválidos e rode `named-checkconf` novamente. Causas típicas:

* `;` faltando ao final de uma linha ou de um bloco `};`
* Chaves `{ }` desbalanceadas
* Caracteres colados de páginas web (aspas "inteligentes", links em Markdown, espaços especiais)
* Bloco `zone` duplicado para o mesmo domínio

### Rollback

Use o **nome exato do backup** criado no Passo 2:

```bash
cp /etc/named/conditional.conf.AAAAMMDD-HHMMSS.bak /etc/named/conditional.conf
named-checkconf
rndc reload
rndc flushtree example.com
```
