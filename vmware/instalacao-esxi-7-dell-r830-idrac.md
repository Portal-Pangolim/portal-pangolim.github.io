---
layout: default
description: "Registro de instalação do VMware ESXi 7 em Dell R830 usando iDRAC, mídia virtual e configuração inicial."
title: Instalação do VMware ESXi 7.0.3 em Dell PowerEdge R830 via iDRAC
---

# Instalação do VMware ESXi 7.0.3 em Dell PowerEdge R830 via iDRAC
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## 1. Objetivo

Este procedimento descreve a instalação do **VMware ESXi 7.0.3** em servidores **Dell PowerEdge R830**, utilizando acesso remoto pelo **iDRAC** e configuração de RAID pelo controlador **PERC H730**.

O procedimento foi utilizado nos hosts:

```text
esxi-host01
esxi-host02
```

---

## 2. Pré-requisitos

Antes de iniciar, tenha em mãos:

```text
Acesso ao iDRAC do servidor
Usuário e senha de administrador do iDRAC
ISO do VMware ESXi 7.0.3
Senha que será definida para o usuário root do ESXi
Confirmação de que os dados dos discos podem ser apagados
```

> Atenção: este procedimento apaga os dados dos discos utilizados na nova configuração RAID.

---

## 3. Acesso ao iDRAC

Acesse o iDRAC pelo navegador:

```text
https://IP_DO_IDRAC
```

Exemplo:

```text
https://192.0.2.208
https://192.0.2.209
```

Faça login com usuário administrativo.

Depois acesse:

```text
Virtual Console
```

Clique em:

```text
Launch Virtual Console
```

A console remota será aberta em uma nova janela ou aba.

---

## 4. Montar o ISO do VMware ESXi

Na barra superior da console virtual, clique em:

```text
Virtual Media
```

ou:

```text
Connect Virtual Media
```

Depois selecione o ISO do VMware ESXi:

```text
VMware-VMvisor-Installer-7.0U3n-21930508.x86_64.iso
```

Confirme que a mídia ficou conectada ou mapeada.

Deve aparecer algo semelhante a:

```text
Virtual Media is connected
Devices Mapped: 1
ISO mapped to CD/DVD drive
```

---

## 5. Configuração RAID

### 5.1 Acessar o utilitário RAID

Reinicie o servidor pela console do iDRAC.

Durante o boot, pressione:

```text
F2
```

Entre em:

```text
System Setup
```

Depois acesse:

```text
Device Settings
```

Selecione o controlador RAID:

```text
Dell PERC H730 Adapter
```

Entre em:

```text
Configuration Management
```

---

### 5.2 Limpar configuração RAID antiga

Caso o servidor já possua configuração anterior, entre em:

```text
Clear Configuration
```

Confirme a limpeza da configuração.

> Atenção: esta ação remove os Virtual Disks existentes e apaga a estrutura RAID anterior.

---

### 5.3 Criar RAID 5 para datastore

No menu:

```text
Configuration Management
```

clique em:

```text
Create Virtual Disk
```

Configure:

```text
RAID Level: RAID5
Select Physical Disks From: Unconfigured Capacity
```

Clique em:

```text
Select Physical Disks
```

Selecione os três discos grandes:

```text
Physical Disk 00:01:05 - 1862.500 GB
Physical Disk 00:01:06 - 1862.500 GB
Physical Disk 00:01:07 - 1862.500 GB
```

Clique em:

```text
Apply Changes
```

Depois configure os parâmetros do Virtual Disk:

```text
Virtual Disk Name: DATASTORE_RAID5
Virtual Disk Size: 3725 GB aproximadamente
Virtual Disk Size Unit: GB
Strip Element Size: 64 KB
Read Policy: Read Ahead
Write Policy: Write Back
```

Finalize em:

```text
Create Virtual Disk
```

---

### 5.4 Criar RAID 1 para instalação do ESXi

Volte para:

```text
Configuration Management
```

Clique em:

```text
Create Virtual Disk
```

Configure:

```text
RAID Level: RAID1
Select Physical Disks From: Unconfigured Capacity
```

Clique em:

```text
Select Physical Disks
```

Selecione os dois discos pequenos:

```text
Physical Disk 00:01:02 - 278.875 GB
Physical Disk 00:01:03 - 278.875 GB
```

Deixe o terceiro disco pequeno desmarcado:

```text
Physical Disk 00:01:04 - 278.875 GB
```

Clique em:

```text
Apply Changes
```

Depois configure:

```text
Virtual Disk Name: ESXI_RAID1
Virtual Disk Size: 278.875
Virtual Disk Size Unit: GB
Strip Element Size: 64 KB
Read Policy: Read Ahead
Write Policy: Write Back
```

Finalize em:

```text
Create Virtual Disk
```

---

### 5.5 Conferir configuração RAID

No menu:

```text
Configuration Management
```

acesse:

```text
View Disk Group Properties
```

A configuração esperada é:

```text
Virtual Disk 0: DATASTORE_RAID5 - RAID5 - 3.637 TB - Ready
Virtual Disk 1: ESXI_RAID1 - RAID1 - 278.875 GB - Ready
```

