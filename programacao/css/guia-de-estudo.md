---
layout: default
title: CSS — Guia de Estudo
description: Guia de estudo de CSS, de seletores e box model a Flexbox, Grid e design responsivo, com exemplos e exercícios.
---

# CSS — Guia de Estudo
{:.no_toc}

CSS (*Cascading Style Sheets*) controla a **aparência** de uma página: cores, fontes, espaçamentos, posição e adaptação a diferentes telas. O HTML define o que existe na página, e o CSS define como aquilo é exibido.

## Sumário
{:.no_toc}
* TOC
{:toc}

---

## 1. Como adicionar CSS

### Arquivo externo (recomendado)
{:.no_toc}
```html
<head>
  <link rel="stylesheet" href="estilo.css">
</head>
```

### Bloco `<style>` na página
{:.no_toc}
```html
<style>
  h1 { color: teal; }
</style>
```

### Atributo `style` (evite)
{:.no_toc}
```html
<p style="color: red;">Texto vermelho</p>
```

Use o arquivo externo: ele é reaproveitado por várias páginas e mantém o HTML limpo.

---

## 2. Sintaxe básica

```css
seletor {
  propriedade: valor;
  outra-propriedade: valor;
}
```

```css
p {
  color: #333;
  font-size: 16px;
}
```

- O **seletor** escolhe os elementos.
- A **propriedade** diz o que mudar.
- O **valor** diz como mudar.
- Cada declaração termina com `;`.

### Comentários
{:.no_toc}
```css
/* Este texto é ignorado */
```

---

## 3. Seletores

```css
p { }                   /* todos os <p> */
.destaque { }           /* elementos com class="destaque" */
#topo { }               /* elemento com id="topo" */
a, button { }           /* a OU button */
nav a { }               /* <a> dentro de <nav> (descendente) */
ul > li { }             /* <li> filho direto de <ul> */
h2 + p { }              /* <p> logo depois de um <h2> */
input[type="email"] { } /* pelo atributo */
* { }                   /* todos os elementos */
```

### Pseudo-classes (estados)
{:.no_toc}
```css
a:hover { color: tomato; }       /* mouse em cima */
a:focus-visible { outline: 2px solid; } /* foco pelo teclado */
button:disabled { opacity: 0.5; }
li:first-child { font-weight: bold; }
li:nth-child(2n) { background: #eee; }   /* itens pares */
input:invalid { border-color: red; }
```

### Pseudo-elementos
{:.no_toc}
```css
p::first-line { font-weight: bold; }
.aviso::before { content: "⚠ "; }
::selection { background: gold; }
```

---

## 4. Cascata, especificidade e herança

Quando várias regras atingem o mesmo elemento, vale esta ordem:

1. **Especificidade:** quanto mais específico o seletor, mais forte ele é.
   `#id` vence `.classe`, que vence `elemento`.
2. **Ordem:** com a mesma especificidade, a regra que aparece **por último** vence.
3. `!important` força a regra, mas use só em último caso.

```css
p { color: black; }
.destaque { color: blue; }   /* vence p */
#principal { color: red; }   /* vence .destaque */
```

**Herança:** algumas propriedades passam dos elementos pais para os filhos, como `color`, `font-family` e `line-height`. Outras, como `margin`, `border` e `padding`, não.

> Dica: prefira **classes** a `id` e a seletores muito longos. Fica mais simples de manter e sobrescrever.

---

## 5. Cores e unidades

### Formas de escrever cores
{:.no_toc}
```css
color: red;                    /* nome */
color: #1a73e8;                /* hexadecimal */
color: rgb(26 115 232);        /* RGB */
color: rgb(26 115 232 / 0.5);  /* com transparência */
color: hsl(217 80% 51%);       /* matiz, saturação, luminosidade */
```

### Unidades
{:.no_toc}
| Unidade | Tipo | Uso |
|---------|------|-----|
| `px` | Absoluta | Bordas, sombras e detalhes finos. |
| `rem` | Relativa à fonte raiz | Tamanhos de texto e espaçamentos. |
| `em` | Relativa à fonte do elemento | Espaçamentos proporcionais ao texto. |
| `%` | Relativa ao elemento pai | Larguras fluidas. |
| `vw` / `vh` | Relativa à janela | Seções que ocupam a tela. |
| `fr` | Fração do espaço | Colunas do Grid. |

---

## 6. Box model

