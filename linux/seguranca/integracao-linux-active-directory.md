---
layout: default
title: Integração Linux com Active Directory
description: Procedimento de ingresso de host Rocky Linux no Active Directory com Realmd, SSSD e Kerberos.
---

# Integração de servidor Linux ao Active Directory

> **Objetivo:** ingressar um servidor Linux compatível no Active Directory (AD), habilitar resolução de identidades e autenticação de usuários do domínio, preservar o acesso administrativo local e validar a relação de confiança. Este guia **não** contempla criação de grupos, criação/movimentação de objetos, delegação de permissões ou configuração de políticas no AD, nem a definição de regras de autorização SSH e sudo por grupos.
> **Edição pública anonimizada:** esta documentação se refere à PoC de um único host. Nomes de hosts, domínio, contas, grupos, OUs e caminhos de backup identificáveis foram substituídos por exemplos genéricos; IPs e fingerprint operacional foram omitidos. Esses valores não são evidências reais nem devem ser usados para validar um servidor. As evidências originais devem permanecer em armazenamento restrito. Os resultados e as pendências da PoC foram preservados.

## Documentação complementar da PoC

A homologação funcional abrange somente o host da PoC, identificado nesta edição como `linux-poc01`. O rollback real **não foi executado nem homologado**. A integração dos demais servidores é uma etapa futura separada.

- [Relatório de homologação]({{ '/linux/seguranca/integracao-linux-active-directory/relatorio-homologacao.html' | relative_url }}) — resultados aprovados, limites e pendências para produção.
- [Plano de rollback]({{ '/linux/seguranca/integracao-linux-active-directory/procedimento-rollback.html' | relative_url }}) — referência de recuperação **não executada / não homologada na prática**.
- [Checklist de expansão futura]({{ '/linux/seguranca/integracao-linux-active-directory/checklist-expansao.html' | relative_url }}) — planejamento; **nenhum outro servidor foi integrado por este checklist**.

## 1. Escopo e cenário utilizado

O procedimento foi validado em uma prova de conceito (PoC) com **Rocky Linux 9.8**, utilizando **Realmd + SSSD + Adcli + Kerberos**.

| Parâmetro | Exemplo da PoC |
| --- | --- |
| Sistema operacional | Rocky Linux 9.8 |
| Host | `linux-poc01` |
| FQDN | `linux-poc01.ad.example.com` |
| Domínio DNS | `ad.example.com` |
| Realm Kerberos | `AD.EXAMPLE.COM` |
| Conta de ingresso | `svc-join-linux` |
| Acesso de contingência | `root` local e console da VM |

> **Adaptação:** substitua os nomes e o domínio pelos valores de seu ambiente. O objeto do computador e as permissões da conta de ingresso **devem estar previamente preparados e autorizados pela equipe responsável pelo AD**. Este documento não ensina a fazer essa preparação.

## 2. Pré-requisitos

Antes de modificar o servidor, confirme:

- Acesso administrativo (`root` ou `sudo`) e **console da VM** disponível para recuperação.
- Uma segunda sessão SSH aberta, sem encerrar a sessão atual durante a mudança.
- Hostname/FQDN definitivo e resolução DNS interna correta.
- Horário sincronizado com a infraestrutura do domínio (NTP/chrony).
- Comunicação com os controladores de domínio, especialmente DNS (53), Kerberos (88), LDAP (389), SMB (445), troca de senha Kerberos (464) e catálogo global (3268), conforme a arquitetura adotada. Verifique também UDP/TCP e outros serviços aplicáveis às políticas locais.
- Conta autorizada a ingressar **este** computador no domínio; quando o objeto já existe, confirmar permissão de reutilização e redefinição de sua senha.
- Janela de mudança e plano de reversão acordados.

### 2.1. Inventário inicial

Execute como `root`:

```bash
hostnamectl
cat /etc/os-release
timedatectl
ip -br addr
cat /etc/resolv.conf
```

Verifique a resolução do host e do domínio:

```bash
getent hosts linux-poc01.ad.example.com
getent hosts ad.example.com
# Caso o comando dig esteja instalado:
dig +short SRV _ldap._tcp.ad.example.com
dig +short SRV _kerberos._tcp.ad.example.com
```

> Em ambientes com NetworkManager, não altere diretamente `/etc/resolv.conf` sem antes identificar quem gerencia o DNS.

### 2.2. Estado atual de autenticação

```bash
realm list
authselect current
systemctl is-active sssd
sshd -t && echo 'SSH: sintaxe OK'
sshd -T | grep -Ei '^(usepam|permitrootlogin|passwordauthentication|pubkeyauthentication) '
getent passwd root
```

