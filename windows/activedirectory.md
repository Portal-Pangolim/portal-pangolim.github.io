---
layout: default
description: "Consulta de usuários e grupos no Active Directory com exemplos de administração em PowerShell."
title: Active Directory
---

# Active Directory - Comandos Úteis para Suporte e Infraestrutura
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Verificar informações de um usuário

```powershell
Get-ADUser usuario.exemplo
```

Exibir propriedades adicionais:

```powershell
Get-ADUser usuario.exemplo -Properties *
```

Exibir nome, e-mail e departamento:

```powershell
Get-ADUser usuario.exemplo -Properties mail,department |
Select Name,SamAccountName,Mail,Department
```

---

## Verificar grupos de um usuário

```powershell
Get-ADPrincipalGroupMembership usuario.exemplo
```

Somente os nomes:

```powershell
Get-ADPrincipalGroupMembership usuario.exemplo |
Select Name
```

Ordenado:

```powershell
Get-ADPrincipalGroupMembership usuario.exemplo |
Sort Name |
Select Name
```

---

## Verificar membros de um grupo

```powershell
Get-ADGroupMember "GrupoAcessoPadrao"
```

Exibir apenas logins:

```powershell
Get-ADGroupMember "GrupoAcessoPadrao" |
Select SamAccountName
```

Procurar usuário dentro do grupo:

```powershell
Get-ADGroupMember "GrupoAcessoPadrao" |
Where-Object {$_.SamAccountName -eq "usuario.exemplo"}
```

---

## Adicionar usuário a um grupo

```powershell
Add-ADGroupMember `
-Identity "GrupoAcessoPadrao" `
-Members "usuario.exemplo"
```

---

## Remover usuário de um grupo

```powershell
Remove-ADGroupMember `
-Identity "GrupoAcessoPadrao" `
-Members "usuario.exemplo"
```

Sem confirmação:

```powershell
Remove-ADGroupMember `
-Identity "GrupoAcessoPadrao" `
-Members "usuario.exemplo" `
-Confirm:$false
```

---

## Verificar se usuário está bloqueado

```powershell
Get-ADUser usuario.exemplo -Properties LockedOut |
Select Name,LockedOut
```

---

## Desbloquear usuário

```powershell
Unlock-ADAccount usuario.exemplo
```

---

## Verificar data da última troca de senha

```powershell
Get-ADUser usuario.exemplo -Properties PasswordLastSet |
Select Name,PasswordLastSet
```

---

## Forçar troca de senha no próximo logon

```powershell
Set-ADUser `
-Identity "usuario.exemplo" `
-ChangePasswordAtLogon $true
```

---

## Redefinir senha

```powershell
Set-ADAccountPassword `
-Identity "usuario.exemplo" `
-Reset `
-NewPassword (ConvertTo-SecureString "SENHA_FORTE_DE_EXEMPLO" -AsPlainText -Force)
```

---

## Verificar computadores no domínio

```powershell
Get-ADComputer -Filter *
```

Listar somente nomes:

```powershell
Get-ADComputer -Filter * |
Select Name
```

---

## Procurar computador específico

```powershell
Get-ADComputer -Identity PC-EXEMPLO-01
```

---

## Verificar informações do computador

```powershell
Get-ADComputer PC-EXEMPLO-01 -Properties *
```

---

## Pesquisar usuário por nome

```powershell
Get-ADUser -Filter 'Name -like "*Usuario*"'
```

---

## Pesquisar computador por nome

```powershell
Get-ADComputer -Filter 'Name -like "*PC-EXEMPLO*"'
```

---

## Descobrir em qual OU está o usuário

```powershell
Get-ADUser usuario.exemplo |
Select DistinguishedName
```

Exemplo:

```text
CN=Usuario Exemplo,
OU=Colaboradores,
OU=Usuarios,
OU=Matriz,
DC=corp,
DC=example,
DC=com
```

---

## Verificar usuário logado na máquina local

```cmd
whoami
```

---

## Verificar grupos recebidos no logon

```cmd
whoami /groups
```

Filtrar por Proxy:

```cmd
whoami /groups | findstr /i Proxy
```

---

## Atualizar tickets Kerberos

Visualizar:

```cmd
klist
```

Limpar:

```cmd
klist purge
```

---

## Verificar informações do domínio

```cmd
systeminfo | findstr /B /C:"Domínio"
```

---

## Verificar controladores de domínio

```cmd
nltest /dclist:corp.example.com
```

---

## Verificar conectividade com o AD

```cmd
nltest /dsgetdc:corp.example.com
```

---

## Verificar replicação do AD (Admins)

```cmd
repadmin /replsummary
```

---

## Comandos RSAT

Verificar se o módulo AD está carregado:

```powershell
Get-Module ActiveDirectory
```

Importar:

```powershell
Import-Module ActiveDirectory
```
