---
layout: default
title: JavaScript — Guia de Estudo
description: Guia de estudo de JavaScript, dos fundamentos ao assíncrono, com exemplos práticos e exercícios.
---

# JavaScript — Guia de Estudo
{:.no_toc}
JavaScript é a linguagem da web. Ela roda no navegador (para deixar páginas interativas) e também no servidor, com o **Node.js**. Este guia segue uma ordem de estudo: fundamentos, funções, estruturas de dados, DOM e código assíncrono.

## Sumário
* TOC
{:toc}

---

## 1. Como executar JavaScript

### No navegador
{:.no_toc}
Abra o DevTools (`F12`), vá na aba **Console** e digite:

```js
console.log("Olá, mundo!");
```

Ou crie um arquivo `index.html`:

```html
<!doctype html>
<html lang="pt-BR">
<body>
  <h1 id="titulo">Olá</h1>
  <script src="app.js"></script>
</body>
</html>
```

### No terminal, com Node.js
{:.no_toc}
```bash
node --version
node app.js
```

> Dica: para estudar, use o Console do navegador para testar ideias rápidas e o Node.js para scripts maiores.

---

## 2. Variáveis e tipos

Use `const` por padrão, `let` quando o valor precisar mudar e evite `var`.

```js
const nome = "Ana";      // não pode ser reatribuída
let idade = 30;          // pode ser reatribuída
idade = 31;
```

### Tipos primitivos
{:.no_toc}
| Tipo        | Exemplo              | Observação                          |
|-------------|----------------------|-------------------------------------|
| `string`    | `"texto"`            | Aspas simples, duplas ou crase      |
| `number`    | `42`, `3.14`         | Inteiros e decimais                 |
| `boolean`   | `true`, `false`      | Valores lógicos                     |
| `undefined` | `undefined`          | Variável declarada sem valor        |
| `null`      | `null`               | Ausência intencional de valor       |
| `bigint`    | `123n`               | Inteiros muito grandes              |
| `symbol`    | `Symbol("id")`       | Identificador único                 |

Tudo que não é primitivo é **objeto** (arrays, funções, datas etc.).

```js
typeof "oi";        // "string"
typeof 10;          // "number"
typeof null;        // "object" (bug histórico da linguagem)
typeof [];          // "object"
Array.isArray([]);  // true
```

### Template strings
{:.no_toc}
```js
const nome = "Ana";
console.log(`Olá, ${nome}! 2 + 2 = ${2 + 2}`);
```

---

## 3. Operadores e comparações

```js
5 + 2;    // 7
5 ** 2;   // 25 (potência)
5 % 2;    // 1  (resto)

5 == "5";   // true  (compara com conversão de tipo)
5 === "5";  // false (compara valor e tipo)
```

**Regra de ouro:** use sempre `===` e `!==`.

### Valores "falsy"
{:.no_toc}
São tratados como falso em condições: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Todo o resto é "truthy", inclusive `[]` e `{}`.

### Operadores úteis
{:.no_toc}
```js
const nome = usuario?.nome;        // encadeamento opcional: não quebra se usuario for null
const porta = config.porta ?? 80;  // usa 80 só se for null ou undefined
const ativo = entrada || "padrão"; // usa "padrão" se entrada for falsy
```

---

## 4. Controle de fluxo

```js
const nota = 7;

if (nota >= 7) {
  console.log("Aprovado");
} else if (nota >= 5) {
  console.log("Recuperação");
} else {
  console.log("Reprovado");
}
```

### Laços
{:.no_toc}
```js
for (let i = 0; i < 3; i++) {
  console.log(i);
}

const frutas = ["maçã", "uva", "pera"];

for (const fruta of frutas) {   // percorre valores
  console.log(fruta);
}

const pessoa = { nome: "Ana", idade: 30 };

for (const chave in pessoa) {   // percorre chaves de objetos
  console.log(chave, pessoa[chave]);
}

let n = 0;
while (n < 3) {
  n++;
}
```

