---
layout: default
description: "Conceitos e etapas do Nutanix Volumes: Volume Groups, vDisks, IQNs e descoberta de armazenamento iSCSI."
title: Configurando Volumes Nutanix
---

# Configurando Volumes Nutanix


## Sumário

1. [Introdução](#introducao)
2. [O que é Nutanix Volumes?](#o-que-e-nutanix-volumes)
3. [Conceitos principais](#conceitos-principais)
4. [Passos de configuração](#passos-de-configuracao)
5. [Requisitos importantes](#requisitos-importantes)
6. [Boas práticas](#boas-praticas)
7. [Resumo](#resumo)

---
<span id="introducao"></span>

## Introdução

Este guia reúne os principais conceitos e passos para configurar o Nutanix Volumes.

<span id="o-que-e-nutanix-volumes"></span>

## O que é Nutanix Volumes?

O **Nutanix Volumes** é uma solução de armazenamento em blocos fornecida por software, apresentada aos clientes por meio do protocolo **iSCSI**.

Ele pode atender:

- Máquinas virtuais;
- Servidores físicos;
- Hosts externos ao cluster.

## Conceitos principais

- **Volume Group (VG)**: conjunto de um ou mais discos virtuais.
- **vDisk**: disco virtual apresentado ao host.
- **IQN**: identificador iSCSI do iniciador ou destino.
- **iSCSI Data Services IP**: endereço virtual usado para descoberta.
- **Thin provisioning**: alocação de espaço conforme o consumo.

<span id="passos-de-configuracao"></span>

## Passos de configuração

1. Obter o IQN do iniciador iSCSI do cliente.
2. Criar o IP de Serviços de Dados iSCSI no Prism.
3. Criar um Volume Group.
4. Adicionar vDisks ao Volume Group.
5. Configurar lista de permissões para o VG.
6. Autorizar os IQNs dos clientes no VG.
7. Criar segredo se for usar CHAP.
8. Executar a descoberta do destino iSCSI no cliente.
9. Estabelecer a sessão iSCSI.

## Requisitos importantes

- As portas TCP 3260 e 3205 devem estar abertas.
- O iSCSI Data Services IP não pode ser igual ao IP virtual do cluster.
- O target deve ser descoberto pelo IP de Serviços de Dados.
- Evite conectar diretamente aos IPs das CVMs.

<span id="boas-praticas"></span>

## Boas práticas

- Mantenha a lista de permissões atualizada.
- Utilize CHAP quando necessário.
- Monitore a utilização de vDisks e o balanceamento.
- Verifique alertas no Prism após alterações.

## Resumo

- Nutanix Volumes é storage em bloco por iSCSI.
- Volume Groups agrupam vDisks.
- O iSCSI Data Services IP é o ponto de descoberta.
- Use permissões e segurança para proteger o acesso.
