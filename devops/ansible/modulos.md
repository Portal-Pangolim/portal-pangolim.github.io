---
layout: default
description: "Módulos do Ansible para tarefas de administração, com exemplos de execução e parâmetros."
title: Módulos Ansible
---

# Módulos Ansible
{:.no_toc}

> Parte da trilha de estudo Ansible: [Índice](index.md) · [Inventários](inventarios.md) · **Módulos (você está aqui)** · [Playbooks](playbooks.md)


<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## Introdução

Os **módulos** são os componentes responsáveis por executar ações no Ansible.

Um Playbook define:

> **O que queremos fazer e em quais servidores.**

O módulo define:

> **Como essa ação será realizada.**

Por exemplo, para iniciar um serviço Linux, podemos utilizar o módulo:

```yaml
ansible.builtin.systemd
```

Para copiar um arquivo:

```yaml
ansible.builtin.copy
```

Para instalar um pacote:

```yaml
ansible.builtin.package
```

Para criar um usuário:

```yaml
ansible.builtin.user
```

Para executar um comando:

```yaml
ansible.builtin.command
```

A relação pode ser visualizada assim:

```text
Inventário
    ↓
Onde executar?
    ↓
Playbook
    ↓
O que fazer?
    ↓
Task
    ↓
Qual módulo utilizar?
    ↓
Módulo
    ↓
Executa a ação no servidor
```

---

## 1. O que é um módulo?

Um módulo é uma unidade de código do Ansible responsável por realizar uma determinada operação.

Exemplo:

```yaml
- name: Instalar Nginx
  ansible.builtin.package:
    name: nginx
    state: present
```

Nesse exemplo:

```text
name
 ↓
nome da tarefa

ansible.builtin.package
 ↓
módulo

name: nginx
 ↓
pacote desejado

state: present
 ↓
estado desejado
```

O módulo recebe parâmetros e executa a operação necessária.

---

## 2. Task x Module

É importante não confundir os dois conceitos.

Uma **Task** é uma tarefa do Playbook.

Um **Module** é o componente que executa a ação.

Exemplo:

```yaml
- name: Instalar Nginx
  ansible.builtin.package:
    name: nginx
    state: present
```

Aqui:

```text
Task:
"Instalar Nginx"

Module:
ansible.builtin.package
```

Visualmente:

```text
Task
 |
 +-- name: Instalar Nginx
 |
 +-- Module: package
       |
       +-- name: nginx
       +-- state: present
```

---

## 3. Estrutura de uma Task com módulo

A estrutura mais comum é:

```yaml
- name: Nome da tarefa
  ansible.builtin.modulo:
    parametro1: valor
    parametro2: valor
```

Exemplo:

```yaml
- name: Criar diretório
  ansible.builtin.file:
    path: /opt/aplicacao
    state: directory
    mode: '0755'
```

Temos:

```text
Task:
Criar diretório

Module:
file

Parâmetros:
path
state
mode
```

---

## 4. FQCN

Nos exemplos modernos de Ansible, é recomendável utilizar o nome completo do módulo.

Por exemplo:

```yaml
ansible.builtin.copy
```

em vez de:

```yaml
copy
```

Esse nome completo é chamado de **Fully Qualified Collection Name (FQCN)**.

A estrutura:

```text
ansible.builtin.copy
│       │       │
│       │       └── módulo
│       └────────── collection
└────────────────── namespace
```

---

## 5. Por que utilizar FQCN?

Imagine que existam módulos com nomes semelhantes em diferentes collections.

Utilizar:

```yaml
ansible.builtin.copy
```

deixa explícito qual módulo está sendo utilizado.

Também melhora:

* legibilidade;
* documentação;
* manutenção;
* análise por ferramentas;
* compatibilidade com projetos maiores.

Por isso, neste material utilizaremos:

```yaml
ansible.builtin.*
```

---

## 6. Descobrindo módulos

O Ansible possui muitos módulos.

Podemos consultar a documentação localmente:

```bash
ansible-doc ansible.builtin.copy
```

Outro exemplo:

```bash
ansible-doc ansible.builtin.systemd
```

Para o módulo `package`:

```bash
ansible-doc ansible.builtin.package
```

Essa é uma das ferramentas mais importantes para aprender Ansible.

---

## 7. Como ler a documentação

Ao executar:

```bash
ansible-doc ansible.builtin.file
```

a documentação apresenta informações como:

```text
NAME
    file

DESCRIPTION
    Manage files and file properties.

OPTIONS
    path
    state
    owner
    group
    mode
```

O mais importante é entender:

```text
Qual problema o módulo resolve?
Quais parâmetros ele aceita?
Quais parâmetros são obrigatórios?
Qual é o comportamento padrão?
```

---

## 8. Módulo debug