### switch
{:.no_toc}
```js
switch (dia) {
  case "sab":
  case "dom":
    console.log("Fim de semana");
    break;
  default:
    console.log("Dia útil");
}
```

---

## 5. Funções

```js
// Declaração
function somar(a, b) {
  return a + b;
}

// Arrow function
const multiplicar = (a, b) => a * b;

// Parâmetro padrão e rest
function saudar(nome = "visitante", ...extras) {
  return `Olá, ${nome}! Extras: ${extras.length}`;
}
```

### Escopo e closures
{:.no_toc}
Uma função "lembra" das variáveis do lugar onde foi criada:

```js
function contador() {
  let total = 0;
  return () => ++total;
}

const proximo = contador();
proximo(); // 1
proximo(); // 2
```

### Funções são valores
{:.no_toc}
Podem ser guardadas em variáveis e passadas como argumento (*callbacks*):

```js
function executar(tarefa) {
  tarefa();
}

executar(() => console.log("feito"));
```

---

## 6. Arrays

```js
const numeros = [1, 2, 3, 4, 5];

numeros.push(6);       // adiciona no fim
numeros.pop();         // remove do fim
numeros.length;        // tamanho
numeros.includes(3);   // true
numeros.indexOf(4);    // 3
```

### Métodos que você vai usar todo dia
{:.no_toc}
```js
const dobro = numeros.map(n => n * 2);           // [2, 4, 6, 8, 10]
const pares = numeros.filter(n => n % 2 === 0);  // [2, 4]
const soma = numeros.reduce((acc, n) => acc + n, 0); // 15
const achado = numeros.find(n => n > 3);         // 4
const temGrande = numeros.some(n => n > 4);      // true
const todosPositivos = numeros.every(n => n > 0); // true

numeros.forEach(n => console.log(n));
```

`map`, `filter` e `reduce` **não alteram** o array original; eles retornam um novo valor.

---

## 7. Objetos

```js
const usuario = {
  nome: "Ana",
  idade: 30,
  ativo: true,
  apresentar() {
    return `Sou ${this.nome}`;
  },
};

usuario.nome;           // "Ana"
usuario["idade"];       // 30
usuario.email = "a@b.com";
delete usuario.ativo;

Object.keys(usuario);    // ["nome", "idade", "apresentar", "email"]
Object.values(usuario);
Object.entries(usuario);
```

### Desestruturação e spread
{:.no_toc}
```js
const { nome, idade } = usuario;        // extrai propriedades
const [primeiro, segundo] = [10, 20];   // extrai itens

const copia = { ...usuario, idade: 31 };  // copia e altera
const todos = [...[1, 2], ...[3, 4]];     // [1, 2, 3, 4]
```

### JSON
{:.no_toc}
```js
const texto = JSON.stringify({ a: 1, b: [2, 3] }); // objeto → texto
const objeto = JSON.parse(texto);                  // texto → objeto
```

### Classes
{:.no_toc}
```js
class Animal {
  constructor(nome) {
    this.nome = nome;
  }

  falar() {
    return `${this.nome} faz barulho`;
  }
}

class Cachorro extends Animal {
  falar() {
    return `${this.nome} late`;
  }
}

new Cachorro("Rex").falar(); // "Rex late"
```

---

## 8. Tratamento de erros

```js
try {
  const dados = JSON.parse("{ inválido");
} catch (erro) {
  console.error("Falhou:", erro.message);
} finally {
  console.log("Sempre executa");
}

function dividir(a, b) {
  if (b === 0) throw new Error("Divisão por zero");
  return a / b;
}
```

---

## 9. DOM e eventos

O **DOM** é a representação da página em forma de objetos que o JavaScript pode ler e alterar.

```html
<button id="botao">Clique</button>
<p id="saida"></p>
<ul id="lista"></ul>
```

```js
const botao = document.querySelector("#botao");
const saida = document.querySelector("#saida");
const lista = document.querySelector("#lista");

botao.addEventListener("click", () => {
  saida.textContent = "Você clicou!";
  saida.classList.toggle("destaque");

  const item = document.createElement("li");
  item.textContent = "Novo item";
  lista.appendChild(item);
});
```

