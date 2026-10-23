---
layout: default
validation: pending-lab
description: "Uso restrito do Cntlm no Windows para clientes Linux autorizados, com ACLs, proteção de hashes e firewall delimitado."
title: Windows como proxy restrito para Linux com Cntlm
---

# Windows como Proxy para VMs Linux usando Cntlm
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
#> **Escopo e validação:** somente clientes explicitamente autorizados pela organização. Os IPs da rede host-only neste exemplo são fictícios. Configuração revisada documentalmente; os testes de aceitação e negação abaixo ainda precisam ser executados em laboratório. Um cliente autorizado usa a identidade corporativa configurada no Cntlm. Não exponha o listener à LAN, Wi-Fi ou Internet.

## Objetivo

Utilizar um computador Windows como **proxy HTTP/HTTPS** para máquinas virtuais Linux que não possuem acesso direto à Internet.

Neste cenário:

```text
                    INTERNET
                        │
                        ▼
              ┌─────────────────┐
              │     WINDOWS     │
              │                 │
              │ Cntlm Proxy     │
              │ Porta: 3128     │
              └────────┬────────┘
                       │
                       │ Rede da VM
                       ▼
              ┌─────────────────┐
              │    VM LINUX     │
              │                 │
              │ HTTP_PROXY      │
              │ HTTPS_PROXY     │
              └─────────────────┘
```

O Windows recebe as requisições da VM Linux e utiliza o Cntlm para acessar a Internet através do proxy corporativo.

---

## 1. Pré-requisitos

No Windows:

* Windows 10/11
* Cntlm instalado
* Acesso ao proxy corporativo
* Firewall permitindo a porta do Cntlm
* IP do Windows acessível pela VM

Na VM Linux:

* Rocky Linux, RHEL, CentOS, Debian ou distribuição equivalente
* Rede configurada para alcançar o Windows

---

## 2. Instalação do Cntlm no Windows

Extraia o Cntlm, por exemplo:

```text
C:\Temp\cntlm-0.92.3-win32\cntlm-0.92.3
```

Verifique se existem os arquivos:

```powershell
dir C:\Temp\cntlm-0.92.3-win32\cntlm-0.92.3
```

Entre no diretório:

```powershell
cd C:\Temp\cntlm-0.92.3-win32\cntlm-0.92.3
```

---

## 3. Configuração do Cntlm

Edite o arquivo:

```text
cntlm.ini
```

Exemplo:

```ini
Username    SEU_USUARIO
Domain      SEU_DOMINIO
Workstation WINDOWS

Proxy       IP_DO_PROXY_CORPORATIVO:PORTA

Listen      127.0.0.1:3128
Listen      192.168.56.1:3128
Gateway     no

# Primeira regra correspondente vence: exceções antes da negação geral.
Allow       127.0.0.1/32
Allow       192.168.56.10/32
Deny        0/0
Auth        NTLMv2

NoProxy     localhost, 127.0.0.*, 10.*, 172.16.*, 192.168.*
```

Substitua:

```text
SEU_USUARIO
SEU_DOMINIO
IP_DO_PROXY_CORPORATIVO
PORTA
```

pelos valores utilizados no ambiente.

> **Importante:** não coloque a senha em texto puro no arquivo.

---

## 4. Gerar o hash da senha

No PowerShell, execute:

```powershell
.\cntlm.exe -H -u SEU_USUARIO -d SEU_DOMINIO
```

O Cntlm solicitará a senha.

Será retornado algo semelhante a:

```text
PassLM      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PassNT      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PassNTLMv2  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Use somente o `PassNTLMv2` no `cntlm.ini`, com `Auth NTLMv2`. Não copie `PassLM` ou `PassNT` para habilitar protocolos antigos:

```ini
PassNTLMv2  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

O hash continua sendo um segredo de autenticação: não publique, não envie em logs e não versione. Restrinja a ACL NTFS do arquivo e do diretório de instalação aos administradores e à conta efetiva do serviço, concedendo apenas leitura à conta que executa o Cntlm. Confira a conta do serviço antes de ajustar a ACL; não copie regras de permissões sem identificar essa conta. Use um diretório de instalação protegido, em vez de manter credenciais em \Temp. Se houver exposição, troque a senha e gere outro hash. O modo verboso pode registrar informações sensíveis; use-o apenas no diagnóstico controlado.

---

## 5. Testar o Cntlm manualmente

Antes de instalar como serviço, teste o Cntlm manualmente.

Execute:

```powershell
.\cntlm.exe -f -v
```

O parâmetro `-f` mantém o processo em primeiro plano.

O `-v` habilita mensagens detalhadas.