O módulo:

```yaml
ansible.builtin.debug
```

serve para exibir informações durante a execução.

Exemplo:

```yaml
- name: Mostrar mensagem
  ansible.builtin.debug:
    msg: "Servidor Linux"
```

Resultado:

```text
Servidor Linux
```

---

## 9. debug com variáveis

Podemos mostrar uma variável:

```yaml
- name: Mostrar hostname
  ansible.builtin.debug:
    var: hostname_result
```

Ou:

```yaml
- name: Mostrar hostname
  ansible.builtin.debug:
    msg: "{{ hostname_result.stdout }}"
```

> **Dica:** use `var` quando quiser inspecionar a variável inteira (útil para depuração) e `msg` quando quiser compor uma mensagem legível para quem está lendo o log.

---

## 10. Módulo command

O módulo:

```yaml
ansible.builtin.command
```

executa comandos no servidor remoto.

Exemplo:

```yaml
- name: Verificar hostname
  ansible.builtin.command: hostname
```

Outro exemplo:

```yaml
- name: Verificar uptime
  ansible.builtin.command: uptime
```

---

## 11. Limitações do command

O `command` não executa o comando através de um shell.

Por isso, recursos como:

```bash
|
>
>>
&&
||
$(...)
```

não devem ser utilizados da mesma forma que em um shell.

Por exemplo, isto pode não funcionar como esperado:

```yaml
- name: Exemplo
  ansible.builtin.command: ps aux | grep nginx
```

Quando precisamos de recursos do shell, podemos utilizar:

```yaml
ansible.builtin.shell
```

---

## 12. Módulo shell

O módulo:

```yaml
ansible.builtin.shell
```

executa comandos através do shell.

Exemplo:

```yaml
- name: Procurar processos
  ansible.builtin.shell: |
    ps aux | grep nginx | grep -v grep
```

Podemos utilizar:

```bash
|
>
&&
||
$(...)
```

e outros recursos do shell.

---

## 13. command x shell

Regra prática:

```text
Comando simples
      ↓
    command

Precisa de recursos do shell
      ↓
    shell
```

Exemplo com `command`:

```yaml
- name: Verificar kernel
  ansible.builtin.command: uname -r
```

Exemplo com `shell`:

```yaml
- name: Procurar processos
  ansible.builtin.shell: |
    ps aux | grep nginx | grep -v grep
```

Sempre que possível, prefira um módulo específico em vez de `shell`.

---

## 14. Módulo raw

O módulo:

```yaml
ansible.builtin.raw
```

executa comandos diretamente no servidor remoto.

Exemplo:

```yaml
- name: Verificar versão do Python
  ansible.builtin.raw: python3 --version
```

Também podemos utilizar:

```yaml
- name: Verificar serviço
  ansible.builtin.raw: systemctl status nginx
```

---

## 15. Quando utilizar raw?

O `raw` pode ser útil quando:

* o Python remoto não está disponível;
* a versão do Python remoto é incompatível;
* precisamos executar uma etapa de bootstrap;
* estamos fazendo diagnóstico;
* precisamos executar um comando específico de baixo nível.

Por exemplo, em servidores antigos, o módulo `raw` pode funcionar mesmo quando módulos Ansible normais não conseguem executar corretamente.

---

## 16. command x shell x raw

Podemos pensar assim:

```text
                 Quero executar um comando
                          |
              +-----------+-----------+
              |                       |
       Existe módulo              Não existe
       apropriado?                    |
              |                       |
             SIM                      |
              |                       |
       Use o módulo             Preciso de shell?
                                      |
                             +--------+--------+
                             |                 |
                            NÃO               SIM
                             |                 |
                          command             shell
                             |
                             |
                    Python remoto problemático?
                             |
                            raw
```

Na prática, a prioridade costuma ser:

```text
1. Módulo específico
2. command
3. shell
4. raw
```

Mas `raw` pode ser a escolha correta quando há uma razão técnica específica.

---

## 17. Módulo package

O módulo:

```yaml
ansible.builtin.package
```

permite gerenciar pacotes de software.

Exemplo:

```yaml
- name: Instalar Nginx
  ansible.builtin.package:
    name: nginx
    state: present
```

Para remover:

```yaml
- name: Remover Nginx
  ansible.builtin.package:
    name: nginx
    state: absent
```

---

## 18. package x apt x dnf

O módulo `package` é genérico.

Podemos utilizar:

```yaml
ansible.builtin.package
```

quando queremos que o Ansible utilize o gerenciador de pacotes apropriado.

Também existem módulos específicos, como:

```yaml
ansible.builtin.apt
```

para Debian/Ubuntu.

E:

```yaml
ansible.builtin.dnf
```

para Rocky/RHEL/Fedora e sistemas relacionados.