Um `realm list` vazio e SSSD inativo são esperados em um host ainda não integrado. Registre qualquer integração anterior antes de continuar.

### 2.3. Conectividade

Confirme a resolução dos DCs e teste conectividade de rede sem modificar políticas:

```bash
getent hosts dc01.ad.example.com
# Exemplo de teste TCP para um DC conhecido (requer bash):
for porta in 88 389 445 464 3268; do
  timeout 3 bash -c "</dev/tcp/dc01.ad.example.com/$porta" \
    && echo "TCP $porta: OK" \
    || echo "TCP $porta: falhou"
done
```

O teste TCP não substitui a validação de DNS, UDP, Kerberos ou LDAP. Não prossiga com problemas de DNS ou sincronização de horário.

## 3. Backup preventivo

**Faça backup antes de instalar/configurar a integração.** Uma cópia dos arquivos locais permite comparar alterações e apoiar recuperação. Evite restauração indiscriminada de PAM/SSSD em um sistema em uso.

```bash
BACKUP="/root/backup-pre-ad-$(date +%Y%m%d-%H%M%S)"
mkdir -m 700 -p "$BACKUP"

tar -czf "$BACKUP/configuracoes-autenticacao.tar.gz" \
  -C / \
  etc/pam.d \
  etc/nsswitch.conf \
  etc/ssh \
  etc/sudoers \
  etc/sudoers.d \
  etc/krb5.conf \
  etc/security \
  etc/authselect \
  etc/sssd 2>"$BACKUP/avisos-tar.log"

chmod 600 "$BACKUP/configuracoes-autenticacao.tar.gz"
gzip -t "$BACKUP/configuracoes-autenticacao.tar.gz" && echo 'Backup íntegro'
tar -tzf "$BACKUP/configuracoes-autenticacao.tar.gz" | head -n 25
cat "$BACKUP/avisos-tar.log"
```

> Se o `tar` retornar falha por caminho inexistente, ajuste os caminhos ao estado real do host e refaça o backup; **não** interprete um arquivo parcial como backup completo. Preserve o diretório sob `/root` com acesso restrito. Se um sistema de backup corporativo existir, confirme também a possibilidade de restauração da VM.

## 4. Instalar as dependências

Em Rocky Linux 9 / RHEL 9 compatíveis:

```bash
dnf install -y \
  realmd \
  sssd \
  sssd-tools \
  adcli \
  oddjob \
  oddjob-mkhomedir \
  krb5-workstation \
  samba-common-tools
```

Confirme:

```bash
rpm -q realmd sssd sssd-tools adcli oddjob oddjob-mkhomedir krb5-workstation samba-common-tools
```

A instalação pode atualizar dependências do sistema. Revise a transação do `dnf` antes de executá-la em produção.

## 5. Descobrir o domínio e testar Kerberos

```bash
realm discover ad.example.com
realm list
```

Antes do ingresso, `realm discover` deve identificar Active Directory e SSSD, enquanto `realm list` normalmente permanece vazio.

Teste a autenticação da conta de ingresso **sem incluir a senha no comando**:

```bash
kinit svc-join-linux@AD.EXAMPLE.COM
klist
```

O `kinit` solicita a senha no terminal. Um ticket válido demonstra que as credenciais foram aceitas, **não** que a conta possui autorização para ingressar ou reutilizar a conta de computador no AD. Não salve nem compartilhe senhas em documentação ou logs.

## 6. Ingressar o servidor no AD

Garanta que:

1. O hostname está correto.
2. O objeto de computador existente, se houver, está liberado para uso.
3. A conta de ingresso tem as permissões necessárias.
4. Uma sessão `root` e a console da VM continuam disponíveis.

Para um ingresso comum, em que a localização do objeto é tratada pela equipe de AD:

```bash
realm join --verbose \
  --user=svc-join-linux \
  ad.example.com
```

Se a equipe de AD **informar expressamente** a OU em que o computador deve ser localizado e a conta tiver as permissões correspondentes, pode-se indicar `--computer-ou`:

```bash
realm join --verbose \
  --user=svc-join-linux \
  --computer-ou='OU=Linux,OU=Laboratorio,DC=ad,DC=example,DC=com' \
  ad.example.com
```

> A opção `--computer-ou` é **opcional** e o DN acima é exclusivo do cenário exemplificado. Ela não concede permissões nem substitui autorização prévia. O ingresso pode redefinir a senha da conta de computador existente no AD: não reutilize um objeto ainda ativo em outro equipamento.

