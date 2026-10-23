---
layout: default
description: "Arquitetura hiperconvergente: integração de computação e armazenamento distribuído em um cluster Nutanix."
title: Arquitetura hiperconvergente
---

# Arquitetura hiperconvergente
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Infraestrutura tradicional

Em uma arquitetura tradicional, é comum encontrar componentes separados:

```text
Servidores
    ↓
Rede de armazenamento
    ↓
Storage centralizado
```

Também podem existir ferramentas distintas para:

- Virtualização;
- Armazenamento;
- Rede;
- Monitoramento;
- Proteção de dados.

Essa separação pode aumentar a complexidade operacional.

## Infraestrutura hiperconvergente

Na HCI, cada nó contribui com processamento, memória e armazenamento.

```text
Cluster HCI
├── Nó 1: compute + storage
├── Nó 2: compute + storage
└── Nó 3: compute + storage
```

O software distribui os dados e serviços entre os nós.

## Arquitetura distribuída

Um ambiente Nutanix não depende de uma única controladora de storage central. As CVMs dos nós trabalham em conjunto.

```text
CVM 1 ←→ CVM 2 ←→ CVM 3
```

Essa abordagem oferece:

- Escalabilidade horizontal;
- Distribuição de carga;
- Tolerância a falhas;
- Administração centralizada;
- Expansão por adição de nós.

## Escalabilidade horizontal

Quando o ambiente precisa de mais recursos, novos nós podem ser adicionados ao cluster.

```text
Cluster inicial
├── Nó 1
├── Nó 2
└── Nó 3

Expansão
├── Nó 1
├── Nó 2
├── Nó 3
└── Nó 4
```

Dependendo da plataforma e da configuração, a expansão pode aumentar:

- CPU;
- Memória;
- Capacidade de armazenamento;
- Desempenho agregado.

## Separação lógica das camadas

Apesar da integração, as funções continuam distintas:

| Camada | Responsabilidade |
|---|---|
| Hardware | CPU, memória, discos e rede |
| Hipervisor | Execução das máquinas virtuais |
| AOS | Armazenamento e serviços distribuídos |
| Prism | Gerenciamento |
| Serviços de dados | Files, Volumes, Objects e outros |

## Benefícios operacionais

A arquitetura hiperconvergente busca simplificar:

- Implantação;
- Crescimento do ambiente;
- Monitoramento;
- Atualizações;
- Recuperação após falhas;
- Administração diária.

## Ponto de atenção

Hiperconvergência não elimina a necessidade de planejamento. O ambiente ainda depende de:

- Capacidade adequada;
- Rede bem dimensionada;
- DNS e NTP confiáveis;
- Políticas de resiliência;
- Monitoramento;
- Procedimentos de backup e recuperação.

## Resumo

```text
Tradicional:
servidor → SAN → storage

Hiperconvergente:
nós com compute e storage → serviços distribuídos
```
