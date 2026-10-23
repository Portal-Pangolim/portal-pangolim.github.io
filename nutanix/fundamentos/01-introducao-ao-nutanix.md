---
layout: default
description: "Introdução ao Nutanix: hiperconvergência, componentes da plataforma e organização da trilha de fundamentos."
title: Introdução ao Nutanix
---

# Introdução ao Nutanix
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Visão geral

Nutanix é uma plataforma de infraestrutura hiperconvergente, conhecida como **HCI** (*Hyperconverged Infrastructure*). Ela reúne computação, armazenamento, virtualização e gerenciamento em uma arquitetura distribuída.

Em vez de depender de servidores, storages e ferramentas totalmente separados, um ambiente Nutanix utiliza vários nós trabalhando em conjunto como um cluster.

```text
Cluster Nutanix
├── Nó 1: CPU + memória + discos
├── Nó 2: CPU + memória + discos
└── Nó 3: CPU + memória + discos
```

## Nó e cluster

Um **nó** é um servidor físico individual.

Um **cluster** é um conjunto de nós que compartilham recursos e trabalham como uma única plataforma.

Cada nó normalmente possui:

- Processadores;
- Memória RAM;
- Discos SSD, NVMe ou HDD;
- Interfaces de rede;
- Um hipervisor;
- Uma Controller Virtual Machine, ou CVM.

## Principais componentes

| Componente | Função |
|---|---|
| AHV | Hipervisor nativo da Nutanix |
| AOS | Serviços distribuídos de armazenamento e dados |
| CVM | Máquina virtual que executa os serviços Nutanix |
| Prism Element | Administração de um cluster |
| Prism Central | Administração centralizada de múltiplos clusters e serviços |
| Nutanix Files | Serviço distribuído de arquivos SMB e NFS |
| Nutanix Volumes | Serviço de armazenamento em bloco |
| Nutanix Objects | Serviço de armazenamento de objetos |
| Data Lens | Visibilidade, segurança e governança de dados não estruturados |

## Exemplo de uso

Uma empresa pode executar no mesmo cluster:

```text
Cluster Nutanix
├── Servidores Windows
├── Servidores Linux
├── Bancos de dados
├── Aplicações corporativas
├── Nutanix Files
└── Serviços de proteção e análise de dados
```

## Relação com o Data Lens

Para compreender o Data Lens, é importante conhecer o caminho dos dados:

```text
Usuário ou aplicação
        ↓
SMB ou NFS
        ↓
Nutanix Files
        ↓
AOS e armazenamento do cluster
        ↓
Eventos e metadados analisados pelo Data Lens
```

## Resumo

- Nutanix é uma plataforma de infraestrutura hiperconvergente.
- O cluster é formado por vários nós.
- O AHV executa máquinas virtuais.
- O AOS fornece armazenamento distribuído.
- O Prism administra a plataforma.
- O Files fornece compartilhamentos SMB e exports NFS.
