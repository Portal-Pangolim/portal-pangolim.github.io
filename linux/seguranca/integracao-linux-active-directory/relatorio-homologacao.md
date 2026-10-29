---
layout: default
title: "Linux com AD — Relatório de homologação da PoC"
description: "Resultados da PoC em um único host: homologação funcional, limites e pendências para produção."
status: historical
---

# PoC Linux integrado ao Active Directory — Relatório de homologação

> **Edição pública anonimizada:** esta documentação se refere à PoC de um único host. Nomes de hosts, domínio, contas, grupos, OUs e caminhos de backup identificáveis foram substituídos por exemplos genéricos; IPs e fingerprint operacional foram omitidos. Esses valores não são evidências reais nem devem ser usados para validar um servidor. As evidências originais devem permanecer em armazenamento restrito. Os resultados e as pendências da PoC foram preservados.

**Ambiente:** Homologação (identificadores anonimizados)<br>
**Host:** `linux-poc01.ad.example.com` (IP omitido na edição pública)<br>
**Sistema operacional:** Rocky Linux 9.8<br>
**Domínio:** `ad.example.com` / realm `AD.EXAMPLE.COM`<br>
**Data da execução:** 29/10/2026<br>
**Situação:** **Homologação funcional aprovada, com pendências para produção**<br>
**Escopo:** exclusivamente o linux-poc01. Os demais hosts Linux compatíveis serão tratados em implantação futura; servidores legados pertencem a outro projeto.

## 1. Objetivo e escopo

Validar integração direta de um host Linux compatível ao Active Directory por Realmd/Adcli/SSSD, autenticação de contas AD via SSH, autorização por grupo AD, separação de privilégios sudo, auditabilidade básica, funcionamento de credenciais em cache e preservação de acesso administrativo local.

Não constituem parte da aprovação atual: implantação em outros servidores; alterações de políticas corporativas do AD; regras permanentes de auditoria; MFA; endurecimento definitivo do SSH; rollback real; teste de falha física de conectividade com todos os controladores de domínio.

## 2. Arquitetura implementada

```text
Usuário AD → SSH / PAM → SSSD → Active Directory (ad.example.com)
                          ├─ autorização SSH: grupo LINUX_SSH
                          ├─ autenticação offline: cache de credenciais
                          └─ NSS: usuários e grupos AD

Sudo → /etc/sudoers.d/90-linux-ad → grupo LINUX_ADM

Acesso de emergência → conta root local + console da VM Nutanix
Logs → journald / rsyslog / auditd (eventos básicos)
```

**OU do computador:** `OU=Linux,OU=Laboratorio,DC=ad,DC=example,DC=com`. O objeto de computador era preexistente e foi preservado. O ingresso foi realizado com conta de delegação `svc-join-linux` depois do ajuste das permissões necessárias no AD.

### Componentes

- `realmd 0.17.1`, `adcli 0.9.3.1`, `sssd/sssd-ad 2.9.8`, `oddjob`, `oddjob-mkhomedir`, `krb5-workstation` — instalados (versões específicas conforme inventário executado).
- Perfil `authselect`: `sssd`, recurso `with-mkhomedir`.
- `/etc/sssd/sssd.conf`: permissão `600`; `id_provider = ad`, `access_provider = ad`, `cache_credentials = True`, `krb5_store_password_if_offline = True`, `use_fully_qualified_names = False` e `ad_access_filter` apontando ao grupo de SSH.
- `/etc/sudoers.d/90-linux-ad`: `%linux_adm ALL=(ALL:ALL) ALL`, permissão `440`.
- `/etc/krb5.keytab`: presente, restrito a root. **Nunca publicar nem anexar o conteúdo.**

## 3. Evidências e resultados