Se estiver funcionando, deverá aparecer algo indicando que o Cntlm está escutando na porta configurada.

Exemplo:

```text
Listening on 192.168.56.1:3128
```

---

## 6. Testar o proxy no próprio Windows

No PowerShell:

```powershell
curl.exe -x http://127.0.0.1:3128 -I https://www.google.com
```

Ou:

```powershell
curl.exe -x http://127.0.0.1:3128 -I https://registry-1.docker.io
```

Se retornar HTTP `200`, `301`, `302` ou outro código válido do destino, o proxy está respondendo.

---

## 7. Instalar o Cntlm como serviço do Windows

O pacote utilizado possui o:

```text
cygrunsrv.exe
```

Entre no diretório:

```powershell
cd C:\Temp\cntlm-0.92.3-win32\cntlm-0.92.3
```

Instale o serviço:

```powershell
.\cygrunsrv.exe -I Cntlm -d "Cntlm Proxy" -p "C:\Temp\cntlm-0.92.3-win32\cntlm-0.92.3\cntlm.exe"
```

Depois verifique:

```powershell
Get-Service Cntlm
```

Para iniciar:

```powershell
Start-Service Cntlm
```

Verifique novamente:

```powershell
Get-Service Cntlm
```

Resultado esperado:

```text
Status   Name   DisplayName
------   ----   -----------
Running  Cntlm  Cntlm Proxy
```

---

## 8. Configurar o serviço para iniciar automaticamente

Execute:

```powershell
Set-Service Cntlm -StartupType Automatic
```

Confirme:

```powershell
Get-Service Cntlm | Select-Object Name,Status,StartType
```

O resultado deverá indicar:

```text
Name    : Cntlm
Status  : Running
StartType : Automatic
```

---

## 9. Verificar se a porta 3128 está aberta

No Windows:

```powershell
netstat -ano | findstr :3128
```

Ou:

```powershell
Get-NetTCPConnection -LocalPort 3128
```

O esperado é algo semelhante a:

```text
192.168.56.1:3128
```

Confirme somente os listeners esperados: loopback e IP da interface host-only. Não deve existir listener curinga (`0.0.0.0` ou `::`).

---

## 10. Liberar a porta no Firewall do Windows

O exemplo abaixo pressupõe interface host-only chamada `VirtualBox Host-Only Network`, IP do Windows `192.168.56.1`, cliente fixo `192.168.56.10` e perfil `Private`. Identifique os valores reais com `Get-NetAdapter` e `Get-NetConnectionProfile`; não amplie o perfil ou a origem para contornar uma falha. Confirme bloqueio padrão de entrada e ausência de regras mais amplas antes de criar a exceção:

```powershell
New-NetFirewallRule `
    -DisplayName "Cntlm Proxy 3128" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3128 `
    -LocalAddress 192.168.56.1 `
    -RemoteAddress 192.168.56.10 `
    -InterfaceAlias "VirtualBox Host-Only Network" `
    -Profile Private `
    -Action Allow
```

Verifique:

```powershell
Get-NetFirewallRule -DisplayName "Cntlm Proxy 3128"
```

---

## 11. Descobrir o IP do Windows

No Windows:

```powershell
ipconfig
```

Procure o adaptador utilizado pela VM.

Exemplo:

```text
Ethernet adapter:

IPv4 Address. . . . . . : 192.168.56.1
```

Nesse exemplo:

```text
IP DO WINDOWS = 192.168.56.1
```

Esse será o endereço utilizado pela VM Linux.

---

## 12. Configurar a VM Linux

Na VM Linux, configure o proxy apontando para o IP do Windows.

Exemplo:

```text
Windows: 192.168.56.1
Cntlm:   3128
```

O proxy será:

```text
http://192.168.56.1:3128
```

---

## 13. Configurar variáveis de ambiente

Para teste temporário:

```bash
export HTTP_PROXY="http://192.168.56.1:3128"
export HTTPS_PROXY="http://192.168.56.1:3128"
export http_proxy="http://192.168.56.1:3128"
export https_proxy="http://192.168.56.1:3128"
```

Também é recomendado configurar:

```bash
export NO_PROXY="localhost,127.0.0.1,127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
export no_proxy="$NO_PROXY"
```

---

## 14. Tornar o proxy permanente

No Rocky Linux/RHEL/CentOS:

```bash
vi /etc/profile.d/proxy.sh
```

Adicione:

```bash
export HTTP_PROXY="http://192.168.56.1:3128"
export HTTPS_PROXY="http://192.168.56.1:3128"

export http_proxy="http://192.168.56.1:3128"
export https_proxy="http://192.168.56.1:3128"

export NO_PROXY="localhost,127.0.0.1,127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
export no_proxy="$NO_PROXY"
```