Exemplo:

```yaml
- name: Instalar pacote
  ansible.builtin.dnf:
    name: nginx
    state: present
```

> **Dica:** prefira `package` quando o Playbook precisa funcionar em distribuições diferentes; use `apt`/`dnf` quando quiser opções específicas daquele gerenciador (ex.: `update_cache`, `autoremove`).

---

## 19. Módulo systemd

Para sistemas Linux que utilizam systemd, podemos utilizar:

```yaml
ansible.builtin.systemd
```

Exemplo:

```yaml
- name: Iniciar Nginx
  ansible.builtin.systemd:
    name: nginx
    state: started
```

---

## 20. Estados de um serviço

Podemos utilizar:

```yaml
state: started
```

para iniciar.

```yaml
state: stopped
```

para parar.

```yaml
state: restarted
```

para reiniciar.

```yaml
state: reloaded
```

para recarregar a configuração.

Exemplo:

```yaml
- name: Reiniciar Nginx
  ansible.builtin.systemd:
    name: nginx
    state: restarted
```

---

## 21. Habilitando um serviço

Podemos configurar o serviço para iniciar automaticamente no boot:

```yaml
- name: Habilitar Nginx
  ansible.builtin.systemd:
    name: nginx
    enabled: true
```

Também podemos combinar:

```yaml
- name: Garantir Nginx ativo
  ansible.builtin.systemd:
    name: nginx
    state: started
    enabled: true
```

Isso significa:

```text
Serviço iniciado
+
Serviço habilitado no boot
```

---

## 22. Módulo service

Também existe:

```yaml
ansible.builtin.service
```

Exemplo:

```yaml
- name: Iniciar Nginx
  ansible.builtin.service:
    name: nginx
    state: started
```

O `service` fornece uma interface mais genérica para gerenciamento de serviços.

Quando sabemos que o sistema utiliza systemd, `systemd` pode ser mais explícito.

---

## 23. Módulo file

O módulo:

```yaml
ansible.builtin.file
```

é utilizado para gerenciar arquivos, diretórios, permissões, links e propriedades.

Criar diretório:

```yaml
- name: Criar diretório
  ansible.builtin.file:
    path: /opt/aplicacao
    state: directory
```

---

## 24. Permissões

Podemos definir o modo:

```yaml
- name: Criar diretório
  ansible.builtin.file:
    path: /opt/aplicacao
    state: directory
    mode: '0755'
```

O uso das aspas é recomendado para valores como:

```text
0755
0644
0600
```

porque representam valores que possuem semântica de permissão.

---

## 25. Proprietário e grupo

Podemos definir:

```yaml
- name: Criar diretório
  ansible.builtin.file:
    path: /opt/aplicacao
    state: directory
    owner: root
    group: root
    mode: '0755'
```

Assim:

```text
Diretório:
    /opt/aplicacao

Owner:
    root

Group:
    root

Permissão:
    0755
```

---

## 26. Remover arquivo ou diretório

Podemos utilizar:

```yaml
- name: Remover arquivo
  ansible.builtin.file:
    path: /tmp/teste.txt
    state: absent
```

O estado:

```yaml
state: absent
```

significa que o objeto não deve existir.

---

## 27. Criar arquivo vazio

Podemos utilizar:

```yaml
- name: Criar arquivo
  ansible.builtin.file:
    path: /tmp/teste.txt
    state: touch
```

Também podemos definir permissões:

```yaml
- name: Criar arquivo
  ansible.builtin.file:
    path: /tmp/teste.txt
    state: touch
    mode: '0644'
```

---

## 28. Módulo copy

O módulo:

```yaml
ansible.builtin.copy
```

copia arquivos do Control Node para o Managed Node.

Exemplo:

```yaml
- name: Copiar arquivo
  ansible.builtin.copy:
    src: arquivos/teste.txt
    dest: /tmp/teste.txt
```

Estrutura:

```text
Control Node
     |
     | copy
     ↓
Managed Node
```

---

## 29. Copiando conteúdo

Também podemos criar um arquivo diretamente:

```yaml
- name: Criar configuração
  ansible.builtin.copy:
    content: |
      servidor=proxy01
      ambiente=producao
    dest: /etc/minha-aplicacao.conf
```

---

## 30. Módulo template

O módulo:

```yaml
ansible.builtin.template
```

é parecido com `copy`, mas permite utilizar variáveis.

Arquivo:

```text
nginx.conf.j2
```

Conteúdo:

```jinja2
server {
    listen {{ porta }};
    server_name {{ servidor }};
}
```

Playbook:

```yaml
- name: Configurar Nginx
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/conf.d/app.conf
```

Se:

```yaml
porta: 8080
servidor: web01
```

o arquivo gerado conterá:

```text
listen 8080;
server_name web01;
```

---

## 31. copy x template

Use:

```text
copy
```

quando o arquivo é estático.

Use:

```text
template
```

quando o conteúdo depende de variáveis.

Exemplo:

```text
Arquivo igual para todos:
    copy

Arquivo diferente por servidor:
    template
```

---

## 32. Módulo user

O módulo:

```yaml
ansible.builtin.user
```

gerencia usuários Linux.

Criar usuário:

```yaml
- name: Criar usuário
  ansible.builtin.user:
    name: operador
    state: present
```

Remover:

```yaml
- name: Remover usuário
  ansible.builtin.user:
    name: operador
    state: absent
```

---

## 33. Criando usuário com shell

Exemplo:

```yaml
- name: Criar usuário
  ansible.builtin.user:
    name: operador
    shell: /bin/bash
    create_home: true
    state: present
```

---

## 34. Módulo group

O módulo:

```yaml
ansible.builtin.group
```

gerencia grupos Linux.

Exemplo:

```yaml
- name: Criar grupo
  ansible.builtin.group:
    name: operadores
    state: present
```

---

## 35. Adicionando usuário a grupo

Podemos combinar `user` e grupos:

```yaml
- name: Criar usuário
  ansible.builtin.user:
    name: operador
    groups:
      - operadores
    append: true
```

O `append: true` é importante quando queremos adicionar o usuário aos grupos sem substituir grupos suplementares existentes.

---

## 36. Módulo stat

O módulo:

```yaml
ansible.builtin.stat
```

permite consultar informações sobre arquivos.

Exemplo:

```yaml
- name: Verificar arquivo
  ansible.builtin.stat:
    path: /etc/hosts
  register: hosts_file
```

Depois:

```yaml
- name: Mostrar resultado
  ansible.builtin.debug:
    var: hosts_file.stat.exists
```

---

## 37. Verificando se arquivo existe

Exemplo:

```yaml
- name: Verificar configuração
  ansible.builtin.stat:
    path: /etc/squid/squid.conf
  register: squid_config
```

Depois:

```yaml
- name: Informar resultado
  ansible.builtin.debug:
    msg: "Arquivo existe"
  when: squid_config.stat.exists
```

---

## 38. Módulo find

O módulo:

```yaml
ansible.builtin.find
```

permite procurar arquivos.

Exemplo:

```yaml
- name: Procurar arquivos de log
  ansible.builtin.find:
    paths: /var/log
    patterns: "*.log"
  register: logs
```

Depois podemos consultar:

```yaml
- name: Mostrar quantidade
  ansible.builtin.debug:
    msg: "Arquivos encontrados: {{ logs.matched }}"
```

---

## 39. Módulo shell x find

Para uma busca simples:

```bash
find /var/log -name "*.log"
```

poderíamos utilizar `shell`.

Mas quando queremos fazer uma operação estruturada de busca de arquivos, o módulo:

```yaml
ansible.builtin.find
```

é normalmente mais adequado.

---

## 40. systemd x shell

Em vez de:

```yaml
- name: Iniciar Nginx
  ansible.builtin.shell: systemctl start nginx
```

prefira:

```yaml
- name: Iniciar Nginx
  ansible.builtin.systemd:
    name: nginx
    state: started
```

A segunda opção permite ao Ansible compreender melhor o estado desejado.

---

## 41. Idempotência dos módulos

Muitos módulos Ansible são projetados para trabalhar de forma idempotente.

Exemplo:

```yaml
- name: Garantir diretório
  ansible.builtin.file:
    path: /opt/aplicacao
    state: directory
```

Primeira execução:

```text
changed=1
```

Execução seguinte, se o diretório já estiver correto:

```text
changed=0
```

Isso é uma das grandes vantagens de utilizar módulos em vez de comandos arbitrários.

---

## 42. changed_when

Mesmo utilizando comandos, podemos controlar o estado:

```yaml
- name: Consultar serviço
  ansible.builtin.command: systemctl is-active nginx
  register: nginx_status
  changed_when: false
```

Assim, uma consulta não será apresentada como uma alteração.

---

## 43. failed_when

Podemos controlar a condição de erro:

```yaml
- name: Consultar serviço
  ansible.builtin.command: systemctl is-active nginx
  register: nginx_status
  changed_when: false
  failed_when: false
```

Isso pode ser útil em diagnósticos.

Por exemplo:

```text
nginx ativo
```

ou:

```text
nginx parado
```

não necessariamente significa que o Playbook inteiro deve falhar.

---

## 44. register + módulo

Qualquer módulo que retorne informações pode ser armazenado com `register`.

Exemplo:

```yaml
- name: Verificar arquivo
  ansible.builtin.stat:
    path: /etc/hosts
  register: resultado
```