Se os dois volumes aparecerem como **Ready**, a configuração RAID está concluída.

---

## 6. Boot pelo instalador do ESXi

Saia do System Setup e reinicie o servidor.

Durante o boot, pressione:

```text
F11
```

Entre em:

```text
One-shot UEFI Boot Menu
```

Selecione:

```text
Virtual Optical Drive
```

Caso apareça também a opção abaixo, prefira **Virtual Optical Drive**:

```text
Embedded SATA Port Optical Drive A: EFI DVD/CDROM
```

O instalador do ESXi será carregado.

---

## 7. Instalação do VMware ESXi

Na tela inicial do instalador:

```text
VMware ESXi 7.0.3 Installer
```

Aguarde o carregamento.

Na tela de boas-vindas, pressione:

```text
Enter
```

Aceite o contrato de licença com:

```text
F11
```

---

### 7.1 Selecionar disco de instalação

Na tela:

```text
Select a Disk to Install or Upgrade
```

Selecione o disco menor:

```text
DELL PERC H730 - 278.875 GB
```

Esse disco corresponde ao:

```text
ESXI_RAID1
```

Não selecione o disco grande:

```text
3.637 TB
```

Esse disco corresponde ao:

```text
DATASTORE_RAID5
```

Ele será usado posteriormente como datastore.

---

### 7.2 Selecionar layout de teclado

Na tela de layout do teclado, selecione:

```text
US Default
```

Pressione:

```text
Enter
```

---

### 7.3 Definir senha do root

Na tela de senha, defina a senha do usuário root.

Recomenda-se utilizar uma senha compatível com teclado **US Default**.

Exemplo de formato:

```text
SENHA_FORTE_DE_EXEMPLO!
```

Observação: no teclado US, o caractere `!` é digitado com:

```text
Shift + 1
```

Evite caracteres que possam causar confusão de layout, como:

```text
@
ç
acentos
```

Confirme a senha e pressione:

```text
Enter
```

---

### 7.4 Confirmar instalação

Na tela de confirmação, pressione:

```text
F11
```

Aguarde a instalação do ESXi.

Ao final, será exibida a mensagem de instalação concluída.

Antes de reiniciar, desconecte a mídia virtual.

Na console do iDRAC, clique em:

```text
Virtual Media
```

Depois selecione:

```text
Disconnect
```

ou:

```text
Unmap
```

Confirme que ficou:

```text
Devices Mapped: 0
```

Depois pressione:

```text
Enter
```

para reiniciar.

---

## 8. Primeiro boot do ESXi

Após reiniciar, o servidor deve iniciar pelo disco local e carregar o ESXi.

A tela esperada é a tela amarela/cinza do VMware ESXi, com informações semelhantes a:

```text
VMware ESXi 7.0.3
Dell Inc. PowerEdge R830
F2 Customize System/View Logs
F12 Shut Down/Restart
```

Caso apareça a mensagem abaixo, é normal se o IP ainda não foi configurado:

```text
DHCP lookup failed
```

Isso significa que o ESXi tentou obter IP por DHCP e não recebeu endereço válido.

---

## 9. Configuração de rede

Neste procedimento, o IP fixo do ESXi **não foi configurado**, pois os servidores serão instalados em outra localidade e a equipe local configurará os endereços na rede de destino.

Para configurar IP posteriormente:

```text
F2 > root > senha > Configure Management Network
```

Depois acessar:

```text
Network Adapters
VLAN
IPv4 Configuration
DNS Configuration
Custom DNS Suffixes
```

Configurar conforme o padrão da rede local.

---

## 10. Checklist final

Antes de considerar o servidor pronto, conferir:

```text
RAID DATASTORE_RAID5 criado
RAID ESXI_RAID1 criado
ESXi instalado no disco de 278.875 GB
Servidor inicializando pelo VMware ESXi
Senha root testada
Mídia virtual desconectada
Servidor sem ISO mapeado
iDRAC acessível
Health do servidor OK
```

Configuração final esperada:

```text
DATASTORE_RAID5 - RAID5 - 3.637 TB - Ready
ESXI_RAID1 - RAID1 - 278.875 GB - Ready
VMware ESXi 7.0.3 instalado
```

---

## 11. Observações importantes

O IP do iDRAC é independente do IP do ESXi.

Exemplo:

```text
iDRAC: acesso remoto ao hardware do servidor
ESXi: sistema operacional/hypervisor instalado no servidor
```

Mesmo que o ESXi esteja sem IP, ainda é possível acessar o servidor pelo iDRAC, desde que o iDRAC esteja configurado corretamente na rede.

Caso o servidor seja enviado para outra localidade, o iDRAC também pode precisar de ajuste de IP conforme a rede de destino.

No ambiente de destino, a equipe local deverá configurar:

```text
IP de gerenciamento do ESXi
Máscara
Gateway
DNS
Hostname
VLAN, se aplicável
Datastore no volume DATASTORE_RAID5
```
