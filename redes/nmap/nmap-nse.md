---
layout: default
title: Nmap — NSE
description: Guia completo do Nmap Scripting Engine para inventário, auditoria defensiva, troubleshooting e automação.
---


# Nmap NSE: Scripts, Auditoria Defensiva e Automação
{:.no_toc}


O **Nmap Scripting Engine (NSE)** é o mecanismo de scripts do Nmap. Ele permite ampliar uma varredura tradicional de hosts, portas e versões com tarefas de descoberta, coleta de informações, validação de configuração e auditoria de segurança.

Os scripts NSE são escritos em **Lua** e são executados em paralelo pelo Nmap. Eles podem identificar títulos HTTP, cabeçalhos, chaves SSH, capacidades de serviços, certificados TLS, configurações de DNS, informações de SNMP e muitos outros dados úteis para inventário e hardening.

> **Uso autorizado:** execute Nmap e NSE somente em ativos próprios ou sob autorização formal, com escopo, janela e responsáveis definidos. Scripts NSE não executam em sandbox e podem gerar tráfego, consumir recursos ou expor dados a terceiros dependendo do script utilizado.


---


<div class="toc-title">Sumário</div>
* Sumário:
{:toc}


---


## 1. Objetivo


Este documento apresenta:


* Funcionamento do Nmap Scripting Engine
* Onde os scripts NSE ficam armazenados
* Categorias de scripts e avaliação de risco
* Uso de `-sC`, `--script` e `--script-help`
* Uso de argumentos com `--script-args`
* Scripts seguros para inventário e auditoria
* Auditoria de HTTP/HTTPS, SSH, DNS, SMB, SNMP e TLS
* Automação com Bash e Ansible
* Criação de scripts NSE simples em Lua
* Boas práticas, evidências e troubleshooting


---


## 2. Conceitos


### 2.1 O que é NSE
{:.no_toc}

O NSE é uma extensão do Nmap para automatizar tarefas de rede.

Enquanto um scan tradicional pode responder:


```text
A porta TCP 443 está aberta.
```

um script NSE pode complementar a resposta:


```text
A porta TCP 443 está aberta.
O servidor responde como HTTPS.
O título da página é "Portal Interno".
O certificado expira em 42 dias.
A aplicação não envia determinados cabeçalhos de segurança.
```

O NSE pode ser usado para:


* Inventário técnico
* Descoberta de serviços
* Identificação de versões
* Verificação de configurações expostas
* Auditoria de certificados TLS
* Coleta de banners
* Diagnóstico de DNS
* Diagnóstico de conectividade
* Verificação de hardening
* Geração de evidências para relatórios
* Automação de verificações repetitivas


---


### 2.2 Fluxo de execução
{:.no_toc}

```text
Definir escopo autorizado
          |
          v
Descobrir hosts ativos
          |
          v
Identificar portas abertas
          |
          v
Detectar serviços e versões
          |
          v
Executar scripts NSE compatíveis
          |
          v
Analisar resultados
          |
          v
Validar no ativo, firewall e logs
          |
          v
Corrigir e executar reteste
```


Na maioria dos casos, scripts NSE são executados em conjunto com um scan de portas, pois vários scripts dependem de portas abertas e serviços detectados.


---


### 2.3 Tipos de scripts
{:.no_toc}

O NSE possui quatro tipos principais de scripts:


| Tipo | Momento de execução | Uso típico |
| --- | --- | --- |
| `prerule` | Antes das fases de scan | Descoberta por broadcast e tarefas independentes do alvo |
| `hostrule` | Para cada host elegível | Coleta de informações do host |
| `portrule` | Para cada serviço/porta elegível | HTTP, SSH, DNS, TLS, SMB e outros serviços |
| `postrule` | Após o scan completo | Consolidação, comparação e apresentação de resultados |


Exemplo conceitual:


```text
Prerule
  |
  +-- Detectar serviços por broadcast na rede local
  |
Hostrule
  |
  +-- Consultar informações relacionadas ao IP do host
  |
Portrule
  |
  +-- Executar http-title na porta 443
  +-- Executar ssh-hostkey na porta 22
  |
Postrule
  |
  +-- Comparar chaves SSH duplicadas entre hosts varridos
```


---


## 3. Instalação e localização dos scripts


### 3.1 Instalação do Nmap
{:.no_toc}

No Rocky Linux, RHEL, AlmaLinux ou Fedora:


```bash
dnf install -y nmap
```


No Debian ou Ubuntu:


```bash
sudo apt update
sudo apt install -y nmap
```