Todo elemento é uma caixa formada por quatro camadas, de dentro para fora: **conteúdo → padding → border → margin**.

```css
.caixa {
  width: 300px;
  padding: 16px;              /* espaço interno */
  border: 2px solid #333;     /* borda */
  margin: 24px;               /* espaço externo */
}
```

### Atalhos
{:.no_toc}
```css
margin: 10px;                /* todos os lados */
margin: 10px 20px;           /* vertical | horizontal */
margin: 10px 20px 30px 40px; /* topo | direita | base | esquerda */
margin: 0 auto;              /* centraliza um bloco com largura definida */
```

### `box-sizing`
{:.no_toc}
Por padrão, `padding` e `border` são somados à largura, o que confunde nos cálculos. Coloque isto no começo de todo projeto:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

Com isso, `width: 300px` significa 300px no total, já incluindo padding e borda.

### Bordas, cantos e sombras
{:.no_toc}
```css
.cartao {
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

## 7. Texto e fontes

```css
body {
  font-family: "Inter", system-ui, Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #222;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.02em;
}

a {
  text-decoration: none;
}

.maiusculas {
  text-transform: uppercase;
}
```

- Sempre termine `font-family` com uma família genérica (`sans-serif`, `serif`, `monospace`).
- Um `line-height` entre 1.5 e 1.7 deixa textos longos mais legíveis.
- Para fontes externas, use o Google Fonts ou `@font-face`.

---

## 8. Display e posicionamento

### `display`
{:.no_toc}
```css
display: block;         /* ocupa a linha toda */
display: inline;        /* flui junto com o texto */
display: inline-block;  /* em linha, mas aceita largura e altura */
display: none;          /* remove o elemento da página */
display: flex;          /* layout flexível */
display: grid;          /* layout em grade */
```

### `position`
{:.no_toc}
```css
.relativo { position: relative; }   /* referência para filhos absolutos */

.absoluto {
  position: absolute;               /* posicionado dentro do pai relativo */
  top: 0;
  right: 0;
}

.fixo {
  position: fixed;                  /* fixo na janela, mesmo ao rolar */
  bottom: 16px;
  right: 16px;
}

.grudento {
  position: sticky;                 /* fixa ao chegar no topo */
  top: 0;
}
```

`z-index` controla a ordem de sobreposição e só funciona em elementos posicionados.

---

## 9. Flexbox

Organiza itens em **uma dimensão** (linha ou coluna). É ideal para menus, barras e alinhamentos.

```html
<div class="barra">
  <span>Logo</span>
  <nav>Menu</nav>
  <button>Entrar</button>
