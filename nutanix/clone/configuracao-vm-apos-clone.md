---
layout: default
title: Configuração de VM Linux após clone
description: Procedimento de configuração e validação de uma VM Linux clonada (hostname, rede, identificadores, discos, horário, firewall e preparação para o Commvault).
---


> **Revisão humana pendente:** a origem dos nomes e endereços deste registro não foi confirmada. Verifique a sanitização antes de publicar ou reutilizar. Os valores foram preservados para evitar atribuir identidade fictícia sem evidência.

# Configuração de VM Linux após clone

Procedimento para configurar e validar uma máquina virtual Linux após a clonagem, garantindo identificação própria, rede correta, serviços operacionais e condições adequadas para uso em produção.

* TOC
{:toc}

## 1. Objetivo

Documentar o procedimento de configuração e validação de uma máquina virtual Linux após sua clonagem, garantindo que ela tenha identificação própria, configuração de rede correta, serviços operacionais e condições adequadas para uso em produção.

Este procedimento também contempla as verificações necessárias para preparar a VM para instalação ou integração com o Commvault.

## 2. Pré-requisitos

Antes de iniciar, confirme:

- [ ] A VM original foi clonada e está disponível no ambiente de virtualização.
- [ ] O acesso ao console da VM está funcionando.
- [ ] As credenciais de administrador (`root` ou usuário com `sudo`) estão disponíveis.
- [ ] O hostname e o endereço IP que serão utilizados foram definidos.
- [ ] O endereço IP está reservado ou autorizado na rede.
- [ ] As configurações de DNS, gateway, máscara e VLAN são conhecidas.
- [ ] Há conectividade com os servidores necessários para a operação da VM.

> **Atenção:** não coloque a VM clonada em produção com o mesmo endereço IP ou hostname da máquina original. Se possível, mantenha a interface de rede desconectada até conferir as configurações herdadas do clone.

## 3. Acessar a VM e identificar o sistema

Acesse a VM pelo console do ambiente de virtualização ou por SSH, caso a rede já esteja configurada.

Verifique a distribuição, a versão do sistema operacional, o kernel e a arquitetura:

```bash
cat /etc/os-release
uname -r
uname -m
hostnamectl
```

Verifique os recursos disponíveis:

```bash
uptime
free -h
df -hT
lsblk -f
ip -br address
ip route
```

Registre os resultados para comparação com os requisitos da aplicação que será instalada.

## 4. Configurar o hostname

Defina o hostname aprovado para a nova VM:

```bash
hostnamectl set-hostname NOVO-HOSTNAME
```

Substitua `NOVO-HOSTNAME` pelo nome definitivo do servidor.

Valide:

```bash
hostnamectl
hostname -f
cat /etc/hostname
```

O resultado de `hostname -f` pode depender da configuração de DNS e do domínio local. Se não retornar o nome completo esperado, confira os registros DNS e o arquivo `/etc/hosts`.

Edite o arquivo, se necessário:

```bash
vi /etc/hosts
```

Exemplo ilustrativo:

```text
127.0.0.1   localhost localhost.localdomain
10.0.0.100  NOVO-HOSTNAME.dominio.local NOVO-HOSTNAME
```

> **Importante:** utilize o endereço IP e o domínio reais do ambiente. Não associe o hostname a um IP incorreto.

## 5. Configurar a rede

### 5.1. Identificar as interfaces
{:no_toc}
```bash
ip -br link
ip -br address
ip route
nmcli device status
nmcli connection show
```

Identifique a interface de rede, o perfil ativo, o endereço IP atual e a rota padrão.

### 5.2. Configurar o endereço IP
{:no_toc}
Em sistemas Rocky Linux, RHEL e outras distribuições que utilizam NetworkManager, identifique o perfil correto:

```bash
nmcli connection show
```

Para configurar um perfil existente com IP estático, utilize o modelo abaixo, substituindo os valores pelos dados aprovados:

```bash
nmcli connection modify "NOME-DA-CONEXAO" \
  ipv4.method manual \
  ipv4.addresses "10.0.0.100/24" \
  ipv4.gateway "10.0.0.1" \
  ipv4.dns "10.0.0.10 10.0.0.11"
```

> **Importante:** os endereços acima são exemplos. A máscara `/24`, o gateway e os DNS não devem ser utilizados sem confirmação. Confira também se o perfil é o correto e se a alteração não interromperá o acesso remoto.

Antes de ativar o perfil, garanta que existe acesso pelo console. Aplique a configuração:

```bash
nmcli connection up "NOME-DA-CONEXAO"
```

Valide:

```bash
ip -br address
ip route
nmcli device status
```

Em distribuições que não utilizam NetworkManager, adapte o procedimento ao gerenciador de rede instalado.

### 5.3. Testar a conectividade
{:no_toc}
Teste o gateway:

```bash
ping -c 4 IP_DO_GATEWAY
```