Verificar a instalação:


```bash
nmap --version
```


---


### 3.2 Diretório dos scripts NSE
{:.no_toc}

Em distribuições Linux, os scripts geralmente ficam em um destes caminhos:


```bash
/usr/share/nmap/scripts
```


ou:


```bash
/usr/local/share/nmap/scripts
```


Localizar o diretório real:


```bash
find /usr/share /usr/local/share -type d -path '*/nmap/scripts' 2>/dev/null
```


Listar scripts disponíveis:


```bash
ls -1 /usr/share/nmap/scripts | less
```


Filtrar scripts HTTP:


```bash
ls -1 /usr/share/nmap/scripts/http-*
```


Filtrar scripts SSH:


```bash
ls -1 /usr/share/nmap/scripts/ssh-*
```


Filtrar scripts DNS:


```bash
ls -1 /usr/share/nmap/scripts/dns-*
```


---


### 3.3 Banco de scripts
{:.no_toc}


O Nmap mantém um banco de dados de scripts para localizar rapidamente scripts e categorias:


```text
/usr/share/nmap/scripts/script.db
```


Ao adicionar, remover ou alterar scripts locais, atualize o banco:


```bash
sudo nmap --script-updatedb
```


Verificar se o script foi indexado:


```bash
grep -i 'meu-script' /usr/share/nmap/scripts/script.db
```


---


## 4. Categorias NSE


Os scripts NSE possuem categorias. A categoria ajuda a entender a finalidade e o risco potencial, mas não substitui a leitura da documentação do script.


| Categoria | Finalidade | Política recomendada |
| --- | --- | --- |
| `safe` | Coleta e descoberta com risco reduzido | Permitida após validação do escopo |
| `default` | Conjunto padrão do Nmap | Revisar antes de executar |
| `discovery` | Descoberta de rede, serviços e dados | Usar em escopo limitado |
| `version` | Complementa detecção de versão | Executada com `-sV` |
| `auth` | Informações sobre autenticação | Usar apenas com autorização |
| `broadcast` | Descoberta via broadcast/multicast | Somente em rede local autorizada |
| `external` | Consulta recursos de terceiros | Avaliar privacidade e conformidade |
| `malware` | Indicadores de malware ou backdoors | Validar resultado com equipe de segurança |
| `vuln` | Verificações relacionadas a vulnerabilidades conhecidas | Exige autorização explícita |
| `intrusive` | Pode consumir recursos ou ser percebido como ataque | Não usar sem aprovação específica |
| `brute` | Tentativas de credenciais | Não usar em ambientes reais |
| `dos` | Pode causar indisponibilidade | Não usar |
| `exploit` | Exploração ativa de falhas | Não usar |
| `fuzzer` | Envia entradas inesperadas ou aleatórias | Não usar |


---


### 4.1 Categoria `safe`
{:.no_toc}

A categoria `safe` é a mais apropriada para inventário e auditoria inicial.

Ela contém scripts que não foram projetados para:


* Derrubar serviços
* Consumir grandes quantidades de banda
* Exaurir CPU ou memória
* Explorar falhas de segurança


Mesmo scripts `safe` podem gerar alertas em IDS/IPS, WAF, proxy ou SIEM. Portanto, informe a equipe responsável antes de uma execução em produção.


Listar informações sobre scripts seguros:


```bash
nmap --script-help safe
```


Executar scripts seguros em poucas portas autorizadas:


```bash
nmap -sT -sV \
  -p 22,80,443 \
  --script safe \
  192.168.56.20
```


---


### 4.2 Categoria `default`
{:.no_toc}

A opção:


```bash
-sC
```


equivale a:


```bash
--script=default
```


Exemplo:


```bash
nmap -sT -sV -sC -p 22,80,443 192.168.56.20
```


Embora seja comum, `-sC` não deve ser usado automaticamente contra qualquer rede. O conjunto padrão pode variar entre versões e alguns scripts podem ser mais invasivos do que o esperado para determinado ambiente.


Antes de executar, visualize os scripts selecionados:


```bash
nmap --script-help default
```


---


### 4.3 Categorias que exigem cuidado
{:.no_toc}

Evite as categorias abaixo em produção sem aprovação explícita, testes prévios e janela de mudança:


```text
brute
dos
exploit
fuzzer
intrusive
```


Também trate `vuln`, `auth`, `broadcast` e `external` com cuidado.


Motivos:


| Categoria | Risco principal |
| --- | --- |
| `brute` | Bloqueio de contas, alertas e volume de tentativas |
| `dos` | Indisponibilidade parcial ou total do serviço |
| `exploit` | Alteração, execução ou comprometimento do alvo |
| `fuzzer` | Consumo de recursos e comportamento inesperado |
| `intrusive` | Tráfego intenso, logs, alertas ou efeito operacional |
| `external` | Vazamento de IP, domínio ou metadados para terceiros |
| `broadcast` | Descoberta de ativos fora da lista original |
| `vuln` | Possível impacto ou falsos positivos |
| `auth` | Consulta de mecanismos de autenticação e dados sensíveis |


---


## 5. Seleção de scripts


### 5.1 Executar scripts padrão
{:.no_toc}

```bash
nmap -sC 192.168.56.20
```


Com identificação de versão:


```bash
nmap -sT -sV -sC -p 22,80,443 192.168.56.20
```


---


### 5.2 Executar um script específico
{:.no_toc}

Exemplo: obter o título de páginas HTTP/HTTPS.


```bash
nmap -sT \
  -p 80,443 \
  --script http-title \
  192.168.56.20
```


Exemplo: coletar chave pública SSH.


```bash
nmap -sT \
  -p 22 \
  --script ssh-hostkey \
  192.168.56.20
```


Exemplo: consultar cabeçalhos HTTP.


```bash
nmap -sT \
  -p 80,443 \
  --script http-headers \
  192.168.56.20
```


---


### 5.3 Executar vários scripts
{:.no_toc}

Scripts separados por vírgula:


```bash
nmap -sT \
  -p 80,443 \
  --script http-title,http-headers,http-security-headers \
  192.168.56.20
```


Scripts de SSH e TLS:


```bash
nmap -sT \
  -p 22,443 \
  --script ssh-hostkey,ssl-cert \
  192.168.56.20
```


---


### 5.4 Usar padrões com curinga
{:.no_toc}

Todos os scripts cujo nome começa com `http-`:


```bash
nmap -sT \
  -p 80,443 \
  --script "http-*" \
  192.168.56.20
```


> Atenção: esse padrão pode incluir scripts não apropriados para uma auditoria inicial. Prefira scripts nomeados explicitamente ou expressões com exclusões.


Exemplo mais restritivo:


```bash
nmap -sT \
  -p 80,443 \
  --script "http-title,http-headers,http-security-headers,http-methods" \
  192.168.56.20
```


---


### 5.5 Expressões booleanas
{:.no_toc}

O Nmap permite combinar categorias e nomes com:


```text
and
or
not
```


Exemplo: scripts padrão que também são classificados como seguros:


```bash
nmap -sT \
  -p 22,80,443 \
  --script "default and safe" \
  192.168.56.20
```


Exemplo: scripts seguros ou padrão, excluindo scripts HTTP:


```bash
nmap -sT \
  -p 22,80,443 \
  --script "(default or safe) and not http-*" \
  192.168.56.20
```


Para auditoria operacional, prefira a seleção explícita de scripts. Ela torna o comando mais previsível, fácil de auditar e simples de repetir.


---


## 6. Consultar documentação antes da execução


Antes de executar qualquer script, use:


```bash
nmap --script-help NOME_DO_SCRIPT
```


Exemplo:


```bash
nmap --script-help http-security-headers
```


Exemplo:


```bash
nmap --script-help ssl-cert
```


Exemplo:


```bash
nmap --script-help ssh-hostkey
```


A saída normalmente apresenta:


* Nome do script
* Categorias
* Descrição
* Argumentos aceitos
* Dependências
* Observações de uso
* Referência para documentação NSE


Para consultar vários scripts:


```bash
nmap --script-help http-title,http-headers,ssl-cert
```


Para pesquisar scripts disponíveis por padrão:


```bash
nmap --script-help "http-*"
```


---


## 7. Scripts úteis para inventário defensivo


### 7.1 HTTP e HTTPS
{:.no_toc}

#### Título da aplicação
{:.no_toc}

```bash
nmap -sT \
  -p 80,443 \
  --script http-title \
  192.168.56.20
```


Uso:


* Identificar páginas padrão
* Encontrar portais administrativos expostos
* Validar redirecionamentos
* Diferenciar aplicações em um mesmo ambiente


---


#### Cabeçalhos HTTP
{:.no_toc}

```bash
nmap -sT \
  -p 80,443 \
  --script http-headers \
  192.168.56.20
```


Uso:


* Verificar `Server`
* Verificar `Location`
* Verificar `Content-Type`
* Identificar proxies e balanceadores
* Validar redirecionamentos HTTP para HTTPS


