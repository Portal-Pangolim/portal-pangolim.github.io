---
layout: default
description: "Relação entre storage pool, container e vDisk na organização do armazenamento Nutanix."
title: Storage Pool, Container e vDisk
---

# Storage Pool, Container e vDisk
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Visão geral

O armazenamento Nutanix é organizado em camadas lógicas.

```text
Discos físicos
      ↓
Storage Pool
      ↓
Storage Container
      ↓
vDisk
      ↓
Sistema operacional da VM
```

## Storage Pool

Um **storage pool** agrupa a capacidade física dos dispositivos de armazenamento do cluster.

```text
Storage Pool
├── Discos do nó 1
├── Discos do nó 2
└── Discos do nó 3
```

Ele representa a capacidade agregada disponível para o AOS.

## Storage Container

Um **storage container** é uma divisão lógica criada sobre o storage pool.

```text
Storage Pool
├── Container-Produção
├── Container-Testes
└── Container-Arquivos
```

O container pode possuir configurações e políticas próprias.

Ele não representa necessariamente um grupo físico separado de discos.

## vDisk

Um **vDisk** é um disco virtual associado a uma máquina virtual.

```text
VM: servidor-app
├── vDisk 1: sistema operacional
└── vDisk 2: dados
```

Dentro do sistema operacional, o vDisk aparece como um disco comum.

Exemplos:

```text
Windows:
C:\
D:\

Linux:
/dev/sda
/dev/sdb
```

## Comparação

| Objeto | Representa |
|---|---|
| Disco físico | Dispositivo instalado no nó |
| Storage Pool | Capacidade física agregada |
| Storage Container | Organização lógica da capacidade |
| vDisk | Disco virtual utilizado pela VM |

## Exemplo completo

```text
Discos NVMe e SSD dos nós
          ↓
Storage Pool 01
          ↓
Container-Produção
          ↓
vDisk de 500 GB
          ↓
VM de aplicação
```

## Capacidade lógica e física

Um vDisk pode ter um tamanho lógico definido, mas seu consumo físico depende de fatores como:

- Dados realmente gravados;
- Replicação;
- Snapshots;
- Compressão;
- Deduplicação, quando aplicável;
- Erasure coding, quando aplicável;
- Metadados;
- Reserva operacional.

## Boas práticas

- Acompanhe o crescimento dos containers.
- Não avalie capacidade apenas pelo tamanho nominal dos vDisks.
- Considere snapshots e políticas de proteção.
- Mantenha espaço livre operacional.
- Investigue crescimento inesperado.
- Evite criar containers sem necessidade administrativa.

## Resumo

```text
Pool = capacidade física agregada
Container = organização lógica
vDisk = disco virtual de uma VM
```
