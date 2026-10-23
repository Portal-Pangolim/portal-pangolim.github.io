---
layout: default
description: "Inventários do Ansible: definição de hosts, grupos, variáveis e organização dos ambientes gerenciados."
title: Inventários Ansible
---

# Inventários Ansible
{:.no_toc}

> Parte da trilha de estudo Ansible: [Índice](index.md) · **Inventários (você está aqui)** · [Módulos](modulos.md) · [Playbooks](playbooks.md)


<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## Introdução

O **inventário** é o arquivo (ou conjunto de arquivos) que diz ao Ansible **quais servidores existem, como agrupá-los e como acessá-los**.

Ele informa, principalmente:

* quais servidores existem;
* a quais grupos cada servidor pertence;
* endereço ou hostname de cada servidor;
* usuário e porta usados na conexão SSH;
* variáveis específicas de hosts ou grupos.

```text
Inventário
    ↓
Quais servidores existem?
    ↓
Quais pertencem a cada grupo?
    ↓
Como o Ansible deve acessá-los?
```

O inventário responde **onde** executar. O Playbook responde **o que** executar. Por isso, ele é uma das primeiras coisas a entender antes de escrever Playbooks.

> **Como usar este material:** as seções 1 a 8 são o básico. As seções 9 a 14 tratam de organização e variáveis. As seções 15 em diante são práticas e de aprofundamento. Ao final há exercícios e um checklist.

---

## 1. Control Node e Managed Nodes

```text
                    CONTROL NODE
                         |
                       Ansible
                         |
          +--------------+--------------+
          |              |              |
       servidor        servidor       servidor
          01             02             03
```

* **Control Node:** máquina onde o Ansible está instalado e de onde os comandos são executados.
* **Managed Nodes:** servidores administrados (não precisam ter o Ansible instalado; em geral só precisam de SSH e Python).

O inventário fica no Control Node. Exemplo:

```text
/opt/ansible/inventory/hosts.ini
```

---

## 2. Para que serve o inventário?

Imagine estes servidores:

```text
10.0.27.72
10.0.27.73
10.0.27.74
10.0.27.80
10.0.27.81
```

Podemos organizá-los em grupos:

```text
                Linux
                  |
       +----------+----------+
       |                     |
     Squid                  Web
       |                     |
  .72 .73 .74             .80 .81
```

Assim, um Playbook pode executar somente nos servidores desejados:

```yaml
hosts: squid
```

Significa: *execute este Play somente nos hosts do grupo `squid`.*

---

## 3. Inventário no formato INI

O formato INI é o mais simples para começar:

```ini
[squid]
10.0.27.72
10.0.27.73
10.0.27.74

[web]
10.0.27.80
10.0.27.81
```

Estrutura:

```text
[nome_do_grupo]
host
host
host
```

**Regras para nomes de grupos:** use letras, números e underscore (`_`). Evite hífens e espaços. Prefira `sao_paulo` a `sao-paulo`.

### Grupos implícitos

Mesmo sem declará-los, o Ansible sempre cria dois grupos:

* `all`: todos os hosts do inventário;
* `ungrouped`: hosts que não pertencem a nenhum outro grupo.

Por isso **não é necessário** criar um grupo só para "todos os servidores": use `all`.

### Faixas de hosts

Para muitos servidores com nomes sequenciais, use faixas:

```ini
[web]
web[01:05].exemplo.com.br    # web01 até web05

[proxy]
10.0.27.[72:74]              # .72, .73 e .74
```

---

## 4. Grupos e múltiplos pertencimentos

Um servidor pode pertencer a **vários grupos**. Isso permite organizar o inventário por critérios diferentes ao mesmo tempo (função, ambiente, localidade):

```ini
[squid]
10.0.27.72
10.0.27.73

[linux]
10.0.27.72
10.0.27.73
10.0.27.80

[producao]
10.0.27.72
10.0.27.80
```

O host `10.0.27.72` pertence a `squid`, `linux` e `producao`.

> Repetir IPs em vários grupos funciona, mas gera retrabalho. Na seção 9 veremos "grupos de grupos", que evitam isso.

---

## 5. Executando comandos ad-hoc no inventário

### Sintaxe básica

```bash
ansible -i inventory/hosts.ini squid -m ping -k
```

| Parte                    | Significado                          |
| ------------------------ | ------------------------------------ |
| `-i inventory/hosts.ini` | qual inventário usar                 |
| `squid`                  | grupo (ou padrão) de hosts alvo      |
| `-m ping`                | módulo a executar                    |
| `-k`                     | solicita a senha SSH interativamente |

