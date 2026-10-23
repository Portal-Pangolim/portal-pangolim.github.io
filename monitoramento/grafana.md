---
layout: default
description: "Instalação do Grafana no Rocky Linux 9, configuração do repositório e verificação inicial do serviço."
title: Instalação do Grafana no Rocky Linux 9
---

# Instalação do Grafana no Rocky Linux 9
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Objetivo

Instalar o Grafana em um servidor Rocky Linux 9 para criação de dashboards e visualização de métricas.

---

## Ambiente

* Sistema Operacional: Rocky Linux 9
* Grafana: 13.x
* Porta padrão: 3000/TCP

---

## Adicionando o repositório oficial

Criar o arquivo de repositório:

```bash
cat > /etc/yum.repos.d/grafana.repo << 'EOF'
[grafana]
name=grafana
baseurl=https://rpm.grafana.com
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://rpm.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
EOF
```

Validar o repositório:

```bash
dnf repolist | grep grafana
```

Saída esperada:

```text
grafana              grafana
```

---

## Instalando o Grafana

Instalar o pacote:

```bash
dnf install grafana -y
```

Verificar a versão:

```bash
grafana-server -v
```

Exemplo:

```text
Version 13.0.2
```

---

## Habilitando o serviço

Iniciar o Grafana e configurar inicialização automática:

```bash
systemctl enable --now grafana-server
```

Verificar o status:

```bash
systemctl status grafana-server
```

Ou:

```bash
systemctl is-active grafana-server
```

Saída esperada:

```text
active
```

---

## Verificando a porta de escuta

O Grafana utiliza a porta TCP 3000 por padrão.

Verificar:

```bash
ss -tlnp | grep 3000
```

Exemplo:

```text
LISTEN 0 4096 *:3000 *:*
```

---

## Configurando o Firewall

Verificar se o Firewalld está ativo:

```bash
systemctl is-active firewalld
```

Liberar a porta 3000:

```bash
firewall-cmd --permanent --add-port=3000/tcp
```

Aplicar as alterações:

```bash
firewall-cmd --reload
```

Validar:

```bash
firewall-cmd --list-ports
```

Exemplo:

```text
3000/tcp
```

---

## Obtendo o IP do servidor

```bash
hostname -I
```

Ou:

```bash
ip -4 addr show
```

Exemplo:

```text
192.0.2.10
```

---

## Acessando o Grafana

Abrir no navegador:

```text
http://IP_DO_SERVIDOR:3000
```

Exemplo:

```text
http://192.0.2.10:3000
```

---

## Credenciais padrão

Primeiro acesso:

```text
Usuário: admin
Senha: admin
```

Após o login, o Grafana solicitará a alteração da senha.

---

## Comandos úteis

### Verificar status
{:.no_toc}
```bash
systemctl status grafana-server
```

### Reiniciar serviço
{:.no_toc}
```bash
systemctl restart grafana-server
```

### Parar serviço
{:.no_toc}
```bash
systemctl stop grafana-server
```

### Iniciar serviço
{:.no_toc}
```bash
systemctl start grafana-server
```

### Ver logs
{:.no_toc}
```bash
journalctl -u grafana-server -f
```

---

## Troubleshooting

### Serviço não inicia
{:.no_toc}
Verificar logs:

```bash
journalctl -xeu grafana-server
```

---

### Porta 3000 não responde
{:.no_toc}
Verificar escuta:

```bash
ss -tlnp | grep 3000
```

Verificar firewall:

```bash
firewall-cmd --list-ports
```

---

### Acesso recusado pelo navegador
{:.no_toc}
Verificar se o serviço está ativo:

```bash
systemctl is-active grafana-server
```

Verificar conectividade de rede:

```bash
ping IP_DO_SERVIDOR
```

---

## Resultado esperado

Ao final da instalação, o Grafana estará acessível através do navegador na porta 3000:

```text
http://IP_DO_SERVIDOR:3000
```

Pronto para integração com Zabbix, Prometheus, InfluxDB, PostgreSQL, MySQL e outras fontes de dados.
