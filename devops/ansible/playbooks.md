---
layout: default
description: "Playbooks do Ansible: estrutura YAML, tarefas, variáveis e organização de rotinas de automação."
title: Playbooks Ansible
---

# Ansible — Guia Prático
{:.no_toc}

> Parte da trilha de estudo Ansible: [Índice](index.md) · [Inventários](inventarios.md) · [Módulos](modulos.md) · **Playbooks (você está aqui)**

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
### Introdução

Um **Playbook Ansible** é um arquivo escrito em **YAML** que define, de forma organizada e automatizada, quais tarefas o Ansible deve executar em um ou mais servidores.

Enquanto o comando `ansible` executa uma ação pontual, o Playbook transforma várias ações em um procedimento documentado, repetível e automatizado.

Uma execução manual poderia ser:

```bash
ssh usuario@servidor
systemctl status servico
systemctl is-active servico
```

Com Ansible, essas verificações podem ser executadas de forma padronizada:

```bash
ansible-playbook -i inventory/hosts.ini playbooks/diagnostico.yml -k
```

O Playbook passa a funcionar como um procedimento operacional automatizado.

Um Playbook pode organizar tarefas de:

* Administração de servidores Linux
* Instalação e atualização de pacotes
* Gerenciamento de serviços
* Alteração de arquivos de configuração
* Criação de usuários
* Execução de comandos remotos
* Aplicação de configurações
* Deploy de aplicações
* Gerenciamento de múltiplos servidores
* Automação de rotinas operacionais

---

### Como um Playbook funciona

O Ansible trabalha com uma estrutura simples:

```text
Administrador
     │
     │ Ansible
     ▼
 Inventário
     │
     ├── Servidor 01
     ├── Servidor 02
     └── Servidor 03
```

O administrador define **o que precisa ser feito**, e o Ansible executa as tarefas nos hosts definidos.

Um dos principais objetivos é evitar procedimentos como:

```bash
ssh servidor01
comando
ssh servidor02
comando
ssh servidor03
comando
```

Em vez disso:

```bash
ansible servidores -m shell -a "comando"
```

Ou através de um playbook:

```bash
ansible-playbook configurar.yml
```

---

## Instalação

### Red Hat / Rocky / AlmaLinux

Em sistemas baseados em RHEL:

```bash
dnf install ansible-core -y
```

Verifique:

```bash
ansible --version
```

Exemplo:

```text
ansible [core 2.x.x]
```

---

### Debian / Ubuntu

```bash
apt update
apt install ansible -y
```

Verifique:

```bash
ansible --version
```

---

## Estrutura básica

Um projeto Ansible pode ser organizado assim:

```text
ansible/
├── inventory/
│   └── hosts.ini
├── playbooks/
│   ├── teste.yml
│   └── nginx.yml
└── ansible.cfg
```

Uma estrutura simples também pode ser:

```text
ansible/
├── hosts.ini
├── teste.yml
└── ansible.cfg
```

Para começar, a segunda opção é suficiente.

---

## Inventário

O **inventário** define quais servidores serão administrados pelo Ansible.

Exemplo mínimo:

```ini
[servidores]
server01
server02
server03
```

> 📖 Este guia usa apenas o essencial do inventário para poder avançar logo para playbooks. Para o assunto completo — grupos de grupos, `group_vars`/`host_vars`, inventário dinâmico, padrões de seleção de hosts, `ansible_host` × `inventory_hostname`, boas práticas e exercícios — veja **[Inventários Ansible](inventarios.md)**.

---

### Grupos

O inventário permite organizar servidores em grupos.

```ini
[web]
web01
web02

[banco]
db01
db02

[monitoramento]
zabbix01
```

Isso permite executar tarefas somente em determinado grupo:

```bash
ansible web -m ping
```

Ou:

```bash
ansible banco -m ping
```