Durante o ingresso, o Realmd/Adcli normalmente:

- Define uma senha para a **conta de computador**, distinta da senha do usuário de ingresso.
- Cria `/etc/krb5.keytab` com as chaves Kerberos do host.
- Gera a configuração do SSSD e integra PAM/NSS via `authselect`.
- Habilita serviços necessários à autenticação.

**Resultado esperado:** `Successfully enrolled machine in realm`.

### 6.1. Possíveis erros

| Mensagem | Interpretação / ação |
| --- | --- |
| `Cannot set computer password: Access denied` | Conta de ingresso sem permissão para redefinir a senha do objeto de computador existente. Solicitar correção à equipe AD; não repetir indefinidamente. |
| `Insufficient permissions to join the domain` | Revisar autorização/delegação da conta e estado do objeto. |
| Falha de descoberta do domínio | Revisar DNS, SRV, conectividade e horário. |
| Aviso ao atualizar tipos de criptografia do objeto | Pode ser falta de permissão em atributo do AD; mesmo com ingresso concluído, validar o keytab e a relação de confiança. Não habilitar algoritmos antigos indiscriminadamente. |

**Importante:** uma falha no `realm join` pode ocorrer antes ou depois de alterações locais ou no AD. Inspecione o estado antes de tentar de novo ou reverter.

## 7. Validação pós-ingresso

### 7.1. Domínio e serviços

```bash
realm list
systemctl is-active sssd
systemctl is-active oddjobd
sssctl domain-status ad.example.com
sssctl config-check
authselect current
authselect check
sshd -t && echo 'SSH: sintaxe OK'
```

Verifique se o domínio aparece como `configured: kerberos-member`, SSSD/oddjobd estão ativos e os validadores não retornam erros.

### 7.2. Keytab e relação de confiança

```bash
klist -kte /etc/krb5.keytab
adcli testjoin -v
echo "Código do testjoin: $?"
```

O `adcli testjoin` deve terminar com sucesso e código `0`. Na PoC, o keytab apresentou chaves AES128/AES256, e o teste de relacionamento com o AD foi bem-sucedido.

> Proteja o `/etc/krb5.keytab`: ele contém credenciais do **computador**. Não anexe o arquivo ao portal, não cole seu conteúdo em chamados e não conceda acesso indiscriminado.

### 7.3. Resolução de usuários e grupos

Use uma conta **de teste aprovada**:

```bash
id 'usuario.teste@ad.example.com'
getent passwd 'usuario.teste@ad.example.com'
sssctl user-checks -a acct -s sshd 'usuario.teste@ad.example.com'
```

O comando `id` deve apresentar UID/GID, e `getent` deve retornar a identidade. `pam_acct_mgmt: Success` indica aprovação na fase de **autorização de conta**, mas **não** comprova senha correta nem login SSH completo.

### 7.4. Testar login SSH real

Em uma **nova sessão** do cliente:

```bash
ssh -l 'usuario.teste@ad.example.com' linux-poc01.ad.example.com
```

Dentro da sessão:

```bash
whoami
id
pwd
ls -ld "$HOME"
```

O home pode ser criado automaticamente quando o perfil `authselect` habilita `with-mkhomedir` e `oddjobd` está ativo. Se o SSH alertar sobre **chave de host conhecida em vários servidores**, interrompa e investigue duplicação de chaves (comum em clones de VM); valide o fingerprint antes de aceitar a conexão.

### 7.5. Preservação da conta local

```bash
id root
getent passwd root
sssctl user-checks -a acct -s sshd root
```

Um aviso do SSSD de que não encontra `root` em sua base não significa falha se o PAM autorizar a conta local. **Confirme também um novo login real pela console ou por SSH**, conforme a política de segurança, antes de encerrar as sessões de contingência.

## 8. Login pelo nome curto (opcional)

Por padrão, o ambiente da PoC inicialmente exigia nomes completos, como `usuario.teste@ad.example.com`. Para permitir apenas `usuario.teste`, é possível utilizar, no bloco `[domain/ad.example.com]` de `/etc/sssd/sssd.conf`:

```ini
use_fully_qualified_names = False
```

**Antes de alterar:** verificar colisões com nomes locais e outros domínios, salvar backup e avaliar impacto sobre aplicações, regras sudo e filtros que dependam da apresentação dos nomes. Mantenha o acesso de contingência.

Após editar e validar a configuração:

```bash
chmod 600 /etc/sssd/sssd.conf
sssctl config-check
systemctl restart sssd
systemctl is-active sssd
id usuario.teste
sssctl user-checks -a acct -s sshd usuario.teste
```

