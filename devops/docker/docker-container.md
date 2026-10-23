---
layout: default
description: "Comandos para criar, executar, inspecionar e gerenciar containers Docker no dia a dia."
title: Docker — containers
---

# Containers
{:.no_toc}

Este tutorial apresenta os conceitos e comandos básicos para criar, executar, inspecionar e remover containers Docker.


<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

## Pré-requisitos

- Docker Engine instalado;
- acesso ao terminal;
- permissão para executar comandos Docker.

Verifique se o Docker está instalado e em execução:

```bash
docker --version
docker info
```

---

## 1. O que é um container?

Um **container** é uma unidade isolada utilizada para executar uma aplicação e suas dependências de forma padronizada.

Diferentemente de uma máquina virtual, um container não precisa carregar um sistema operacional completo. Ele utiliza o kernel do sistema operacional do host, mantendo processos, arquivos, rede e outros recursos isolados.

De forma simplificada:

```text
┌─────────────────────────────────────┐
│             Host Linux              │
│                                     │
│  ┌───────────┐   ┌───────────┐      │
│  │ Container │   │ Container │      │
│  │   Nginx   │   │   MySQL   │      │
│  └───────────┘   └───────────┘      │
│                                     │
│              Kernel                 │
└─────────────────────────────────────┘
```

Um container normalmente é criado a partir de uma **imagem Docker**.

A relação básica é:

```text
Imagem → Container
```

A imagem funciona como um modelo, enquanto o container é uma instância em execução dessa imagem.

---

## 2. Verificar se o Docker está instalado

Antes de trabalhar com containers, verifique a instalação do Docker:

```bash
docker --version
```

Exemplo:

```text
Docker version 29.x.x, build xxxxxxx
```

Também é possível verificar informações mais detalhadas:

```bash
docker info
```

Se o Docker estiver funcionando corretamente, o comando exibirá informações sobre o Docker Engine, containers, imagens, armazenamento e outros componentes.

---

## 3. Criar o primeiro container

Para criar e executar um container simples, utilize:

```bash
docker run hello-world
```

O Docker irá:

1. verificar se a imagem `hello-world` está disponível localmente;
2. caso não esteja, procurar a imagem em um registry;
3. baixar a imagem;
4. criar um container;
5. executar o processo definido pela imagem;
6. exibir a mensagem do container;
7. finalizar o container.

Esse comando é uma boa forma de verificar se o Docker Engine está funcionando.

---

## 4. Executar um container Nginx

Agora vamos executar um servidor web utilizando o Nginx:

```bash
docker run -d --name nginx -p 8080:80 nginx
```

Nesse comando:

| Parâmetro      | Função                                                   |
| -------------- | -------------------------------------------------------- |
| `docker run`   | Cria e inicia um container                               |
| `-d`           | Executa o container em segundo plano                     |
| `--name nginx` | Define o nome do container                               |
| `-p 8080:80`   | Mapeia a porta 8080 do host para a porta 80 do container |
| `nginx`        | Imagem utilizada para criar o container                  |

O mapeamento:

```text
8080:80
```

significa:

```text
Host                Container
┌──────────┐        ┌──────────┐
│  :8080   │ ─────► │   :80    │
└──────────┘        └──────────┘
```

Assim, uma conexão feita na porta `8080` do host será encaminhada para a porta `80` do container.

---

## 5. Verificar os containers em execução

Para listar os containers em execução:

```bash
docker ps
```

Exemplo:

```text
CONTAINER ID   IMAGE   COMMAND                  STATUS         PORTS                  NAMES
a1b2c3d4e5f6   nginx   "/docker-entrypoint…"   Up 10 seconds  0.0.0.0:8080->80/tcp   nginx
```

Algumas informações importantes:

* `CONTAINER ID`: identificador do container;
* `IMAGE`: imagem utilizada;
* `STATUS`: estado atual;
* `PORTS`: portas publicadas;
* `NAMES`: nome do container.

---

## 6. Listar todos os containers

O comando `docker ps` mostra somente os containers em execução.

Para visualizar também os containers que foram finalizados:

```bash
docker ps -a
```

Exemplo:

```text
CONTAINER ID   IMAGE        STATUS                      NAMES
a1b2c3d4e5f6   nginx        Up 2 minutes                nginx
b2c3d4e5f6a1   hello-world  Exited (0) 5 minutes ago    hello-world
```

Isso é importante porque um container pode existir mesmo depois que seu processo principal foi encerrado.

---

## 7. Verificar o container pelo navegador

Com o Nginx em execução, acesse:

```text
http://localhost:8080
```

Se o container estiver funcionando corretamente, será exibida a página padrão do Nginx.

---

## 8. Visualizar os logs

Para visualizar os logs do container:

```bash
docker logs nginx
```

Para acompanhar os logs em tempo real:

```bash
docker logs -f nginx
```

O `-f` significa **follow**, mantendo o terminal acompanhando novas mensagens.

Para sair da visualização dos logs:

```text
Ctrl + C
```

Isso interrompe apenas a visualização dos logs, não o container.

---

## 9. Executar comandos dentro do container

É possível abrir um shell dentro de um container em execução:

```bash
docker exec -it nginx /bin/bash
```

Caso a imagem não possua `bash`, utilize:

```bash
docker exec -it nginx /bin/sh
```

Por exemplo:

```bash
docker exec -it nginx /bin/sh
```

Dentro do container:

```bash
hostname
```

```bash
cat /etc/os-release
```

```bash
ps
```

Para sair:

```bash
exit
```

### Diferença entre `docker exec` e `docker run`

`docker run` cria um **novo container**.

`docker exec` executa um comando em um **container que já existe e está em execução**.

---

## 10. Parar um container

Para parar o Nginx:

```bash
docker stop nginx
```

Verifique:

```bash
docker ps
```

O container não deverá mais aparecer entre os containers em execução.

Porém, ele continua existindo.

Para confirmar:

```bash
docker ps -a
```

---

## 11. Iniciar novamente um container parado

Como o container ainda existe, não é necessário utilizar `docker run` novamente.

Utilize:

```bash
docker start nginx
```

Verifique:

```bash
docker ps
```

O container deverá voltar a aparecer como `Up`.

---

## 12. Reiniciar um container

Também é possível reiniciar diretamente:

```bash
docker restart nginx
```

Esse comando é equivalente, de forma simplificada, a:

```text
stop → start
```

---

## 13. Remover um container

Para remover o container:

```bash
docker rm nginx
```

Se o container estiver em execução, será necessário pará-lo primeiro:

```bash
docker stop nginx
```

Depois:

```bash
docker rm nginx
```

É possível verificar:

```bash
docker ps -a
```

O container `nginx` não deverá mais aparecer.

---

## 14. Remover um container em execução

Também existe a opção:

```bash
docker rm -f nginx
```

O `-f` força a remoção do container.

Use esse comando com cuidado, principalmente em ambientes de produção.

---

## 15. Ciclo de vida básico

O ciclo básico de um container pode ser representado assim:

```text
              docker run
                   │
                   ▼
             ┌───────────┐
             │  Criado   │
             └─────┬─────┘
                   │
                   ▼
             ┌───────────┐
             │ Executando│
             └─────┬─────┘
                   │
          docker stop
                   │
                   ▼
             ┌───────────┐
             │  Parado   │
             └─────┬─────┘
                   │
          docker start
                   │
                   └──────────────► Executando

             docker rm
                   │
                   ▼
             ┌───────────┐
             │  Removido │
             └───────────┘
```

---

## 16. Comandos essenciais

| Comando          | Função                                 |
| ---------------- | -------------------------------------- |
| `docker run`     | Cria e inicia um container             |
| `docker ps`      | Lista containers em execução           |
| `docker ps -a`   | Lista todos os containers              |
| `docker start`   | Inicia um container parado             |
| `docker stop`    | Para um container                      |
| `docker restart` | Reinicia um container                  |
| `docker logs`    | Exibe os logs                          |
| `docker exec`    | Executa um comando dentro do container |
| `docker rm`      | Remove um container                    |

---

## 17. Exercício prático

Execute os comandos abaixo na ordem:

### 1. Criar o container

```bash
docker run -d --name nginx -p 8080:80 nginx
```

### 2. Verificar

```bash
docker ps
```

### 3. Testar o serviço

```bash
curl http://localhost:8080
```

### 4. Consultar os logs

```bash
docker logs nginx
```

### 5. Entrar no container

```bash
docker exec -it nginx /bin/sh
```

Dentro do container:

```bash
hostname
```

Depois:

```bash
exit
```

### 6. Parar

```bash
docker stop nginx
```

### 7. Verificar

```bash
docker ps -a
```

### 8. Iniciar novamente

```bash
docker start nginx
```

### 9. Remover

```bash
docker stop nginx
docker rm nginx
```

---

## 18. O que aprender depois?

Depois de entender containers, o próximo passo é estudar **imagens Docker**.

A relação entre os conceitos será:

```text
Dockerfile
    │
    ▼
Imagem Docker
    │
    ▼
Container
    │
    ├── Volume
    ├── Rede
    └── Processo
```

Depois disso, os conceitos podem ser aprofundados com:

1. **Imagens Docker**
2. **Dockerfile**
3. **Volumes**
4. **Redes Docker**
5. **Docker Compose**
6. **Registries privados**
7. **Troubleshooting**