---


#### Cabeçalhos de segurança
{:.no_toc}

```bash
nmap -sT \
  -p 443 \
  --script http-security-headers \
  192.168.56.20
```


Exemplos de cabeçalhos relevantes:


```text
Strict-Transport-Security
Content-Security-Policy
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
```


O resultado deve ser validado com a equipe de desenvolvimento ou segurança. Ausência de cabeçalho não significa automaticamente vulnerabilidade explorável; pode indicar melhoria de hardening.


---


#### Métodos HTTP
{:.no_toc}

```bash
nmap -sT \
  -p 80,443 \
  --script http-methods \
  192.168.56.20
```


Uso:


* Verificar métodos aceitos pelo servidor
* Identificar métodos inesperados
* Apoiar revisão de configuração de proxy, WAF ou aplicação


Métodos que merecem revisão conforme o contexto:


```text
PUT
DELETE
TRACE
CONNECT
PATCH
```


Não conclua risco apenas porque um método aparece na resposta. Valide se ele é realmente aceito, se exige autenticação e se faz parte do comportamento esperado da aplicação.


---


#### Cookies HTTP
{:.no_toc}

```bash
nmap -sT \
  -p 443 \
  --script http-cookie-flags \
  192.168.56.20
```


Uso:


* Verificar cookies de sessão
* Identificar ausência de atributos `Secure`
* Identificar ausência de `HttpOnly`
* Apoiar revisão de configuração de aplicação


---


### 7.2 SSH
{:.no_toc}

#### Chaves públicas SSH
{:.no_toc}

```bash
nmap -sT \
  -p 22 \
  --script ssh-hostkey \
  192.168.56.20
```


Uso:


* Inventariar fingerprints
* Identificar hosts com chaves duplicadas
* Validar reconstrução indevida de imagens clonadas
* Apoiar inventário de bastions e servidores


Para múltiplos ativos:


```bash
nmap -sT \
  -p 22 \
  --script ssh-hostkey \
  -iL servidores-ssh.txt
```


Uma chave SSH duplicada entre hosts diferentes pode indicar clonagem de VM, imagem mal preparada ou reuso indevido de chaves. Investigue antes de substituir chaves em produção.


---


#### Algoritmos SSH
{:.no_toc}

```bash
nmap -sT \
  -p 22 \
  --script ssh2-enum-algos \
  192.168.56.20
```


Uso:


* Inventariar algoritmos de chave
* Revisar algoritmos de cifra
* Verificar MACs negociáveis
* Apoiar hardening de `sshd_config`


Após a coleta, valide a configuração local:


```bash
sudo sshd -T | sort
```


Arquivo principal:


```bash
sudo cat /etc/ssh/sshd_config
```


---


### 7.3 TLS e certificados
{:.no_toc}

#### Certificado TLS
{:.no_toc}

```bash
nmap -sT \
  -p 443 \
  --script ssl-cert \
  192.168.56.20
```


Uso:


* Identificar emissor
* Identificar validade
* Verificar Subject Alternative Name
* Verificar algoritmo da chave
* Apoiar controle de expiração de certificados


Quando o serviço exige SNI, use o nome correto da aplicação:


```bash
nmap -sT \
  -p 443 \
  --script ssl-cert \
  --script-args tls.servername=app.lab.local \
  192.168.56.20
```


---


#### Cifras TLS
{:.no_toc}

```bash
nmap -sT \
  -p 443 \
  --script ssl-enum-ciphers \
  192.168.56.20
```


Uso:


* Inventariar versões TLS
* Identificar cifras legadas
* Apoiar adequação de proxy, Nginx, Apache, HAProxy ou load balancer


Execute primeiro em homologação. A enumeração de cifras pode gerar múltiplas conexões e alertas em ferramentas de monitoramento.


---


### 7.4 DNS
{:.no_toc}

#### Recursão DNS
{:.no_toc}

```bash
nmap -sU \
  -p 53 \
  --script dns-recursion \
  192.168.56.53
```


Uso:


* Validar se um servidor DNS aceita recursão
* Confirmar comportamento de resolvers internos
* Identificar exposição indevida de recursão em serviços públicos


Em DNS interno, recursão pode ser esperada. Em DNS público autoritativo, recursão geralmente deve ser restrita.


---


#### Informações do servidor DNS
{:.no_toc}

```bash
nmap -sU \
  -p 53 \
  --script dns-nsid \
  192.168.56.53
```


Uso:


* Identificar informações expostas pelo serviço
* Verificar NSID
* Validar exposição de `id.server`
* Revisar exposição de informações de versão


---


#### Verificação de zona
{:.no_toc}

```bash
nmap -sU \
  -p 53 \
  --script dns-check-zone \
  --script-args dns-check-zone.domain=lab.local \
  192.168.56.53
```


Uso:


* Revisar práticas de configuração de zona
* Apoiar validação de DNS autoritativo
* Identificar inconsistências de registros


---


### 7.5 SNMP
{:.no_toc}

#### Descrição do sistema
{:.no_toc}

```bash
nmap -sU \
  -p 161 \
  --script snmp-sysdescr \
  192.168.56.1
```


Uso:


* Identificar descrição de sistema
* Confirmar inventário de equipamento
* Apoiar revisão de exposição SNMP


> Execute somente contra dispositivos que fazem parte do escopo e possuem comunidade ou credenciais autorizadas. SNMP pode expor dados de alto valor operacional.


---


### 7.6 SMB e Windows
{:.no_toc}

#### Informações do sistema SMB
{:.no_toc}

```bash
nmap -sT \
  -p 445 \
  --script smb-os-discovery \
  192.168.56.30
```


Uso:


* Coletar informações de sistema em ambiente Windows autorizado
* Apoiar inventário de hosts
* Validar conectividade SMB


A saída pode ser limitada por políticas de segurança, firewall, autenticação ou endurecimento de SMB.


---


### 7.7 Bancos de dados
{:.no_toc}

Para bancos de dados, priorize inventário de portas, versão e necessidade de exposição. Não execute scripts que consultem tabelas, credenciais ou façam alterações sem aprovação específica.


Exemplo de coleta básica de informações de MySQL em laboratório autorizado:


```bash
nmap -sT \
  -p 3306 \
  --script mysql-info \
  192.168.56.40
```


Exemplo de verificação de exposição PostgreSQL:


```bash
nmap -sT \
  -sV \
  -p 5432 \
  192.168.56.41
```


Para produção, a validação preferencial deve ocorrer com o time de banco, inventário de serviços, firewall e configurações locais.


---


## 8. Argumentos de scripts


### 8.1 Sintaxe
{:.no_toc}

Argumentos NSE são informados com:


```bash
--script-args "nome=valor"
```


Exemplo:


```bash
nmap -sT \
  -p 443 \
  --script ssl-cert \
  --script-args tls.servername=portal.lab.local \
  192.168.56.20
```


Vários argumentos:


```bash
nmap -sT \
  -p 443 \
  --script http-title,http-headers \
  --script-args "http.useragent=Pangolim-Auditoria/1.0" \
  192.168.56.20
```


---


### 8.2 Consultar argumentos aceitos
{:.no_toc}

Sempre consulte a ajuda do script antes de usar argumentos:


```bash
nmap --script-help ssl-cert
```


```bash
nmap --script-help dns-check-zone
```


```bash
nmap --script-help http-title
```


Não invente nomes de argumentos. Argumentos incorretos podem ser ignorados silenciosamente ou resultar em comportamento inesperado.


---


### 8.3 Arquivo de argumentos
{:.no_toc}

Para não expor argumentos sensíveis no histórico do shell, use um arquivo protegido.


Criar arquivo:


```bash
cat > nse-args.conf <<'EOF'
http.useragent=Pangolim-Auditoria/1.0
tls.servername=portal.lab.local
EOF
```


Proteger permissões:


```bash
chmod 600 nse-args.conf
```


Usar no Nmap:


```bash
nmap -sT \
  -p 443 \
  --script ssl-cert,http-headers \
  --script-args-file nse-args.conf \
  192.168.56.20
```


Não salve senhas, tokens, comunidades SNMP ou arquivos de argumentos sensíveis em repositórios Git públicos.


---


## 9. Perfis operacionais seguros


### 9.1 Inventário básico de servidores
{:.no_toc}

```bash
nmap -sT \
  -sV \
  --version-light \
  -p 22,80,443 \
  --script ssh-hostkey,http-title,http-headers,ssl-cert \
  -oA evidencias/inventario-basico \
  -iL alvos-aprovados.txt
```


Objetivo:


* Confirmar SSH, HTTP e HTTPS
* Coletar banners e versões
* Coletar chave SSH
* Coletar título HTTP
* Coletar certificado TLS
* Gerar saída normal, XML e grepável


---


### 9.2 Auditoria básica de HTTPS
{:.no_toc}

