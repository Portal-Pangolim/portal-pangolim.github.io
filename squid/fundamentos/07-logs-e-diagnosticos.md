---
layout: default
title: Logs e Diagnóstico
description: "Análise de logs e procedimentos para diagnóstico de problemas no Squid."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 4h16v16H4z"/>
    <path d="M8 8h8"/>
    <path d="M8 12h5"/>
    <path d="M8 16h8"/>
  </svg>
  Logs e Diagnóstico
</h1>

---

## Visão geral

Os logs são uma das principais ferramentas para identificar problemas de acesso através do Squid.

Eles permitem verificar:

- requisições;
- destinos;
- códigos de resposta;
- usuários;
- erros;
- falhas de conexão;
- bloqueios;
- problemas de comunicação.

---

## Principais logs

Os arquivos podem estar localizados em:

```text
/var/log/squid/
```

Um dos principais arquivos é:

```text
/var/log/squid/access.log
```

---

## Acompanhando o access.log

Para acompanhar novas requisições:

```bash
tail -f /var/log/squid/access.log
```

Para consultar as últimas linhas:

```bash
tail -n 50 /var/log/squid/access.log
```

---

## Pesquisando uma URL

Para localizar determinado domínio:

```bash
grep "exemplo.com" /var/log/squid/access.log
```

Também é possível utilizar:

```bash
grep -i "exemplo.com" /var/log/squid/access.log
```

---

## Verificando o serviço

Primeiro, confirme se o Squid está ativo:

```bash
systemctl status squid
```

Se necessário:

```bash
systemctl is-active squid
```

---

## Verificando erros da configuração

Sempre que houver uma alteração de configuração:

```bash
squid -k parse
```

Esse comando é uma das primeiras verificações a serem realizadas quando o Squid apresenta comportamento inesperado após uma alteração.

---

## Reconfigure

Quando a configuração estiver correta:

```bash
squid -k reconfigure
```

Se o comportamento continuar incorreto, consulte os logs.

---

## Diagnóstico por etapas

Uma sequência básica de diagnóstico:

```text
1. Verificar serviço
        |
        v
2. Verificar configuração
        |
        v
3. Verificar porta
        |
        v
4. Verificar ACLs
        |
        v
5. Verificar arquivos de URLs
        |
        v
6. Verificar access.log
        |
        v
7. Verificar comunicação com destino
```

---

## Verificando a porta

Para verificar se o Squid está escutando:

```bash
ss -lntp | grep squid
```

---

## Verificando processos

```bash
ps aux | grep squid
```

---

## Verificando conectividade

Quando houver suspeita de problema de rede, teste a resolução DNS:

```bash
getent hosts exemplo.com
```

Também pode ser necessário testar a conectividade diretamente:

```bash
curl -I https://exemplo.com
```

O teste deve considerar a arquitetura de rede e as políticas existentes.

---

## Problemas comuns

### Squid não inicia

Verifique:

```bash
systemctl status squid
```

Depois:

```bash
squid -k parse
```

---

### URL permitida sendo bloqueada

Verifique:

```bash
grep -n "exemplo.com" /squid/regras/url.liberadas
```

Depois:

```bash
grep -n "exemplo.com" /squid/regras/url.bloqueadas
```

Também analise as regras `http_access` e a ordem das ACLs.

---

### URL bloqueada sendo liberada

Verifique:

- ACL utilizada;
- arquivo de URLs;
- ordem das regras;
- existência de uma regra anterior permitindo o acesso;
- logs do Squid.

---

### Alteração não aplicada

Confirme:

```bash
squid -k parse
```

Depois:

```bash
squid -k reconfigure
```

E acompanhe:

```bash
tail -f /var/log/squid/access.log
```

---

## Diagnóstico em ambiente com múltiplos proxies

Quando existem vários proxies, é importante verificar se o problema ocorre em apenas um servidor ou em todos.

A automação do gerenciamento de URLs reduz esse tipo de divergência ao aplicar as alterações no grupo:

```text
proxy_squid
```

Mesmo assim, após uma alteração importante, deve-se confirmar o estado dos servidores envolvidos.

---

## Checklist de diagnóstico

```text
[ ] Serviço Squid ativo
[ ] Configuração válida
[ ] Porta escutando
[ ] ACLs verificadas
[ ] URLs liberadas verificadas
[ ] URLs bloqueadas verificadas
[ ] Ordem das regras verificada
[ ] access.log analisado
[ ] DNS verificado
[ ] Conectividade verificada
[ ] Reconfigure executado
```

---

## Resumo

A análise de um problema no Squid deve começar pelo básico e avançar gradualmente.

A sequência recomendada é:

```text
Serviço
  ↓
Configuração
  ↓
ACLs
  ↓
Regras
  ↓
URLs
  ↓
Logs
  ↓
Rede / DNS
```

> O diagnóstico eficiente depende de identificar em qual etapa da requisição o problema está ocorrendo.