Teste em **nova conexão**:

```bash
ssh usuario.teste@linux-poc01.ad.example.com
```

> No cenário validado, a identidade passou a aparecer como `usuario.admin`, mantendo o UID e o home já existente. O nome curto é opcional, não uma exigência para ingressar no AD.

## 9. Problemas frequentes e diagnóstico

| Sintoma | Verificações iniciais |
| --- | --- |
| `sssctl: command not found` | Instalar/verificar pacote `sssd-tools`. |
| `realm list` vazio após a tentativa | O join pode não ter sido concluído; consultar logs e saída do comando. |
| SSSD inativo | `systemctl status sssd`, `journalctl -u sssd -b`, `sssctl config-check`. |
| Usuário do AD não é resolvido | `sssctl domain-status`, `id`, DNS, conectividade e logs do SSSD. |
| Autorização PAM negada | Verificar políticas de acesso do SSSD/AD; não assumir senha inválida. |
| `adcli testjoin` falha | Conferir chave do computador, conectividade com DC e relação de confiança; não apagar keytab sem diagnóstico. |
| SSH não autentica apesar de `id` funcionar | Verificar `sshd -t`, `sshd -T`, PAM, logs de SSH e políticas de autorização. |
| Chave SSH apresentada também em outros hosts | Investigar possíveis clones com host keys duplicadas; planejar rotação sem interromper automações. |

Consultas úteis:

```bash
journalctl -u sssd -b --no-pager | tail -n 100
journalctl -u sshd -b --no-pager | tail -n 100
sssctl domain-status ad.example.com
sssctl config-check
```

Evite publicar logs que revelem dados pessoais, detalhes internos desnecessários ou materiais de autenticação.

## 10. Recuperação e rollback

**Não execute rollback automaticamente.** A ação depende de quanto o ingresso avançou.

1. **Falha antes do ingresso:** verificar se `realm list` permanece vazio, SSSD não foi configurado e `/etc/krb5.keytab` não foi criado. Corrigir a causa antes de uma nova tentativa.
2. **Falha após alterações no host:** manter console e root local; analisar `realm list`, `authselect current`, `sssctl config-check`, serviços e logs. Comparar com o backup.
3. **Saída planejada do domínio:** `realm leave ad.example.com` pode remover configuração local e, dependendo de permissões/opções, afetar registro no AD. Executar somente com autorização, entendendo o efeito no ambiente, e validar posteriormente.
4. **Restauração local:** recuperar **somente** arquivos necessários do backup validado, com procedimento específico para PAM/SSH/SSSD e teste pela console. Não sobrescrever todos os arquivos de autenticação de forma indiscriminada.
5. **Nunca apagar** `/var/lib/sss/db/`, keytab ou objetos no AD como primeira medida de diagnóstico.

## 11. Checklist de aceite do ingresso

- [ ] DNS, horário e conectividade com DCs confirmados.
- [ ] Backup de autenticação criado e validado.
- [ ] Conta de ingresso autorizada para o computador.
- [ ] `realm join` concluído sem erro impeditivo.
- [ ] `realm list` indica participação no domínio.
- [ ] SSSD e oddjobd ativos; `authselect check` válido.
- [ ] `/etc/krb5.keytab` presente e protegido.
- [ ] `adcli testjoin` executado com sucesso.
- [ ] Usuário do AD resolvido por `id`/`getent`.
- [ ] Login SSH real testado com usuário autorizado.
- [ ] Home do usuário validado, se aplicável.
- [ ] Login local de contingência testado.
- [ ] Chave SSH exclusiva do host verificada.
- [ ] Logs revisados e evidências registradas sem senhas.

## 12. Limites deste guia

O ingresso no AD **não configura automaticamente uma política completa de autorização**. A gestão de grupos de acesso, separação entre SSH e sudo, GPOs, regras de acesso, MFA e controles de auditoria será abordada em documentação específica. Também ficam fora deste procedimento os servidores legados incompatíveis com SSSD/Realmd e os testes de autenticação offline, que exigem planejamento e critérios próprios.

---

**Referência de validação:** PoC (identificadores anonimizados), `linux-poc01.ad.example.com`, Rocky Linux 9.8, 29/10/2026. O ingresso e a confiança Kerberos foram confirmados por `realm list` e `adcli testjoin`; a autenticação SSH pelo AD, o home automático e a preservação do login root local foram testados. As etapas de autorização por grupos e sudo realizadas na PoC não fazem parte deste guia introdutório.