Teste a resolução de nomes:

```bash
getent hosts NOME_DO_SERVIDOR
```

Confira a configuração de resolução de nomes:

```bash
cat /etc/resolv.conf
```

Se houver conectividade com o gateway, mas não com os servidores necessários, verifique as rotas, as regras de firewall, as ACLs de rede e as configurações de proxy.

## 6. Validar os identificadores do sistema

Após a clonagem, verifique os identificadores e arquivos herdados da VM original.

### 6.1. Machine ID
{:no_toc}

Consulte o identificador:

```bash
cat /etc/machine-id
```

O identificador deve ser exclusivo para cada instalação. Não o altere automaticamente sem confirmar a política de clonagem e os procedimentos da distribuição.

Se o ambiente exigir a regeneração do `machine-id`, faça isso conforme o procedimento oficial do sistema operacional, preferencialmente antes de registrar a VM em serviços de gerenciamento.

### 6.2. Chaves SSH
{:no_toc}
Confira as chaves de host existentes:

```bash
ls -l /etc/ssh/ssh_host_*
```

Se a VM original já possuía acesso SSH, verifique se as chaves foram copiadas para o clone. Servidores distintos não devem compartilhar as mesmas chaves de host.

Em sistemas que utilizam OpenSSH, após confirmar que as chaves herdadas precisam ser regeneradas e que há acesso pelo console:

```bash
ssh-keygen -A
```

> **Atenção:** esse comando gera apenas as chaves que estiverem ausentes; não substitui as existentes. Para substituir chaves herdadas, siga o procedimento específico da distribuição, com backup e planejamento da mudança.

Depois, valide o serviço:

```bash
systemctl status sshd
```

Em distribuições nas quais o serviço possui outro nome, consulte o nome correto. Se houver acesso remoto por SSH, valide a conexão antes de encerrar a sessão atual.

## 7. Conferir discos e pontos de montagem

Confira os discos, os sistemas de arquivos e seus identificadores:

```bash
lsblk -f
blkid
df -hT
cat /etc/fstab
```

Verifique se os UUIDs configurados em `/etc/fstab` correspondem aos discos da VM clonada.

Não copie UUIDs de outro servidor sem validação. Discos adicionais, volumes de dados e partições de aplicações devem ser identificados antes de qualquer alteração.

Depois de revisar o arquivo `/etc/fstab`, valide as entradas:

```bash
findmnt --verify
```

Quando apropriado, teste as montagens previstas:

```bash
mount -a
```

> **Atenção:** execute `mount -a` somente após revisar o arquivo e garantir que as montagens não causarão impacto. Corrija eventuais erros antes de reiniciar a VM.

## 8. Validar data e sincronização de horário

Consulte a data, o fuso horário e o serviço de sincronização:

```bash
date
timedatectl
```

Confira o serviço NTP ou Chrony, conforme a distribuição:

```bash
systemctl status chronyd
chronyc tracking
```

Se o sistema não utilizar Chrony, identifique o serviço de sincronização correspondente.

O horário correto é importante para logs, autenticação, certificados, monitoramento e execução de backups.

## 9. Atualizar e validar o sistema operacional

Identifique o gerenciador de pacotes:

```bash
command -v dnf
command -v yum
command -v apt
```

Em Rocky Linux ou RHEL, consulte as atualizações disponíveis:

```bash
dnf check-update
```

> **Atenção:** a atualização efetiva deve seguir a política de mudanças do ambiente. Não execute uma atualização completa em produção sem verificar compatibilidade, janela de manutenção e necessidade de reinicialização.

Confira serviços com falha:

```bash
systemctl --failed
```

Verifique os últimos eventos críticos:

```bash
journalctl -p err -b
```

## 10. Validar firewall, acesso e segurança

Confira o estado do firewall:

```bash
systemctl status firewalld
firewall-cmd --state
```

Se o ambiente utilizar `firewalld`, liste as regras ativas:

```bash
firewall-cmd --list-all
```

Confira a situação do SSH:

```bash
systemctl status sshd
ss -lntp
```

> **Atenção:** não desative o firewall indiscriminadamente. Libere apenas as portas exigidas pela aplicação, conforme a arquitetura e as regras de segurança da organização.

## 11. Preparar a VM para o Commvault

Esta etapa se aplica quando a máquina clonada será protegida por uma solução Commvault.

### 11.1. Verificar se o agente já está instalado
{:no_toc}

Antes de instalar qualquer componente, procure instalações e processos existentes:

```bash
rpm -qa | grep -Ei 'commvault|simpana'
```

Verifique os processos:

```bash
pgrep -af 'commvault|cvd|ClMgrS|EvMgrS'
```

Verifique diretórios comuns, sem assumir que todos estarão presentes:

```bash
ls -ld /opt/commvault /opt/simpana 2>/dev/null
```