| Critério | Evidência observada | Resultado |
|---|---|---|
| Join ao AD | `realm list` indicou `configured: kerberos-member` e `client-software: sssd`; `adcli testjoin` passou | Aprovado |
| Descoberta de DC/GC | `sssctl domain-status ad.example.com` online; DCs e Global Catalog descobertos | Aprovado |
| Integridade SSSD | `sssctl config-check`: 0 erros; serviço ativo e habilitado | Aprovado |
| Acesso AD via SSH | Login real de `usuario.admin` e `usuario.ssh` | Aprovado |
| Autorização SSH | Usuário fora do grupo negado pelo PAM; posteriormente `usuario.ssh` incluído somente no grupo SSH e acesso permitido | Aprovado |
| Sudo separado | `usuario.admin`, membro de SSH e ADM: `sudo -l`, `sudo id` → `uid=0(root)` | Aprovado |
| Negação de sudo | `usuario.ssh`, membro apenas do grupo SSH: `Sorry, user ... may not run sudo` | Aprovado |
| Acesso de emergência | Root local via SSH e console Nutanix confirmados | Aprovado para PoC |
| Chaves de host SSH | Chaves clonadas/duplicadas substituídas; fingerprint ED25519 atual **omitido na edição pública; consultar registro restrito** | Aprovado |
| Cache offline | SIGUSR1 às 15:51:59; PAM SSH autenticou `usuario.ssh` às 15:52:52; retorno online às 15:53:08 | Aprovado em simulação SSSD offline |
| Reconexão | SSSD retornou online; SSH/SSSD ativos após sinal SIGUSR2 | Aprovado |
| Logs de autenticação | auditd registrou `USER_AUTH`, `USER_ACCT`, `USER_LOGIN`, IP de origem (omitido na edição pública), usuário e sessão | Aprovado |
| Sudo auditável | `journalctl _COMM=sudo` com concessões, comandos `/bin/id`, `/bin/su` e negativas | Aprovado (básico) |
| Auditoria experimental | Regra temporária `poc_sssd_config` capturou `openat` com `O_WRONLY|O_APPEND`; removida; `auditctl -l` voltou a `No rules` | Aprovado |
| Auditoria persistente | Nenhuma regra específica carregada | Pendente de política/aprovação |
| Backup pré-PoC | `/root/backup-pre-poc-ad-<DATA-HORA-PRE>/configuracoes-autenticacao.tar.gz` — GZIP testado | Disponível |
| Backup pós-PoC | `/root/backup-poc-ad-homologada-<DATA-HORA-POS>/configuracoes.tar.gz` — GZIP e listagem TAR testados | Disponível |
| Rollback completo | Procedimento preparado, mas não executado | **Não homologado** |

**Interpretação do teste offline:** comprova autenticação via PAM/SSSD enquanto o backend estava marcado offline, com cache; **não substitui** ensaio de indisponibilidade real de todos os DCs, DNS ou rede. O SSSD recuperou o estado online automaticamente.

## 4. Segurança e operação observadas

- SSH efetivo: `usepam yes`, `passwordauthentication yes`, `pubkeyauthentication yes`, `permitrootlogin yes`, `maxauthtries 6`, `loglevel INFO`. Login direto de root por senha foi preservado intencionalmente **somente para segurança operacional da PoC**; revisar antes da produção.
- Auditd ativo e habilitado, `lost=0`, sem regras adicionais. Retenção: `max_log_file=8`, `num_logs=5`, rotação habilitada, `space_left_action=SYSLOG`, `admin_space_left_action=SUSPEND`. Adequação à política institucional ainda não avaliada.
- Rsyslog e journald ativos. Não foi identificado encaminhamento remoto ativo na consulta apresentada; requer validação corporativa.
- O resultado `authselect check` foi válido. Os arquivos `/etc/pam.d/{system-auth,password-auth,fingerprint-auth,smartcard-auth,postlogin}` e `/etc/nsswitch.conf` são atualmente links simbólicos gerenciados pelo authselect.
- Antes da PoC, esses caminhos eram arquivos regulares; o PAM para `system-auth` e `password-auth` utilizava autenticação local (`pam_unix`) embora NSS já referisse `sss`. Isso exige rollback seletivo e cauteloso.

## 5. Pendências e critérios para encerramento formal

1. Revisão/aprovação das configurações SSH para produção, com método de recuperação independente do AD; avaliar MFA conforme política institucional.
2. Aprovação da auditoria persistente, retenção e centralização dos logs; regra experimental foi removida ao final.
3. Revisão operacional do roteiro de rollback e, se exigido, ensaio **em ambiente descartável/clone**, nunca automaticamente no host homologado.
4. Confirmar a política de indisponibilidade de AD/DNS e os limites de credenciais offline; possível teste real de falha apenas com janela e rollback de rede previamente autorizados.
5. Aprovação dos responsáveis por Linux, AD, Segurança e operação para expansão.

## 6. Parecer

**A PoC funcional para integração direta SSSD/Realmd está aprovada no host linux-poc01**, com controle de login SSH e privilégios sudo por grupos AD distintos, cache offline simulado e rastreabilidade básica demonstrados. **Não representa aprovação irrestrita para produção ou implantação massiva.** A configuração homologada deve ser preservada até a definição do projeto de expansão.

**Evidências:** saídas de terminal coletadas durante a PoC, logs locais de `sshd`, `sssd`, `sudo` e `auditd`, e os backups locais citados. Não copiar keytab, senhas, chaves privadas ou backups completos para repositórios de documentação.

---

[Voltar à integração Linux com Active Directory]({{ '/linux/seguranca/integracao-linux-active-directory.html' | relative_url }})
