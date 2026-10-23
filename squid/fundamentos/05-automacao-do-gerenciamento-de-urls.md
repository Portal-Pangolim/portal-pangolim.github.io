---
layout: default
title: Automação do Gerenciamento de URLs
description: "Gerenciamento automatizado de URLs do Squid utilizando Ansible."
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 2v4"/>
    <path d="M12 18v4"/>
    <path d="M4.93 4.93l2.83 2.83"/>
    <path d="m16.24 16.24 2.83 2.83"/>
    <path d="M2 12h4"/>
    <path d="M18 12h4"/>
    <path d="m4.93 19.07 2.83-2.83"/>
    <path d="m16.24 7.76 2.83-2.83"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
  Automação do Gerenciamento de URLs
</h1>

---

## Visão geral

O gerenciamento manual de URLs se torna trabalhoso quando existem vários servidores Squid.

Para evitar alterações individuais, o gerenciamento pode ser automatizado utilizando **Ansible**.

No ambiente documentado, a automação permite executar uma única operação e aplicar a alteração nos proxies definidos no inventário.

---

## Estrutura

O projeto utilizado para a automação está organizado em:

```text
/opt/ansible/squid/
```

O inventário contém o grupo:

```text
proxy_squid
```

Esse grupo reúne os proxies que devem receber as alterações.

---

## Servidores

O grupo `proxy_squid` contempla os seguintes servidores:

```text
10.0.27.72
10.0.27.73
10.0.27.75
10.8.17.72
10.8.17.73
10.8.17.74
```

A automação permite manter as regras sincronizadas entre esses servidores.

---

## Arquivos de URLs

Os arquivos utilizados pelos proxies são:

```text
/squid/regras/url.liberadas
/squid/regras/url.bloqueadas
```

A ação executada pelo playbook determina em qual arquivo a URL será incluída.

---

## Playbook

O playbook responsável pelo gerenciamento é:

```text
squid_url_manager.yml
```

Ele trabalha com:

```text
hosts: proxy_squid
serial: 1
```

O `serial: 1` faz com que os servidores sejam processados um por vez.

Isso permite alterar um proxy, validar a operação e então continuar para o próximo servidor.

---

## Parâmetros

O playbook recebe dois parâmetros principais:

```text
url
acao
```

A URL define o domínio que será gerenciado.

A ação determina o tipo de operação:

```text
liberar
bloquear
```

---

## Liberando uma URL

Exemplo:

```bash
ansible-playbook squid_url_manager.yml \
  -e "url=.exemplo.com acao=liberar"
```

Nesse caso, a URL será adicionada à lista de URLs liberadas.

---

## Bloqueando uma URL

Exemplo:

```bash
ansible-playbook squid_url_manager.yml \
  -e "url=.exemplo.com acao=bloquear"
```

Nesse caso, a URL será adicionada à lista de URLs bloqueadas.

---

## Validação

A automação não deve simplesmente alterar o arquivo.

Depois da alteração, é necessário verificar se a configuração do Squid continua válida.

O processo utiliza:

```bash
squid -k parse
```

Somente depois da validação a nova configuração é aplicada.

---

## Recarregando o Squid

Após a validação, o Squid pode receber:

```bash
squid -k reconfigure
```

Esse comando faz o serviço reler a configuração sem necessidade de reinicialização completa.

---

## Fluxo da automação

O fluxo pode ser representado assim:

```text
Usuário
   |
   v
Ansible
   |
   v
proxy_squid
   |
   +--> URL liberada/bloqueada
   |
   v
squid -k parse
   |
   v
squid -k reconfigure
```

---

## Execução em sequência

Como o playbook utiliza:

```yaml
serial: 1
```

os servidores são tratados individualmente:

```text
Proxy 01
   |
   v
Validação
   |
   v
Reconfigure
   |
   v
Proxy 02
   |
   v
Validação
   |
   v
Reconfigure
   |
  ...
```

Isso evita aplicar a alteração simultaneamente em todos os proxies.

---

## Idempotência

O playbook foi desenvolvido de forma idempotente.

Isso significa que executar novamente uma operação que já foi aplicada não deve criar entradas duplicadas desnecessariamente.

Por exemplo, se:

```text
.exemplo.com
```

já estiver na lista de liberadas, uma nova execução para liberar o mesmo domínio não deve gerar várias ocorrências da mesma entrada.

---

## Verificação

Depois da execução, pode-se verificar diretamente no servidor:

```bash
grep -n ".exemplo.com" /squid/regras/url.liberadas
```

Ou:

```bash
grep -n ".exemplo.com" /squid/regras/url.bloqueadas
```

Também é possível verificar o status:

```bash
systemctl status squid
```

---

## Execução de uma URL por vez

A versão atual do playbook foi preparada para receber uma URL por execução.

Exemplo:

```bash
ansible-playbook squid_url_manager.yml \
  -e "url=.exemplo.com acao=liberar"
```

Para várias URLs, seria necessário executar o processo para cada domínio ou adaptar posteriormente o playbook para receber uma lista.

Um possível formato futuro seria:

```text
urls:
  - .exemplo.com
  - .exemplo.org
  - .outrodominio.com
```

---

## Vantagens da automação

A automação proporciona:

- padronização;
- redução de operações manuais;
- aplicação em vários proxies;
- validação da configuração;
- reconfigure automático;
- execução controlada;
- maior facilidade de auditoria;
- menor possibilidade de divergência entre servidores.

> **Próximo:** [Autenticação]({{ 'squid/fundamentos/06-autenticacao.html' | relative_url }})