Depois:

```yaml
- name: Mostrar resultado
  ansible.builtin.debug:
    var: resultado
```

Outro exemplo:

```yaml
- name: Verificar serviço
  ansible.builtin.systemd:
    name: nginx
  register: nginx_result
```

---

## 45. Módulo setup

O módulo:

```yaml
ansible.builtin.setup
```

é utilizado para coletar **facts** do sistema.

Exemplo:

```yaml
- name: Coletar informações
  ansible.builtin.setup:
```

Isso permite obter informações como:

```text
Sistema operacional
Hostname
Kernel
CPU
Memória
Interfaces
Endereços IP
Arquitetura
Discos
```

Normalmente o Ansible executa esse processo automaticamente quando:

```yaml
gather_facts: true
```

---

## 46. Usando facts

Depois da coleta podemos utilizar variáveis como:

```yaml
{{ ansible_hostname }}
```

```yaml
{{ ansible_distribution }}
```

```yaml
{{ ansible_kernel }}
```

```yaml
{{ ansible_architecture }}
```

Exemplo:

```yaml
- name: Mostrar sistema
  ansible.builtin.debug:
    msg:
      - "Hostname: {{ ansible_hostname }}"
      - "Distribuição: {{ ansible_distribution }}"
      - "Kernel: {{ ansible_kernel }}"
```

---

## 47. Diagnóstico avançado de serviços

Módulos como `systemd` e `service` são ótimos para **alterar** o estado de um serviço (iniciar, parar, habilitar), mas retornam um conjunto limitado de informações.

Quando o diagnóstico exige propriedades detalhadas do serviço, geralmente é mais adequado consultar diretamente:

```bash
systemctl show
```

através de `command`, `shell` ou `raw`.

Isso permite obter propriedades específicas como:

```text
MainPID
MemoryCurrent
TasksCurrent
ActiveState
SubState
ActiveEnterTimestamp
```

---

## 48. Módulo uri

O módulo:

```yaml
ansible.builtin.uri
```

permite fazer requisições HTTP/HTTPS.

Exemplo:

```yaml
- name: Testar aplicação
  ansible.builtin.uri:
    url: https://example.com
    method: GET
    status_code: 200
```

Pode ser útil para:

```text
health checks
APIs
websites
serviços HTTP
monitoramento
```

---

## 49. Módulo get_url

O módulo:

```yaml
ansible.builtin.get_url
```

faz download de arquivos.

Exemplo:

```yaml
- name: Baixar arquivo
  ansible.builtin.get_url:
    url: https://example.com/app.tar.gz
    dest: /tmp/app.tar.gz
```

---

## 50. Módulo unarchive

O módulo:

```yaml
ansible.builtin.unarchive
```

é utilizado para trabalhar com arquivos compactados.

Exemplo:

```yaml
- name: Extrair aplicação
  ansible.builtin.unarchive:
    src: app.tar.gz
    dest: /opt/
```

---

## 51. Módulo cron

O módulo:

```yaml
ansible.builtin.cron
```

gerencia tarefas agendadas.

Exemplo:

```yaml
- name: Criar tarefa cron
  ansible.builtin.cron:
    name: "Backup diário"
    minute: "0"
    hour: "2"
    job: "/opt/scripts/backup.sh"
```

Isso cria uma execução diária às 02:00.

---

## 52. Módulos de rede

Existem módulos para trabalhar com diferentes aspectos de rede.

Alguns exemplos:

```text
ansible.builtin.uri
ansible.builtin.get_url
ansible.builtin.wait_for
```

O módulo:

```yaml
ansible.builtin.wait_for
```

pode ser utilizado para esperar por uma porta.

Exemplo:

```yaml
- name: Esperar porta 8080
  ansible.builtin.wait_for:
    port: 8080
    timeout: 30
```

---

## 53. Módulo wait_for

Também podemos verificar uma porta específica:

```yaml
- name: Verificar SSH
  ansible.builtin.wait_for:
    host: "{{ inventory_hostname }}"
    port: 22
    timeout: 10
```

É útil em processos de:

```text
deploy
reinicialização
startup
health check
```

---

## 54. Módulos para processos

Para gerenciamento de processos, podemos utilizar módulos específicos ou comandos Linux.

Em alguns diagnósticos, comandos como:

```bash
ps
pgrep
top
```

podem ser mais adequados porque precisamos de informações específicas do processo.

Exemplo:

```yaml
- name: Coletar processos
  ansible.builtin.raw: |
    ps -eo pid,comm,%cpu,%mem,rss,vsz,etime,args --no-headers
```

Nesse caso, o `raw` não significa que o Ansible esteja sendo utilizado incorretamente.

Estamos fazendo uma coleta específica que pode não ter uma representação conveniente em um módulo genérico.

