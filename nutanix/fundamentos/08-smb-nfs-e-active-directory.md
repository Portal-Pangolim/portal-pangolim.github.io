---
layout: default
description: "Conceitos de SMB, NFS e Active Directory aplicados ao acesso e à identidade no Nutanix Files."
title: SMB, NFS e Active Directory
---

# SMB, NFS e Active Directory
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## SMB

**SMB**, ou *Server Message Block*, é muito utilizado em ambientes Windows.

Exemplo:

```text
\\files01\financeiro
```

O compartilhamento também pode ser mapeado como uma unidade:

```text
F:\
```

O SMB pode utilizar:

- Active Directory;
- Usuários e grupos;
- ACLs;
- Kerberos;
- NTLM, conforme o ambiente;
- Permissões de compartilhamento;
- Permissões de arquivos e pastas.

## NFS

**NFS**, ou *Network File System*, é muito utilizado em ambientes Linux e Unix.

Exemplo:

```text
files01:/dados
```

Montagem:

```bash
mount files01:/dados /mnt/dados
```

O NFS pode utilizar:

- UID e GID;
- Permissões POSIX;
- ACLs;
- Redes ou clientes autorizados;
- Kerberos, quando configurado;
- Opções do export.

## Comparação

| Característica | SMB | NFS |
|---|---|---|
| Ambiente comum | Windows | Linux e Unix |
| Caminho | `\\servidor\share` | `servidor:/export` |
| Nome do recurso | Share | Export |
| Identidade comum | Active Directory | UID/GID ou Kerberos |
| Permissões | ACLs Windows | POSIX/ACLs |

## Active Directory

O **Active Directory**, ou AD, centraliza identidades e recursos.

Ele pode armazenar:

- Usuários;
- Grupos;
- Computadores;
- Servidores;
- Contas de serviço;
- Unidades organizacionais;
- Políticas.

## Autenticação e autorização

### Autenticação

Responde:

> Quem é você?

### Autorização

Responde:

> O que você pode fazer?

Exemplo:

```text
Usuário: maria.oliveira
        ↓ pertence ao grupo
GG-RH-Alteracao
        ↓ recebe permissão
\\files01\rh
```

## Integração do Files com o AD

Em um cenário SMB, o Nutanix Files pode ingressar no domínio.

```text
Active Directory
      ↓ autentica usuários
Nutanix Files
      ↓ aplica permissões
Compartilhamento SMB
```

## Dependências importantes

### DNS

O Files deve resolver corretamente:

- Nome do domínio;
- Controladores de domínio;
- Registros necessários;
- Nome do próprio serviço.

### NTP

A sincronização de horário é essencial, principalmente em ambientes Kerberos.

### Rede

As portas necessárias entre Files, DNS e controladores de domínio devem estar liberadas.

## Diagnóstico de acesso negado

Quando o usuário autentica, mas não acessa a pasta:

1. Confirme a conta utilizada.
2. Verifique os grupos do usuário.
3. Confira a permissão do compartilhamento.
4. Confira as ACLs da pasta.
5. Procure negações explícitas.
6. Atualize as credenciais do usuário.
7. Analise os eventos de auditoria.

## Resumo

```text
SMB = compartilhamento comum em Windows
NFS = export comum em Linux/Unix
AD = identidades e grupos
Autenticação = quem é o usuário
Autorização = o que ele pode fazer
```
