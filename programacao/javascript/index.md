---
layout: default
description: "Trilha JavaScript com guia de estudo, projeto Node.js e indicação dos capítulos ainda planejados."
title: JavaScript
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M12 8v6a2 2 0 0 1-2 2"/>
    <path d="M16 16c.6.6 1.3 1 2 1 1 0 1.6-.5 1.6-1.3 0-.9-.7-1.2-1.6-1.6-.9-.4-1.5-.7-1.5-1.5 0-.7.6-1.1 1.4-1.1.6 0 1.1.2 1.5.6"/>
  </svg>
  JavaScript
</h1>

> A linguagem da web: dos fundamentos à programação assíncrona, do navegador ao Node.js, com um projeto prático para consolidar o que foi estudado.

---

## Sobre esta seção

JavaScript é a linguagem de programação da web. Ela roda em todos os navegadores e, com o **Node.js**, também fora deles, em servidores, ferramentas de linha de comando e automações. Por isso é uma das linguagens mais versáteis para quem está começando e para quem trabalha com desenvolvimento web.

Esta seção reúne o material de estudo em uma trilha progressiva. Você pode segui-la na ordem ou consultar cada tema de forma independente.

---

## Pré-requisitos

- Saber usar um editor de código, como o Visual Studio Code.
- Noções básicas de lógica de programação (variáveis, condições e repetições) ajudam, mas não são obrigatórias.
- Para a parte de navegador, conhecer o básico de HTML e CSS facilita.

---

## Trilha de estudo

```mermaid
flowchart LR
    A["1. Fundamentos"] --> B["2. Ambiente"]
    B --> C["3. Programação"]
    C --> D["4. Estruturas de dados"]
    D --> E["5. Assíncrono"]
    E --> F["6. DOM e eventos"]
    E --> G["7. Módulos e npm"]
    G --> H["8. Orientação a objetos"]
    H --> I["9. Node.js"]
    F --> J["10. Testes e qualidade"]
    I --> J
    J --> K["Projeto Node.js"]
```

---

## Conteúdo

Siga a sequência abaixo para estudar JavaScript dos fundamentos até o desenvolvimento com Node.js.

<div class="wiki-topic-list">

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">1. Fundamentos</span>
    <span class="wiki-topic-description">História, ECMAScript, tipos de dados, variáveis com <code>let</code> e <code>const</code>, operadores e sintaxe básica.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">2. Ambiente</span>
    <span class="wiki-topic-description">Node.js, npm, console do navegador, DevTools e configuração do VS Code. Seu laboratório para praticar desde o início.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">3. Programação</span>
    <span class="wiki-topic-description">Condições, laços, funções, arrow functions, escopo, closures e tratamento de erros.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">4. Estruturas de Dados</span>
    <span class="wiki-topic-description">Arrays, objetos, <code>Map</code> e <code>Set</code>, desestruturação, spread e JSON.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">5. Programação Assíncrona</span>
    <span class="wiki-topic-description">Event loop, callbacks, Promises, <code>async</code>/<code>await</code> e requisições com <code>fetch</code>.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">6. DOM e Eventos</span>
    <span class="wiki-topic-description">Seleção e manipulação de elementos, eventos, formulários e armazenamento no navegador.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">7. Módulos e npm</span>
    <span class="wiki-topic-description">Módulos ES e CommonJS, <code>package.json</code>, dependências e scripts.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">8. Orientação a Objetos</span>
    <span class="wiki-topic-description">Classes, herança, prototypes, <code>this</code> e padrões de organização de código.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">9. Node.js</span>
    <span class="wiki-topic-description">Sistema de arquivos, servidores HTTP, APIs REST e variáveis de ambiente.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">10. Testes e Qualidade</span>
    <span class="wiki-topic-description">Testes automatizados, depuração, ESLint e boas práticas.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

</div>

---

## Materiais de apoio

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'programacao/javascript/guia-de-estudo.html' | relative_url }}">
    <span class="wiki-topic-title">Guia de Estudo</span>
    <span class="wiki-topic-description">Roteiro organizado, metas por etapa e dicas para estudar JavaScript de forma consistente.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/javascript/projeto-nodejs.html' | relative_url }}">
    <span class="wiki-topic-title">Projeto Node.js</span>
    <span class="wiki-topic-description">Projeto prático para aplicar a trilha: construa uma aplicação completa passo a passo.</span>
  </a>

  <div class="wiki-topic planned">
    <span class="wiki-topic-title">Exercícios</span>
    <span class="wiki-topic-description">Exercícios progressivos para praticar sintaxe, lógica, assincronismo e manipulação do DOM. Podem ser feitos em paralelo a cada etapa.</span>
  <span>Planejado — conteúdo ainda indisponível.</span></div>

</div>

---

## Como estudar

1. **Pratique desde o primeiro dia.** Abra o console do navegador ou o Node.js e teste cada exemplo.
2. **Digite o código**, em vez de apenas copiar. Isso fixa a sintaxe.
3. **Erre e leia as mensagens de erro.** Elas indicam o arquivo, a linha e a causa.
4. **Faça os exercícios** de cada etapa antes de avançar.
5. **Construa algo seu.** Um projeto pequeno ensina mais que muitos exemplos isolados.
6. **Consulte a documentação oficial**, como a MDN Web Docs, para aprofundar.

---

## Ferramentas recomendadas

| Ferramenta | Uso |
|---|---|
| **Visual Studio Code** | Editor de código |
| **Node.js (versão LTS)** | Execução de JavaScript fora do navegador e gerenciador `npm` |
| **Navegador com DevTools** | Console, depuração e inspeção de páginas |
| **Git e GitHub** | Controle de versão e publicação dos projetos |

---

## Referências

- [MDN Web Docs: JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
- [Node.js: documentação](https://nodejs.org/docs/latest/api/)
- [ECMAScript: especificação da linguagem](https://tc39.es/ecma262/)