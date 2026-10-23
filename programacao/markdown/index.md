---
layout: default
title: Markdown
description: Visão geral do Markdown, com resumo da sintaxe e links para os guias da wiki.
---

# Markdown

Markdown é uma linguagem de marcação simples para formatar texto. Você escreve em texto puro, com alguns símbolos, e o resultado é convertido em HTML. É o formato usado nesta wiki, em arquivos `README.md` do GitHub e em muitas ferramentas de documentação.

## Conteúdo

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'programacao/markdown/markdown.html' | relative_url }}">
    <span class="wiki-topic-title">Guia Completo</span>
    <span class="wiki-topic-description">Sintaxe de títulos, listas, links, imagens, tabelas e citações.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/markdown/markdown-bloco-de-codigos.html' | relative_url }}">
    <span class="wiki-topic-title">Blocos de Código</span>
    <span class="wiki-topic-description">Como exibir código, comandos e diagramas com destaque de sintaxe.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/markdown/tabelas.html' | relative_url }}">
    <span class="wiki-topic-title">Tabelas</span>
    <span class="wiki-topic-description">Guia completo de tabelas em markdown.</span>
  </a>

</div>

## Por que usar Markdown

- É legível mesmo sem ser convertido.
- Funciona bem com Git, porque é texto e mostra diferenças linha a linha.
- É portátil: o mesmo arquivo pode virar página web, PDF ou documento.
- Exige pouco aprendizado: a sintaxe básica se aprende em minutos.

## Resumo da sintaxe

| Para obter          | Escreva                  |
|---------------------|--------------------------|
| Título              | `# Título`, `## Subtítulo` |
| **Negrito**         | `**texto**`              |
| *Itálico*           | `*texto*`                |
| Código em linha     | `` `código` ``           |
| Link                | `[texto](https://site)`  |
| Imagem              | `![descrição](imagem.png)` |
| Lista com marcadores | `- item`                |
| Lista numerada      | `1. item`                |
| Citação             | `> texto`                |
| Linha divisória     | `---`                    |

### Bloco de código

Use três crases, seguidas do nome da linguagem:

````markdown
```bash
echo "Olá, mundo!"
```
````

## Onde o Markdown é usado

- Documentação técnica e wikis, como esta.
- Arquivos `README.md` em repositórios.
- Descrições de Pull Requests e issues no GitHub.
- Anotações em ferramentas como Obsidian e Notion.

## Próximos passos

1. Leia o **Guia Completo** e teste cada exemplo.
2. Veja a página **Blocos de Código** para documentar comandos e scripts.
3. Conheça o [Jekyll]({{ 'programacao/jekyll/' | relative_url }}), que transforma seus arquivos Markdown em um site.