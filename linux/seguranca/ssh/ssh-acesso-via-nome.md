---
layout: default
description: "Configuração de acesso SSH por nome, com resolução de hosts e verificação da conexão."
title: Acessando VMs VirtualBox por nome
---

# Acessando VMs do VirtualBox via SSH por nome (em vez de IP)
{:.no_toc}

Este tutorial mostra como configurar suas VMs (Rocky/RHEL/CentOS/Fedora) para serem acessadas via SSH usando um nome amigável (`vm-01.local`) em vez do IP, usando **mDNS/Avahi**. Também cobre uma alternativa via `~/.ssh/config` e um roteiro de troubleshooting para quando o mDNS não funciona.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## O que é o Avahi?

O **Avahi** é uma implementação open source do protocolo **mDNS/DNS-SD** (também conhecido como *Zeroconf* ou *Bonjour*, nome da versão da Apple) para Linux. Ele permite que uma máquina anuncie seu próprio nome e serviços na rede local automaticamente, sem precisar de um servidor DNS central — daí o nome "zero configuration networking".

Na prática, é o que permite que uma VM Linux seja acessada por um nome como `vm-01.local` em vez do IP, mesmo em redes onde não existe um DNS interno configurado. O Avahi escuta requisições multicast na porta `5353/UDP` e responde com o IP correspondente ao hostname, de forma parecida com o Bonjour no macOS ou o LLMNR no Windows.

---

## Pré-requisitos

- VM com rede em modo **Bridged Adapter** no VirtualBox (a VM precisa receber IP direto da rede local — mDNS não atravessa NAT).
- Acesso root/sudo na VM.
- Windows/Mac/Linux como host.

> Se sua VM estiver em modo **NAT**, pule para a [Alternativa: SSH Config](#alternativa-ssh-config-funciona-com-qualquer-modo-de-rede).

---

## 1. Instalar o Avahi na VM

### Debian/Ubuntu
```bash
sudo apt update
sudo apt install avahi-daemon
```

### RHEL / CentOS / Rocky / Alma / Fedora
No mundo RHEL o pacote se chama apenas `avahi` (não `avahi-daemon`):
```bash
dnf install avahi avahi-tools
```

Se der erro de pacote não encontrado, confirme o nome disponível no repositório:
```bash
dnf search avahi
```

---

## 2. Habilitar e iniciar o serviço

```bash
systemctl enable --now avahi-daemon
```

Verifique se subiu corretamente:
```bash
systemctl status avahi-daemon
```
Deve aparecer `Active: active (running)` e, no log, uma linha como:
```
Server startup complete. Host name is vm-01.local.
```

---

## 3. Definir/checar o hostname

O nome publicado via mDNS é `<hostname>.local`.

Verificar o hostname atual:
```bash
hostname
```

Para trocar por um nome mais amigável:
```bash
hostnamectl set-hostname minhavm
systemctl restart avahi-daemon
```

---

## 4. Firewall (se aplicável)

Se o `firewalld` estiver ativo na VM, libere a porta mDNS (5353/udp):
```bash
firewall-cmd --add-service=mdns --permanent
firewall-cmd --reload
```

Se o `firewalld` não estiver rodando (`FirewallD is not running`), não há nada a fazer aqui.

---

## 5. Acessar a partir do host

### Testar resolução de nome
```bash
ping vm-01.local
```

### Conectar via SSH
```bash
ssh usuario@vm-01.local
```

### Observações por sistema operacional do host
- **Linux/Mac**: suporte a mDNS nativo, geralmente funciona sem instalar nada.
- **Windows**: **não** tem mDNS nativo. É necessário ter o **Bonjour** instalado (vem junto com o iTunes, ou pode ser instalado separadamente como "Bonjour Print Services"). Sempre inclua o sufixo `.local` no comando — no Windows, `ping vm-01` (sem `.local`) não funciona.

---

## Alternativa: SSH Config (funciona com qualquer modo de rede)

Se a VM estiver em modo **NAT**, ou se você só quer um atalho sem depender de mDNS, crie um alias no arquivo `~/.ssh/config` do seu **host**:

```
Host minhavm
    HostName 192.168.1.50
    User usuario
    Port 22
```

Depois conecte com:
```bash
ssh minhavm
```

> Isso não é resolução de nome de verdade — é um atalho local. Se o IP da VM mudar, você precisa atualizar essa linha no arquivo.

### Se a VM estiver em modo NAT
Configure port forwarding no VirtualBox:
`Configurações da VM → Rede → Avançado → Encaminhamento de Portas`

Redirecione, por exemplo, a porta `2222` do host para a `22` da VM. No `~/.ssh/config`:
```
Host minhavm
    HostName 127.0.0.1
    Port 2222
    User usuario
```

---

## Troubleshooting: mDNS funciona em uma VM mas não em outra

Se `ping vm-01.local` funciona mas `ping vm-02.local` não, siga esta ordem:

### 1. Confirme que incluiu o `.local`
No Windows, `ping vm-02` (sem sufixo) sempre falha, mesmo com tudo certo. Use sempre `ping vm-02.local`.

### 2. Teste a conectividade básica por IP
```
ping 10.0.97.33
```
Se isso **não** responder, o problema não é mDNS — é roteamento/rede entre o host e a VM (VLAN diferente, firewall de rede, etc). Compare a faixa de IP da VM que funciona com a que não funciona.

### 3. Teste a resolução localmente, dentro da própria VM
```bash
avahi-resolve -n vm-02.local
```
Se retornar o próprio IP, o avahi está funcionando corretamente do lado da VM — o problema está na propagação do multicast pela rede (switches gerenciados costumam bloquear ou não repassar tráfego multicast entre certas portas/VLANs, o que explica funcionar numa VM e não em outra mesmo com o avahi configurado de forma idêntica).

### 4. Restrinja o Avahi à interface de rede correta
Em VMs com múltiplas interfaces (por exemplo, VMs que também são nós de cluster Kubernetes, com interfaces `cali*`, `tunl0`, etc.), o Avahi pode se confundir tentando publicar em interfaces erradas. Edite:
```bash
sudo nano /etc/avahi/avahi-daemon.conf
```
Na seção `[server]`, adicione:
```
allow-interfaces=enp0s3
```
(substitua `enp0s3` pelo nome da interface de rede física/bridged real, visto no `ip a`)

Depois reinicie:
```bash
sudo systemctl restart avahi-daemon
```

---

## Resumo rápido

| Situação | Solução |
|---|---|
| VM em modo Bridged | mDNS/Avahi (`vm.local`) |
| VM em modo NAT | `~/.ssh/config` + port forwarding |
| Ping por nome falha no Windows | Verificar sufixo `.local` e instalação do Bonjour |
| Ping por nome falha, mas por IP funciona | Multicast bloqueado na rede — restringir interface do Avahi |
| Ping por IP também falha | Problema de roteamento/rede, não é mDNS |