---
layout: default
description: "Resiliência no Nutanix: fatores de replicação RF2 e RF3, tolerância a falhas e localidade dos dados."
title: Resiliência, RF2, RF3 e localidade
---

# Resiliência, RF2, RF3 e localidade
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Resiliência de dados

O cluster Nutanix protege os dados mantendo cópias ou utilizando outros mecanismos de resiliência, conforme a configuração.

Dois termos comuns são:

- RF2;
- RF3.

## RF2

No **RF2**, os dados são mantidos com duas cópias.

```text
Bloco de dados
├── Cópia A
└── Cópia B
```

O objetivo é permitir tolerância a uma falha compatível com o desenho do cluster e sua política de proteção.

## RF3

No **RF3**, os dados são mantidos com três cópias.

```text
Bloco de dados
├── Cópia A
├── Cópia B
└── Cópia C
```

RF3 oferece um nível maior de proteção, porém consome mais capacidade.

## Capacidade

Uma conta simplificada ajuda a entender o impacto:

```text
10 TB de dados com RF2
≈ 20 TB antes de eficiências e overheads

10 TB de dados com RF3
≈ 30 TB antes de eficiências e overheads
```

O consumo real pode variar por causa de:

- Compressão;
- Snapshots;
- Metadados;
- Erasure coding;
- Reserva operacional;
- Dados temporários;
- Políticas diferentes.

## Localidade dos dados

A **localidade dos dados** busca manter os dados próximos da VM que os utiliza.

```text
Nó 1
├── VM A
├── CVM 1
└── Dados usados pela VM A
```

Quando possível, isso reduz acessos remotos pela rede.

## Leitura local

```text
VM → CVM local → disco local
```

## Leitura remota

```text
VM → CVM local → outra CVM → disco remoto
```

A leitura remota faz parte do funcionamento normal de uma arquitetura distribuída.

## Falha de disco

Fluxo conceitual:

```text
1. O cluster detecta a falha.
2. Os metadados identificam os dados afetados.
3. Outras cópias continuam disponíveis.
4. O AOS recria a proteção em dispositivos saudáveis.
5. A resiliência é restaurada.
```

## Falha de nó

Quando um nó falha, existem dois assuntos diferentes:

### Disponibilidade das VMs

As VMs podem ser reiniciadas em outros hosts, desde que existam recursos e condições adequadas.

### Resiliência dos dados

As cópias existentes em outros nós mantêm os dados disponíveis dentro dos limites da política configurada.

## Resumo

```text
RF2 = duas cópias
RF3 = três cópias
Localidade = dados próximos da carga quando possível
Reconstrução = restauração automática da proteção
```