**Observações importantes:**

* Sem `-i`, o Ansible usa o inventário padrão (normalmente `/etc/ansible/hosts`). Em projetos, prefira sempre informar `-i` ou configurar `inventory` no `ansible.cfg`.
* O `-k` exige o pacote `sshpass` no Control Node. O recomendado a longo prazo é usar **chaves SSH** (seção 16).
* O módulo `ping` do Ansible **não é um ICMP ping**: ele testa conexão SSH, Python e execução de módulo no host.

### Todos os hosts

```bash
ansible -i inventory/hosts.ini all -m ping -k
```

### Listando os hosts sem executar nada

```bash
ansible -i inventory/hosts.ini all --list-hosts
```

```text
hosts (5):
    10.0.27.72
    10.0.27.73
    10.0.27.74
    10.0.27.80
    10.0.27.81
```

Também funciona para um grupo:

```bash
ansible -i inventory/hosts.ini squid --list-hosts
```

`--list-hosts` é excelente para conferir **onde** algo vai rodar antes de executar.

---

## 6. Nome lógico × endereço real

O inventário não precisa usar somente IPs. Pode usar hostnames (se o DNS resolver):

```ini
[squid]
s-sesu2772
s-sesu2773
```

Também é possível dar um **nome lógico** ao host e informar o endereço real com `ansible_host`:

```ini
[squid]
proxy01 ansible_host=10.0.27.72
proxy02 ansible_host=10.0.27.73
proxy03 ansible_host=10.0.27.74
```

```text
proxy01 → 10.0.27.72
proxy02 → 10.0.27.73
proxy03 → 10.0.27.74
```

Nomes lógicos deixam Playbooks, logs e relatórios muito mais legíveis, e o IP pode mudar sem alterar nada além do inventário.

### Duas variáveis que não se confundem

| Variável             | O que representa                             | Exemplo (`proxy01`) |
| -------------------- | --------------------------------------------- | -------------------- |
| `inventory_hostname` | nome do host **como aparece no inventário**  | `proxy01`            |
| `ansible_host`       | endereço **usado na conexão**                | `10.0.27.72`         |

Exemplo prático:

```ini
[squid]
proxy01 ansible_host=10.0.27.72
```

```yaml
---
- name: Teste
  hosts: squid
  gather_facts: false

  tasks:
    - name: Mostrar informações
      ansible.builtin.debug:
        msg:
          - "Nome: {{ inventory_hostname }}"
          - "IP: {{ ansible_host }}"
```

```text
Nome: proxy01
IP: 10.0.27.72
```

> Se um host **não** tiver `ansible_host`, a variável `ansible_host` assume o próprio nome do host.

---

## 7. Variáveis de conexão

São variáveis especiais que controlam **como** o Ansible se conecta.

| Variável                    | Função                                        | Padrão                        |
| ---------------------------- | --------------------------------------------- | ------------------------------ |
| `ansible_host`              | endereço de conexão                           | nome do host                  |
| `ansible_user`              | usuário SSH                                   | usuário local ou `ansible.cfg` |
| `ansible_port`              | porta SSH                                     | `22`                           |
| `ansible_ssh_private_key_file` | chave privada SSH                          | chave padrão do SSH            |
| `ansible_become`            | elevar privilégio (sudo) nas tarefas          | `false`                        |
| `ansible_python_interpreter`| caminho do Python no host remoto              | detecção automática            |

Exemplo combinando várias:

```ini
[squid]
proxy01 ansible_host=10.0.27.72 ansible_user=root ansible_port=22
```

```text
Nome lógico: proxy01
Endereço:    10.0.27.72
Usuário:     root
Porta:       22
```

Em vez de `root`, é mais seguro usar um usuário comum com `ansible_become=true` (sudo).

---

## 8. Senhas no inventário

É possível escrever:

```ini
proxy01 ansible_host=10.0.27.72 ansible_user=root ansible_password=senha
```

Mas **não faça isso** em arquivos que possam ser versionados (Git) ou compartilhados.

Alternativas, da melhor para a mais simples:

1. **Chaves SSH** (recomendado);
2. **Ansible Vault** para criptografar valores ou arquivos;
3. `-k` (pergunta a senha na execução): aceitável em estudo e testes.

Exemplo de valor criptografado com Vault:

```bash
ansible-vault encrypt_string 'MinhaSenha' --name 'ansible_password'
```

---

## 9. Grupos de grupos (`:children`)

Um grupo pode conter **outros grupos**:

```ini
[squid]
10.0.27.72
10.0.27.73

[web]
10.0.27.80
10.0.27.81

[infra:children]
squid
web
```

```text
infra
├── squid
│   ├── 10.0.27.72
│   └── 10.0.27.73
│
└── web
    ├── 10.0.27.80
    └── 10.0.27.81
```

```bash
ansible -i inventory/hosts.ini infra -m ping -k
```

### Hierarquia maior

Atenção à sintaxe: um grupo que contém outros grupos **sempre** usa o sufixo `:children`.

```ini
[producao_squid]
10.0.27.72
10.0.27.73

[homologacao_squid]
10.0.28.72
10.0.28.73

[squid:children]
producao_squid
homologacao_squid

[producao:children]
producao_squid

[homologacao:children]
homologacao_squid

[infra:children]
producao
homologacao
```

> **Erro comum:** escrever `[producao]` seguido do nome de um grupo. Sem `:children`, o Ansible trata `producao_squid` como se fosse um **hostname**.

---

## 10. Variáveis de grupo e de host no próprio inventário

### Variáveis de grupo (`:vars`)

```ini
[web]
web01 ansible_host=10.0.27.80
web02 ansible_host=10.0.27.81

[web:vars]
porta_http=80
ambiente=producao
```

```yaml
- name: Mostrar ambiente
  ansible.builtin.debug:
    msg: "Ambiente: {{ ambiente }}"
```

### Variáveis de host

```ini
[web]
web01 ansible_host=10.0.27.80 porta_http=80
web02 ansible_host=10.0.27.81 porta_http=8080
```

```text
web01 → porta 80
web02 → porta 8080
```

> No formato INI, valores tendem a ser interpretados como texto ou literais simples. Para listas, dicionários e tipos bem definidos, prefira `group_vars/` e `host_vars/` (seção 13).

---

## 11. Formato YAML

O Ansible também aceita inventários em YAML:

```yaml
all:
  children:

    squid:
      hosts:
        proxy01:
          ansible_host: 10.0.27.72
        proxy02:
          ansible_host: 10.0.27.73

    web:
      hosts:
        web01:
          ansible_host: 10.0.27.80
        web02:
          ansible_host: 10.0.27.81
      vars:
        porta_http: 80
```

```text
all
├── squid
│   ├── proxy01
│   └── proxy02
│
└── web
    ├── web01
    └── web02
```

### INI ou YAML?

| INI                                      | YAML                                             |
| ----------------------------------------- | ------------------------------------------------- |
| Mais curto e simples para começar        | Mais verboso, porém estruturado                  |
| Tipos de variáveis menos previsíveis     | Tipos de dados claros (listas, dicionários etc.) |
| Ótimo para estudo e ambientes pequenos   | Bom para inventários maiores e complexos         |

O mais importante é **manter consistência** no projeto.

---

## 12. Formas de organizar o inventário

### Por função

```ini
[proxy]
10.0.27.72
10.0.27.73

[web]
10.0.27.80
10.0.27.81

[banco]
10.0.27.90
10.0.27.91

[monitoramento]
10.0.27.100
```

Permite criar Playbooks por função: `diagnostico_proxy.yml`, `diagnostico_web.yml`, `diagnostico_banco.yml`...

### Por ambiente

```ini
[producao]
10.0.27.72
10.0.27.80

[homologacao]
10.0.28.72
10.0.28.80
```

```bash
ansible-playbook playbook.yml --limit producao
```

### Por localização

```ini
[brasilia]
10.0.27.72
10.0.27.73

[sao_paulo]
10.0.30.72
10.0.30.73

[rio]
10.0.31.72
10.0.31.73
```

### Combinando critérios

O poder do inventário está em **cruzar** esses critérios: um mesmo host é `squid` (função), `producao` (ambiente) e `brasilia` (local). Depois, use padrões de seleção (seção 15) para escolher exatamente o recorte desejado.

---

## 13. `group_vars` e `host_vars`

Conforme o projeto cresce, mantenha as variáveis **fora** do arquivo de hosts:

```text
inventory/
├── hosts.ini
├── group_vars/
│   ├── all.yml        # vale para todos os hosts
│   ├── linux.yml
│   ├── squid.yml
│   └── web.yml
└── host_vars/
    ├── proxy01.yml
    └── proxy02.yml
```