Aplique:

```bash
source /etc/profile.d/proxy.sh
```

Verifique:

```bash
env | grep -i proxy
```

---

## 15. Testar a comunicação entre Linux e Windows

Na VM:

```bash
ping -c 4 192.168.56.1
```

Depois teste a porta:

```bash
nc -vz 192.168.56.1 3128
```

Resultado esperado:

```text
Connection to 192.168.56.1 3128 port [tcp/*] succeeded!
```

Se `nc` não estiver instalado, utilize:

```bash
curl -v -x http://192.168.56.1:3128 https://www.google.com
```

---

## 16. Testar acesso à Internet através do proxy

Execute:

```bash
curl -I https://www.google.com
```

Ou explicitamente:

```bash
curl -x http://192.168.56.1:3128 -I https://www.google.com
```

Também pode testar:

```bash
curl -I https://registry-1.docker.io
```

---

## 17. Configurar DNF/YUM

Para o DNF utilizar o proxy:

```bash
vi /etc/dnf/dnf.conf
```

Adicione:

```ini
proxy=http://192.168.56.1:3128
```

Teste:

```bash
dnf clean all
dnf makecache
```

---

## 18. Configurar Docker

Edite:

```bash
mkdir -p /etc/systemd/system/docker.service.d
```

Crie:

```bash
vi /etc/systemd/system/docker.service.d/http-proxy.conf
```

Conteúdo:

```ini
[Service]
Environment="HTTP_PROXY=http://192.168.56.1:3128"
Environment="HTTPS_PROXY=http://192.168.56.1:3128"
Environment="NO_PROXY=localhost,127.0.0.1,127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
```

Recarregue:

```bash
systemctl daemon-reload
systemctl restart docker
```

Confirme:

```bash
systemctl show docker --property=Environment
```

Teste:

```bash
docker pull hello-world
```

---

## 19. Configurar Git

Para utilizar o proxy:

```bash
git config --global http.proxy http://192.168.56.1:3128
git config --global https.proxy http://192.168.56.1:3128
```

Verifique:

```bash
git config --global --get http.proxy
git config --global --get https.proxy
```

---

## 20. Configurar wget

O `wget` normalmente utilizará as variáveis:

```bash
HTTP_PROXY
HTTPS_PROXY
```

Teste:

```bash
wget https://www.google.com
```

---

## 21. Configurar repositórios e ferramentas adicionais

Qualquer aplicação que utilize as variáveis padrão de proxy poderá utilizar:

```text
http://IP_DO_WINDOWS:3128
```

Exemplo:

```text
HTTP Proxy  = http://192.168.56.1:3128
HTTPS Proxy = http://192.168.56.1:3128
```

---

## 22. Verificação completa

#### Windows

Verificar serviço:

```powershell
Get-Service Cntlm
```

Verificar porta:

```powershell
netstat -ano | findstr :3128
```

Testar localmente:

```powershell
curl.exe -x http://127.0.0.1:3128 -I https://www.google.com
```

#### Linux

Verificar conectividade:

```bash
ping -c 4 IP_DO_WINDOWS
```

Verificar porta:

```bash
nc -vz IP_DO_WINDOWS 3128
```

Verificar proxy:

```bash
env | grep -i proxy
```

Testar Internet:

```bash
curl -I https://www.google.com
```

Testar Docker:

```bash
docker pull hello-world
```

---

## 23. Utilização com clones da VM

A VM Linux pode ser clonada mantendo a configuração do proxy.

Exemplo:

```text
VM original
     │
     ├── Clone 01
     ├── Clone 02
     ├── Clone 03
     └── Clone 04
```

Todas podem utilizar:

```text
http://192.168.56.1:3128
```

Como o **IP do Windows é fixo**, não é necessário alterar a configuração do proxy em cada clone.

O ponto importante é garantir que:

1. O Windows continue utilizando o mesmo IP.
2. O Cntlm continue escutando na porta `3128`.
3. O Firewall continue permitindo a porta `3128`.
4. As VMs consigam alcançar o IP do Windows.
5. Não haja conflito de IP entre os clones.

---

## 24. Atenção ao IP da VM

O IP da própria VM **pode mudar** ao criar clones, principalmente se estiver utilizando DHCP.

Isso normalmente **não exige alteração do proxy**.

A configuração aponta para:

```text
IP DO WINDOWS:3128
```

e não para o IP da VM.

Portanto:

```text
VM 01 → Windows:3128
VM 02 → Windows:3128
VM 03 → Windows:3128
VM 04 → Windows:3128
```

