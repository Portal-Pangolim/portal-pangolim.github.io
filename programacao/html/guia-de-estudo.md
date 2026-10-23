---
layout: default
title: HTML — Guia de Estudo
description: Guia de estudo de HTML, da estrutura básica a formulários, semântica e acessibilidade, com exemplos e exercícios.
---

# HTML — Guia de Estudo
{:.no_toc}

HTML (*HyperText Markup Language*) é a linguagem que define a **estrutura e o conteúdo** de uma página web: títulos, parágrafos, links, imagens, tabelas e formulários. Ele diz **o que** cada elemento é. A aparência fica a cargo do CSS e o comportamento, do JavaScript.

## Sumário
{:.no_toc}
* TOC
{:toc}

---

## 1. Estrutura básica de uma página

Crie um arquivo `index.html`:

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Minha primeira página</title>
</head>
<body>
  <h1>Olá, mundo!</h1>
  <p>Esta é a minha primeira página em HTML.</p>
</body>
</html>
```

| Parte | Função |
|-------|--------|
| `<!doctype html>` | Informa ao navegador que o documento é HTML5. |
| `<html lang="pt-BR">` | Elemento raiz. O `lang` ajuda buscadores e leitores de tela. |
| `<head>` | Informações da página que não aparecem no conteúdo: título, codificação, estilos. |
| `<body>` | Tudo o que o visitante vê. |
| `<meta charset="utf-8">` | Garante que acentos e símbolos apareçam corretamente. |
| `<meta name="viewport" ...>` | Faz a página se ajustar bem em celulares. |

Para abrir, dê um duplo clique no arquivo ou use a extensão **Live Server** do VS Code, que atualiza a página ao salvar.

---

## 2. Elementos, tags e atributos

Um elemento normalmente tem tag de abertura, conteúdo e tag de fechamento. Os atributos ficam na tag de abertura.

```html
<a href="https://exemplo.com" target="_blank">Visite o site</a>
```

- **Tag de abertura:** `<a ...>`
- **Atributos:** `href` e `target`
- **Conteúdo:** `Visite o site`
- **Tag de fechamento:** `</a>`

Alguns elementos não têm conteúdo e não precisam de fechamento, como `<img>`, `<br>`, `<hr>` e `<input>`.

Elementos podem ser **aninhados**, desde que sejam fechados na ordem inversa da abertura:

```html
<p>Texto com <strong>destaque e <em>ênfase</em></strong>.</p>
```

### Comentários
{:.no_toc}

```html
<!-- Este texto não aparece na página -->
```

---

## 3. Textos

```html
<h1>Título principal</h1>
<h2>Subtítulo</h2>
<h3>Seção</h3>

<p>Um parágrafo de texto.</p>

<p>
  <strong>Negrito (importante)</strong>,
  <em>itálico (ênfase)</em>,
  <mark>destacado</mark>,
  <small>texto pequeno</small>,
  <code>código em linha</code>.
</p>

<blockquote>Uma citação longa.</blockquote>

<pre>
Texto    pré-formatado
   preserva espaços e quebras.
</pre>

<br>  <!-- quebra de linha -->
<hr>  <!-- linha divisória -->
```

- Vão de `<h1>` até `<h6>`. Use **um único** `<h1>` por página e não pule níveis.
- Prefira `<strong>` e `<em>` a `<b>` e `<i>`, pois carregam significado, não só aparência.
- HTML ignora espaços e quebras de linha repetidos. Use `<br>` ou parágrafos para separar.

---

## 4. Links e imagens

### Links
{:.no_toc}

```html
<a href="https://exemplo.com">Site externo</a>
<a href="contato.html">Outra página do mesmo site</a>
<a href="#secao-2">Ir para um trecho da página</a>
<a href="mailto:ana@exemplo.com">Enviar e-mail</a>
<a href="https://exemplo.com" target="_blank" rel="noopener">Abrir em nova aba</a>
```

Para o destino de `#secao-2`, o elemento precisa de um `id`:

```html
<h2 id="secao-2">Seção 2</h2>
```

> Ao usar `target="_blank"`, acrescente `rel="noopener"` por segurança.

### Imagens
{:.no_toc}