(Detalhes sobre grupos de grupos e múltiplos pertencimentos: [Inventários Ansible, seções 3 e 4](inventarios.md#4-grupos-e-múltiplos-pertencimentos).)

---

## Variáveis do inventário

É possível definir informações específicas para os hosts, como o IP real (`ansible_host`) e o usuário de conexão (`ansible_user`):

```ini
[servidores]
server01 ansible_host=10.0.0.10 ansible_user=ansible
server02 ansible_host=10.0.0.11 ansible_user=ansible
```

(Guia completo de variáveis de conexão, senhas e precedência: [Inventários Ansible, seção 7](inventarios.md#7-variáveis-de-conexão).)

---

## Testando a comunicação

O primeiro teste normalmente é:

```bash
ansible all -i hosts.ini -m ping
```

Se funcionar, o resultado será parecido com:

```text
server01 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

O módulo `ping` do Ansible não é o mesmo que o comando Linux:

```bash
ping 10.0.0.10
```

O módulo `ping` verifica principalmente se o Ansible consegue se comunicar com o host e executar Python remotamente.

---

## Ad-Hoc Commands

Os comandos **ad-hoc** permitem executar tarefas diretamente sem criar um playbook.

Exemplo:

```bash
ansible servidores -i hosts.ini -m command -a "hostname"
```

Executar:

```bash
uptime
```

em todos os servidores:

```bash
ansible servidores -i hosts.ini -m command -a "uptime"
```

Consultar memória:

```bash
ansible servidores -i hosts.ini -m command -a "free -h"
```

Consultar espaço em disco:

```bash
ansible servidores -i hosts.ini -m command -a "df -h"
```

---

## Módulos

O Ansible possui diversos **módulos**, cada um destinado a determinado tipo de tarefa.

Exemplos:

```text
command
shell
copy
file
package
dnf
apt
service
systemd
user
group
lineinfile
template
debug
stat
```

A ideia é utilizar o módulo adequado para cada tarefa.

---

## command

O módulo `command` executa comandos no servidor remoto.

Exemplo:

```bash
ansible servidores -m command -a "hostname"
```

Outro exemplo:

```bash
ansible servidores -m command -a "df -h"
```

Por padrão, o `command` não utiliza um shell completo.

Por exemplo, operadores como:

```bash
|
>
>>
&&
```

podem não funcionar como esperado.

---

## shell

O módulo `shell` executa o comando através do shell.

Exemplo:

```bash
ansible servidores -m shell -a "df -h | grep /"
```

Outro exemplo:

```bash
ansible servidores -m shell -a "hostname && uptime"
```

#### Regra prática

Prefira:

```text
command
```

quando o comando simples for suficiente.

Utilize:

```text
shell
```

quando realmente precisar de recursos do shell.

---

## become

O `become` permite executar tarefas com privilégios elevados.

Exemplo:

```bash
ansible servidores -m command -a "whoami" --become
```

Em um playbook:

```yaml
- name: Exemplo
  hosts: servidores
  become: true

  tasks:
    - name: Verificar usuário
      ansible.builtin.command: whoami
```

Normalmente:

```yaml
become: true
```

é utilizado para tarefas administrativas.

---

## Playbooks

O **playbook** é um arquivo YAML que descreve as tarefas que o Ansible deverá executar.

Exemplo:

```yaml
---
- name: Teste Ansible
  hosts: servidores

  tasks:
    - name: Verificar hostname
      ansible.builtin.command: hostname
```

Salvar como:

```text
teste.yml
```

Executar:

```bash
ansible-playbook -i hosts.ini teste.yml
```

---

## Estrutura de um Playbook

Um playbook normalmente possui:

```yaml
---
- name: Nome do play
  hosts: servidores
  become: true

  vars:
    variavel: valor

  tasks:
    - name: Primeira tarefa
      ansible.builtin.command: comando

    - name: Segunda tarefa
      ansible.builtin.command: outro_comando
```

Os principais elementos são:

```text
name
hosts
become
vars
tasks
```

---

## Tasks

As `tasks` são as tarefas executadas pelo Ansible.

Exemplo:

```yaml
tasks:

  - name: Verificar hostname
    ansible.builtin.command: hostname

  - name: Verificar uptime
    ansible.builtin.command: uptime

  - name: Verificar disco
    ansible.builtin.command: df -h
```

Cada tarefa deve possuir uma descrição clara.

---

## Módulo package

O módulo `package` permite trabalhar com pacotes de diferentes distribuições.

Exemplo:

```yaml
- name: Instalar pacote
  ansible.builtin.package:
    name: vim
    state: present
```

O Ansible utilizará o gerenciador de pacotes disponível no sistema.

---

## DNF

Em sistemas Rocky Linux, RHEL, AlmaLinux e derivados:

```yaml
- name: Instalar vim
  ansible.builtin.dnf:
    name: vim
    state: present
```

Instalar vários pacotes:

```yaml
- name: Instalar pacotes
  ansible.builtin.dnf:
    name:
      - vim
      - curl
      - wget
      - git
    state: present
```

---

## APT

Em Debian e Ubuntu:

```yaml
- name: Instalar vim
  ansible.builtin.apt:
    name: vim
    state: present
    update_cache: true
```

---

## Gerenciamento de serviços

O módulo `systemd` permite administrar serviços.

Iniciar:

```yaml
- name: Iniciar nginx
  ansible.builtin.systemd:
    name: nginx
    state: started
```

Parar:

```yaml
- name: Parar nginx
  ansible.builtin.systemd:
    name: nginx
    state: stopped
```

Reiniciar:

```yaml
- name: Reiniciar nginx
  ansible.builtin.systemd:
    name: nginx
    state: restarted
```

Habilitar no boot:

```yaml
- name: Habilitar nginx
  ansible.builtin.systemd:
    name: nginx
    enabled: true
```

---

## Criando arquivos

O módulo `file` pode criar arquivos e diretórios.

Criar diretório:

```yaml
- name: Criar diretório
  ansible.builtin.file:
    path: /opt/teste
    state: directory
    mode: '0755'
```

Criar arquivo vazio:

```yaml
- name: Criar arquivo
  ansible.builtin.file:
    path: /opt/teste/exemplo.txt
    state: touch
```

---

## Copiando arquivos

O módulo `copy` envia arquivos para os servidores.

```yaml
- name: Copiar arquivo
  ansible.builtin.copy:
    src: arquivo.conf
    dest: /etc/arquivo.conf
    mode: '0644'
```

Estrutura:

```text
projeto/
├── hosts.ini
├── playbook.yml
└── arquivo.conf
```

---

## Usuários

Criar usuário:

```yaml
- name: Criar usuário
  ansible.builtin.user:
    name: operador
    state: present
```

Remover usuário:

```yaml
- name: Remover usuário
  ansible.builtin.user:
    name: operador
    state: absent
```

---

## Variáveis

Variáveis permitem evitar valores repetidos.

```yaml
---
- name: Exemplo de variáveis
  hosts: servidores

  vars:
    pacote: vim

  tasks:

    - name: Instalar pacote
      ansible.builtin.package:
        name: "{{ pacote }}"
        state: present
```

A variável é utilizada assim:

```text
{{ pacote }}
```

---

## Register

O `register` permite armazenar o resultado de uma tarefa.

Exemplo:

```yaml
- name: Consultar hostname
  ansible.builtin.command: hostname
  register: resultado_hostname
```

Depois:

```yaml
- name: Mostrar resultado
  ansible.builtin.debug:
    var: resultado_hostname.stdout
```

---

## Debug

O módulo `debug` permite exibir informações durante a execução.

```yaml
- name: Mostrar mensagem
  ansible.builtin.debug:
    msg: "Servidor configurado com sucesso"
```

Com variável:

```yaml
- name: Mostrar hostname
  ansible.builtin.debug:
    var: ansible_hostname
```

---

## Facts

O Ansible coleta informações sobre o sistema remoto chamadas de **facts**.

Exemplos:

```text
ansible_hostname
ansible_distribution
ansible_distribution_version
ansible_kernel
ansible_default_ipv4.address
ansible_memtotal_mb
```

Exemplo:

```yaml
- name: Mostrar sistema operacional
  ansible.builtin.debug:
    msg: "{{ ansible_distribution }} {{ ansible_distribution_version }}"
```

---

## gather_facts

Por padrão, o Ansible normalmente coleta facts no início de um play.

É possível desabilitar:

```yaml
gather_facts: false
```

Exemplo:

```yaml
---
- name: Teste
  hosts: servidores
  gather_facts: false

  tasks:
    - name: Verificar hostname
      ansible.builtin.command: hostname
```

Isso pode deixar execuções simples mais rápidas.

---

## Condicionais

O `when` permite executar uma tarefa somente quando uma condição for verdadeira.

Exemplo:

```yaml
- name: Instalar pacote em Rocky Linux
  ansible.builtin.dnf:
    name: vim
    state: present
  when: ansible_distribution == "Rocky"
```

Outro exemplo:

```yaml
- name: Executar somente em servidor web
  ansible.builtin.command: hostname
  when: "'web' in group_names"
```

---

## Loops

Loops permitem repetir uma tarefa.

Exemplo:

```yaml
- name: Instalar pacotes
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop:
    - vim
    - curl
    - wget
    - git
```

Isso evita criar uma task para cada pacote.

---

## Handlers

Handlers são tarefas executadas quando uma alteração ocorre.

Exemplo:

```yaml
tasks:

  - name: Copiar configuração
    ansible.builtin.copy:
      src: nginx.conf
      dest: /etc/nginx/nginx.conf
    notify: Reiniciar nginx

handlers:

  - name: Reiniciar nginx
    ansible.builtin.systemd:
      name: nginx
      state: restarted
```

Se o arquivo não mudar, o handler não será executado.

Isso é muito útil para configurações de serviços.

---

## Idempotência

Um dos conceitos mais importantes do Ansible é a **idempotência**.

Significa que executar o mesmo playbook várias vezes deve deixar o servidor no estado desejado sem realizar alterações desnecessárias.

Por exemplo:

```yaml
- name: Instalar vim
  ansible.builtin.package:
    name: vim
    state: present
```

Na primeira execução:

```text
changed=1
```

Nas próximas:

```text
changed=0
```

O pacote já está instalado, então nenhuma alteração é necessária.

---

## changed, ok, failed e skipped

Ao executar um playbook, o Ansible apresenta informações como:

```text
ok
changed
failed
skipped
```

#### ok

A tarefa foi executada e nenhuma alteração foi necessária.

#### changed

O Ansible realizou alguma alteração.

#### failed

A tarefa apresentou erro.

#### skipped

A tarefa foi ignorada, normalmente por causa de uma condição `when`.

---

## Check Mode

O `--check` permite simular alterações sem aplicá-las.

```bash
ansible-playbook -i hosts.ini playbook.yml --check
```

É muito útil antes de executar mudanças em produção.

---

## Diff

O parâmetro `--diff` pode mostrar diferenças em arquivos alterados.

```bash
ansible-playbook -i hosts.ini playbook.yml --diff
```

Pode ser combinado com:

```bash
ansible-playbook -i hosts.ini playbook.yml --check --diff
```

---

## Limitar a execução

O parâmetro `--limit` permite executar o playbook somente em determinado host ou grupo.

Exemplo:

```bash
ansible-playbook -i hosts.ini playbook.yml --limit server01
```

Ou:

```bash
ansible-playbook -i hosts.ini playbook.yml --limit web
```

Isso é extremamente útil para testar uma alteração antes de aplicá-la em todos os servidores.

---

## Tags

Tags permitem executar apenas determinadas tarefas.

Exemplo:

```yaml
tasks:

  - name: Instalar nginx
    ansible.builtin.package:
      name: nginx
      state: present
    tags:
      - instalacao

  - name: Configurar nginx
    ansible.builtin.copy:
      src: nginx.conf
      dest: /etc/nginx/nginx.conf
    tags:
      - configuracao
```

Executar somente:

```bash
ansible-playbook -i hosts.ini playbook.yml --tags instalacao
```

---

## Ansible Vault

O **Ansible Vault** permite proteger informações sensíveis.

Por exemplo:

```text
senhas
tokens
chaves
credenciais
```

Criar arquivo criptografado:

```bash
ansible-vault create secrets.yml
```

Editar:

```bash
ansible-vault edit secrets.yml
```

Visualizar:

```bash
ansible-vault view secrets.yml
```

Isso evita armazenar senhas diretamente em texto puro nos playbooks.

---

## ansible.cfg

O arquivo `ansible.cfg` permite definir configurações do projeto.

Exemplo:

```ini
[defaults]
inventory = hosts.ini
host_key_checking = False
interpreter_python = auto_silent
```

Com isso, em vez de:

```bash
ansible all -i hosts.ini -m ping
```

pode ser utilizado:

```bash
ansible all -m ping
```

desde que o comando seja executado no diretório onde o `ansible.cfg` está disponível.

---

## Exemplo prático

Vamos criar um playbook que:

1. Instala o `vim`
2. Cria um diretório
3. Cria um arquivo
4. Mostra o hostname

```yaml
---
- name: Configuração básica dos servidores
  hosts: servidores
  become: true

  tasks:

    - name: Instalar vim
      ansible.builtin.package:
        name: vim
        state: present

    - name: Criar diretório
      ansible.builtin.file:
        path: /opt/infra-linux
        state: directory
        mode: '0755'

    - name: Criar arquivo
      ansible.builtin.file:
        path: /opt/infra-linux/servidor.txt
        state: touch
        mode: '0644'

    - name: Mostrar hostname
      ansible.builtin.command: hostname
      register: hostname_result

    - name: Exibir hostname
      ansible.builtin.debug:
        var: hostname_result.stdout
```

Executar:

```bash
ansible-playbook -i hosts.ini configuracao.yml
```

---

## Executando comandos em vários servidores

Imagine o seguinte inventário:

```ini
[squid]
s-sesu2772
s-sesu2773
s-sesu2775
s-sesu872
s-sesu873
s-sesu874
```

Consultar hostname:

```bash
ansible squid -i squid.ini -m command -a "hostname"
```

Consultar espaço em disco:

```bash
ansible squid -i squid.ini -m command -a "df -h"
```

Consultar memória:

```bash
ansible squid -i squid.ini -m command -a "free -h"
```

Consultar serviço:

```bash
ansible squid -i squid.ini -m shell -a "systemctl status squid --no-pager"
```

Esse modelo é muito útil para administração de vários servidores.

---

## Serial

Quando existem muitos servidores, pode ser interessante evitar alterações simultâneas.

O parâmetro `serial` controla quantos hosts serão processados por vez.

Exemplo:

```yaml
---
- name: Atualização controlada
  hosts: servidores
  become: true
  serial: 1

  tasks:

    - name: Atualizar pacote
      ansible.builtin.package:
        name: squid
        state: latest
```

Com:

```yaml
serial: 1
```

o Ansible trabalha com um servidor por vez.

Também é possível:

```yaml
serial: 2
```

para trabalhar com dois servidores por vez.

---

## Troubleshooting

Quando o Ansible apresenta erro, não significa necessariamente que o problema seja no playbook.

O problema pode estar em:

```text
DNS
│
├── SSH
│
├── autenticação
│
├── permissões
│
├── Python
│
├── firewall
│
├── rede
│
└── próprio playbook
```

---

### Teste 1 — Resolução DNS

```bash
getent hosts server01
```

Ou:

```bash
nslookup server01
```

---

### Teste 2 — Conectividade

```bash
ping server01
```

---

### Teste 3 — SSH

```bash
ssh server01
```

---

### Teste 4 — Porta SSH

```bash
nc -vz server01 22
```

---

### Teste 5 — Ansible Ping

```bash
ansible server01 -m ping
```

---

### Teste 6 — Verificar configuração

```bash
ansible-inventory -i hosts.ini --graph
```

Para visualizar os dados:

```bash
ansible-inventory -i hosts.ini --list
```

---

## Erros comuns

### Permission denied

Exemplo:

```text
Permission denied (publickey,password)
```

Normalmente indica problema de autenticação SSH.

Verifique:

```bash
ssh usuario@servidor
```

---

### UNREACHABLE

Exemplo:

```text
server01 | UNREACHABLE!
```

Pode indicar:

* DNS incorreto
* IP incorreto
* SSH indisponível
* firewall
* rota
* credencial
* usuário incorreto

---

### sudo password required

Exemplo:

```text
Missing sudo password
```

O Ansible precisa da senha para utilizar `sudo`.

Pode ser utilizado:

```bash
ansible-playbook -i hosts.ini playbook.yml --ask-become-pass
```

---

### Python ausente

Alguns módulos Ansible precisam de Python no host remoto.

Verifique:

```bash
python3 --version
```

Se necessário, defina o interpretador:

```ini
server01 ansible_python_interpreter=/usr/bin/python3
```

---

## Boas práticas

#### Use nomes claros

Prefira:

```yaml
- name: Reiniciar serviço Squid
```

em vez de:

```yaml
- name: Tarefa 1
```

#### Prefira módulos

Em vez de:

```yaml
ansible.builtin.shell: systemctl restart squid
```

prefira:

```yaml
ansible.builtin.systemd:
  name: squid
  state: restarted
```

#### Teste primeiro

Utilize:

```bash
--check
```

e:

```bash
--limit
```

antes de executar mudanças grandes.

#### Evite credenciais no código

Utilize:

```text
Ansible Vault
```

para informações sensíveis.

#### Faça mudanças graduais

Em ambientes críticos:

```yaml
serial: 1
```

pode evitar que uma alteração errada afete todos os servidores simultaneamente.

---

## Fluxo recomendado para execução

Um fluxo seguro pode ser:

```text
1. Editar inventário
        ↓
2. Testar conectividade
        ↓
3. Testar SSH
        ↓
4. Executar ansible ping
        ↓
5. Validar inventário
        ↓
6. Executar --check
        ↓
7. Testar com --limit
        ↓
8. Executar playbook
        ↓
9. Validar resultado
        ↓
10. Verificar logs/serviço
```

---

## Comandos essenciais

#### Ver versão

```bash
ansible --version
```

#### Testar hosts

```bash
ansible all -m ping
```

#### Executar comando

```bash
ansible all -m command -a "hostname"
```

#### Executar playbook

```bash
ansible-playbook playbook.yml
```

#### Especificar inventário

```bash
ansible-playbook -i hosts.ini playbook.yml
```

#### Simular alterações

```bash
ansible-playbook -i hosts.ini playbook.yml --check
```

#### Mostrar diferenças

```bash
ansible-playbook -i hosts.ini playbook.yml --diff
```

#### Limitar execução

```bash
ansible-playbook -i hosts.ini playbook.yml --limit server01
```

#### Ver inventário

```bash
ansible-inventory -i hosts.ini --graph
```

#### Listar inventário

```bash
ansible-inventory -i hosts.ini --list
```

---

## O que estudar depois

Depois de dominar os fundamentos, avance para:

```text
Ansible
│
├── Inventários avançados
├── Variáveis
├── Facts
├── Conditionals
├── Loops
├── Handlers
├── Templates Jinja2
├── Ansible Vault
├── Roles
├── Collections
├── Ansible Galaxy
├── Ansible Lint
├── Molecule
└── AWX / Ansible Automation Platform
```

Para administração Linux, **Roles + Jinja2 + Vault + Ansible Galaxy** são especialmente importantes.

---

## Exercícios práticos

### Exercício 1 — Inventário

Crie três hosts:

```ini
[servidores]
server01
server02
server03
```

Teste:

```bash
ansible servidores -m ping
```

---

### Exercício 2 — Informações do sistema

Execute:

```bash
ansible servidores -m command -a "hostname"
```

Depois:

```bash
ansible servidores -m command -a "uptime"
```

E:

```bash
ansible servidores -m command -a "df -h"
```

---

### Exercício 3 — Playbook

Crie um playbook que:

* Instale `vim`
* Crie `/opt/infra-linux`
* Crie `/opt/infra-linux/teste.txt`
* Mostre o hostname
* Mostre a distribuição Linux

---

### Exercício 4 — Serviço

Crie um playbook que:

* Instale o Nginx
* Inicie o serviço
* Habilite o serviço no boot
* Verifique o estado do serviço

---

### Exercício 5 — Alteração controlada

Execute o playbook primeiro:

```bash
ansible-playbook -i hosts.ini playbook.yml --check
```

Depois teste somente em um host:

```bash
ansible-playbook -i hosts.ini playbook.yml --limit server01
```

Somente depois aplique nos demais.

---

## Resumo

O Ansible permite transformar tarefas repetitivas de administração em automações padronizadas.

Os principais conceitos para começar são:

```text
Inventário
    ↓
Hosts e grupos
    ↓
Módulos
    ↓
Ad-Hoc Commands
    ↓
Playbooks
    ↓
Tasks
    ↓
Variáveis
    ↓
Conditionals
    ↓
Loops
    ↓
Handlers
    ↓
Roles
```

Os comandos mais importantes para memorizar inicialmente são:

```bash
ansible --version
ansible all -m ping
ansible all -m command -a "hostname"
ansible-playbook -i hosts.ini playbook.yml
ansible-inventory -i hosts.ini --graph
```

> **Regra de ouro:** primeiro aprenda a executar uma tarefa manualmente no Linux. Depois transforme essa tarefa em um comando Ansible. Por fim, transforme o comando em um playbook idempotente e reutilizável.