---
layout: default
validation: pending-lab
description: "Configuração de cliente NFS no Rocky Linux 9, montagem persistente e verificação de acesso por identidade."
title: Cliente NFS no Rocky Linux 9
---

> **Exemplo fictício:** nomes sob example.com e endereços reservados para documentação; adapte e valide em laboratório antes do uso. Estes endereços não são destinos para testes na Internet.


# Cliente NFS no Rocky Linux 9
{:.no_toc}

> Tutorial para instalação e configuração de um cliente NFS no Rocky Linux 9.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Objetivo

Ao final deste tutorial, o cliente Rocky Linux será capaz de acessar um compartilhamento NFS exportado por um servidor Rocky Linux.

Neste guia será configurado:

- Cliente Rocky Linux
- Montagem manual do compartilhamento
- Montagem automática utilizando `/etc/fstab`
- Testes de leitura e escrita

> Este tutorial pressupõe que o servidor NFS já esteja configurado.

---

## Cenário

| Equipamento | IP |
|------------|------------|
| Servidor NFS | `192.0.2.16` |
| Cliente Rocky Linux | `192.0.2.24` |
| Compartilhamento | `/dados` |
| Ponto de montagem | `/mnt/dados` |

---

## Verificar conectividade

Antes de iniciar, confirme que o cliente consegue acessar o servidor.

```bash
ping -c 4 192.0.2.16
```

Teste também a porta do NFS:

```bash
nc -zv 192.0.2.16 2049
```

Caso o `nc` não esteja instalado:

```bash
dnf install -y nmap-ncat
```

---

## Instalar o cliente NFS

Instale os utilitários do NFS:

```bash
dnf install -y nfs-utils
```

---

## Verificar os compartilhamentos disponíveis

Liste os compartilhamentos exportados pelo servidor:

```bash
showmount -e 192.0.2.16
```

Resultado esperado:

```text
Export list for 192.0.2.16:
/dados 192.0.2.0/24
```

Caso apareça:

```text
clnt_create: RPC: Unable to receive
```

Verifique:

- Firewall
- Serviço `nfs-server`
- Serviço `rpcbind`
- Conectividade de rede

---

## Criar o ponto de montagem

```bash
mkdir -p /mnt/dados
```

---

## Montar o compartilhamento

```bash
mount -t nfs 192.0.2.16:/dados /mnt/dados
```

Também é possível montar explicitando a versão:

```bash
mount -t nfs -o vers=4.2 192.0.2.16:/dados /mnt/dados
```

---

## Confirmar a montagem

```bash
mount | grep dados
```

Exemplo:

```text
192.0.2.16:/dados on /mnt/dados type nfs4 (...)
```

Ou:

```bash
df -h
```

Resultado esperado:

```text
Filesystem             Size  Used Avail Mounted on
192.0.2.16:/dados       XXG   XXG   XXG /mnt/dados
```

---

## Verificar o conteúdo

```bash
ls -la /mnt/dados
```

Exemplo:

```text
arquivo1.txt
arquivo2.txt
```

Visualize um arquivo:

```bash
cat /mnt/dados/arquivo1.txt
```

Resultado esperado:

```text
Arquivo 1
```

---

## Testar leitura

```bash
cat /mnt/dados/arquivo2.txt
```

Resultado esperado:

```text
Arquivo 2
```

---

## Testar escrita

Crie um arquivo:

```bash
echo "Teste NFS" > /mnt/dados/teste-nfs.txt
```

Verifique:

```bash
ls -l /mnt/dados
```

Leia o conteúdo:

```bash
cat /mnt/dados/teste-nfs.txt
```

---

## Verificar informações da montagem

```bash
nfsstat -m
```

Exemplo:

```text
/mnt/dados from 192.0.2.16:/dados
 Flags: rw,vers=4.2,...
```

---

## Desmontar o compartilhamento

```bash
umount /mnt/dados
```

Confirme:

```bash
mount | grep dados
```

Não deverá retornar nenhum resultado.

---

## Configurar montagem automática

Edite:

```bash
vim /etc/fstab
```

Adicione:

```text
192.0.2.16:/dados    /mnt/dados    nfs    defaults,_netdev    0 0
```

Descrição:

| Opção | Descrição |
|--------|-----------|
| defaults | Opções padrão |
| _netdev | Aguarda a rede antes da montagem |

---

## Testar o arquivo fstab

Sem reiniciar:

```bash
mount -a
```

Caso não haja erros:

```bash
mount | grep dados
```

---

## Reiniciar o cliente

Após reiniciar:

```bash
reboot
```

Confirme:

```bash
df -h
```

O compartilhamento deverá estar montado automaticamente.

---

## Comandos úteis

Ver compartilhamentos disponíveis:

```bash
showmount -e 192.0.2.16
```

Montar:

```bash
mount -t nfs 192.0.2.16:/dados /mnt/dados
```

Desmontar:

```bash
umount /mnt/dados
```

Ver montagens:

```bash
mount | grep nfs
```

Ver estatísticas:

```bash
nfsstat -m
```

---

## Solução de problemas

### Compartilhamento não aparece

Verifique:

```bash
showmount -e 192.0.2.16
```

---

### Erro:

```text
RPC: Unable to receive
```

Verifique:

```bash
systemctl status nfs-server
systemctl status rpcbind
```

No servidor.

Também confira o firewall:

```bash
firewall-cmd --list-services
```

---

### Erro:

```text
Permission denied
```

Verifique:

- Permissões do diretório exportado
- Configuração do `/etc/exports`
- UID/GID do usuário
- `root_squash`
- `anonuid`
- `anongid`

---

### Confirmar exportações do servidor

```bash
showmount -e 192.0.2.16
```

---

## Estrutura final

```text
Servidor Rocky
192.0.2.16
        │
        │
        ▼
Compartilhamento NFS
        │
        ▼
Cliente Rocky
192.0.2.24
        │
        ▼
/mnt/dados
```

---

## Próximos passos

Após concluir este tutorial, prossiga para:

1. Cliente NFS no Windows
2. Permissões POSIX
3. UID/GID
4. root_squash
5. anonuid e anongid
6. Identity Mapping
7. NFSv3 x NFSv4


## Escrita e mapeamento de identidade

`rw` não substitui as permissões do servidor. Confira UID/GID numéricos, associação a grupos, umask e ACLs antes de prometer escrita. Execute os exemplos de criação de arquivos como a identidade autorizada; root remoto continua sujeito a `root_squash`. No Windows, confirme os recursos disponíveis na edição instalada e o mapeamento de identidade do cliente NFS; a identidade anônima não equivale automaticamente ao usuário autorizado. Não habilite `no_root_squash` como solução genérica.

Consulte [identidades e autorização no servidor](servidor-nfs-rocky-linux-9.html#identidades-e-autorização-de-escrita). Testes de aceitação e negação em clientes Linux e Windows permanecem pendentes de laboratório.
