---
layout: default
description: "Etapas para expandir armazenamento LVM e sistema de arquivos, com verificação dos volumes e do espaço disponível."
title: LVM
---

# LVM
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Como criar e montar um novo volume LVM

Este procedimento cria um novo volume LVM utilizando um disco já conectado ao servidor.

> Atenção: os comandos deste tutorial consideram que `/dev/sdb` é um disco novo e sem dados. Confirme o dispositivo antes de executar comandos que alteram discos.

## Pré-requisitos

- Disco conectado ao servidor
- Acesso como `root` ou permissão para usar `sudo`
- Pacotes `lvm2` instalados

Instale o pacote, caso necessário:

```bash
dnf install -y lvm2
```

## Identificar o disco

```bash
lsblk
```

```text
NAME   SIZE TYPE MOUNTPOINTS
sda     20G disk
└─sda1  20G part /
sdb     10G disk
```

Confirme que o disco escolhido não possui partições ou dados que devam ser preservados.

---

## Criar o Physical Volume (PV)

```bash
pvcreate /dev/sdb
```

Verificar:

```bash
pvs
```

---

## Criar o Volume Group (VG)

```bash
vgcreate dados-vg /dev/sdb
```

Verificar:

```bash
vgs
```

O grupo `dados-vg` deve aparecer com aproximadamente o tamanho disponível em `/dev/sdb`.
---

## Criar o Logical Volume (LV)

Para criar um volume de 5 GiB:

```bash
lvcreate -L 5G -n dados-lv dados-vg
```

Para utilizar todo o espaço livre do grupo, use:

```bash
lvcreate -l 100%FREE -n dados-lv dados-vg
```

Verificar:

```bash
lvs
```
---

## Criar o filesystem

Escolha apenas um dos filesystems abaixo.

XFS:

```bash
mkfs.xfs /dev/dados-vg/dados-lv
```

ou EXT4:

```bash
mkfs.ext4 /dev/dados-vg/dados-lv
```

---

## Criar o ponto de montagem

```bash
mkdir -p /dados
```

---

## Montar o volume

```bash
mount /dev/dados-vg/dados-lv /dados
```

Validar:

```bash
df -h
```

Também é possível confirmar o volume montado com:

```bash
findmnt /dados
```
---

## Configurar montagem automática

Obter o UUID:

```bash
blkid
```

Editar:

```bash
vi /etc/fstab
```

Adicionar:

```text
UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx /dados xfs defaults 0 0
```

Se tiver escolhido EXT4, substitua `xfs` por `ext4`.

Testar:

```bash
mount -a
```

---

## Validar o resultado

Verifique o espaço disponível e o filesystem:

```bash
df -hT /dados
lsblk -f
```

O volume deve aparecer montado em `/dados` com o filesystem escolhido.

## Estrutura criada

```text
Disco (/dev/sdb)
   ↓
PV
   ↓
VG (dados-vg)
   ↓
LV (dados-lv)
   ↓
Filesystem (XFS)
   ↓
/dados
```

---

## Resumo

```bash
lsblk

pvcreate /dev/sdb
vgcreate dados-vg /dev/sdb

lvcreate -L 5G -n dados-lv dados-vg

mkfs.xfs /dev/dados-vg/dados-lv

mkdir -p /dados

mount /dev/dados-vg/dados-lv /dados

findmnt /dados

blkid /dev/dados-vg/dados-lv

mount -a
```
