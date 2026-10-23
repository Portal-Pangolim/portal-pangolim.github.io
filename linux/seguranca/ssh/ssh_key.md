---
layout: default
description: "Criação e uso de chaves SSH para autenticação, distribuição da chave pública e proteção da chave privada."
title: Autenticação com chaves SSH
---

# Configurar acesso SSH por chave pública no Rocky Linux
{:.no_toc}
<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Objetivo

Configurar acesso SSH usando uma chave **ED25519**, permitindo que um computador Windows acesse um servidor Rocky Linux sem precisar informar a senha.

### Ambiente utilizado

| Item           | Valor                        |
| -------------- | ---------------------------- |
| Cliente        | Windows                      |
| Servidor       | Rocky Linux                  |
| IP do servidor | `10.0.97.38`                 |
| Usuário        | `root`                       |
| Tipo de chave  | `ED25519`                    |
| Chave pública  | `/root/.ssh/authorized_keys` |

---

## 1. Verificar se existe uma chave no Windows

No PowerShell:

```powershell
Get-ChildItem C:\Users\$env:USERNAME\.ssh\
```

Procure pelos arquivos:

```text
id_ed25519
id_ed25519.pub
```

A chave pública está em:

```text
C:\Users\<usuario>\.ssh\id_ed25519.pub
```

Para visualizar:

```powershell
Get-Content C:\Users\$env:USERNAME\.ssh\id_ed25519.pub
```

Exemplo:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIo8Hh88LZI6zgWqUhyNKaq3F3msM0C4Hc9MT+28iEDM joaopedros111@gmail.com
```

> **Importante:** nunca compartilhe o arquivo `id_ed25519`. Ele é a chave privada.

---

## 2. Criar uma chave ED25519

Caso ainda não exista uma chave:

```powershell
ssh-keygen -t ed25519
```

Pressione `Enter` para aceitar o local padrão:

```text
C:\Users\<usuario>\.ssh\id_ed25519
```

Os arquivos criados serão:

```text
id_ed25519       # Chave privada
id_ed25519.pub   # Chave pública
```

É recomendado utilizar uma **passphrase** para proteger a chave privada.

---

## 3. Copiar a chave pública para o Rocky Linux

Caso o acesso por senha esteja funcionando, a chave pode ser copiada diretamente pelo PowerShell:

```powershell
Get-Content C:\Users\$env:USERNAME\.ssh\id_ed25519.pub | ssh root@10.0.97.38 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

No Rocky Linux, ajuste as permissões:

```bash
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
chown -R root:root /root/.ssh
```

Corrija também o contexto do SELinux:

```bash
restorecon -Rv /root/.ssh
```

---

## 4. Verificar a fingerprint da chave

No Windows:

```powershell
ssh-keygen -lf C:\Users\$env:USERNAME\.ssh\id_ed25519.pub
```

Exemplo:

```text
256 SHA256:d95eYD77DlTxXUznWeojkZgDecbWBGQzOfFQh6tMbQ0 joaopedros111@gmail.com (ED25519)
```

No Rocky Linux:

```bash
ssh-keygen -lf /root/.ssh/authorized_keys
```

A fingerprint deve ser a mesma:

```text
256 SHA256:d95eYD77DlTxUznWeojkZgDecbWBGQzOfFQh6tMbQ0
```

Isso confirma que a chave pública instalada no servidor corresponde à chave pública do cliente.

---

## 5. Verificar a configuração do SSH

No Rocky Linux:

```bash
sshd -T | grep -Ei 'pubkeyauthentication|authorizedkeysfile|permitrootlogin|authenticationmethods'
```

Para permitir autenticação por chave, deve existir:

```text
pubkeyauthentication yes
authorizedkeysfile .ssh/authorized_keys
```

Para permitir login de `root`:

```text
permitrootlogin yes
```

Ou, de forma mais segura:

```text
permitrootlogin prohibit-password
```

---

## 6. Verificar `AuthenticationMethods`

Um problema comum é encontrar:

```text
authenticationmethods password
```

Verifique:

```bash
sshd -T | grep '^authenticationmethods'
```

Se aparecer:

```text
authenticationmethods password
```

o servidor está **forçando autenticação por senha**.

Nesse caso, mesmo que:

```text
pubkeyauthentication yes
```

esteja configurado, o servidor continuará oferecendo somente:

```text
Authentications that can continue: password
```

### Localizar a configuração

```bash
grep -RniE 'AuthenticationMethods|PubkeyAuthentication|PermitRootLogin' \
/etc/ssh/sshd_config /etc/ssh/sshd_config.d/ 2>/dev/null
```

Exemplo:

```text
/etc/ssh/sshd_config.d/99-local.conf:2:PubkeyAuthentication yes
/etc/ssh/sshd_config.d/99-local.conf:3:AuthenticationMethods password
```

---

## 7. Remover a exigência de senha

Edite o arquivo:

```bash
vi /etc/ssh/sshd_config.d/99-local.conf
```

Remova:

```text
AuthenticationMethods password
```

Mantendo:

```text
PubkeyAuthentication yes
```

Também é possível remover diretamente:

```bash
sed -i '/^AuthenticationMethods password$/d' \
/etc/ssh/sshd_config.d/99-local.conf
```

---

## 8. Validar a configuração

Antes de recarregar o SSH:

```bash
sshd -t
```

Se não houver nenhuma saída, a configuração está válida.

Verifique novamente:

```bash
sshd -T | grep -Ei '^authenticationmethods|^pubkeyauthentication|^passwordauthentication'
```

O resultado esperado é semelhante a:

```text
pubkeyauthentication yes
passwordauthentication yes
```

Não deve existir:

```text
authenticationmethods password
```

---

## 9. Recarregar o SSH

Como estamos trabalhando remotamente, prefira `reload`:

```bash
systemctl reload sshd
```

Verifique:

```bash
systemctl status sshd --no-pager
```

> **Não feche a sessão SSH atual antes de testar uma nova conexão.**

---

## 10. Testar o acesso por chave

No PowerShell:

```powershell
ssh -o IdentitiesOnly=yes -i C:\Users\$env:USERNAME\.ssh\id_ed25519 root@10.0.97.38
```

Se estiver tudo correto, o acesso será realizado utilizando a chave privada.

---

## 11. Diagnóstico detalhado

Caso o SSH ainda solicite senha:

```powershell
ssh -vvv -o IdentitiesOnly=yes -i C:\Users\$env:USERNAME\.ssh\id_ed25519 root@10.0.97.38
```

Procure por:

```text
Offering public key
```

Quando a chave for aceita:

```text
Server accepts key
```

E finalmente:

```text
Authenticated to 10.0.97.38 using "publickey".
```

### Se aparecer:

```text
Authentications that can continue: password
```

verifique:

```bash
sshd -T | grep '^authenticationmethods'
```

---

## 12. Monitorar o log do SSH

No Rocky Linux:

```bash
journalctl -f -u sshd
```

Enquanto o comando estiver sendo executado, faça uma nova tentativa de conexão a partir do Windows.

Também é possível consultar os últimos eventos:

```bash
journalctl -u sshd --since "10 minutes ago"
```

Ou filtrar eventos de autenticação:

```bash
journalctl -u sshd | grep -Ei 'publickey|failed|accepted|authentication'
```

---

## 13. Verificar o SELinux

Verifique o status:

```bash
getenforce
```

Normalmente:

```text
Enforcing
```

Verifique os contextos:

```bash
ls -Zd /root /root/.ssh /root/.ssh/authorized_keys
```

Corrija os contextos, se necessário:

```bash
restorecon -Rv /root/.ssh
```

---

## 14. Verificar permissões

As permissões recomendadas são:

```bash
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
chown -R root:root /root/.ssh
```

Verifique:

```bash
ls -ld /root/.ssh
ls -l /root/.ssh/authorized_keys
```

Resultado esperado:

```text
drwx------ root root /root/.ssh
-rw------- root root /root/.ssh/authorized_keys
```

---

## 15. Configuração mais segura

Depois de confirmar que o acesso por chave funciona, é possível desabilitar o login de `root` por senha.

Exemplo:

```text
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
```

Outra opção é exigir explicitamente chave pública:

```text
AuthenticationMethods publickey
```

### Atenção

**Não desabilite a autenticação por senha antes de testar o acesso por chave em uma segunda sessão.**

Mantenha a sessão atual aberta e abra outro PowerShell:

```powershell
ssh -o IdentitiesOnly=yes -i C:\Users\$env:USERNAME\.ssh\id_ed25519 root@10.0.97.38
```

Somente depois que a segunda sessão funcionar feche a primeira.

---

## 16. Fluxo de diagnóstico

Quando o acesso SSH por chave não funcionar, verifique nesta ordem:

```text
1. A chave privada existe no cliente?
       ↓
2. A chave pública está no authorized_keys?
       ↓
3. As fingerprints são iguais?
       ↓
4. PubkeyAuthentication está habilitado?
       ↓
5. AuthenticationMethods está bloqueando publickey?
       ↓
6. As permissões de ~/.ssh estão corretas?
       ↓
7. O contexto SELinux está correto?
       ↓
8. O sshd está funcionando?
       ↓
9. O journal do sshd mostra a tentativa?
```

---

## 17. Comandos essenciais

### Windows

```powershell
ssh-keygen -lf C:\Users\$env:USERNAME\.ssh\id_ed25519.pub
```

```powershell
ssh -vvv -o IdentitiesOnly=yes -i C:\Users\$env:USERNAME\.ssh\id_ed25519 root@10.0.97.38
```

### Rocky Linux

```bash
ssh-keygen -lf /root/.ssh/authorized_keys
```

```bash
sshd -T | grep -Ei 'pubkeyauthentication|authorizedkeysfile|permitrootlogin|authenticationmethods'
```

```bash
sshd -t
```

```bash
journalctl -f -u sshd
```

```bash
restorecon -Rv /root/.ssh
```

```bash
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
```

---

## Resultado esperado

Ao final, o acesso deverá funcionar:

```powershell
ssh root@10.0.97.38
```

Ou especificando explicitamente a chave:

```powershell
ssh -i C:\Users\$env:USERNAME\.ssh\id_ed25519 root@10.0.97.38
```

No log do cliente deverá aparecer:

```text
Authenticated to 10.0.97.38 using "publickey".
```

> **Boa prática:** em ambientes de produção, prefira utilizar um usuário administrativo normal com `sudo` em vez de permitir login SSH direto como `root`.