```bash
nmap -sT \
  -p 443 \
  --script http-title,http-headers,http-security-headers,http-cookie-flags,ssl-cert \
  -oA evidencias/https-auditoria \
  192.168.56.20
```


Objetivo:


* Verificar título da aplicação
* Coletar cabeçalhos
* Verificar cabeçalhos de segurança
* Avaliar atributos de cookies
* Verificar certificado TLS


---


### 9.3 Validação de DNS interno
{:.no_toc}

```bash
nmap -sU \
  -p 53 \
  --script dns-recursion,dns-nsid \
  -oA evidencias/dns-interno \
  192.168.56.53
```


Objetivo:


* Validar disponibilidade UDP/53
* Verificar comportamento de recursão
* Revisar informações de identificação expostas


---


### 9.4 Validação de SSH
{:.no_toc}

```bash
nmap -sT \
  -p 22 \
  --script ssh-hostkey,ssh2-enum-algos \
  -oA evidencias/ssh-auditoria \
  -iL servidores-ssh.txt
```


Objetivo:


* Coletar fingerprints SSH
* Comparar possíveis chaves duplicadas
* Inventariar algoritmos suportados
* Apoiar hardening de SSH


---


## 10. Saída e evidências


### 10.1 Formatos de saída
{:.no_toc}

| Opção | Formato | Uso |
| --- | --- | --- |
| `-oN arquivo.txt` | Normal | Leitura humana |
| `-oX arquivo.xml` | XML | Integração e processamento |
| `-oG arquivo.gnmap` | Grepável | Compatibilidade com scripts legados |
| `-oA prefixo` | Todos os formatos principais | Recomendado para evidência |


Exemplo:


```bash
mkdir -p evidencias/nmap
```


```bash
nmap -sT \
  -p 22,443 \
  --script ssh-hostkey,ssl-cert \
  -oA evidencias/nmap/servidor-01 \
  192.168.56.20
```


Arquivos gerados:


```text
servidor-01.nmap
servidor-01.xml
servidor-01.gnmap
```


---


### 10.2 Dados sensíveis
{:.no_toc}

A saída do NSE pode conter:


* Versões de software
* Nomes de host
* Domínios internos
* IPs privados
* Cabeçalhos HTTP
* Configurações de serviço
* Chaves públicas SSH
* Certificados
* Informações de rede
* Dados expostos acidentalmente por um serviço


Boas práticas:


```text
Não publicar saídas em repositórios públicos.
Não anexar saída completa em tickets abertos.
Remover IPs e domínios internos de exemplos públicos.
Armazenar evidências em local com controle de acesso.
Definir prazo de retenção.
Registrar data, origem e autorização da execução.
```


---


## 11. Automação com Bash


### 11.1 Script de inventário
{:.no_toc}

Criar arquivo:


```bash
vi nmap-inventario.sh
```


Conteúdo:


```bash
#!/usr/bin/env bash

set -euo pipefail

ALVOS="${1:?Informe o arquivo de alvos aprovados}"
DATA="$(date +%F_%H%M%S)"
DIRETORIO="evidencias/nmap/${DATA}"

mkdir -p "${DIRETORIO}"

nmap \
  -sT \
  -sV \
  --version-light \
  -p 22,80,443 \
  --script ssh-hostkey,http-title,http-headers,ssl-cert \
  -iL "${ALVOS}" \
  -oA "${DIRETORIO}/inventario"

echo "Evidências salvas em: ${DIRETORIO}"
```


Dar permissão:


```bash
chmod 750 nmap-inventario.sh
```


Executar:


```bash
./nmap-inventario.sh alvos-aprovados.txt
```


Exemplo de arquivo de alvos:


```text
192.168.56.20
192.168.56.21
192.168.56.22
```


---


### 11.2 Cuidados na automação
{:.no_toc}

Antes de agendar uma automação:


* Validar o comando contra um único host
* Validar horário de execução
* Definir taxa e timeout adequados
* Criar lista explícita de ativos autorizados
* Proteger arquivos de saída
* Notificar equipes responsáveis
* Registrar mudanças no escopo
* Tratar falhas de scan sem repetir indefinidamente


---


## 12. Automação com Ansible


Exemplo de playbook para executar uma auditoria limitada a partir do nó de administração.


Arquivo:


```text
playbooks/nmap-auditoria.yml
```


Conteúdo:


```yaml
***
- name: Auditoria Nmap NSE autorizada
  hosts: localhost
  gather_facts: false

  vars:
    alvo: 192.168.56.20
    portas: "22,80,443"
    scripts: "ssh-hostkey,http-title,http-headers,ssl-cert"

  tasks:

    - name: Executar inventário controlado
      ansible.builtin.command:
        argv:
          - nmap
          - -sT
          - -sV
          - --version-light
          - -p
          - "{{ portas }}"
          - --script
          - "{{ scripts }}"
          - "{{ alvo }}"
      register: nmap_result
      changed_when: false

    - name: Mostrar resultado
      ansible.builtin.debug:
        var: nmap_result.stdout_lines
```


Executar:


```bash
ansible-playbook playbooks/nmap-auditoria.yml
```


Para produção, grave a saída em diretório protegido, registre o identificador de mudança e limite os alvos a inventários revisados.


---


## 13. Criar script NSE simples


### 13.1 Estrutura básica
{:.no_toc}

Scripts NSE são escritos em Lua e normalmente possuem:


* Metadados
* Categorias
* Regra de execução
* Função `action`
* Bibliotecas Nmap/NSE


Exemplo didático que apenas imprime uma mensagem para hosts elegíveis:


```lua
description = [[
Script didático para validar a estrutura de um script NSE local.
Não realiza conexão nem alteração no alvo.
]]

author = "Pangolim"

license = "Same as Nmap"

categories = { "safe", "discovery" }

hostrule = function(host)
  return true
end

action = function(host)
  return "Host avaliado: " .. host.ip
end
```


Salvar como:


```text
pangolim-host-info.nse
```


Copiar para o diretório de scripts local:


```bash
sudo cp pangolim-host-info.nse /usr/share/nmap/scripts/
```


Atualizar banco:


```bash
sudo nmap --script-updatedb
```


Executar em laboratório:


```bash
nmap -sn \
  --script pangolim-host-info \
  192.168.56.20
```


---


### 13.2 Script simples para serviço HTTP
{:.no_toc}

Exemplo didático que roda apenas quando o Nmap identifica HTTP ou HTTPS.


```lua
local shortport = require "shortport"

description = [[
Script didático que informa que uma porta HTTP/HTTPS foi encontrada.
Não faz coleta adicional nem altera o alvo.
]]

author = "Pangolim"

license = "Same as Nmap"

categories = { "safe", "discovery" }

portrule = shortport.http

action = function(host, port)
  return string.format(
    "Serviço HTTP/HTTPS identificado em %s:%d",
    host.ip,
    port.number
  )
end
```


Salvar como:


```text
pangolim-http-info.nse
```


Executar em laboratório:


```bash
nmap -sT \
  -p 80,443 \
  --script pangolim-http-info \
  192.168.56.20
```


---


### 13.3 Boas práticas para scripts próprios
{:.no_toc}

* Começar com scripts sem alteração de estado
* Evitar armazenar credenciais no código
* Validar entradas recebidas por argumentos
* Implementar timeout e tratamento de erro
* Usar nomes específicos, como `pangolim-http-info`
* Documentar categorias, objetivo e argumentos
* Executar em laboratório antes de usar em produção
* Revisar scripts de terceiros antes de instalar
* Atualizar o banco com `nmap --script-updatedb`
* Versionar scripts internos em repositório privado


---


## 14. Debug e troubleshooting


### 14.1 Script não foi executado
{:.no_toc}

Verificar se o script existe:


```bash
ls -l /usr/share/nmap/scripts/NOME-DO-SCRIPT.nse
```


Consultar a documentação:


```bash
nmap --script-help NOME-DO-SCRIPT
```


Atualizar banco de scripts:


```bash
sudo nmap --script-updatedb
```


Verificar se a porta necessária está aberta:


```bash
nmap -sT -sV -p 22,80,443 192.168.56.20
```


Muitos scripts possuem `portrule`, portanto só executam quando o serviço ou porta correspondente é detectado.


---


### 14.2 A saída está vazia
{:.no_toc}

Possíveis causas:


* Script não encontrou informação relevante
* Serviço exige autenticação
* Firewall ou WAF filtrou a consulta
* Porta está fechada ou filtrada
* Serviço está em porta não padrão
* Host usa proxy reverso ou balanceador
* Script depende de detecção de versão
* Script não é compatível com o serviço detectado


Ação recomendada:


```bash
nmap -sT -sV -vv \
  -p 80,443 \
  --script http-title,http-headers \
  192.168.56.20
```


---


### 14.3 Exibir rastreio de scripts
{:.no_toc}

Para depurar comunicação de scripts em laboratório, use:


```bash
nmap -sT \
  -p 443 \
  --script ssl-cert \
  --script-trace \
  192.168.56.20
```


> Atenção: `--script-trace` pode exibir conteúdo de requisições e respostas. Não compartilhe essa saída sem revisar dados sensíveis.


---


### 14.4 Host parece indisponível
{:.no_toc}

Validar rota:


```bash
ip route get 192.168.56.20
```


Validar resolução:


```bash
getent hosts servidor.lab.local
```


Executar descoberta:


```bash
nmap -sn -n 192.168.56.20
```


Quando houver evidência de que o host está ativo, mas bloqueia descoberta, execute somente portas autorizadas:


```bash
nmap -Pn \
  -sT \
  -p 22,443 \
  --script ssh-hostkey,ssl-cert \
  192.168.56.20
```


Não use `-Pn` como padrão em redes grandes: isso pode aumentar tempo, tráfego e resultados ambíguos.


---


## 15. Checklist de execução


### Antes
{:.no_toc}

- [ ] Existe autorização formal?
- [ ] Os IPs, domínios e portas estão definidos?
- [ ] Há janela de execução aprovada?
- [ ] As equipes foram avisadas?
- [ ] Há critério de parada?
- [ ] O scan foi validado em laboratório ou homologação?
- [ ] A saída será armazenada de forma segura?
- [ ] Scripts foram revisados com `--script-help`?


### Durante
{:.no_toc}

- [ ] O tráfego está dentro do esperado?
- [ ] Há alertas de indisponibilidade?
- [ ] O firewall, IDS/IPS ou WAF registrou eventos inesperados?
- [ ] O comando e o horário foram registrados?
- [ ] O escopo permanece o mesmo da autorização?


### Depois
{:.no_toc}

- [ ] Resultados foram comparados com CMDB e inventário?
- [ ] Achados foram validados no host?
- [ ] Portas sem necessidade foram tratadas?
- [ ] Configurações foram corrigidas?
- [ ] Houve reteste após a correção?
- [ ] Evidências foram protegidas?
- [ ] O relatório contém responsável, prazo e risco?


---


## 16. Referência rápida


```bash
# Ver scripts disponíveis
ls -1 /usr/share/nmap/scripts | less

# Consultar ajuda de um script
nmap --script-help http-title

# Executar scripts padrão
nmap -sC 192.168.56.20

# Executar scripts padrão com identificação de versões
nmap -sT -sV -sC -p 22,80,443 192.168.56.20

# Executar scripts seguros em portas específicas
nmap -sT -sV -p 22,80,443 --script safe 192.168.56.20

# Título HTTP
nmap -sT -p 80,443 --script http-title 192.168.56.20

# Cabeçalhos HTTP
nmap -sT -p 80,443 --script http-headers 192.168.56.20

# Cabeçalhos de segurança HTTP
nmap -sT -p 443 --script http-security-headers 192.168.56.20

# Certificado TLS
nmap -sT -p 443 --script ssl-cert 192.168.56.20

# Cifras TLS
nmap -sT -p 443 --script ssl-enum-ciphers 192.168.56.20

# Chaves SSH
nmap -sT -p 22 --script ssh-hostkey 192.168.56.20

# Algoritmos SSH
nmap -sT -p 22 --script ssh2-enum-algos 192.168.56.20

# Recursão DNS
nmap -sU -p 53 --script dns-recursion 192.168.56.53

# Informações DNS
nmap -sU -p 53 --script dns-nsid 192.168.56.53

# Salvar todos os formatos de evidência
nmap -sT -p 22,443 --script ssh-hostkey,ssl-cert \
  -oA evidencias/servidor-01 \
  192.168.56.20

# Atualizar banco após adicionar scripts próprios
sudo nmap --script-updatedb
```


---


## 17. Conclusão


O NSE transforma o Nmap em uma ferramenta mais completa para inventário, validação e auditoria. O uso seguro depende menos da quantidade de scripts executados e mais de um processo disciplinado:


```text
Escopo autorizado
        +
Seleção explícita de scripts
        +
Portas limitadas
        +
Baixo impacto
        +
Validação manual
        +
Correção e reteste
```


Para ambientes corporativos, comece com scripts específicos e previsíveis:


```text
ssh-hostkey
ssh2-enum-algos
http-title
http-headers
http-security-headers
http-cookie-flags
ssl-cert
dns-recursion
dns-nsid
```


Evite executar categorias amplas, scripts de terceiros não revisados ou qualquer técnica que possa afetar disponibilidade, autenticação ou confidencialidade sem autorização explícita.