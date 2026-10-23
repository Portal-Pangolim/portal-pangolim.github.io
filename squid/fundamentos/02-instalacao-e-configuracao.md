---
layout: default
title: Instalação e Configuração do Squid
description: "Instalação, configuração inicial e validação do Squid."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3v12"/>
    <path d="m7 10 5 5 5-5"/>
    <path d="M5 21h14"/>
  </svg>
  Instalação e Configuração
</h1>

---

## Instalação

Em sistemas baseados em Red Hat, o Squid pode ser instalado utilizando:

```bash
dnf install squid
```

Após a instalação, verifique o serviço:

```bash
systemctl status squid
```

---

## Inicialização do serviço

Para iniciar o Squid:

```bash
systemctl start squid
```

Para habilitar a inicialização automática:

```bash
systemctl enable squid
```

É possível verificar:

```bash
systemctl is-enabled squid
```

---

## Arquivo principal

A configuração principal normalmente fica em:

```text
/etc/squid/squid.conf
```

Antes de alterar o arquivo, é recomendável realizar uma cópia:

```bash
cp /etc/squid/squid.conf /etc/squid/squid.conf.bak
```

---

## Validando a configuração

Antes de aplicar uma alteração, valide a configuração:

```bash
squid -k parse
```

Quando não existem erros de sintaxe, a configuração pode ser aplicada.

Esse procedimento é especialmente importante antes de um `reconfigure`, pois evita aplicar uma configuração inválida ao serviço.

---

## Porta do proxy

Um exemplo simples de configuração:

```conf
http_port 3128
```

Nesse exemplo, o Squid ficará escutando na porta `3128`.

Verifique a porta com:

```bash
ss -lntp | grep squid
```

---

## Configuração básica de acesso

Exemplo:

```conf
acl rede_interna src 10.0.0.0/8

http_access allow rede_interna
http_access deny all
```

A primeira regra permite a rede definida pela ACL.

A segunda nega tudo que não tiver sido permitido anteriormente.

---

## Aplicando alterações

Depois de alterar o `squid.conf`, valide:

```bash
squid -k parse
```

Se a configuração estiver correta, aplique:

```bash
squid -k reconfigure
```

O `reconfigure` permite que o Squid releia sua configuração sem uma parada completa do serviço.

---

## Verificando o serviço

Após a alteração:

```bash
systemctl status squid
```

Também é possível verificar mensagens recentes:

```bash
journalctl -u squid -n 50
```

---

## Checklist

Antes de considerar a configuração concluída:

```text
[ ] Squid instalado
[ ] Serviço iniciado
[ ] Serviço habilitado
[ ] squid.conf configurado
[ ] squid -k parse executado
[ ] squid -k reconfigure executado
[ ] Porta verificada
[ ] Logs verificados
```

> **Próximo:** [ACLs e Regras de Acesso]({{ 'squid/fundamentos/03-acls-e-regras-de-acesso.html' | relative_url }})