</div>
```

```css
.barra {
  display: flex;
  justify-content: space-between; /* eixo principal */
  align-items: center;            /* eixo transversal */
  gap: 16px;
}
```

| Propriedade | Função |
|-------------|--------|
| `flex-direction` | `row` (padrão) ou `column`. |
| `justify-content` | Alinha no eixo principal: `flex-start`, `center`, `space-between`, `space-around`. |
| `align-items` | Alinha no eixo transversal: `stretch`, `center`, `flex-start`. |
| `flex-wrap` | `wrap` permite quebrar os itens em várias linhas. |
| `gap` | Espaço entre os itens. |
| `flex: 1` | (no item) ocupa o espaço que sobrar. |

### Centralizar algo na tela
{:.no_toc}
```css
.tela {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

---

## 10. Grid

Organiza itens em **duas dimensões** (linhas e colunas). É ideal para layouts de página e galerias.

```css
.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 colunas iguais */
  gap: 16px;
}
```

### Colunas que se adaptam sozinhas
{:.no_toc}
```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
```

### Layout de página
{:.no_toc}
```css
.pagina {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "topo  topo"
    "menu  conteudo"
    "rodape rodape";
  min-height: 100vh;
}

.topo     { grid-area: topo; }
.menu     { grid-area: menu; }
.conteudo { grid-area: conteudo; }
.rodape   { grid-area: rodape; }
```

> Regra prática: **Flexbox** para alinhar itens em uma linha ou coluna, **Grid** para montar a estrutura da página.

---

## 11. Design responsivo

O design responsivo faz a página funcionar bem em celulares, tablets e computadores.

1. Declare o `viewport` no HTML:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```
2. Use larguras flexíveis (`%`, `fr`, `max-width`) em vez de valores fixos.
3. Adapte o layout com **media queries**:

```css
.cards {
  display: grid;
  grid-template-columns: 1fr;          /* celular: 1 coluna */
  gap: 16px;
}

@media (min-width: 700px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1000px) {
  .cards { grid-template-columns: repeat(4, 1fr); }
}
```

Começar pelo celular e ampliar com `min-width` (*mobile first*) costuma resultar em CSS mais simples.

### Imagens que se ajustam
{:.no_toc}
```css
img {
  max-width: 100%;
  height: auto;
}
```

### Tema escuro automático
{:.no_toc}
```css
@media (prefers-color-scheme: dark) {
  body { background: #121212; color: #ddd; }
}
```

---

## 12. Variáveis CSS

```css
:root {
  --cor-principal: #1a73e8;
  --cor-fundo: #ffffff;
  --espaco: 16px;
}

.botao {
  background: var(--cor-principal);
  padding: var(--espaco);
}
```

Mudar o valor em `:root` atualiza o site inteiro, o que facilita criar temas.

---

## 13. Transições e animações

### Transição
{:.no_toc}
```css
.botao {
  background: #1a73e8;
  transition: background 0.2s ease, transform 0.2s ease;
}

.botao:hover {
  background: #0b57c2;
  transform: translateY(-2px);
}
```

### Animação com `@keyframes`
{:.no_toc}
```css
@keyframes pulsar {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.alerta {
  animation: pulsar 1.5s ease-in-out infinite;
}
```

Para respeitar quem prefere menos movimento:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 14. Exemplo completo: cartão

```html
<article class="cartao">
  <h2>Título do cartão</h2>
  <p>Um texto curto de apresentação.</p>
  <a class="botao" href="#">Saiba mais</a>
</article>
```

```css
.cartao {
  max-width: 320px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cartao h2 {
  margin: 0 0 8px;
  font-size: 1.25rem;
}

.botao {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background: #1a73e8;
  color: #fff;
  text-decoration: none;
  transition: background 0.2s;
}

.botao:hover {
  background: #0b57c2;
}
```

---

## 15. Boas práticas

- Comece com um *reset* simples: `box-sizing: border-box` e `margin: 0` no `body`.
- Use **classes** com nomes claros, como `.cartao` e `.menu-principal`.
- Evite `!important` e seletores muito longos.
- Use `rem` para textos e espaçamentos, para respeitar a configuração de fonte do usuário.
- Defina cores e espaçamentos em **variáveis**.
- Mantenha um bom contraste entre texto e fundo.
- Teste em várias larguras de tela, usando o modo responsivo do DevTools (`F12`).
- Organize o arquivo por seções: variáveis, base, layout, componentes e responsivo.

---

## 16. Plano de estudos

| Etapa | Tema | Prática sugerida |
|-------|------|------------------|
| 1 | Seletores, cores e texto | Estilizar o currículo feito em HTML. |
| 2 | Box model e bordas | Criar cartões com sombra e cantos arredondados. |
| 3 | Flexbox | Barra de navegação e centralização de elementos. |
| 4 | Grid | Galeria de imagens e layout de página. |
| 5 | Responsividade | Adaptar a página para celular, tablet e desktop. |
| 6 | Variáveis e transições | Tema claro e escuro com efeitos de hover. |
| 7 | Projeto final | Landing page completa e responsiva. |

### Exercícios rápidos
{:.no_toc}
1. Centralize um cartão no meio da tela usando Flexbox.
2. Monte uma galeria de 6 imagens com Grid que mostre 1, 2 ou 3 colunas conforme a largura.
3. Crie um botão com efeito de hover e transição suave.
4. Defina cores e espaçamentos com variáveis e crie um tema escuro com `prefers-color-scheme`.

---

## 17. Referências

- [MDN — CSS](https://developer.mozilla.org/pt-BR/docs/Web/CSS){:target="_blank" rel="noopener"}: referência completa, em português.
- [web.dev — Learn CSS](https://web.dev/learn/css){:target="_blank" rel="noopener"}: curso gratuito.
- [CSS-Tricks — Guia de Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/){:target="_blank" rel="noopener"} e [Guia de Grid](https://css-tricks.com/snippets/css/complete-guide-grid/){:target="_blank" rel="noopener"}: consulta visual.
- [Flexbox Froggy](https://flexboxfroggy.com/#pt-br){:target="_blank" rel="noopener"} e [Grid Garden](https://cssgridgarden.com/#pt-br){:target="_blank" rel="noopener"}: jogos para praticar.