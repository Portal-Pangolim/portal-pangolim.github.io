---
layout: default
title: Markdown — Blocos de Código
description: Guia completo sobre como usar blocos de código em Markdown, incluindo sintaxe inline, cercada, indentada e realce de sintaxe no Jekyll.
---

# Markdown — Blocos de Código
{:.no_toc}

[← Voltar para Documentação](index.html)

Guia de estudo completo sobre como representar código em Markdown: desde uma palavra destacada no meio de um parágrafo até blocos inteiros com realce de sintaxe (*syntax highlighting*), como usados no Pangolim.

---
<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

## 1. Código inline

Para destacar um trecho curto de código dentro de uma frase, envolva o texto com **crases simples** (`` ` ``).

```markdown
Use o comando `sudo apt update` para atualizar os pacotes.
```

**Resultado:**

Use o comando `sudo apt update` para atualizar os pacotes.

### Quando usar

* Nomes de comandos, variáveis, funções ou arquivos citados no meio do texto.
* Valores curtos (`true`, `null`, `200`).

### Crase dentro do próprio código

Se o texto que você quer destacar contém uma crase, use **crases duplas** como delimitador:

```markdown
Para escapar um caractere, use `` ` `` dentro do texto.
```

---

## 2. Blocos de código indentados (estilo antigo)

O Markdown original (Gruber, 2004) define blocos de código a partir de **4 espaços** ou **1 tab** de indentação:

```markdown
    echo "Este é um bloco indentado"
    ls -la
```

**Resultado:**

    echo "Este é um bloco indentado"
    ls -la

### Limitações

* Não permite indicar a linguagem (sem realce de sintaxe).
* Fácil de quebrar sem querer (basta indentar um parágrafo por engano).
* Praticamente substituído pelos **blocos cercados** (próxima seção) na prática atual.

> **Recomendação:** evite esse estilo em documentações novas. Use-o só se precisar manter compatibilidade com processadores Markdown muito antigos.

---

## 3. Blocos de código cercados (fenced code blocks)

É o formato recomendado hoje, suportado pelo **GitHub Flavored Markdown (GFM)** e pelo **kramdown** (motor padrão do Jekyll no GitHub Pages).

### Sintaxe com crases

<pre>
```
echo "Bloco cercado simples"
```
</pre>

### Sintaxe com til (alternativa)

<pre>
~~~
echo "Também funciona com til"
~~~
</pre>

Use o til quando o próprio conteúdo do bloco contiver três crases (por exemplo, ao documentar Markdown dentro de Markdown — como este próprio arquivo faz).

### Indicando a linguagem

Escreva o nome da linguagem logo após as crases de abertura:

<pre>
```bash
sudo systemctl restart nginx
```
</pre>

Isso ativa o **realce de sintaxe** (syntax highlighting), colorindo palavras-chave, strings, comentários etc. de acordo com a linguagem.

**Linguagens comuns usadas em documentação de infraestrutura:**

| Identificador | Uso típico |
|---|---|
| `bash` / `sh` | Comandos de terminal, scripts shell |
| `yaml` | Arquivos de configuração (`.yml`) |
| `json` | Dados estruturados, APIs |
| `text` | Saída de comando, árvores de diretório, texto sem realce |
| `ini` / `toml` | Arquivos de configuração simples |
| `dockerfile` | Dockerfiles |
| `nginx` | Configuração do Nginx |
| `diff` | Comparação entre versões de arquivo |

---

## 4. Blocos aninhados (código dentro de código)

Quando você precisa mostrar um bloco de código **dentro de outro bloco** de exemplo (como nas seções acima deste documento), use um número maior de crases na cerca externa:

<pre>
````markdown
```bash
echo "bloco interno"
```
````
</pre>

A regra é: **a cerca externa precisa ter mais crases que qualquer cerca usada dentro dela.**

---

## 5. Realce de sintaxe no Jekyll (Rouge)

O Jekyll usa o **Rouge** como highlighter padrão (compatível com GitHub Pages, que não permite plugins arbitrários). Existem duas formas de gerar blocos com realce:

### 5.1 Blocos cercados padrão (recomendado)

Funciona automaticamente, sem tags especiais — é o que foi mostrado na seção 3:

<pre>
```yaml
title: Pangolim
layout: default
```
</pre>

### 5.2 Tag `highlight` do Jekyll
{% raw %}
O Jekyll também oferece uma tag própria do Liquid chamada `highlight`, útil quando você precisa de recursos extras como numeração de linhas.

> **Atenção — armadilha comum:** o Liquid processa tags `{% ... %}` **antes** do Kramdown renderizar o Markdown. Ou seja, escrever a tag `highlight` dentro de um bloco de código cercado **não a transforma em texto** — o Jekyll tenta executá-la de verdade, e se faltar a linguagem ela quebra o build com `Syntax Error in tag 'highlight'`. Para exibir a sintaxe apenas como exemplo (sem executá-la), é preciso "escapar" as chaves usando a saída de string do próprio Liquid, como no bloco abaixo.
{% endraw %}
{% raw %}
```liquid
{% highlight yaml linenos %}
title: Pangolim
layout: default
{% endhighlight %}
```
{% endraw %}

* `linenos` adiciona numeração de linhas.
* É processada pelo mecanismo de templates (Liquid), então **só funciona dentro de arquivos processados pelo Jekyll** — não em um Markdown puro fora do site.

> **Dica:** prefira blocos cercados (crases triplas) para manter a documentação portátil (funciona em GitHub, editores, preview local etc.), e reserve a tag `highlight` para quando precisar de numeração de linhas.

---

## 6. Boas práticas para blocos de código na documentação

1. **Sempre declare a linguagem**, mesmo quando for apenas `text` — facilita a leitura e evita realce incorreto.
2. **Um bloco, um propósito.** Evite misturar comando e saída no mesmo bloco sem indicação clara; quando fizer sentido, separe em dois blocos (um `bash` para o comando, outro `text` para a saída).
3. **Use comentários dentro do bloco** para explicar partes específicas do código, em vez de interromper o bloco com texto.
4. **Cuidado com a indentação dentro de listas.** Um bloco de código dentro de um item de lista precisa estar alinhado com o texto do item, senão o processador pode não reconhecê-lo como parte da lista.
5. **Escape corretamente conteúdo Liquid.** Se o bloco de código mostra algo como uma variável de template (por exemplo, `page.title` entre chaves duplas), envolva o trecho com as tags `raw` e `endraw` do próprio Liquid — do contrário o Jekyll tenta interpretar aquele conteúdo como uma variável real, o que pode quebrar o build ou gerar saída vazia.

### Exemplo: protegendo conteúdo com a tag `raw`

{% raw %}
````liquid
```yaml
titulo: "{{ page.title }}"
```
````
{% endraw %}

Sem a proteção da tag `raw`, o Jekyll tentaria processar a variável de template antes mesmo de renderizar o bloco como código — e como este documento demonstrou na prática, isso é exatamente o que causou o erro de build original.

---

## 7. Resumo rápido

| Necessidade | Sintaxe |
|---|---|
| Palavra/comando curto no meio do texto | crases simples ao redor do texto |
| Bloco simples, sem linguagem | crases triplas |
| Bloco com realce de sintaxe | crases triplas + nome da linguagem |
| Bloco dentro de outro bloco (exemplo) | mais crases na cerca externa |
| Numeração de linhas no Jekyll | tag `highlight` com o argumento `linenos` |
| Mostrar sintaxe Liquid sem executá-la | envolver o trecho com as tags `raw` e `endraw` |

---

### Próximos passos

Continue o estudo com [Markdown — Tabelas](tabelas.html) ou volte ao [índice de Documentação](index.md).