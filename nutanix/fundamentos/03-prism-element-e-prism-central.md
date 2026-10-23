---
layout: default
description: "Diferenças entre Prism Element e Prism Central e suas funções no gerenciamento de ambientes Nutanix."
title: Prism Element e Prism Central
---

# Prism Element e Prism Central
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## O que é o Prism?

O Prism é a interface de gerenciamento da plataforma Nutanix.

Por meio dele, o administrador acompanha:

- Saúde do cluster;
- Hosts;
- Máquinas virtuais;
- Armazenamento;
- Redes;
- Alertas;
- Eventos;
- Tarefas;
- Capacidade;
- Desempenho.

## Prism Element

O **Prism Element**, ou PE, administra um cluster específico.

```text
Prism Element
      │
      └── Cluster A
```

Atividades comuns:

- Verificar a saúde dos hosts;
- Consultar CPU e memória;
- Administrar VMs;
- Conferir storage pools e containers;
- Visualizar alertas locais;
- Acompanhar tarefas;
- Consultar métricas de desempenho.

## Prism Central

O **Prism Central**, ou PC, oferece uma visão centralizada de um ou vários clusters.

```text
                 Prism Central
                /             \
         Cluster A           Cluster B
       Prism Element       Prism Element
```

Atividades comuns:

- Acompanhar vários clusters;
- Administrar recursos centralizados;
- Aplicar políticas;
- Pesquisar VMs e entidades;
- Acessar serviços Nutanix;
- Consolidar alertas e capacidade;
- Utilizar automação e governança.

## Comparação

| Característica | Prism Element | Prism Central |
|---|---|---|
| Escopo | Um cluster | Um ou vários clusters |
| Foco | Operação local | Gestão centralizada |
| Uso comum | Hosts, VMs e storage local | Políticas, serviços e visão global |
| Abreviação | PE | PC |

## Navegação inicial

Ao acessar o Prism, verifique primeiro:

1. Estado geral do cluster;
2. Alertas críticos;
3. Tarefas em andamento;
4. Capacidade disponível;
5. Utilização de CPU e memória;
6. Latência de armazenamento;
7. Estado dos hosts e CVMs.

## Alertas e tarefas

Um **alerta** indica uma condição que merece atenção.

Uma **tarefa** registra uma operação executada ou em andamento.

Exemplos:

```text
Alerta:
Host sem comunicação

Tarefa:
Criação de máquina virtual
```

## Boas práticas

- Não ignore alertas recorrentes.
- Leia a causa e o impacto antes de agir.
- Confirme se existe manutenção em andamento.
- Registre alterações importantes.
- Evite executar várias mudanças simultâneas sem necessidade.
- Consulte a saúde do cluster antes e depois de uma manutenção.

## Resumo

```text
Prism Element = administração de um cluster
Prism Central = administração centralizada
```
