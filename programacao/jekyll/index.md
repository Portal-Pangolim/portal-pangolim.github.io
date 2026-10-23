---
layout: default
title: Jekyll
description: Visão geral do Jekyll, estrutura de um projeto e comandos básicos para publicar no GitHub Pages.
---

# Jekyll

Jekyll é um gerador de sites estáticos. Ele lê arquivos Markdown e HTML, aplica um layout e gera um site pronto, feito só de HTML, CSS e JavaScript. O GitHub Pages usa Jekyll por padrão, por isso é a base desta wiki.

## Conteúdo

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'programacao/jekyll/jekyll.html' | relative_url }}">
    <span class="wiki-topic-title">Guia Completo</span>
    <span class="wiki-topic-description">Instalação, configuração, layouts, includes e publicação no GitHub Pages.</span>
  </a>

</div>

## Como funciona

```text
Arquivos .md / .html  +  Layout  +  Configuração
                    ↓
                  Jekyll
                    ↓
        Pasta _site com o site pronto
                    ↓
            Publicação (GitHub Pages)
```

Cada página escrita em Markdown recebe o layout definido no cabeçalho e é convertida em uma página HTML completa, com menu, rodapé e estilos.

## Estrutura de um projeto

| Item             | Função                                                      |
|------------------|-------------------------------------------------------------|
| `_config.yml`    | Configuração do site (título, descrição, plugins).          |
| `_layouts/`      | Modelos de página, como `default.html`.                     |
| `_includes/`     | Trechos reutilizáveis, como logo e rodapé.                  |
| `assets/`        | CSS, JavaScript e imagens.                                  |
| `index.md`       | Página inicial.                                             |
| `pasta/index.md` | Página inicial de uma seção, acessada em `/pasta/`.         |
| `_site/`         | Resultado gerado. Não deve ser editado nem versionado.      |

## Cabeçalho das páginas (front matter)

Todo arquivo começa com um bloco entre `---` que define o layout e os metadados:

```yaml
---
layout: default
title: Título da página
description: Resumo usado em buscas e redes sociais.
---
```

## Liquid

O Jekyll usa a linguagem de templates **Liquid**. Variáveis ficam entre chaves duplas e comandos entre chaves com porcentagem.

{% raw %}
```liquid
<a href="{{ 'linux/' | relative_url }}">Linux</a>

{% if page.title %}
  {{ page.title }}
{% endif %}
```
{% endraw %}

> Para mostrar código Liquid dentro de uma página, como acima, envolva o trecho com `raw` e `endraw`. Sem isso, o Jekyll tenta executá-lo.

## Comandos básicos

```bash
# Instalar as dependências do projeto
bundle install

# Rodar o site localmente com recarga automática
bundle exec jekyll serve

# Gerar o site na pasta _site
bundle exec jekyll build
```

O site local fica disponível em `http://localhost:4000`.

## Publicando no GitHub Pages

1. Envie o projeto para um repositório no GitHub.
2. Em **Settings → Pages**, escolha a branch de publicação.
3. Aguarde o build. Cada `git push` republica o site automaticamente.

## Problemas comuns

- **Página não aparece:** confira se o arquivo tem o front matter (`---`) no início.
- **Link quebrado:** use `relative_url` nos links internos.
- **Conteúdo com chaves duplas some:** envolva o trecho com `raw` e `endraw`.
- **Alteração não aparece no site:** aguarde o build do GitHub Pages e limpe o cache do navegador (Ctrl+F5).

## Próximos passos

1. Leia o **Guia Completo**.
2. Aprenda a escrever páginas em [Markdown]({{ 'programacao/markdown/' | relative_url }}).