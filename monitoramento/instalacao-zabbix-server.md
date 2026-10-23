---
layout: default
description: "Roteiro de instalação do Zabbix Server e dos componentes necessários ao monitoramento."
title: Instalação do Zabbix Server com PostgreSQL no Rocky Linux 9
---

# Instalação do Zabbix Server com PostgreSQL no Rocky Linux 9
{:.no_toc}

Este tutorial mostra uma instalação básica do Zabbix Server utilizando PostgreSQL como banco de dados.

Para monitorar outros servidores, consulte também:

- [Instalação do Zabbix Agent no Linux]({{ 'monitoramento/instalacao-zabbix-agent-linux.html' | relative_url }})
- [Instalação do Zabbix Agent no Windows]({{ 'monitoramento/instalacao-zabbix-agent-windows.html' | relative_url }})

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Adicionar o repositório do Zabbix

```bash
rpm -Uvh https://repo.zabbix.com/zabbix/7.0/rhel/9/x86_64/zabbix-release-latest-7.0.el9.noarch.rpm

dnf clean all
```

---

## Instalar os pacotes

```bash
dnf install -y \
zabbix-server-pgsql \
zabbix-web-pgsql \
zabbix-nginx-conf \
zabbix-sql-scripts \
zabbix-selinux-policy \
zabbix-agent
```

---

## Instalar PostgreSQL

```bash
dnf install -y postgresql-server
```

Inicializar o banco:

```bash
postgresql-setup --initdb
```

Habilitar o serviço:

```bash
systemctl enable --now postgresql
```

Verificar:

```bash
systemctl status postgresql
```

---

## Criar banco de dados

Acessar o PostgreSQL:

```bash
sudo -u postgres psql
```

Criar usuário:

```sql
CREATE USER zabbix WITH PASSWORD 'SUBSTITUA_POR_SENHA_PROPRIA';
```

Criar banco:

```sql
CREATE DATABASE zabbix OWNER zabbix;
```

Conceder permissões:

```sql
GRANT ALL PRIVILEGES ON DATABASE zabbix TO zabbix;
```

Sair:

```sql
\q
```

---

## Importar o schema do Zabbix

```bash
zcat /usr/share/zabbix/sql-scripts/postgresql/server.sql.gz | \
PGPASSWORD='SUBSTITUA_POR_SENHA_PROPRIA' psql -U zabbix -d zabbix
```

A importação pode levar alguns minutos.

---

## Configurar o Zabbix Server

Editar:

```bash
vi /etc/zabbix/zabbix_server.conf
```

Localizar:

```text
DBPassword=
```

Alterar:

```text
DBPassword=SUBSTITUA_POR_SENHA_PROPRIA
```

Salvar o arquivo.

---

## Iniciar serviços

```bash
systemctl enable --now zabbix-server
systemctl enable --now zabbix-agent
systemctl enable --now nginx
systemctl enable --now php-fpm
```

Verificar:

```bash
systemctl status zabbix-server
```

---

## Liberar firewall

```bash
firewall-cmd --permanent --add-service=http

firewall-cmd --reload
```

---

## Acessar interface Web

Abrir no navegador:

```text
http://IP_DO_SERVIDOR
```

Exemplo:

```text
http://192.0.2.35
```

---

## Login padrão

Altere a senha padrão no primeiro acesso. Os valores de senha neste tutorial são exemplos; substitua-os por credenciais próprias, fortes e exclusivas. Não registre segredos em repositórios públicos, nem copie comandos com senhas para históricos ou logs compartilhados.

```text
Usuário: Admin
Senha: zabbix
```

---

## Verificações úteis

Verificar logs do servidor:

```bash
tail -f /var/log/zabbix/zabbix_server.log
```

Verificar porta:

```bash
ss -tulpn | grep 10051
```

Verificar banco:

```bash
sudo -u postgres psql
```

---

## Serviços principais

```bash
systemctl status zabbix-server
systemctl status zabbix-agent
systemctl status postgresql
systemctl status nginx
systemctl status php-fpm
```