---

## 55. Escolhendo o módulo correto

Antes de escrever:

```yaml
ansible.builtin.shell: ...
```

faça a pergunta:

> Existe um módulo Ansible que já faça isso?

Exemplo:

### Instalar pacote

Evite:

```yaml
ansible.builtin.shell: dnf install nginx -y
```

Prefira:

```yaml
ansible.builtin.package:
  name: nginx
  state: present
```

### Iniciar serviço

Evite:

```yaml
ansible.builtin.shell: systemctl start nginx
```

Prefira:

```yaml
ansible.builtin.systemd:
  name: nginx
  state: started
```

### Criar usuário

Evite:

```yaml
ansible.builtin.shell: useradd operador
```

Prefira:

```yaml
ansible.builtin.user:
  name: operador
  state: present
```

---

## 56. Quando comandos continuam sendo úteis

Mesmo com centenas de módulos, comandos Linux continuam importantes.

Imagine um diagnóstico de infraestrutura:

```bash
ps
ss
ip
tracepath
df
free
journalctl
systemctl show
```

Nem sempre precisamos transformar cada comando em uma automação complexa.

Por exemplo:

```yaml
- name: Verificar conexões
  ansible.builtin.raw: ss -lntp
```

pode ser exatamente o que precisamos.

O objetivo não é eliminar comandos Linux.

O objetivo é **automatizar seu uso de maneira organizada**.

---

## 57. Módulos para diagnóstico

Para administração Linux, alguns recursos importantes são:

```text
debug
setup
stat
find
command
shell
raw
uri
wait_for
```

Podemos utilizá-los para criar ferramentas de diagnóstico.

Exemplo:

```text
Diagnóstico
│
├── setup
│     └── sistema
│
├── stat
│     └── arquivos
│
├── find
│     └── arquivos
│
├── command
│     └── comandos simples
│
├── shell
│     └── comandos com shell
│
├── raw
│     └── comandos de baixo nível
│
└── debug
      └── relatório
```

---

## 58. Módulos para configuração

Para configuração, alguns dos principais são:

```text
package
dnf
apt
systemd
service
file
copy
template
user
group
cron
```

Podemos pensar:

```text
Software
   ↓
package

Serviço
   ↓
systemd

Arquivo
   ↓
copy / template

Diretório
   ↓
file

Usuário
   ↓
user

Grupo
   ↓
group

Agendamento
   ↓
cron
```

---

## 59. Módulos e idempotência

Um dos maiores benefícios dos módulos é permitir declarar o **estado desejado**.

Em vez de:

```bash
systemctl start nginx
```

pensamos:

```yaml
state: started
```

Em vez de:

```bash
mkdir -p /opt/app
```

pensamos:

```yaml
state: directory
```

Em vez de:

```bash
useradd operador
```

pensamos:

```yaml
state: present
```

O Ansible compara o estado atual com o estado desejado e realiza a alteração somente quando necessário.

---

## 60. Exemplo completo

Um Playbook utilizando vários módulos:

```yaml
---
- name: Configurar servidor web
  hosts: web
  become: true

  tasks:

    - name: Instalar Nginx
      ansible.builtin.package:
        name: nginx
        state: present

    - name: Criar diretório da aplicação
      ansible.builtin.file:
        path: /opt/aplicacao
        state: directory
        owner: root
        group: root
        mode: '0755'

    - name: Copiar página
      ansible.builtin.copy:
        content: |
          <html>
          <h1>Servidor configurado pelo Ansible</h1>
          </html>
        dest: /opt/aplicacao/index.html
        mode: '0644'

    - name: Iniciar Nginx
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: true

    - name: Verificar porta HTTP
      ansible.builtin.wait_for:
        port: 80
        timeout: 10
```

Esse Playbook utiliza:

```text
package
file
copy
systemd
wait_for
```

---

## 61. Exemplo de diagnóstico

Um Playbook pode utilizar:

```yaml
---
- name: Diagnóstico
  hosts: linux
  gather_facts: false

  tasks:

    - name: Verificar hostname
      ansible.builtin.command: hostname
      register: hostname_result
      changed_when: false

    - name: Verificar memória
      ansible.builtin.command: free -h
      register: memory_result
      changed_when: false

    - name: Verificar disco
      ansible.builtin.command: df -h /
      register: disk_result
      changed_when: false

    - name: Verificar arquivo
      ansible.builtin.stat:
        path: /etc/hosts
      register: hosts_file

    - name: Resultado
      ansible.builtin.debug:
        msg:
          - "Servidor: {{ hostname_result.stdout | trim }}"
          - "Arquivo /etc/hosts existe: {{ hosts_file.stat.exists }}"
          - "Memória:"
          - "{{ memory_result.stdout_lines }}"
          - "Disco:"
          - "{{ disk_result.stdout_lines }}"
```