---

## 25. Solução de problemas

### Cntlm não inicia

Verifique:

```powershell
Get-Service Cntlm
```

Veja os eventos do Windows ou tente executar manualmente:

```powershell
.\cntlm.exe -f -v
```

---

### Porta 3128 não está aberta

Verifique:

```powershell
netstat -ano | findstr :3128
```

Se não aparecer nada, verifique o `cntlm.ini`:

```ini
Listen 192.168.56.1:3128
```

---

### Linux não consegue conectar ao Windows

Na VM:

```bash
ping -c 4 IP_DO_WINDOWS
```

Depois:

```bash
nc -vz IP_DO_WINDOWS 3128
```

Se o `ping` funcionar mas a porta não:

* verificar o Cntlm;
* verificar o Firewall do Windows;
* verificar a configuração `Listen`;
* verificar a rede da VM.

---

### Cntlm funciona no Windows, mas não na VM

Teste primeiro:

```powershell
curl.exe -x http://127.0.0.1:3128 -I https://www.google.com
```

Depois:

```powershell
curl.exe -x http://IP_DO_WINDOWS:3128 -I https://www.google.com
```

Se funcionar no `127.0.0.1`, mas não no IP do Windows, provavelmente o problema está no `Listen` ou no Firewall.

---

## 26. Comandos rápidos

#### Windows

```powershell
Get-Service Cntlm
Start-Service Cntlm
Restart-Service Cntlm
Set-Service Cntlm -StartupType Automatic
netstat -ano | findstr :3128
```

Teste:

```powershell
curl.exe -x http://127.0.0.1:3128 -I https://www.google.com
```

#### Linux

```bash
export HTTP_PROXY="http://IP_DO_WINDOWS:3128"
export HTTPS_PROXY="http://IP_DO_WINDOWS:3128"

export http_proxy="http://IP_DO_WINDOWS:3128"
export https_proxy="http://IP_DO_WINDOWS:3128"

curl -I https://www.google.com
```

---

## 27. Resumo da arquitetura

```text
┌─────────────────────────────────────────────────────┐
│                    REDE CORPORATIVA                 │
│                                                     │
│  ┌───────────────┐                                  │
│  │ Proxy externo │                                  │
│  │ corporativo   │                                  │
│  └───────▲───────┘                                  │
│          │                                          │
│          │ autenticação NTLM                       │
│          │                                          │
│  ┌───────┴────────┐                                 │
│  │    WINDOWS     │                                 │
│  │                │                                 │
│  │     Cntlm      │                                 │
│  │    :3128       │                                 │
│  └───────▲────────┘                                 │
│          │                                          │
│          │ HTTP/HTTPS                               │
│          │                                          │
│  ┌───────┴────────┐                                 │
│  │    VM LINUX    │                                 │
│  │                │                                 │
│  │ HTTP_PROXY     │                                 │
│  │ HTTPS_PROXY    │                                 │
│  └────────────────┘                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Configuração final

```text
Windows
  Cntlm
  └── 192.168.56.1:3128

Linux
  HTTP_PROXY=http://IP_DO_WINDOWS:3128
  HTTPS_PROXY=http://IP_DO_WINDOWS:3128
```

**Essa configuração permite utilizar o Windows como gateway de proxy para as VMs Linux, mantendo o Cntlm como intermediário para o proxy corporativo.**


## WSL, validação e recuperação

No WSL com rede espelhada, verifique primeiro se o loopback do Windows é alcançável; nesse caso mantenha somente o listener local. No WSL2 com NAT, o endereço do host e a origem do cliente podem mudar: identifique ambos e autorize somente o cliente necessário na ACL e no firewall. Não substitua uma origem variável por toda a rede. Revise após reinicialização ou mudança de perfil.

Em laboratório, confirme: acesso local e da VM autorizada; recusa de uma segunda VM não autorizada; ausência de listener na interface corporativa; serviço e ACL NTFS após reinício; aplicação das restrições nos perfis de rede usados. Faça as tentativas contra um destino aprovado pela organização. Porta aberta não comprova autorização correta.

Para desativar o acesso, pare o serviço, remova somente a regra criada por este procedimento e revise as configurações de proxy dos clientes. Preserve uma cópia protegida da configuração anterior para recuperação. Não remova regras corporativas. Estes testes não foram executados nesta revisão.

Referência: [manual do Cntlm: Listen, Allow, Deny, Auth e hashes](https://cntlm.sourceforge.net/cntlm_manual.pdf). As ACLs são avaliadas em ordem; a primeira correspondência decide. Opções de ACL na linha de comando podem substituir as do arquivo: confira também os argumentos do serviço.