### Seleção de elementos
{:.no_toc}
```js
document.querySelector(".classe");      // primeiro elemento que combina
document.querySelectorAll("a[href]");   // todos que combinam
document.getElementById("id");
```

### Eventos comuns
{:.no_toc}
`click`, `input`, `change`, `submit`, `keydown`, `mouseover`, `DOMContentLoaded`.

```js
document.querySelector("form").addEventListener("submit", evento => {
  evento.preventDefault(); // impede o envio padrão
});
```

> Use `textContent` para inserir texto. Evite `innerHTML` com dados de usuários, porque abre brecha para ataques XSS.

---

## 10. Código assíncrono

JavaScript executa uma coisa por vez, mas operações demoradas (rede, timers) não travam a página porque são tratadas de forma assíncrona.

### setTimeout
{:.no_toc}
```js
setTimeout(() => console.log("depois de 1 segundo"), 1000);
console.log("isso aparece primeiro");
```

### Promises
{:.no_toc}
```js
const espera = ms => new Promise(resolve => setTimeout(resolve, ms));

espera(500)
  .then(() => console.log("pronto"))
  .catch(erro => console.error(erro));
```

### async / await
{:.no_toc}
```js
async function carregarUsuario(id) {
  try {
    const resposta = await fetch(`https://api.exemplo.com/usuarios/${id}`);

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    return await resposta.json();
  } catch (erro) {
    console.error("Erro ao carregar:", erro.message);
  }
}
```

### Várias requisições em paralelo
{:.no_toc}
```js
const [a, b] = await Promise.all([
  fetch("/a.json").then(r => r.json()),
  fetch("/b.json").then(r => r.json()),
]);
```

---

## 11. Módulos

```js
// util.js
export const PI = 3.14;
export function dobrar(n) {
  return n * 2;
}
export default function saudar() {
  return "oi";
}
```

```js
// app.js
import saudar, { PI, dobrar } from "./util.js";
```

No HTML, use `<script type="module" src="app.js"></script>`.

---

## 12. Boas práticas

- Prefira `const`; use `let` só quando precisar reatribuir.
- Use `===` em vez de `==`.
- Dê nomes claros a variáveis e funções.
- Mantenha funções pequenas, com uma responsabilidade.
- Sempre trate erros em operações de rede.
- Use o **modo estrito** (`"use strict";`) ou módulos, que já o ativam.
- Formate e analise o código com **Prettier** e **ESLint**.

---

## 13. Plano de estudos

| Etapa | Tema                                   | Prática sugerida                       |
|-------|----------------------------------------|----------------------------------------|
| 1     | Variáveis, tipos, operadores           | Calculadora de IMC no console          |
| 2     | Condições e laços                      | FizzBuzz e tabuada                     |
| 3     | Funções e escopo                       | Funções de conversão de temperatura    |
| 4     | Arrays e objetos                       | Lista de tarefas em memória            |
| 5     | DOM e eventos                          | To-do list na página                   |
| 6     | Assíncrono e `fetch`                   | Consumir uma API pública e listar dados|
| 7     | Módulos e projeto final                | Mini app organizado em vários arquivos |

### Exercícios rápidos
{:.no_toc}
1. Escreva uma função que receba um array de números e retorne só os pares, dobrados.
2. Crie uma função que conte quantas vezes cada palavra aparece em um texto.
3. Faça um botão que alterne entre tema claro e escuro, guardando a escolha no `localStorage`.
4. Consuma uma API pública com `fetch` e mostre os resultados em uma lista na página.

---

## 14. Referências

- [MDN Web Docs — JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript){:target="_blank" rel="noopener"}: a referência principal, em português.
- [javascript.info](https://javascript.info/){:target="_blank" rel="noopener"}: tutorial moderno e completo.
- [Node.js](https://nodejs.org/){:target="_blank" rel="noopener"}: para rodar JavaScript fora do navegador.