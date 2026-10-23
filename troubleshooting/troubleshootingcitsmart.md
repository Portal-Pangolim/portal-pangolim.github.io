---
layout: default
description: "Referência de diagnóstico do CITSmart, com coleta de informações e verificações de serviços."
title: Troubleshooting Aplicação ITSM de Exemplo
---

# Troubleshooting – Indisponibilidade da Aplicação ITSM de Exemplo
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Solução de Contorno

Reiniciar os serviços da aplicação ITSM de exemplo.

Observação: a reinicialização restabelece o funcionamento da aplicação, porém não corrige a causa raiz do problema.

---

## Sintoma

Usuários relatam indisponibilidade ou lentidão no acesso à aplicação ITSM de exemplo.

---

## Verificar status dos containers

```bash
docker ps
```

Verificar se todos os containers do ambiente estão em execução.

---

## Verificar consumo de recursos

```bash
docker stats --no-stream itsm-exemplo
```

Validar consumo de CPU e memória do container principal da aplicação.

---

## Verificar erros de memória

```bash
docker logs itsm-exemplo 2>&1 | grep -i "OutOfMemoryError"
```

Caso exista retorno semelhante ao abaixo:

```text
java.lang.OutOfMemoryError: Java heap space
```

A aplicação apresentou esgotamento da memória Java (Heap).

---

## Identificar processo Java

```bash
docker exec -it itsm-exemplo ps -ef | grep java
```

Anotar o PID do processo Java.

Exemplo:

```text
app <PID_JAVA> java ...
```

---

## Verificar utilização da Heap

```bash
docker exec -it itsm-exemplo jcmd <PID_JAVA> GC.heap_info
```

Exemplo:

```text
garbage-first heap total 8388608K
used 1048576K
```

---

## Verificar parâmetros da JVM

```bash
docker exec -it itsm-exemplo jcmd <PID_JAVA> VM.flags
```

Verificar principalmente os parâmetros:

```text
-XX:InitialHeapSize
-XX:MaxHeapSize
```

---

## Coletar logs da aplicação

Acessar:

```text
Sistema → Informações do Sistema → Download Log do JBoss
```

Salvar o arquivo para análise posterior.

---

## Verificar trilha de auditoria

Acessar:

```text
Sistema → Trilha de Auditoria → Auditoria de Dados
```

Filtrar pelo horário da indisponibilidade.

Exemplo:

```text
Data Inicial: DD/MM/AAAA 11:40
Data Final:   DD/MM/AAAA 11:50
```

---

## Evidências encontradas no incidente de DD/MM/AAAA

Foi identificado:

```text
java.lang.OutOfMemoryError: Java heap space
```

A stack trace apontou para:

```text
com.example.audit.service.impl.AuditServiceImpl
org.javers.core.JaversCore.compare
```

Após o erro foram observadas falhas de comunicação internas:

```text
ActiveMQConnectionTimedOutException
AMQ219014
Channel is closed
```

## Conclusão Preliminar

Os indícios apontam para falha relacionada ao módulo de auditoria da aplicação, resultando em esgotamento da memória Java (OutOfMemoryError) e consequente degradação dos serviços internos da aplicação.
