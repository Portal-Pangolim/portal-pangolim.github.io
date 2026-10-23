---
layout: default
description: "Gerenciamento de imagens Docker: obtenção, listagem, construção e remoção de imagens."
title: Imagens Docker
---

# Imagens Docker
{:.no_toc}


Este tutorial apresenta os conceitos e comandos básicos para baixar, inspecionar, construir, versionar e publicar imagens Docker.


<div class="toc-title">Sumário</div>
* Sumário:
{:toc}


## Pré-requisitos

- Docker Engine instalado;
- acesso ao terminal;
- um diretório para os arquivos do projeto;
- acesso a um registry caso a imagem precise ser publicada.

Verifique a instalação:

```bash
docker --version
docker info
```

---

## 1. O que é uma imagem Docker?

Uma imagem Docker é um modelo somente leitura utilizado para criar containers.

Ela reúne a aplicação, suas dependências, arquivos necessários e as instruções para iniciar o processo principal.

Uma mesma imagem pode ser utilizada para criar vários containers:

```text
		   Imagem nginx
			   │
	   ┌─────────┼─────────┐
	   ▼         ▼         ▼
   Container  Container  Container
	 nginx      nginx      nginx
```

Uma imagem pode ser criada localmente ou baixada de um registry, como Docker Hub, GitHub Container Registry ou um registry privado.

---

## 2. Relação entre imagem e container

| Imagem | Container |
| --- | --- |
| Modelo utilizado para criar containers | Instância criada a partir de uma imagem |
| Normalmente é imutável | Possui estado durante sua execução |
| Pode ser armazenada em um registry | É executado pelo Docker Engine |
| Pode gerar vários containers | É criado a partir de uma imagem |

De forma simplificada:

```text
Imagem → docker run → Container
```

Por exemplo:

```bash
docker run nginx
```

Nesse comando, `nginx` é a imagem utilizada para criar o container.

---

## 3. Estrutura de uma imagem

As imagens Docker são construídas em camadas (*layers*). Cada camada representa uma alteração no sistema de arquivos da imagem.

```text
┌──────────────────────────────┐
│ Aplicação / arquivos finais  │
├──────────────────────────────┤
│ Dependências                 │
├──────────────────────────────┤
│ Bibliotecas                  │
├──────────────────────────────┤
│ Sistema de arquivos base     │
└──────────────────────────────┘
```

As camadas podem ser reutilizadas por diferentes imagens, reduzindo o espaço e o tempo de download ou build.

---

## 4. Listar imagens

Liste as imagens disponíveis localmente:

```bash
docker images
```

Também é possível usar:

```bash
docker image ls
```

As colunas mais importantes são:

- `REPOSITORY`: nome do repositório;
- `TAG`: versão ou identificação da imagem;
- `IMAGE ID`: identificador da imagem;
- `CREATED`: data de criação;
- `SIZE`: espaço utilizado.

---

## 5. Baixar uma imagem

Baixe uma imagem do registry padrão:

```bash
docker pull nginx:1.28
```

Se nenhuma tag for especificada, o Docker normalmente utiliza `latest`. Em produção, prefira uma versão explicitamente definida.

```text
docker pull <imagem>:<tag>
```

---

## 6. Inspecionar uma imagem

Para consultar metadados:

```bash
docker image inspect nginx:1.28
```

Também é possível consultar um campo específico:

{% raw %}
```bash
docker image inspect nginx:1.28 --format '{{.Architecture}}'
```
{% endraw %}

---

## 7. Histórico de uma imagem

```bash
docker history nginx:1.28
```

O comando mostra as camadas e as instruções utilizadas na construção da imagem.

---

## 8. Criar um Dockerfile

Crie um diretório para o projeto:

```bash
mkdir site-docker
cd site-docker
```

Crie um arquivo chamado `Dockerfile`:

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80
```

Crie também um arquivo `index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8">
	<title>Site Docker</title>
</head>
<body>
	<h1>Imagem Docker funcionando</h1>
