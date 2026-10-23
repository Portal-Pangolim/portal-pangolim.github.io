---
layout: default
description: "Funções de AHV, AOS e CVM e como esses componentes trabalham juntos no cluster Nutanix."
title: AHV, AOS e CVM
---

# AHV, AOS e CVM
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## AHV

O **AHV** é o hipervisor nativo da Nutanix.

Ele é responsável por executar e administrar máquinas virtuais.

```text
Hardware físico
      ↓
AHV
      ↓
Máquinas virtuais
```

Entre suas responsabilidades estão:

- CPU virtual;
- Memória virtual;
- Interfaces de rede virtuais;
- Inicialização e desligamento de VMs;
- Migração de VMs;
- Alta disponibilidade;
- Conexão dos discos virtuais ao armazenamento.

## AOS

O **AOS** fornece os principais serviços distribuídos de armazenamento e dados da plataforma Nutanix.

Entre suas funções estão:

- Gerenciamento de dados e metadados;
- Replicação;
- Proteção contra falhas;
- Distribuição de dados;
- Eficiência de armazenamento;
- Reconstrução após falhas;
- Integração com o hipervisor.

## CVM

A **Controller Virtual Machine**, ou CVM, é uma máquina virtual especial presente nos nós do cluster.

```text
Nó físico
├── AHV
│   ├── VM de aplicação
│   ├── VM de banco de dados
│   └── CVM
└── Discos locais
```

A CVM executa serviços essenciais do AOS.

## Comunicação entre CVMs

As CVMs trabalham de forma distribuída:

```text
CVM 1 ←→ CVM 2 ←→ CVM 3
```

Isso permite que o cluster distribua:

- Operações de entrada e saída;
- Metadados;
- Replicação;
- Reconstrução;
- Monitoramento.

## Não confunda

| Componente | Função |
|---|---|
| AHV | Virtualização |
| AOS | Armazenamento e serviços de dados |
| CVM | VM especial que executa serviços Nutanix |
| Prism | Gerenciamento |

## Cuidados com a CVM

A CVM não deve ser tratada como uma VM comum.

Evite:

- Desligá-la sem procedimento;
- Alterar seus recursos arbitrariamente;
- Modificar sua configuração manualmente;
- Executar comandos destrutivos sem validação;
- Usá-la para aplicações comuns.

## Fluxo simplificado

```text
VM
 ↓
AHV
 ↓
CVM
 ↓
AOS
 ↓
Discos do cluster
```

## Resumo

```text
AHV = executa VMs
AOS = fornece armazenamento distribuído
CVM = executa os serviços Nutanix no nó
```
