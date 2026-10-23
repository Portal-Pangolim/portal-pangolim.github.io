---
layout: default
description: "Perguntas e respostas para revisar Nutanix Volumes, Volume Groups, vDisks e acesso iSCSI."
title: Questionário Volumes Nutanix
---

# Questionário Volumes Nutanix


## Sumário

1. [Introdução](#introducao)
2. [Perguntas](#perguntas)
3. [Gabarito rápido](#gabarito-rapido)
4. [Revisão](#revisao)

---
<span id="introducao"></span>

## Introdução

Este questionário ajuda a revisar conceitos importantes sobre Nutanix Volumes, iSCSI e Volume Groups.

## Perguntas

1. Qual protocolo o Nutanix Volumes utiliza para apresentar discos a hosts externos?
2. O que é um Volume Group?
3. O que é um vDisk?
4. Qual endereço virtual é usado para descoberta iSCSI no Nutanix?
5. Quais portas TCP devem estar liberadas para iSCSI?
6. O que significa thin provisioning?
7. Por que não se deve acessar IPs das CVMs diretamente?
8. Qual é a função do IQN?
9. É possível usar Nutanix Volumes em clusters com VMware ESXi?
10. O que é CHAP e por que ele é usado?

<span id="gabarito-rapido"></span>

## Gabarito rápido

1. iSCSI.
2. Um conjunto de um ou mais discos virtuais apresentados como armazenamento.
3. Um disco virtual utilizado por uma VM ou servidor.
4. iSCSI Data Services IP.
5. TCP 3260 e TCP 3205.
6. Alocação de espaço conforme o consumo.
7. Porque o cluster usa um IP virtual de descoberta e redirecionamento, não sessões diretas por IP de CVM.
8. Identificar iniciadores e destinos iSCSI.
9. Sim.
10. Um protocolo de autenticação iSCSI usado para proteger conexões.

<span id="revisao"></span>

## Revisão

- Lembre-se de separar Volume Group de vDisk.
- Use o IP de Serviços de Dados iSCSI para descoberta.
- Não misture acesso direto às CVMs com a operação normal dos Volumes.
- O CHAP aumenta a segurança das sessões iSCSI.