Aqui temos:

```text
command
   ↓
register
   ↓
stat
   ↓
register
   ↓
debug
```

---

## 62. Como estudar módulos

Não tente decorar todos os módulos.

O Ansible possui muitos módulos e novas collections podem adicionar outros.

O mais importante é aprender a **encontrar e utilizar a documentação**.

Use:

```bash
ansible-doc ansible.builtin.systemd
```

Depois procure:

```text
NAME
DESCRIPTION
OPTIONS
EXAMPLES
RETURN VALUES
```

O objetivo é conseguir responder:

```text
Qual módulo preciso?
Quais parâmetros ele possui?
Qual parâmetro é obrigatório?
Qual estado devo declarar?
O que o módulo retorna?
```

---

## 63. Comando ansible-doc

Exemplos importantes:

```bash
ansible-doc ansible.builtin.file
```

```bash
ansible-doc ansible.builtin.copy
```

```bash
ansible-doc ansible.builtin.template
```

```bash
ansible-doc ansible.builtin.systemd
```

```bash
ansible-doc ansible.builtin.package
```

```bash
ansible-doc ansible.builtin.user
```

```bash
ansible-doc ansible.builtin.command
```

---

## 64. Listando módulos

Podemos utilizar:

```bash
ansible-doc -l
```

Isso apresenta uma lista de módulos disponíveis.

Podemos procurar por um termo:

```bash
ansible-doc -l | grep systemd
```

Ou:

```bash
ansible-doc -l | grep user
```

Ou:

```bash
ansible-doc -l | grep file
```

Isso é muito útil para descobrir recursos.

---

## 65. Estratégia para escolher um módulo

Ao criar uma tarefa, siga esta ordem:

```text
1. O que quero fazer?
        ↓
2. Existe módulo específico?
        ↓
3. Qual é o módulo?
        ↓
4. Consultar ansible-doc
        ↓
5. Ver exemplos
        ↓
6. Criar Task
        ↓
7. Testar
```

Exemplo:

```text
Quero criar usuário
       ↓
ansible-doc -l | grep user
       ↓
ansible.builtin.user
       ↓
ansible-doc ansible.builtin.user
       ↓
criar Task
```

---

## 66. Tabela de referência

| Módulo      | Função                                 |
| ----------- | -------------------------------------- |
| `debug`     | Exibir informações                     |
| `command`   | Executar comando simples               |
| `shell`     | Executar comando através do shell      |
| `raw`       | Executar comando diretamente           |
| `package`   | Gerenciar pacotes                      |
| `apt`       | Gerenciar pacotes Debian/Ubuntu        |
| `dnf`       | Gerenciar pacotes Red Hat/Rocky/Fedora |
| `systemd`   | Gerenciar serviços systemd             |
| `service`   | Gerenciar serviços de forma genérica   |
| `file`      | Gerenciar arquivos e diretórios        |
| `copy`      | Copiar arquivos                        |
| `template`  | Gerar arquivos a partir de templates   |
| `user`      | Gerenciar usuários                     |
| `group`     | Gerenciar grupos                       |
| `stat`      | Consultar informações de arquivos      |
| `find`      | Procurar arquivos                      |
| `setup`     | Coletar facts                          |
| `uri`       | Fazer requisições HTTP                 |
| `get_url`   | Baixar arquivos                        |
| `unarchive` | Extrair arquivos compactados           |
| `cron`      | Gerenciar tarefas cron                 |
| `wait_for`  | Esperar por portas/condições           |

---

## 67. Módulos mais importantes para Linux

Para seu estudo de infraestrutura Linux, uma ordem interessante é:

```text
1. command
2. shell
3. raw
4. debug
5. package
6. systemd
7. file
8. copy
9. template
10. user
11. group
12. stat
13. find
14. setup
15. uri
16. wait_for
17. cron
18. get_url
19. unarchive
```

Não é necessário dominar todos de uma vez.

---

## 68. Exercícios

### Exercício 1 — command

Crie um Playbook que utilize:

```yaml
ansible.builtin.command
```

para executar:

```bash
hostname
```

Armazene o resultado com:

```yaml
register:
```

e apresente com:

```yaml
debug:
```

### Exercício 2 — shell

Execute:

```bash
ps aux | grep sshd | grep -v grep
```

utilizando:

```yaml
ansible.builtin.shell
```

### Exercício 3 — file

Crie:

```text
/opt/estudo-ansible
```

com:

```text
0755
```

### Exercício 4 — copy

Crie:

```text
/opt/estudo-ansible/teste.txt
```

com conteúdo:

```text
Arquivo criado pelo Ansible.
```

### Exercício 5 — systemd

