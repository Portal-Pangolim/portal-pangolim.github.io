---
layout: default
title: "Linux com AD — Checklist de expansão futura"
description: "Critérios para uma expansão futura por host, ainda não executada e sujeita a aprovação."
status: planned
validation: pending-lab
---

# Checklist — Implantação futura de Linux compatível no AD

> **Edição pública anonimizada:** esta documentação se refere à PoC de um único host. Nomes de hosts, domínio, contas, grupos, OUs e caminhos de backup identificáveis foram substituídos por exemplos genéricos; IPs e fingerprint operacional foram omitidos. Esses valores não são evidências reais nem devem ser usados para validar um servidor. As evidências originais devem permanecer em armazenamento restrito. Os resultados e as pendências da PoC foram preservados.

**Base técnica:** PoC linux-poc01, Rocky Linux 9.8, homologada funcionalmente em 29/10/2026.<br>
**Status:** referência para projeto futuro; **não autoriza alterações nos demais hosts**.<br>
**Escopo previsto:** apenas hosts compatíveis com Realmd/SSSD/Adcli. Sistemas legados serão tratados em projeto separado depois da PoC.

## 1. Governança e elegibilidade (antes de qualquer mudança)

- [ ] Aprovação do projeto de expansão, responsável técnico e janela de mudança por host.
- [ ] Identificar hostname, IP, SO/versão, criticidade, serviços, proprietários, autenticação atual, dependências de domínio e método de recuperação.
- [ ] Confirmar compatibilidade da distribuição/versão e pacotes `realmd`, `adcli`, `sssd`, `sssd-ad`, `oddjob`, `oddjob-mkhomedir`, `krb5-workstation`.
- [ ] Excluir hosts legados deste lote; registrar para projeto futuro.
- [ ] Checar conflitos de nomes de usuários/grupos locais e AD; avaliar impactos de `use_fully_qualified_names = False`.
- [ ] Confirmar estratégia de OU por ambiente (DSV/HML/PRD), conta delegada de join, grupos SSH/ADM e autorização da equipe AD.
- [ ] Preservar, consultar e aprovar tratamento de objetos de computador preexistentes; **nunca excluir/recriar automaticamente**.

## 2. Pré-requisitos de infraestrutura

- [ ] Console remota/hipervisor acessível e autenticação root/local independente do AD validada.
- [ ] Sessão administrativa reserva e plano de recuperação conhecidos.
- [ ] DNS interno resolve domínio, A/PTR, registros SRV de LDAP/Kerberos e controladores corretos.
- [ ] NTP/chrony com relógio sincronizado e fuso correto.
- [ ] Conectividade necessária com DC/GC conforme arquitetura (por exemplo, Kerberos, LDAP, SMB/RPC conforme join, LDAP GC); testar portas e origem/destino autorizadas, sem liberar indiscriminadamente.
- [ ] Verificar políticas SELinux, SSH/PAM/NSS, firewall, ferramentas de segurança, automações, monitoração e sudo locais.
- [ ] Checar chaves SSH existentes (especialmente VMs clonadas); estabelecer correção e impacto sobre `known_hosts` se houver duplicação.
- [ ] Inspecionar `realm list`, `authselect current/check`, `sssd.conf`, `krb5.conf`, `nsswitch.conf`, `/etc/pam.d`, `sudoers`, `sshd -T` antes de mudanças.

## 3. Backup e reversão

- [ ] Backup **pré-mudança** de PAM/NSS/SSH/Kerberos/SSSD/authselect/sudoers, preservando atributos e metadados.
- [ ] Validar GZIP/TAR, itens essenciais e permissões dos backups.
- [ ] Tratar keytab e chaves SSH como segredos; não inserir em Git, Wiki ou chamados abertos.
- [ ] Criar runbook de rollback **específico do host**, considerando links simbólicos do authselect, serviços dependentes, SELinux e objetos preexistentes do AD.
- [ ] Planejar ensaio de reversão em clone/laboratório isolado; documentar o que foi ou não executado.

## 4. Integração piloto por lote

- [ ] Iniciar por ambiente de menor risco e **um host por vez**; repetir validação antes de ampliar lote.
- [ ] Confirmar autorização do join e OU correta com equipe AD; registrar ação e evidência.
- [ ] Validar `realm list`, `adcli testjoin` e `sssctl domain-status`.
- [ ] Verificar SSSD online, `sssctl config-check` sem erros, `authselect check`, serviço `oddjobd`, keytab protegido e home conforme política.
- [ ] Configurar autorização SSH para **grupo AD dedicado**, sem depender de todos os usuários do domínio.
- [ ] Configurar sudo para **grupo AD ADM separado**; validar sintaxe `visudo -c`.
- [ ] Preservar root/local e console até conclusão de todos os testes.

## 5. Testes obrigatórios de autorização

- [ ] Login SSH com conta autorizada e grupo SSH correto.
- [ ] Tentativa SSH com conta fora do grupo negada; registrar logs.
- [ ] Usuário apenas no grupo SSH acessa normalmente **e não tem sudo**.
- [ ] Administrador membro dos grupos SSH + ADM consegue executar `sudo -l` e `sudo id`.
- [ ] Validar logs por usuário, horário, IP, sessão e operações sudo autorizadas/negadas.
- [ ] Testar comportamento do cache offline de forma **controlada** e documentar limitações da simulação; não desconectar produção sem janela autorizada.
- [ ] Testar retorno online e integridade de SSH/SSSD após contingência.
- [ ] Validar mecanismos de acesso de emergência independentemente do AD.

## 6. Segurança, auditoria e aceite

- [ ] Revisar `permitrootlogin`, autenticação por senha, chaves públicas, MFA, políticas de senha, negação e timeout — sem bloquear contas de recuperação.
- [ ] Revisar política corporativa de auditd/journald/rsyslog, centralização, retenção, alertas e capacidade.
- [ ] Aprovar regras persistentes de monitoramento de arquivos críticos; primeiro testar regras temporárias e volume de logs.
- [ ] Validar `auditctl -s` sem eventos perdidos; confirmar logs SSH, PAM, sudo.
- [ ] Criar backup **pós-mudança** íntegro, protegido e com rastreabilidade da alteração.
- [ ] Documentar resultados, responsáveis, exceções, riscos residuais e autorização de passagem para próximo host/lote.

## 7. Matriz de liberação por host

| Marco | Requisito de liberação |
|---|---|
| Inventário | Elegibilidade e dependências identificadas |
| Preparação | DNS, tempo, acesso local, backups, rollback aprovados |
| Join | Vínculo com OU correta, keytab íntegro e SSSD online |
| Autorização | SSH permitido/negado conforme grupo; sudo permitido/negado conforme ADM |
| Segurança | Auditoria básica e acesso de contingência funcionais |
| Conclusão | Evidências arquivadas, riscos aprovados e aceite formal |

## 8. Limites da PoC de referência

A PoC linux-poc01 demonstra viabilidade funcional, mas **não valida automaticamente** versões diferentes de Linux, comportamentos de aplicações específicas, indisponibilidade total de DCs/rede, rollback executado, conformidade da retenção de logs ou MFA. Cada host futuro exigirá avaliação e aceite próprios. **Nenhum outro host foi integrado por este checklist.**

---

[Voltar à integração Linux com Active Directory]({{ '/linux/seguranca/integracao-linux-active-directory.html' | relative_url }})
