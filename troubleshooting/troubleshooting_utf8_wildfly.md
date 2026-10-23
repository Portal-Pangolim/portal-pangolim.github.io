---
layout: default
description: "Investigação de problemas de codificação UTF-8 no WildFly e verificações da configuração Java."
title: Troubleshooting Aplicação de Exemplo
---

# Troubleshooting – Correção de Caracteres Especiais (UTF-8) em Aplicação WildFly no Kubernetes
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Problema

A aplicação de exemplo apresentava problemas com caracteres especiais (acentuação e cedilha) na interface web.

Exemplos:

* Caracteres exibidos incorretamente na aplicação.
* Durante acesso ao container, nomes de arquivos e textos apareciam com caracteres inválidos ou substituídos por `???`.

## Ambiente

* Kubernetes RKE2
* WildFly executando em container
* Namespace: `aplicacao-exemplo`
* Deployment: `aplicacao-exemplo`
* Imagem: `harbor.corp.example.com/library/aplicacao-exemplo:v1.0.0`

---

## Diagnóstico

### Verificação do Locale dentro do Container
{:.no_toc}

Acessado o pod da aplicação:

```bash
kubectl exec -it -n aplicacao-exemplo <pod> -- sh
```

Verificação:

```bash
locale
```

Resultado:

```text
LANG=
LC_CTYPE="POSIX"
LC_ALL=
```

Indicando que o container estava utilizando locale padrão POSIX e não UTF-8.

---

### Verificação da JVM
{:.no_toc}

Executado:

```bash
java -XshowSettings:properties -version 2>&1 | grep -i encoding
```

Após os ajustes, a JVM passou a exibir:

```text
file.encoding = UTF-8
native.encoding = UTF-8
sun.jnu.encoding = UTF-8
```

Confirmando que o Java estava operando em UTF-8.

---

## Solução

Foram adicionadas variáveis de ambiente UTF-8 diretamente no Deployment Kubernetes.

### Comando aplicado
{:.no_toc}

```bash
kubectl set env deployment/aplicacao-exemplo -n aplicacao-exemplo \
LANG=en_US.UTF-8 \
LC_ALL=en_US.UTF-8 \
LC_CTYPE=en_US.UTF-8
```

O Kubernetes realizou automaticamente um rollout do Deployment, criando um novo pod.

---

## Validação

### Verificar variáveis de ambiente
{:.no_toc}

```bash
kubectl exec -it -n aplicacao-exemplo <pod> -- env | grep -E 'LANG|LC_'
```

Resultado esperado:

```text
LANG=en_US.UTF-8
LC_ALL=en_US.UTF-8
LC_CTYPE=en_US.UTF-8
```

### Verificar encoding da JVM
{:.no_toc}

```bash
kubectl exec -it -n aplicacao-exemplo <pod> -- \
java -XshowSettings:properties -version 2>&1 | grep -i encoding
```

Resultado esperado:

```text
file.encoding = UTF-8
native.encoding = UTF-8
sun.jnu.encoding = UTF-8
```

---

## Conclusão

O problema estava relacionado à ausência de configuração explícita de locale UTF-8 no container da aplicação.

A correção consistiu em definir as variáveis:

```text
LANG=en_US.UTF-8
LC_ALL=en_US.UTF-8
LC_CTYPE=en_US.UTF-8
```

no Deployment Kubernetes.

Após o rollout:

* Container passou a utilizar UTF-8.
* JVM passou a operar com UTF-8.
* Ambiente ficou apto a processar e exibir caracteres especiais corretamente.

Caso a aplicação continue apresentando caracteres incorretos após essa correção, a análise deve seguir para:

* Configuração do banco de dados.
* Configuração HTTP/Undertow do WildFly.
* Páginas JSP/JSF/HTML.
* Código da aplicação responsável pela conversão de caracteres.