O nome do arquivo deve ser igual ao nome do **grupo** ou do **host** (como aparece no inventário, ou seja, `inventory_hostname`).

### `group_vars/squid.yml`

```yaml
memoria_alerta: 80
cpu_alerta: 90
```

Todos os hosts do grupo `squid` enxergam essas variáveis:

```yaml
- name: Mostrar limite
  ansible.builtin.debug:
    msg: "CPU: {{ cpu_alerta }}%"
```

### `host_vars/proxy01.yml`

```yaml
ambiente: producao
prioridade: alta
```

Somente `proxy01` recebe essas variáveis.

### Precedência (visão simplificada)

Quando a mesma variável é definida em vários lugares, vence o de **maior precedência**:

```text
group_vars/all            (menor)
     ↓
group_vars de grupo pai
     ↓
group_vars de grupo filho
     ↓
host_vars
     ↓
... play, tasks, etc.
     ↓
-e / --extra-vars         (maior)
```

Há muitas outras camadas na lista oficial de precedência. A recomendação prática é: **defina cada variável em um só lugar** sempre que possível.

---

## 14. Inventário estático × dinâmico

### Estático

Arquivo escrito e mantido manualmente:

```ini
[web]
10.0.27.80
10.0.27.81
```

### Dinâmico

Em nuvem ou grandes datacenters, os servidores mudam o tempo todo. O inventário é obtido de uma fonte externa via **plugin**:

```text
fonte externa (AWS, Azure, GCP, VMware, Nutanix, Kubernetes, CMDB, API)
        ↓
plugin de inventário
        ↓
inventário gerado automaticamente
        ↓
Ansible
```

Em ambientes pequenos e estáveis, o estático costuma bastar. Em ambientes grandes, o dinâmico reduz muito a manutenção manual. Também é possível **misturar** ambos no mesmo diretório de inventário.

---

## 15. Selecionando hosts

### Grupos e hosts individuais

```bash
ansible -i inventory/hosts.ini all   -m ping -k
ansible -i inventory/hosts.ini squid -m ping -k
ansible -i inventory/hosts.ini proxy01 -m ping -k
```

### Padrões de seleção

| Padrão               | Significado                                  |
| ---------------------- | ---------------------------------------------- |
| `'squid:web'`        | união: hosts de `squid` **ou** `web`         |
| `'linux:&producao'`  | interseção: hosts em `linux` **e** `producao` |
| `'all:!homologacao'` | exclusão: todos **menos** `homologacao`      |
| `'web*'`             | curinga em nomes                              |

```bash
ansible -i inventory/hosts.ini 'linux:&producao' -m ping -k
```

> Use aspas simples nos padrões para o shell não interpretar `!` e `&`.

### `--limit` em Playbooks

O Playbook define `hosts:`, e o `--limit` **restringe ainda mais** onde ele executa:

```bash
ansible-playbook -i inventory/hosts.ini playbook.yml --limit squid
ansible-playbook -i inventory/hosts.ini playbook.yml --limit proxy01
ansible-playbook -i inventory/hosts.ini playbook.yml --limit 'squid:&producao'
```

Ele **não amplia** a seleção: só reduz o que o `hosts:` do Playbook já permitia.

---

## 16. Chaves SSH em vez de senha

Para não depender de `-k` nem de senhas no inventário:

```bash
ssh-keygen -t ed25519
ssh-copy-id usuario@10.0.27.72
```

E no inventário:

```ini
[squid]
proxy01 ansible_host=10.0.27.72 ansible_user=ansible ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

Com chaves configuradas, o teste fica simplesmente:

```bash
ansible -i inventory/hosts.ini squid -m ping
```

---

## 17. O comando `ansible-inventory`

Permite **consultar e validar** o inventário sem tocar nos servidores.

### Estrutura em JSON

```bash
ansible-inventory -i inventory/hosts.ini --list
```

### Árvore de grupos

```bash
ansible-inventory -i inventory/hosts.ini --graph
```

```text
@all:
  |--@squid:
  |  |--proxy01
  |  |--proxy02
  |--@ungrouped:
  |--@web:
  |  |--web01
  |  |--web02
