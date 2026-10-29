---
layout: default
title: "Linux com AD — Plano de rollback da PoC"
description: "Salvaguardas e roteiro de recuperação da PoC; rollback real não executado nem homologado."
validation: pending-lab
---

# PoC Linux–AD — Plano de rollback controlado do linux-poc01

> **Edição pública anonimizada:** esta documentação se refere à PoC de um único host. Nomes de hosts, domínio, contas, grupos, OUs e caminhos de backup identificáveis foram substituídos por exemplos genéricos; IPs e fingerprint operacional foram omitidos. Esses valores não são evidências reais nem devem ser usados para validar um servidor. As evidências originais devem permanecer em armazenamento restrito. Os resultados e as pendências da PoC foram preservados.

**Host:** `linux-poc01.ad.example.com` — Rocky Linux 9.8<br>
**Status:** **procedimento de referência, NÃO EXECUTADO / NÃO HOMOLOGADO NA PRÁTICA**<br>
**Aplicação:** exclusivamente mediante incidente, autorização, janela de mudança e responsável designado. Não executar sequencialmente como um script.

## 1. Premissas de segurança

- Possuir **acesso root funcional pela console Nutanix**, testado no momento da intervenção; conservar segunda sessão root ativa.
- Confirmar um meio de acesso local independente do AD, registrar responsável e plano de comunicação.
- Preservar a VM/estado da PoC, serviço SSH, conectividade e configuração do host até que cada etapa tenha sido validada.
- Não executar `tar -xzf ... -C /` de maneira indiscriminada; isso restauraria **chaves SSH antigas duplicadas**, poderia sobrescrever mudanças e danificar links gerenciados pelo authselect.
- Não copiar `/etc/krb5.keytab` ou chaves privadas para documentação; backups contêm segredos, devem permanecer `root:root`, permissões restritas.
- Não remover pacotes nem executar `realm leave --remove` de maneira automática. Objeto do computador no AD é preexistente e deve ser preservado.
- O rollback **não desfaz automaticamente** as permissões e associações feitas diretamente no AD; essas mudanças requerem processo próprio da equipe AD.

## 2. Pontos de recuperação já existentes

**Pré-PoC**: `/root/backup-pre-poc-ad-<DATA-HORA-PRE>/configuracoes-autenticacao.tar.gz` (41 KB aprox.; GZIP íntegro). Contém PAM/NSS/SSH/Kerberos originais. **Não reutilizar chaves SSH desse arquivo.**

**Pós-PoC homologada**: `/root/backup-poc-ad-homologada-<DATA-HORA-POS>/configuracoes.tar.gz` (32 KB aprox.; GZIP e TAR íntegros). Inclui SSSD, keytab, SSH atual, PAM, NSS, authselect e sudoers. Preservar offline e com proteção adequada.

**Backups auxiliares conhecidos**: `/root/sssd.conf.pre-restricao-ad`, `/root/sssd.conf.pre-nome-curto`, `/root/90-linux-ad.pre-grupo-adm`, `/root/backup-ssh-hostkeys-<DATA-HORA-CHAVES>` (verificar presença e pertinência antes de uso).

## 3. Particularidades que impedem restauração genérica

| Caminho | Pré-PoC | Pós-PoC |
|---|---|---|
| `/etc/pam.d/system-auth` e `password-auth` | arquivos regulares, `pam_unix` | links para `/etc/authselect/` com `pam_unix` e `pam_sss` |
| `/etc/pam.d/fingerprint-auth`, `smartcard-auth`, `postlogin` | arquivos regulares | links para `/etc/authselect/` |
| `/etc/nsswitch.conf` | arquivo regular; `passwd: sss files systemd`, `group: sss files systemd` | link para authselect; `passwd: files sss systemd` |
| `authselect` | arquivos de configuração presentes; **perfil ativo não identificado** | perfil `sssd` com `with-mkhomedir` |
| `/etc/ssh/ssh_host_*` | chaves clonadas identificadas | chaves únicas regeneradas — **preservar** |

**Atenção:** restaurar conteúdo sobre links simbólicos pode alterar o alvo em `/etc/authselect/` e não o arquivo pretendido. Alterações de PAM/NSS podem bloquear logins. Exigem revisão e validação por etapa via console.

## 4. Pré-checagens (somente leitura)