```html
<img src="imagens/foto.jpg" alt="Descrição da foto" width="400" height="300">
```

- **`alt`** é obrigatório: descreve a imagem para leitores de tela e aparece se ela não carregar.
- **`width` e `height`** reservam espaço e evitam que a página "pule" ao carregar.
- Para imagens que aparecem só depois de rolar a página, use `loading="lazy"`.

```html
<figure>
  <img src="grafico.png" alt="Gráfico de vendas de 2025">
  <figcaption>Vendas por trimestre.</figcaption>
</figure>
```

### Caminhos de arquivos
{:.no_toc}

| Caminho | Significado |
|---------|-------------|
| `foto.jpg` | Mesma pasta da página. |
| `imagens/foto.jpg` | Dentro da subpasta `imagens`. |
| `../foto.jpg` | Uma pasta acima. |
| `/imagens/foto.jpg` | A partir da raiz do site. |

---

## 5. Listas

```html
<!-- Lista com marcadores -->
<ul>
  <li>Maçã</li>
  <li>Uva</li>
</ul>

<!-- Lista numerada -->
<ol>
  <li>Passo um</li>
  <li>Passo dois</li>
</ol>

<!-- Lista de definições -->
<dl>
  <dt>HTML</dt>
  <dd>Linguagem de marcação para páginas web.</dd>
</dl>
```

Listas podem ser aninhadas, colocando um novo `<ul>` ou `<ol>` dentro de um `<li>`.

---

## 6. Tabelas

```html
<table>
  <caption>Notas do semestre</caption>
  <thead>
    <tr>
      <th>Aluno</th>
      <th>Nota</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ana</td>
      <td>9,0</td>
    </tr>
    <tr>
      <td>Bruno</td>
      <td>7,5</td>
    </tr>
  </tbody>
</table>
```

- `<tr>` é uma linha, `<th>` é cabeçalho e `<td>` é célula.
- `colspan` e `rowspan` mesclam colunas e linhas.
- Use tabelas para **dados**, nunca para montar o layout da página.

---

## 7. Formulários

```html
<form action="/enviar" method="post">

  <label for="nome">Nome</label>
  <input type="text" id="nome" name="nome" required>

  <label for="email">E-mail</label>
  <input type="email" id="email" name="email" placeholder="voce@exemplo.com" required>

  <label for="senha">Senha</label>
  <input type="password" id="senha" name="senha" minlength="8">

  <label for="idade">Idade</label>
  <input type="number" id="idade" name="idade" min="0" max="120">

  <label for="pais">País</label>
  <select id="pais" name="pais">
    <option value="br">Brasil</option>
    <option value="pt">Portugal</option>
  </select>

  <label for="msg">Mensagem</label>
  <textarea id="msg" name="msg" rows="4"></textarea>

  <fieldset>
    <legend>Você aceita receber novidades?</legend>
    <label><input type="radio" name="novidades" value="sim"> Sim</label>
    <label><input type="radio" name="novidades" value="nao"> Não</label>
  </fieldset>

  <label><input type="checkbox" name="termos" required> Li e aceito os termos</label>

  <button type="submit">Enviar</button>

</form>
```

Pontos importantes:
- Todo campo precisa de um `<label>` ligado pelo `for` ao `id` do campo. Isso melhora a acessibilidade e aumenta a área de clique.
- O atributo `name` define o nome do dado enviado.
- Os tipos de `<input>` incluem `text`, `email`, `password`, `number`, `date`, `tel`, `url`, `checkbox`, `radio`, `file` e `range`.
- Atributos de validação: `required`, `min`, `max`, `minlength`, `maxlength` e `pattern`.
- `method="get"` coloca os dados na URL. `method="post"` os envia no corpo da requisição.

---

## 8. HTML semântico

Elementos semânticos descrevem o **papel** de cada parte da página. Buscadores e leitores de tela dependem deles.

```html
<body>

  <header>
    <h1>Meu Site</h1>
    <nav>
      <a href="/">Início</a>
      <a href="/sobre.html">Sobre</a>
    </nav>
  </header>

  <main>
    <article>
      <h2>Título do artigo</h2>
      <p>Conteúdo principal.</p>
    </article>

    <aside>
      <h2>Links relacionados</h2>
    </aside>
  </main>

  <footer>
    <p>&copy; 2026 Meu Site</p>
  </footer>

</body>
```