A ausência de resultados nesses comandos não comprova, isoladamente, que todos os componentes Commvault estão ausentes. Confirme também o inventário de software e os procedimentos da equipe responsável.

### 11.2. Confirmar os requisitos de instalação
{:no_toc}

Antes de instalar o agente, valide:

- [ ] A VM possui hostname definitivo e endereço IP exclusivo.
- [ ] DNS direto e reverso estão configurados conforme os padrões do ambiente.
- [ ] O servidor consegue resolver os nomes dos servidores Commvault necessários.
- [ ] A comunicação de rede exigida pela versão instalada está liberada.
- [ ] A distribuição e a versão do Linux são compatíveis com a versão do agente.
- [ ] Os pacotes e instaladores foram obtidos de uma fonte oficial autorizada.
- [ ] Há credenciais e permissões necessárias para registrar o cliente no CommCell.

### 11.3. Instalar e registrar o agente
{:no_toc}

Obtenha o instalador compatível com o sistema operacional por meio do procedimento oficial de distribuição do Commvault adotado pela organização.

Execute o instalador conforme a documentação correspondente à versão e à arquitetura utilizadas. Os parâmetros, os diretórios de instalação, os serviços e os requisitos de comunicação podem variar entre versões.

Durante o processo, confirme o registro do cliente no ambiente Commvault e utilize a identificação definitiva da VM.

> **Atenção:** não utilize um instalador ou script genérico sem validar a versão e os parâmetros exigidos pelo ambiente.

### 11.4. Validar a instalação
{:no_toc}

Após concluir a instalação, verifique os serviços e os processos do agente. Os nomes variam conforme a versão e os componentes instalados.

Exemplos de verificações:

```bash
pgrep -af 'commvault|cvd|ClMgrS|EvMgrS'
```

```bash
systemctl --type=service --all | grep -i commvault
```

O segundo comando pode não apresentar resultados mesmo quando componentes Commvault estão instalados, pois nem todas as instalações são gerenciadas por unidades systemd com nomes contendo `commvault`.

Confirme também no console de administração do Commvault:

- [ ] O cliente aparece registrado.
- [ ] O hostname e o endereço IP correspondem à VM correta.
- [ ] O sistema operacional foi identificado corretamente.
- [ ] O cliente está conectado e operacional.
- [ ] A política de backup ou o plano de proteção esperado está associado.
- [ ] Um backup de teste pode ser executado e validado.

> **Importante:** a instalação do agente, por si só, não comprova que os backups estão funcionando.

## 12. Reiniciar e executar a validação final

Depois de concluir as alterações e confirmar que a VM está pronta para reinicialização, execute:

```bash
reboot
```

Após o retorno, valide:

```bash
hostnamectl
ip -br address
ip route
lsblk -f
df -hT
systemctl --failed
journalctl -p err -b
```

Confirme também o acesso SSH, a resolução DNS, os serviços da aplicação e o estado do agente Commvault, quando aplicável.

Se houver qualquer falha de rede, montagem ou inicialização, corrija-a antes de liberar a VM para produção.

## 13. Checklist de conclusão

- [ ] Hostname exclusivo configurado.
- [ ] Endereço IP, máscara e gateway validados.
- [ ] DNS direto e reverso conferidos.
- [ ] Machine ID e chaves SSH avaliados.
- [ ] Discos, UUIDs e `/etc/fstab` conferidos.
- [ ] Data e sincronização de horário validadas.
- [ ] Atualizações e serviços com falha avaliados.
- [ ] Firewall e acesso remoto validados.
- [ ] Aplicação e agentes necessários verificados.
- [ ] Cliente Commvault registrado e operacional, quando aplicável.
- [ ] Backup de teste concluído e validado, quando aplicável.
- [ ] Reinicialização realizada e validação pós-boot concluída.
- [ ] Configuração final registrada na documentação de infraestrutura.

## 14. Registro da VM

Preencha os dados da nova máquina após concluir as verificações.

| Campo | Valor |
|---|---|
| Hostname | A preencher |
| Endereço IP | A preencher |
| Máscara de rede | A preencher |
| Gateway | A preencher |
| Servidores DNS | A preencher |
| Sistema operacional | A preencher |
| Versão do kernel | A preencher |
| Ambiente | Desenvolvimento / Homologação / Produção |
| Aplicação ou finalidade | A preencher |
| Cliente Commvault | A preencher, se aplicável |
| Data da configuração | A preencher |
| Responsável | A preencher |
| Resultado da validação | Pendente / Aprovado |

## 15. Referências

- [Documentação oficial do Rocky Linux](https://docs.rockylinux.org/)
- [Documentação oficial do Red Hat Enterprise Linux](https://docs.redhat.com/)
- [Documentação oficial do Commvault](https://documentation.commvault.com/)

---

Atualize este documento sempre que houver mudanças no padrão de clonagem, na configuração de rede, nos requisitos de segurança ou no procedimento de instalação do Commvault.