```

### Variáveis de um host (já resolvidas, incluindo `group_vars`/`host_vars`)

```bash
ansible-inventory -i inventory/hosts.ini --host proxy01
```

Para ver também as variáveis:

```bash
ansible-inventory -i inventory/hosts.ini --graph --vars
```

---

## 18. Inventários separados ou único?

### Um arquivo por ambiente

```text
inventory/
├── producao.ini
├── homologacao.ini
└── desenvolvimento.ini
```

```bash
ansible-playbook -i inventory/producao.ini   playbooks/diagnostico.yml
ansible-playbook -i inventory/homologacao.ini playbooks/diagnostico.yml
```

Reduz o risco de rodar uma automação no ambiente errado, pois é preciso indicar explicitamente o arquivo.

### Um único inventário com grupos de ambiente

```ini
[producao]
proxy01
web01
db01

[homologacao]
proxy02
web02
db02
```

```bash
ansible-playbook playbook.yml --limit producao
```

Mais prático, mas exige mais atenção ao `--limit`. Em ambientes críticos, a separação por arquivo é mais segura.

---

## 19. Exemplo completo

```ini
[squid]
proxy01 ansible_host=10.0.27.72 ansible_user=ansible
proxy02 ansible_host=10.0.27.73 ansible_user=ansible

[web]
web01 ansible_host=10.0.27.80 ansible_user=ansible
web02 ansible_host=10.0.27.81 ansible_user=ansible

[linux:children]
squid
web
```

```text
linux
├── squid
│   ├── proxy01
│   └── proxy02
│
└── web
    ├── web01
    └── web02
```

### Estrutura de projeto sugerida (Pangolim)

```text
/opt/ansible/
├── ansible.cfg
├── inventory/
│   ├── hosts.ini
│   ├── group_vars/
│   └── host_vars/
└── playbooks/
    ├── diagnostico_squid.yml
    └── diagnostico_watchguard.yml
```

Comece simples e cresça aos poucos:

```ini
[squid]
10.0.27.72
```

```ini
[squid]
10.0.27.72
10.0.27.73
10.0.27.74
```

---

## 20. Inventário e Playbook trabalham juntos

```text
inventory
    |
    +-- squid
         |
         +-- 10.0.27.72
         +-- 10.0.27.73
         +-- 10.0.27.74
                 |
                 ↓
             Playbook
                 |
                 ↓
       diagnóstico do Squid
```

* **Inventário = onde**
* **Playbook = o que**
* **Task = ação**
* **Módulo = ferramenta que executa a ação**

Um inventário pode ir além de uma lista de IPs e representar a **visão lógica da infraestrutura**:

```text
Ambiente
├── Produção
│   ├── Proxy
│   ├── Web
│   └── Banco
│
└── Homologação
    ├── Proxy
    ├── Web
    └── Banco
```

---

## 21. Boas práticas

* **Nomes significativos:** `proxy01`, `web01`, em vez de `servidores1`.
* **Organize por função** (`squid`, `web`, `banco`) e **cruze** com ambiente e localidade.
* **Use grupos de grupos** (`[linux:children]`) em vez de repetir hosts.
* **Nunca deixe senhas em texto puro** no inventário: use SSH keys e Ansible Vault.
* **Mantenha variáveis em `group_vars`/`host_vars`** quando o projeto crescer.
* **Defina cada variável em um só lugar.**
* **Versione o inventário** (Git), mas sem segredos.
* **Valide antes de executar:** `--graph`, `--list-hosts`, `ping`, `--limit`.

---

## 22. Fluxo recomendado ao adicionar um servidor

```text
1. Adicionar ao inventário
        ↓
2. ansible-inventory --graph
        ↓
3. --list-hosts
        ↓
4. ansible -m ping
        ↓
5. Playbook com --limit (um host)
        ↓
6. Validar resultado
        ↓
7. Liberar execução no grupo
```

```bash
ansible-inventory -i inventory/hosts.ini --graph
ansible -i inventory/hosts.ini squid --list-hosts
ansible -i inventory/hosts.ini squid -m ping -k
ansible-playbook \
  -i inventory/hosts.ini \
  playbooks/diagnostico_squid.yml \
  --limit proxy01 \
  -k
