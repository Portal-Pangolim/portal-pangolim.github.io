---
layout: default
validation: pending-lab
description: "Configuração e diagnóstico do cliente NFS no Windows 10 e 11, com atenção ao mapeamento de identidade."
title: Cliente NFS no Windows 10/11
---

> **Exemplo fictício:** nomes sob example.com e endereços reservados para documentação; adapte e valide em laboratório antes do uso. Estes endereços não são destinos para testes na Internet.


# Cliente NFS no Windows 10/11
{:.no_toc}

> Tutorial para instalação e configuração de um cliente NFS no Windows 10 e Windows 11.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Objetivo

Ao final deste tutorial, o Windows será capaz de acessar um compartilhamento NFS exportado por um servidor Rocky Linux.

Neste guia será configurado:

- Cliente NFS do Windows
- Montagem manual do compartilhamento
- Testes de leitura e escrita
- Desmontagem do compartilhamento

> Este tutorial pressupõe que o servidor NFS já esteja configurado.

---

## Cenário

| Equipamento | IP |
|------------|------------|
| Servidor NFS | `192.0.2.16` |
| Cliente Windows | `192.0.2.57` |
| Compartilhamento | `/dados` |
| Unidade de rede | `Z:` |

---

## Pré-requisitos

- Windows 10 Pro, Enterprise ou Education
- Windows 11 Pro, Enterprise ou Education
- Acesso administrativo ao computador
- Conectividade com o servidor NFS

---

## Verificar conectividade

Abra o PowerShell e teste a comunicação com o servidor:

```powershell
Test-NetConnection 192.0.2.16 -Port 2049
```

Resultado esperado:

```text
TcpTestSucceeded : True
```

---

## Instalar o Cliente NFS

Abra o **PowerShell como Administrador**.

Instale o recurso:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName ServicesForNFS-ClientOnly -All
```

Também é possível instalar pela interface gráfica:

1. Painel de Controle
2. Programas e Recursos
3. Ativar ou desativar recursos do Windows
4. Marque **Serviços para NFS**
5. Clique em **OK**

---

## Reiniciar o Windows

Após a instalação, reinicie o computador.

---

## Confirmar a instalação

No PowerShell:

```powershell
Get-WindowsOptionalFeature -Online -FeatureName ServicesForNFS-ClientOnly
```

Resultado esperado:

```text
State : Enabled
```

---

## Verificar o serviço

```powershell
Get-Service NfsClnt
```

Resultado esperado:

```text
Status : Running
```

Caso esteja parado:

```powershell
Start-Service NfsClnt
```

---

## Montar o compartilhamento

Abra um PowerShell (não precisa ser administrador).

Monte o compartilhamento:

```powershell
mount.exe -o anon \\192.0.2.16\dados Z:
```

Resultado esperado:

```text
Z: agora está conectado a \\\192.0.2.16\dados

O comando foi concluído com êxito.
```

---

## Confirmar a montagem

```powershell
Get-PSDrive Z
```

Exemplo:

```text
Name Used (GB) Free (GB) Provider
---- --------- --------- --------
Z      ...       ...     FileSystem
```

Também é possível listar o conteúdo:

```powershell
Get-ChildItem Z:\
```

Resultado esperado:

```text
arquivo1.txt
arquivo2.txt
```

---

## Ler arquivos

Visualizar um arquivo:

```powershell
Get-Content Z:\arquivo1.txt
```

Resultado esperado:

```text
Arquivo 1
```

---

## Criar um arquivo

```powershell
"Arquivo criado pelo Windows" | Out-File Z:\windows.txt
```

Depois confira:

```powershell
Get-Content Z:\windows.txt
```

> Caso ocorra **Access Denied**, verifique as permissões configuradas no servidor NFS.

---

## Criar um diretório

```powershell
New-Item Z:\NovaPasta -ItemType Directory
```

---

## Remover um arquivo

```powershell
Remove-Item Z:\windows.txt
```

---

## Desmontar o compartilhamento

```powershell
umount.exe Z:
```

Resultado esperado:

```text
Desconectando Z:
```

Confirme:

```powershell
Get-PSDrive Z
```

Não deverá retornar nenhuma unidade.

---

## Comandos úteis

Montar:

```powershell
mount.exe -o anon \\\192.0.2.16\dados Z:
```

Desmontar:

```powershell
umount.exe Z:
```

Verificar unidade:

```powershell
Get-PSDrive Z
```

Listar arquivos:

```powershell
Get-ChildItem Z:\
```

Ler arquivo:

```powershell
Get-Content Z:\arquivo1.txt
```

---

## Solução de problemas

### A porta do NFS não responde

```powershell
Test-NetConnection 192.0.2.16 -Port 2049
```

Se retornar:

```text
TcpTestSucceeded : False
```

Verifique:

- Firewall do servidor
- Serviço `nfs-server`
- Conectividade de rede

---

### Erro:

```text
mount.exe não é reconhecido
```

Verifique se o recurso **Serviços para NFS** está instalado:

```powershell
Get-WindowsOptionalFeature -Online -FeatureName ServicesForNFS-ClientOnly
```

---

### Erro:

```text
Client for NFS não inicia
```

Confira:

```powershell
Get-Service NfsClnt
```

Se necessário:

```powershell
Start-Service NfsClnt
```

Caso continue falhando, reinicie o Windows.

---

### Erro:

```text
Access is denied
```

Verifique no servidor:

- Permissões do diretório exportado
- UID/GID
- `root_squash`
- `anonuid`
- `anongid`

---

### Unidade Z: não existe

Monte novamente:

```powershell
mount.exe -o anon \\\192.0.2.16\dados Z:
```

---

## Estrutura final

```text
Servidor Rocky Linux
192.0.2.16
        │
        │ NFS
        ▼
Windows 10/11
        │
        ▼
Unidade Z:
```

---

## Próximos passos

Após concluir este tutorial, recomenda-se estudar:

1. Permissões POSIX
2. UID e GID
3. `root_squash`
4. `no_root_squash`
5. `anonuid`
6. `anongid`
7. Identity Mapping
8. NFSv3 x NFSv4
9. Segurança em ambientes NFS


## Escrita e mapeamento de identidade

`rw` não substitui as permissões do servidor. Confira UID/GID numéricos, associação a grupos, umask e ACLs antes de prometer escrita. Execute os exemplos de criação de arquivos como a identidade autorizada; root remoto continua sujeito a `root_squash`. No Windows, confirme os recursos disponíveis na edição instalada e o mapeamento de identidade do cliente NFS; a identidade anônima não equivale automaticamente ao usuário autorizado. Não habilite `no_root_squash` como solução genérica.

Consulte [identidades e autorização no servidor](servidor-nfs-rocky-linux-9.html#identidades-e-autorização-de-escrita). Testes de aceitação e negação em clientes Linux e Windows permanecem pendentes de laboratório.