Executar com sessão root existente; confirmar manualmente. Nos exemplos de caminhos abaixo, substitua `<DATA-HORA-PRE>` e `<DATA-HORA-POS>` pelos diretórios reais obtidos no registro restrito antes de executar:

```bash
hostname -f
who
realm list
authselect current
authselect check
sssctl config-check
sshd -t
visudo -c
systemctl is-active sshd sssd oddjobd
ls -l /etc/pam.d/{system-auth,password-auth,postlogin} /etc/nsswitch.conf
ls -lh '/root/backup-pre-poc-ad-<DATA-HORA-PRE>/configuracoes-autenticacao.tar.gz'
ls -lh '/root/backup-poc-ad-homologada-<DATA-HORA-POS>/configuracoes.tar.gz'
```

Validar `gzip -t` e `tar -tzf` nos dois arquivos. Registrar fingerprint SSH atual e inventariar arquivos de configuração modificados desde o backup. Não interromper o SSH ou rede.

## 5. Roteiro de reversão a ser detalhado na mudança aprovada

**Etapa A — Preparação e evidências**: console Nutanix acessível; conta root local autenticando; snapshot consistente/aprovado da VM (se permitido); backups protegidos e verificados; acesso administrativo alternativo; plano de recuperação testado no clone. Registrar estado de `authselect`, PAM/NSS, SSH, SSSD, keytab e sudo antes de alterações.

**Etapa B — Restaurar autenticação local com segurança**: revisar arquivos regulares originais do backup e os atuais links simbólicos. Definir procedimento explícito para retirar o gerenciamento `authselect` **sem sobrescrever alvos de links** e recuperar seletivamente os cinco arquivos PAM e o `nsswitch.conf`, respeitando conteúdos, permissões e contexto SELinux, após verificação técnica. Não aplicar `authselect select minimal --force` como substituto não verificado da configuração original. Validar login root em **nova** sessão de console antes de prosseguir.

**Etapa C — Desativar autorizações da PoC**: retirar a regra `/etc/sudoers.d/90-linux-ad` e o `ad_access_filter` apenas no momento apropriado, mediante backup e testes. Confirmar `visudo -c`; não deixar políticas inconsistentes. Avaliar se há serviços dependentes do NSS/SSSD antes de desativá-lo.

**Etapa D — Tratar vínculo com AD**: somente após recuperação local comprovada e anuência da equipe AD, avaliar `realm leave` **sem `--remove`** para desvincular o host mantendo o objeto do computador; confirmar o efeito real no AD e o eventual keytab local. Não apagar/mover o objeto histórico do computador nem modificar outras máquinas. Não presumir que o comando restaurará PAM/NSS original: são operações distintas.

**Etapa E — Validação pós-reversão**: `sshd -t`, teste SSH root local em **nova conexão** se habilitado pela política, login de console root, `getent passwd root`, `visudo -c`, `authselect check` somente se o authselect permanecer em uso, estado dos serviços necessários, logs PAM/SSH e conectividade de rede. Comparar com comportamento pré-PoC. Manter console e sessão administrativa até aprovação expressa.

**Etapa F — Retorno ao estado homologado, se a reversão falhar**: parar mudanças, avaliar recuperação por snapshot/console e restauração **seletiva** do backup pós-PoC (incluindo keytab e configuração SSSD, preservando chaves SSH atuais). Não restaurar arquivos sobre links sem tratar tipos e targets; revalidar join, `sssctl`, login, sudo e SSH. Acionar equipe AD se o vínculo de máquina tiver mudado.

## 6. Critérios de sucesso e limites

- Login root local preservado e testado em nova sessão.
- PAM/NSS funcional, sem dependência indevida do AD para contas locais.
- SSH operacional com fingerprint ED25519 atual conferido no registro restrito (valor omitido na edição pública), sem restaurar chave clonada.
- Sudoers íntegro; eventuais autorizações AD removidas somente após isolamento planejado.
- Estado do objeto no AD conhecido e preservado; logs da mudança disponíveis.

**Homologação do rollback:** **pendente**. Este documento descreve salvaguardas e ordem de execução, mas deliberadamente **não fornece um bloco de comandos destrutivos pronto para colar**. Um runbook executável deve ser aprovado após ensaio em clone isolado e validação das dependências reais do host.

---

[Voltar à integração Linux com Active Directory]({{ '/linux/seguranca/integracao-linux-active-directory.html' | relative_url }})
