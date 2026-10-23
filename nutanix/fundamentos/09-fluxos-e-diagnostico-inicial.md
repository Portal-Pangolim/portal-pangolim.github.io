---
layout: default
description: "Fluxos de acesso e verificações iniciais para organizar o diagnóstico de incidentes no Nutanix."
title: Fluxos e diagnóstico inicial
---

# Fluxos e diagnóstico inicial
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Fluxo de gravação de uma VM

Uma gravação percorre várias camadas.

```text
Aplicação
    ↓
Sistema operacional
    ↓
vDisk
    ↓
AHV
    ↓
CVM e AOS
    ↓
Discos do cluster
```

Fluxo conceitual:

1. A aplicação solicita uma gravação.
2. O sistema operacional envia a operação ao disco virtual.
3. O AHV encaminha a operação à camada de armazenamento.
4. A CVM processa a solicitação.
5. O AOS grava e protege os dados.
6. Os metadados registram a localização.
7. A conclusão retorna para a VM.

## Fluxo de leitura

```text
VM solicita um bloco
        ↓
CVM consulta os metadados
        ↓
Localiza a melhor cópia
        ↓
Lê o dado
        ↓
Entrega à VM
```

A leitura pode ser local ou remota.

## Fluxo de acesso ao Files

```text
Usuário
   ↓ SMB/NFS
FSVM
   ↓
CVM e AOS
   ↓
Discos do cluster
```

Em SMB com Active Directory:

```text
Usuário
   ↓ autenticação
Active Directory
   ↓ identidade e grupos
Nutanix Files
   ↓ autorização
Compartilhamento
```

## Diagnóstico de lentidão

Uma VM lenta ao acessar disco pode envolver:

- Aplicação;
- Sistema operacional;
- vDisk;
- AHV;
- CVM;
- Rede entre nós;
- Discos;
- Capacidade;
- Reconstrução;
- Outras cargas concorrentes.

Verificações iniciais:

1. Latência observada pela VM;
2. Latência no cluster;
3. CPU e memória da VM;
4. CPU e memória das CVMs;
5. Utilização dos discos;
6. Utilização da rede;
7. Alertas de hardware;
8. Operações de manutenção;
9. Capacidade livre;
10. Picos de carga.

## Diagnóstico de acesso SMB

Quando um usuário recebe “Acesso negado”:

```text
1. Confirmar usuário e domínio.
2. Testar resolução DNS.
3. Verificar conectividade.
4. Confirmar associação aos grupos.
5. Conferir permissão do share.
6. Conferir ACLs.
7. Procurar negação explícita.
8. Verificar eventos de auditoria.
```

## Diagnóstico de NFS

Quando uma montagem NFS falha:

```text
1. Resolver o nome do servidor.
2. Testar conectividade.
3. Confirmar o caminho do export.
4. Verificar clientes ou redes autorizadas.
5. Conferir opções de montagem.
6. Validar UID/GID ou Kerberos.
7. Consultar logs do cliente e do serviço.
```

## Diagnóstico orientado por camadas

Evite concluir rapidamente que “o storage está com problema”.

Analise de cima para baixo:

```text
Aplicação
    ↓
Sistema operacional
    ↓
Protocolo ou vDisk
    ↓
Rede
    ↓
FSVM ou CVM
    ↓
AOS
    ↓
Hardware
```

## Registro da investigação

Uma boa anotação deve conter:

- Data e horário;
- Usuário ou sistema afetado;
- Sintoma;
- Escopo;
- Alterações recentes;
- Alertas encontrados;
- Testes executados;
- Evidências;
- Ação tomada;
- Resultado.

## Resumo

- Investigue por camadas.
- Separe autenticação de autorização.
- Diferencie FSVM de CVM.
- Observe alertas, tarefas e métricas.
- Registre evidências antes de alterar o ambiente.