```

Para ainda mais segurança, use antes `--check` (simulação) e `--list-hosts` no próprio `ansible-playbook`:

```bash
ansible-playbook -i inventory/hosts.ini playbooks/diagnostico_squid.yml --list-hosts
```

---

## 23. Erros comuns

| Sintoma                                      | Causa provável                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `skipping: no hosts matched`                 | grupo digitado errado, ou `-i` apontando para o arquivo errado     |
| `UNREACHABLE! ... Permission denied`         | usuário/senha/chave incorretos                                      |
| `UNREACHABLE! ... Connection timed out`      | IP errado, firewall, porta SSH diferente (`ansible_port`)           |
| `sshpass` não encontrado ao usar `-k`        | instalar `sshpass` no Control Node                                  |
| Host tratado como nome em vez de grupo       | faltou `:children` na declaração do grupo                           |
| Variável com valor "inesperado"              | mesma variável definida em vários lugares (precedência)             |
| Nome do host não resolve                     | falta DNS; use `ansible_host=IP`                                    |
| Erro de Python no host remoto                | ajustar `ansible_python_interpreter`                                |

---

## 24. Exercícios

**1. Inventário básico.** Crie `inventory/estudo.ini`:

```ini
[linux]
10.0.27.72
10.0.27.73
10.0.27.74
```

```bash
ansible-inventory -i inventory/estudo.ini --graph
```

**2. Teste de conexão.**

```bash
ansible -i inventory/estudo.ini linux -m ping -k
```

**3. Criar grupos.** Adicione:

```ini
[squid]
10.0.27.72
10.0.27.73

[web]
10.0.27.80
10.0.27.81
```

Visualize com `--graph`. O que aparece em `@ungrouped`?

**4. Grupo de grupos.** Adicione:

```ini
[infra:children]
squid
web
```

```bash
ansible -i inventory/estudo.ini infra --list-hosts
```

**5. Nome lógico.** Transforme `10.0.27.72` em `proxy01 ansible_host=10.0.27.72` e rode `--graph` novamente.

**6. Variável de grupo.** Adicione `[squid:vars]` com `ambiente=producao` e crie um Playbook que mostre `inventory_hostname` e `ambiente`.

**7. Variável de host.** Crie `host_vars/proxy01.yml` com `funcao: proxy` e mostre a variável no Playbook.

**8. Padrões.** Teste `'squid:web'`, `'infra:!web'` e `'linux:&squid'` com `--list-hosts`. Explique o resultado de cada um.

**9. Precedência.** Defina `ambiente` em `group_vars/squid.yml` e em `host_vars/proxy01.yml` com valores diferentes. Use `ansible-inventory --host proxy01` para ver qual vence.

**10. SSH key.** Configure uma chave SSH para um host e execute o `ping` **sem** `-k`.

---

## 25. Checklist de estudo

Antes de avançar, você deve conseguir explicar:

* [ ] O que é um inventário;
* [ ] O que são host e grupo;
* [ ] O que são `all` e `ungrouped`;
* [ ] `ansible_host`, `ansible_user`, `ansible_port`;
* [ ] Diferença entre `inventory_hostname` e `ansible_host`;
* [ ] Como criar grupos e colocar um host em vários grupos;
* [ ] Como criar grupos de grupos (`:children`);
* [ ] Como usar `--limit` e padrões (`:`, `:&`, `:!`);
* [ ] Como usar `ansible-inventory --graph`, `--list` e `--host`;
* [ ] Como testar com `ansible -m ping`;
* [ ] Diferença entre inventário estático e dinâmico;
* [ ] Diferença entre `group_vars` e `host_vars`;
* [ ] Noção de precedência de variáveis;
* [ ] Por que não colocar senhas no inventário e quais alternativas existem.

---

## 26. Resumo

A estrutura mais simples:

```ini
[grupo]
host1
host2
```

Evoluindo:

```ini
[squid]
proxy01 ansible_host=10.0.27.72
proxy02 ansible_host=10.0.27.73

[web]
web01 ansible_host=10.0.27.80
web02 ansible_host=10.0.27.81

[linux:children]
squid
web
```

Validar:

```bash
ansible-inventory -i inventory/hosts.ini --graph
```

Testar:

```bash
ansible -i inventory/hosts.ini linux -m ping -k
```

Executar um Playbook, primeiro em um único servidor:

```bash
ansible-playbook \
  -i inventory/hosts.ini \
  playbooks/diagnostico.yml \
  --limit proxy01 \
  -k
```

```text
                 INVENTÁRIO
                     |
             Onde executar?
                     |
        +------------+------------+
        |            |            |
      squid         web          banco
        |            |            |
      hosts        hosts        hosts
        |
        ↓
     PLAYBOOK
        |
        ↓
   O que executar?
```

**Inventário = onde · Playbook = o que · Task = ação · Módulo = ferramenta**

Essa separação é um dos fundamentos para construir automações Ansible organizadas e escaláveis.