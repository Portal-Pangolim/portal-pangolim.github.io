---
layout: default
validation: pending-lab
description: "Servidor NFS no Rocky Linux 9: exportações, root_squash e permissões de escrita por UID e GID."
title: Servidor NFS no Rocky Linux 9
---

> **Exemplo fictício:** nomes sob example.com e endereços reservados para documentação; adapte e valide em laboratório antes do uso. Estes endereços não são destinos para testes na Internet.


# Servidor NFS no Rocky Linux 9
{:.no_toc}

> Tutorial para instalação e configuração de um servidor NFS no Rocky Linux 9.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Objetivo

Ao final deste tutorial o servidor será capaz de compartilhar um diretório via NFS para clientes Linux e Windows.

Neste guia será configurado:

- Servidor Rocky Linux
- Compartilhamento `/dados`
- Rede `192.0.2.0/24`
- Permissão de leitura e escrita para os clientes

> A configuração dos clientes será apresentada em tutoriais separados.

---

## Cenário

| Equipamento | IP |
|------------|------------|
| Servidor NFS | `192.0.2.16` |
| Rede permitida | `192.0.2.0/24` |
| Diretório compartilhado | `/dados` |

---

## Instalar o servidor NFS

Atualize o sistema:

```bash
dnf update -y
```

Instale o servidor NFS:

```bash
dnf install -y nfs-utils
```

---

## Habilitar os serviços

Habilite os serviços para iniciarem junto com o sistema:

```bash
systemctl enable --now rpcbind
systemctl enable --now nfs-server
```

Verifique:

```bash
systemctl status nfs-server
```

Resultado esperado:

```text
Active: active (running)
```

---

## Criar o diretório compartilhado

Crie o diretório que será exportado:

```bash
mkdir -p /dados
```

### Identidades e autorização de escrita

`rw` na exportação permite tentar escrever; as permissões do sistema de arquivos ainda precisam autorizar a identidade remota. Com `sec=sys`, confira os UID/GID numéricos nos dois hosts usando `id USUARIO` e `ls -ldn /dados`. Nomes iguais não garantem identidades iguais. Restrinja os clientes da exportação; em redes não confiáveis, avalie Kerberos e proteção de transporte.

Mantenha `root_squash`: root remoto é remapeado e não deve obter privilégios de escrita. Para um **diretório novo de laboratório**, escolha um grupo dedicado, com GID livre e consistente nos dois hosts. Crie o grupo, associe o usuário autorizado e renove sua sessão antes de testar. Substituindo o grupo pelo nome escolhido, no servidor:

```bash
chgrp equipe_nfs /dados
chmod 2770 /dados
ls -ldn /dados
```

O bit setgid preserva o grupo em novos arquivos. A umask e as ACLs ainda determinam a escrita compartilhada: defina a política e confira os arquivos criados. Se precisar de ACLs, use permissões de acesso e padrão para o grupo específico e valide com `getfacl`. Arquivos existentes mantêm suas permissões; revise-os individualmente. Não aplique mudanças recursivas a dados de produção.

Execute os testes de escrita no cliente como o usuário autorizado, não como root. Confirme criação, leitura e remoção conforme a política; teste também a negação para um usuário sem o grupo e para root remoto. Investigue SELinux e seus logs se as identidades e permissões estiverem corretas. Não use `chmod 777` nem desative `root_squash` para contornar uma negação.

**Laboratório pendente:** nenhuma permissão real foi alterada nesta revisão. Os arquivos de exemplo abaixo são criados por root no servidor; não demonstram escrita pelos clientes e podem precisar de permissões próprias para colaboração.

---

## Criar arquivos de teste

```bash
echo "Arquivo 1" > /dados/arquivo1.txt
echo "Arquivo 2" > /dados/arquivo2.txt
```

Verifique:

```bash
ls -l /dados
```

Resultado esperado:

```text
arquivo1.txt
arquivo2.txt
```

---

## Configurar o compartilhamento

Edite o arquivo:

```bash
vim /etc/exports
```

Adicione:

```text
/dados 192.0.2.0/24(rw,sync,root_squash,no_subtree_check)
```

Descrição das opções:

| Opção | Descrição |
|--------|-----------|
| rw | Leitura e escrita |
| sync | Escrita síncrona |
| no_subtree_check | Desabilita verificação de subtree |

---

## Exportar o compartilhamento

Execute:

```bash
exportfs -rav
```

Saída esperada:

```text
exporting 192.0.2.0/24:/dados
```

---

## Verificar os compartilhamentos

```bash
exportfs -v
```

Exemplo:

```text
/dados 192.0.2.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
```

---

## Configurar o Firewall

Permita o serviço NFS:

```bash
firewall-cmd --permanent --add-service=nfs
firewall-cmd --permanent --add-service=mountd
firewall-cmd --permanent --add-service=rpc-bind

firewall-cmd --reload
```

Verifique:

```bash
firewall-cmd --list-services
```

Deve conter:

```text
nfs
mountd
rpc-bind
```

---

## Configurar SELinux

Caso o SELinux esteja habilitado:

Verifique:

```bash
getenforce
```

Caso esteja em **Enforcing**, execute:

```bash
setsebool -P nfs_export_all_rw on
```

---

## Verificar os serviços

```bash
systemctl status rpcbind
systemctl status nfs-server
```

Todos devem estar:

```text
active (running)
```

---

## Verificar portas abertas

```bash
ss -tulpn | grep rpc
```

ou

```bash
rpcinfo -p
```

Exemplo:

```text
100003    4   tcp   2049  nfs
100005    3   tcp  20048  mountd
```

---

## Testar localmente

Liste os compartilhamentos do próprio servidor:

```bash
showmount -e localhost
```

Resultado esperado:

```text
Export list for localhost:
/dados 192.0.2.0/24
```

Também é possível consultar utilizando o IP do servidor:

```bash
showmount -e 192.0.2.16
```

---

## Estrutura criada

```text
Servidor Rocky Linux
        │
        ├── nfs-utils
        ├── rpcbind
        ├── nfs-server
        │
        └── /dados
              ├── arquivo1.txt
              └── arquivo2.txt
```

---

## Comandos úteis

Listar compartilhamentos:

```bash
exportfs -v
```

Reexportar configurações:

```bash
exportfs -rav
```

Parar o serviço:

```bash
systemctl stop nfs-server
```

Iniciar o serviço:

```bash
systemctl start nfs-server
```

Reiniciar:

```bash
systemctl restart nfs-server
```

Verificar compartilhamentos ativos:

```bash
showmount -e localhost
```

Verificar portas RPC:

```bash
rpcinfo -p
```

---

## Arquivos importantes

| Arquivo | Finalidade |
|----------|------------|
| `/etc/exports` | Compartilhamentos NFS |
| `/etc/nfs.conf` | Configuração do servidor NFS |

---

## Próximos passos

Após concluir este tutorial, prossiga para:

1. Configuração do cliente NFS no Rocky Linux
2. Configuração do cliente NFS no Windows
3. Testes de leitura, escrita e permissões
4. Estudo de UID/GID, `root_squash`, `anonuid`, `anongid` e Identity Mapping