</body>
</html>
```

O `Dockerfile` descreve as etapas utilizadas para construir a imagem.

---

## 9. Construir uma imagem

No diretório que contém o `Dockerfile`, execute:

```bash
docker build -t site-docker:1.0 .
```

O ponto final indica que o contexto do build é o diretório atual.

Confirme a imagem criada:

```bash
docker images site-docker
```

---

## 10. Executar a imagem construída

Crie um container a partir da imagem:

```bash
docker run -d --name site-docker -p 8080:80 site-docker:1.0
```

Teste no terminal:

```bash
curl http://localhost:8080
```

Ou abra no navegador:

```text
http://localhost:8080
```

Verifique o container:

```bash
docker ps
docker logs site-docker
```

---

## 11. Criar tags para a imagem

Uma tag ajuda a identificar a versão da imagem:

```bash
docker tag site-docker:1.0 site-docker:1.1
```

Para usar o nome de um registry:

```bash
docker tag site-docker:1.0 registry.exemplo.com/equipe/site-docker:1.0
```

Também é possível usar o identificador de um commit:

```bash
docker tag site-docker:1.0 site-docker:a81f93c
```

---

## 12. Publicar em um registry

Faça login no registry:

```bash
docker login registry.exemplo.com
```

Envie a imagem:

```bash
docker push registry.exemplo.com/equipe/site-docker:1.0
```

Em ambientes reais, mantenha credenciais fora do código e utilize permissões mínimas para o usuário ou token do registry.

---

## 13. Imagens locais e registries

As imagens podem estar armazenadas localmente ou em um registry.

```text
Registry → docker pull → Imagem local → docker run → Container
```

Exemplos de registries incluem Docker Hub, GitHub Container Registry e registries privados.

---

## 14. Remover imagens

Remova uma imagem pelo nome e tag:

```bash
docker rmi site-docker:1.1
```

Se a imagem estiver sendo utilizada por um container, remova ou pare o container antes:

```bash
docker stop site-docker
docker rm site-docker
docker rmi site-docker:1.0
```

---

## 15. Limpar imagens não utilizadas

Para remover imagens sem tag que não estão sendo utilizadas:

```bash
docker image prune
```

Para remover todas as imagens não utilizadas por containers:

```bash
docker image prune -a
```

Confira o espaço utilizado antes de executar a limpeza:

```bash
docker system df
```

Use comandos de limpeza com atenção, principalmente em servidores compartilhados.

---

## 16. Exercício prático

Execute o fluxo abaixo na ordem:

```bash
mkdir site-docker
cd site-docker
```

Crie o `Dockerfile` e o `index.html` apresentados neste tutorial. Depois:

```bash
docker build -t site-docker:1.0 .
docker run -d --name site-docker -p 8080:80 site-docker:1.0
curl http://localhost:8080
docker logs site-docker
docker stop site-docker
docker rm site-docker
```

---

## 17. Comandos essenciais

| Comando | Função |
| --- | --- |
| `docker images` | Lista as imagens locais |
| `docker pull` | Baixa uma imagem |
| `docker image inspect` | Exibe informações detalhadas |
| `docker history` | Exibe o histórico e as camadas |
| `docker build` | Constrói uma imagem |
| `docker tag` | Cria uma tag para a imagem |
| `docker push` | Publica uma imagem |
| `docker rmi` | Remove uma imagem |
| `docker image prune` | Remove imagens não utilizadas |
| `docker system df` | Exibe o uso de espaço pelo Docker |

---

## 18. Boas práticas

- Use tags explícitas e imutáveis em produção.
- Prefira imagens oficiais ou de origem confiável.
- Use imagens base pequenas quando isso não prejudicar a operação.
- Crie um `.dockerignore` para não enviar arquivos desnecessários ao build.
- Não armazene senhas, tokens ou chaves privadas na imagem.
- Execute processos com usuário não privilegiado quando possível.
- Analise vulnerabilidades antes de publicar a imagem.
- Remova camadas e dependências desnecessárias.
- Registre a origem da imagem e o commit que a produziu.

---

## 19. Próximos passos

Depois de compreender as imagens Docker, avance para o estudo de containers:

```text
Imagem → docker run → Container → logs / exec / inspect → docker rm
```

Consulte o tutorial de [Containers](docker-container.md).