Faça o Ansible garantir que:

```text
sshd
```

esteja ativo.

### Exercício 6 — package

Instale um pacote utilizando:

```yaml
ansible.builtin.package
```

### Exercício 7 — stat

Verifique se:

```text
/etc/hosts
```

existe.

### Exercício 8 — template

Crie um template contendo:

```jinja2
Servidor: {{ inventory_hostname }}
```

Faça o Ansible gerar esse arquivo no servidor.

### Exercício 9 — diagnóstico

Crie um Playbook que utilize pelo menos:

```text
command
register
stat
debug
```

e produza um pequeno relatório.

---

## 69. Projeto prático

Crie:

```text
playbooks/diagnostico_modulos.yml
```

O Playbook deverá coletar:

```text
Hostname
Kernel
Memória
Disco
Estado do SSH
/etc/hosts
Processos
```

Utilize os módulos adequados para cada situação.

Tente evitar `shell` e `raw` quando existir um módulo apropriado.

Depois compare:

```text
Solução utilizando módulos
```

com:

```text
Solução utilizando comandos Linux
```

O objetivo é perceber onde os módulos oferecem vantagens.

---

## 70. Relação entre módulos e os Playbooks do Pangolim

No seu projeto, você já utilizou um caso muito importante:

```text
diagnostico_squid.yml
```

e:

```text
diagnostico_watchguard.yml
```

Esses Playbooks utilizam `raw` para executar comandos Linux específicos.

Por exemplo:

```yaml
ansible.builtin.raw: |
  ps -eo pid,comm,%cpu,%mem,rss,vsz,etime,args --no-headers
```

Isso é uma abordagem válida para **diagnóstico** quando precisamos exatamente das informações fornecidas pelo Linux.

Por outro lado, se o objetivo fosse **gerenciar** um serviço, seria melhor utilizar um módulo específico.

Por exemplo:

```yaml
ansible.builtin.systemd:
  name: squid
  state: started
```

A ideia é:

```text
Diagnóstico específico
        ↓
command / shell / raw
        ↓
coleta de informações

Gerenciamento de estado
        ↓
módulo especializado
        ↓
idempotência
```

---

## 71. Regra prática

Ao escrever uma Task, faça esta pergunta:

> **Existe um módulo Ansible específico para aquilo que quero fazer?**

Se existir, normalmente comece por ele.

Exemplo:

```text
Criar usuário
    ↓
user

Criar diretório
    ↓
file

Copiar arquivo
    ↓
copy

Gerar configuração
    ↓
template

Instalar pacote
    ↓
package

Gerenciar serviço
    ↓
systemd

Consultar arquivo
    ↓
stat
```

Se não existir ou se a operação for uma coleta específica:

```text
command
shell
raw
```

podem ser apropriados.

---

## 72. Conceito fundamental

O Ansible não existe apenas para transformar:

```bash
comando Linux
```

em:

```yaml
shell: comando Linux
```

A grande vantagem do Ansible está em representar o **estado desejado da infraestrutura**.

Em vez de:

```bash
mkdir -p /opt/app
```

podemos declarar:

```yaml
ansible.builtin.file:
  path: /opt/app
  state: directory
```

Em vez de:

```bash
systemctl start nginx
```

podemos declarar:

```yaml
ansible.builtin.systemd:
  name: nginx
  state: started
```

Em vez de:

```bash
useradd operador
```

podemos declarar:

```yaml
ansible.builtin.user:
  name: operador
  state: present
```

Essa mudança de pensamento é fundamental para evoluir no Ansible.

---

## 73. Resumo

Os módulos são os componentes que executam as ações do Ansible.

A estrutura básica é:

```text
Playbook
   ↓
Task
   ↓
Module
   ↓
Parâmetros
   ↓
Servidor
```

Os principais módulos para administração Linux incluem:

```text
command
shell
raw
debug
package
systemd
file
copy
template
user
group
stat
find
setup
uri
wait_for
```

A regra geral é:

```text
Existe módulo específico?
        |
       SIM
        ↓
Use o módulo.

       NÃO
        ↓
Precisa apenas de comando?
        |
       SIM
        ↓
command

Precisa de shell?
        |
       SIM
        ↓
shell

Python remoto indisponível/incompatível
ou necessidade específica de baixo nível?
        |
       SIM
        ↓
raw
```

O objetivo final é conseguir olhar para uma necessidade de infraestrutura e pensar:

```text
O que preciso fazer?
        ↓
Qual módulo representa essa ação?
        ↓
Quais parâmetros preciso?
        ↓
Qual estado desejo?
        ↓
Como validar o resultado?
```

Essa forma de pensar é a base para escrever Playbooks Ansible mais **claros, idempotentes, reutilizáveis e seguros**.