| Elemento | Uso |
|----------|-----|
| `<header>` | Cabeçalho da página ou de uma seção. |
| `<nav>` | Bloco de navegação. |
| `<main>` | Conteúdo principal (um por página). |
| `<section>` | Seção com tema próprio, normalmente com título. |
| `<article>` | Conteúdo independente, como um post. |
| `<aside>` | Conteúdo complementar. |
| `<footer>` | Rodapé. |

### `<div>` e `<span>`
{:.no_toc}

Quando nenhum elemento semântico serve, use `<div>` (bloco) e `<span>` (em linha) como agrupadores sem significado.

---

## 9. Atributos globais

Valem para quase todos os elementos:

| Atributo | Função |
|----------|--------|
| `id` | Identificador **único** na página. |
| `class` | Um ou mais nomes usados pelo CSS e JavaScript. |
| `title` | Dica exibida ao passar o mouse. |
| `lang` | Idioma do trecho. |
| `hidden` | Oculta o elemento. |
| `data-*` | Dados personalizados, como `data-id="42"`. |
| `aria-*` | Informações extras de acessibilidade. |

---

## 10. Mídia e conteúdo incorporado

```html
<video src="video.mp4" controls width="480"></video>

<audio src="musica.mp3" controls></audio>

<iframe src="https://exemplo.com/mapa" title="Mapa da loja" width="400" height="300"></iframe>
```

O `<iframe>` deve sempre ter um `title`.

---

## 11. Acessibilidade

- Use **elementos semânticos** e a hierarquia correta de títulos.
- Escreva um `alt` útil em toda imagem. Se ela for só decorativa, use `alt=""`.
- Ligue cada `<label>` ao seu campo.
- Garanta que tudo funcione **só com o teclado** (Tab, Enter, Espaço).
- Não use apenas a cor para transmitir informação.
- Prefira `<button>` para ações e `<a>` para navegação. Não use `<div>` como botão.
- Teste com um leitor de tela, como o NVDA (Windows) ou o VoiceOver (macOS).

---

## 12. Boas práticas

- Feche todas as tags e mantenha a indentação consistente.
- Use nomes de `id` e `class` claros, em minúsculas.
- Separe a estrutura (HTML) da aparência (CSS) e do comportamento (JavaScript).
- Valide o código em [validator.w3.org](https://validator.w3.org/){:target="_blank" rel="noopener"}.
- Use caracteres especiais com entidades quando necessário: `&lt;` (<), `&gt;` (>), `&amp;` (&) e `&copy;` (©).
- Otimize as imagens e defina `width` e `height`.

---

## 13. Plano de estudos

| Etapa | Tema | Prática sugerida |
|-------|------|------------------|
| 1 | Estrutura, textos e listas | Currículo em uma página. |
| 2 | Links, imagens e caminhos | Site de duas ou três páginas ligadas entre si. |
| 3 | Tabelas | Tabela de horários ou de preços. |
| 4 | Formulários | Formulário de contato com validação. |
| 5 | Semântica e acessibilidade | Refazer a página usando `header`, `main` e `footer`. |
| 6 | Projeto final | Site pessoal completo, pronto para receber CSS. |

### Exercícios rápidos
{:.no_toc}

1. Monte uma página com um título, três parágrafos, uma lista e uma imagem com `alt`.
2. Crie um menu de navegação com `<nav>` e links para três páginas.
3. Faça um formulário de cadastro com nome, e-mail, data de nascimento, país e aceite dos termos.
4. Converta uma página feita só com `<div>` para usar elementos semânticos.

---

## 14. Referências

- [MDN — HTML](https://developer.mozilla.org/pt-BR/docs/Web/HTML){:target="_blank" rel="noopener"}: referência completa, em português.
- [web.dev — Learn HTML](https://web.dev/learn/html){:target="_blank" rel="noopener"}: curso gratuito.
- [W3C Validator](https://validator.w3.org/){:target="_blank" rel="noopener"}: verificação do código.