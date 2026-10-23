---
layout: default
title: Guia prático de Jekyll
description: Jekyll — Guia Completo e Didático
---

# Jekyll — Guia Completo e Didático
{:.no_toc}

> Guia prático para aprender Jekyll e aplicar o conhecimento no projeto **Pangolim**.

---
<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

{% raw %}
## 1. O que é Jekyll?

**Jekyll** é um gerador de sites estáticos escrito em Ruby. Ele transforma Markdown, HTML, CSS, JavaScript, imagens, dados e templates em arquivos HTML prontos para publicação.

```text
Arquivos do projeto
        ↓
      Jekyll
        ↓
   HTML estático
        ↓
    Navegador
```

Por exemplo:

```text
pagina.md
   ↓
Jekyll + Layout + Liquid
   ↓
pagina.html
```

O navegador não executa Ruby ou Jekyll: recebe apenas HTML, CSS, JavaScript e imagens já gerados.

## 2. Jekyll é um framework?

Não exatamente. Jekyll é principalmente um **Static Site Generator (SSG)**: ele gera as páginas antes de elas serem servidas.

```text
Aplicação tradicional:
Navegador → Servidor → Aplicação → Banco de dados → HTML

Jekyll:
Markdown → Jekyll → HTML → Servidor web → Navegador
```

Por isso, é adequado para documentação, blogs, páginas pessoais, portais técnicos, bases de conhecimento e GitHub Pages.

## 3. Jekyll e GitHub Pages

O GitHub Pages possui suporte a sites Jekyll. No projeto Pangolim, o fluxo pode ser:

```text
GitHub → Portal-Pangolim/portal-pangolim.github.io → GitHub Pages → Jekyll → Site publicado
```

O GitHub Pages constrói o site e publica o resultado.

## 4. Estrutura básica

```text
meu-site/
├── _config.yml
├── _layouts/
├── _includes/
├── _posts/
├── _data/
├── _sass/
├── assets/
├── images/
├── index.md
├── sobre.md
└── Gemfile
```

Cada diretório possui uma responsabilidade específica.

## 5. `_config.yml`

`_config.yml` é o arquivo principal de configuração do Jekyll.

```yaml
title: Pangolim
description: Base de conhecimento sobre Linux e infraestrutura
url: "https://portal-pangolim.github.io"
```

Essas informações podem ser acessadas com Liquid:

```liquid
{{ site.title }}
{{ site.description }}
```

## 6. Front Matter

O Front Matter é o bloco YAML no início de uma página. Ele define os metadados usados durante a geração.

```yaml
---
layout: default
title: Ansible
description: Guia de Ansible
---
```

Exemplo completo:

```markdown
---
layout: default
title: Ansible
description: Guia de Ansible
---

# Ansible

Conteúdo da página.
```

## 7. Campos do Front Matter

- `layout`: define o layout, por exemplo `layout: default`.
- `title`: define o título da página; pode ser usado como `{{ page.title }}`.
- `description`: descrição da página; pode ser usada como `{{ page.description }}`.
- Variáveis personalizadas: por exemplo, `categoria: DevOps` e `nivel: intermediário`.

```yaml
---
layout: default
title: Ansible
categoria: DevOps
nivel: intermediário
---
```

```liquid
{{ page.categoria }}
```

## 8. Markdown dentro do Jekyll

Jekyll trabalha bem com Markdown:

````markdown
# Ansible

## Introdução

O Ansible é uma ferramenta de automação.

## Comando básico

```bash
ansible --version
```
````

O Jekyll converte esse conteúdo para HTML, como `<h1>Ansible</h1>` e `<h2>Introdução</h2>`.

## 9. Markdown + Jekyll

Uma página típica pode ser `ansible-playbooks.md`:

````markdown
---
layout: default
title: Ansible - Playbooks
description: Guia de Playbooks do Ansible.
---

# Playbooks

## Estrutura

```yaml
- name: Teste
  hosts: all
  tasks:
    - name: Verificar hostname
      command: hostname
```
````

O Jekyll combina Front Matter, Markdown, layout e Liquid para produzir HTML.

## 10. Layouts

Layouts são modelos reutilizáveis e normalmente ficam em `_layouts/`. Um layout simples, em `_layouts/default.html`, pode ser:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <title>{{ page.title }}</title>
</head>
<body>
  <header>
    <h1>Pangolim</h1>
  </header>
  <main>
    {{ content }}
  </main>
</body>
</html>
```

`{{ content }}` representa o conteúdo da página processada.

## 11. Como `{{ content }}` funciona

Para a página:

```markdown
---
layout: default
title: Linux
---

# Linux

Estudo de Linux.
```

O Jekyll substitui `{{ content }}` pelo HTML produzido a partir do Markdown.

## 12. Fluxo de processamento

```text
linux.md
   │
   ├── Front Matter
   ├── Markdown
   ▼
 Jekyll
   ├── Layout
   ├── Liquid
   ├── Configuração
   └── Assets
   ▼
 HTML
```

## 13. Includes

Includes reutilizam pequenos trechos de HTML e ficam normalmente em `_includes/`.

```html
<!-- _includes/header.html -->
<header>
  <h1>Pangolim</h1>
</header>
```

Para inserir o componente:

```liquid
{% include header.html %}
```

## 14. Por que usar Includes?

Use includes para header, menu, footer, busca ou outros componentes repetidos. Isso reduz duplicação e facilita manutenção.

```liquid
<body>
  {% include header.html %}
  {% include navigation.html %}
  <main>{{ content }}</main>
  {% include footer.html %}
</body>
```

## 15. Liquid

Liquid é a linguagem de templates utilizada pelo Jekyll. Ela acessa dados e executa lógica durante o build.

- `{{ }}`: exibe um valor.
- `{% %}`: executa uma tag ou lógica.
- Comentários Liquid usam `{% comment %}` e `{% endcomment %}`.

```liquid
{% comment %}
Comentário que não aparece no HTML gerado.
{% endcomment %}
```

> `{# #}` não é a sintaxe de comentário do Liquid padrão.

## 16. Variáveis `site` e `page`

`site` representa informações globais; `page` representa a página atual.

```liquid
{{ site.title }}
{{ page.title }}
```

Se `_config.yml` define `title: Pangolim` e a página define `title: Ansible`, os resultados serão, respectivamente, `Pangolim` e `Ansible`.

## 17. Condicionais

```liquid
{% if page.toc %}
  <div id="toc">Índice</div>
{% endif %}
```

O bloco só é emitido se o Front Matter tiver `toc: true`.

```liquid
{% if page.categoria == "Linux" %}
  <p>Documento Linux.</p>
{% else %}
  <p>Outro documento.</p>
{% endif %}
```

## 18. Loops e `_data`

Liquid pode percorrer listas:

```liquid
{% for item in site.data.comandos %}
  <p>{{ item }}</p>
{% endfor %}
```

Arquivos em `_data/` guardam dados estruturados. Exemplo, `_data/categorias.yml`:

```yaml
- nome: Linux
  url: /linux/
- nome: DevOps
  url: /devops/
- nome: Redes
  url: /redes/
```

```liquid
{% for categoria in site.data.categorias %}
  <a href="{{ categoria.url }}">{{ categoria.nome }}</a>
{% endfor %}
```

## 19. Collections

Collections organizam grupos de documentos relacionados. Exemplo:

```text
_ansible/
├── playbooks.md
├── inventarios.md
├── modulos.md
└── variaveis.md
```

No `_config.yml`:

```yaml
collections:
  ansible:
    output: true
```

`output: true` faz o Jekyll gerar páginas para os documentos da collection. Collections são úteis quando a documentação cresce em áreas como Linux, Ansible, Docker, Kubernetes, redes e troubleshooting.

## 20. Posts, assets e links

Posts ficam em `_posts/` e seguem o padrão `YYYY-MM-DD-titulo.md`, sendo úteis para blog, notícias, changelog e conteúdo cronológico.

Arquivos estáticos podem ficar em `assets/`:

```text
assets/
├── css/style.css
└── js/script.js
```

```html
<link rel="stylesheet" href="/assets/css/style.css">
<script src="/assets/js/script.js"></script>
```

Links Markdown:

```markdown
[Linux](https://www.linux.org/)
```

Links internos podem usar `site.baseurl`:

```html
<a href="{{ site.baseurl }}/linux/">Linux</a>
```

Uma URL completa pode usar `{{ site.url }}{{ site.baseurl }}/linux/`.

## 21. Permalinks e layouts hierárquicos

Controle a URL de uma página com `permalink`:

```yaml
---
layout: default
title: Ansible
permalink: /devops/ansible/
---
```

Layouts podem herdar de outros layouts. Por exemplo, `_layouts/documentacao.html`:

```yaml
---
layout: default
---
```

Uma página com `layout: documentacao` usa primeiro `documentacao.html` e depois `default.html`.

## 22. Navegação e índice automático

O menu pode ficar em `_data/menu.yml` e ser renderizado dinamicamente:

```liquid
<nav>
{% for item in site.data.menu %}
  <a href="{{ item.url }}">{{ item.nome }}</a>
{% endfor %}
</nav>
```

Para um índice automático, marque a página com `toc: true` e inclua no layout:

```liquid
{% if page.toc %}
<nav id="toc">
  <strong>Índice</strong>
  <div id="toc-list"></div>
</nav>
{% endif %}
```

O JavaScript pode localizar elementos `<h2>` e `<h3>` e criar os links do índice.

## 23. Plugins e GitHub Pages

Plugins adicionam recursos como sitemap, feed, filtros Liquid e processamento de conteúdo. No GitHub Pages, use somente plugins compatíveis com o ambiente suportado. Não presuma que um plugin que funciona localmente funcionará no build do GitHub Pages.

## 24. Gemfile e Bundler

Um projeto Jekyll normalmente possui um `Gemfile`:

```ruby
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
```

Comandos principais:

```bash
gem install bundler
bundle install
bundle exec jekyll serve
```

Prefira `bundle exec jekyll serve`, pois ele usa as versões das gems definidas pelo projeto.

## 25. Desenvolvimento local

Para testar localmente:

```bash
cd ~/Projetos/portal-pangolim.github.io
bundle install
bundle exec jekyll serve
```

Acesse normalmente `http://localhost:4000`. Para recarregamento automático:

```bash
bundle exec jekyll serve --livereload
```

Fluxo recomendado:

```text
Editar → Salvar → Jekyll processa → Testar no navegador → Corrigir → Commit → Push
```

## 26. Estrutura recomendada

```text
portal-pangolim.github.io/
├── _config.yml
├── _layouts/default.html
├── _includes/
├── _data/
├── assets/
│   ├── css/
│   └── js/
├── images/
├── linux/
├── devops/
├── redes/
├── squid/
├── monitoramento/
├── nutanix/
├── vmware/
├── watchguard/
├── windows/
├── troubleshooting/
├── index.md
├── Gemfile
└── Gemfile.lock
```

Essa estrutura separa código, documentação, dados e assets.

## 27. Exemplo de página completa

Arquivo: `devops/ansible/playbooks.md`.

````markdown
---
layout: default
title: Ansible - Playbooks
description: Guia prático de Playbooks do Ansible.
toc: true
---

# Playbooks

## Introdução

Playbooks são arquivos YAML utilizados para descrever automações do Ansible.

## Estrutura

```yaml
- name: Verificar servidores
  hosts: all
  tasks:
    - name: Verificar hostname
      command: hostname
```

## Validação

```bash
ansible-playbook --syntax-check playbook.yml
```

## Troubleshooting

```bash
ansible-playbook playbook.yml -vvv
```
````

## 28. `_site` e `.gitignore`

Durante o build, o Jekyll gera `_site/`, que contém o site final. Não edite esse diretório diretamente; edite os arquivos-fonte (`.md`, `.html`, `.css`, `.js` e `.yml`) e gere o site novamente.

Exemplo de `.gitignore`:

```gitignore
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
.bundle/
```

## 29. Erros comuns

### Front Matter inválido
{:.no_toc}
```yaml
# Errado
--
layout: default
--

# Correto
---
layout: default
---
```

### YAML inválido ou com indentação errada
{:.no_toc}
```yaml
# Errado
title Pangolim

# Correto
title: Pangolim
```

```yaml
# Errado
collections:
ansible:
  output: true

# Correto
collections:
  ansible:
    output: true
```

Use espaços — preferencialmente dois por nível — e nunca TAB em YAML.

### Layout inexistente
{:.no_toc}
Se a página usa `layout: documentacao`, deve existir `_layouts/documentacao.html`.

### Erro de Liquid
{:.no_toc}
```liquid
# Errado
{{ page.title

# Correto
{{ page.title }}
```

Toda tag condicional deve ser fechada:

```liquid
{% if page.toc %}
  ...
{% endif %}
```

## 30. Como investigar erros

Execute o servidor e leia a mensagem exibida:

```bash
bundle exec jekyll serve
```

Para detalhes adicionais:

```bash
bundle exec jekyll build --trace
```

Valide primeiro a construção:

```bash
bundle exec jekyll build
```

Se terminar sem erro, execute `bundle exec jekyll serve` e teste no navegador.

## 31. Git + Jekyll

O Git versiona os arquivos-fonte; o Jekyll gera o resultado.

```text
Git → Código-fonte → Jekyll → Site HTML → GitHub Pages
```

Rotina prática:

```bash
git pull
# editar arquivo.md
bundle exec jekyll build
bundle exec jekyll serve
git status
git diff
git add .
git commit -m "Adiciona documentação sobre X"
git push
```

## 32. Ordem de estudo

1. Markdown
2. Estrutura do projeto
3. Front Matter
4. Layouts
5. `{{ content }}`
6. Liquid
7. Includes
8. CSS
9. JavaScript
10. Collections
11. `_data`
12. Plugins
13. GitHub Pages

## 33. Exercícios práticos

### Exercício 1 — Criar uma página
{:.no_toc}
Crie `teste.md`:

```markdown
---
layout: default
title: Página de teste
---

# Página de teste

Esta é minha primeira página Jekyll.

## Linux

Estudando Linux.
```

Execute `bundle exec jekyll serve` e abra a página.

### Exercício 2 — Criar uma variável
{:.no_toc}
```yaml
---
layout: default
title: Página de teste
autor: João
---
```

No conteúdo:

```liquid
Autor: {{ page.autor }}
```

### Exercício 3 — Criar uma condição
{:.no_toc}
```yaml
---
layout: default
title: Página de teste
mostrar_aviso: true
---
```

```liquid
{% if page.mostrar_aviso %}
> Esta página possui um aviso.
{% endif %}
```

Altere para `mostrar_aviso: false` e observe o resultado.

### Exercício 4 — Criar um include
{:.no_toc}
Crie `_includes/aviso.html`:

```html
<div class="aviso">
  Conteúdo incluído pelo Jekyll.
</div>
```

Na página:

```liquid
{% include aviso.html %}
```

### Exercício 5 — Criar dados
{:.no_toc}
Crie `_data/servidores.yml`:

```yaml
- nome: Proxy 01
  ip: 10.8.17.71
- nome: Proxy 02
  ip: 10.8.17.72
- nome: Proxy 03
  ip: 10.8.17.73
```

No Markdown:

```liquid
{% for servidor in site.data.servidores %}
- {{ servidor.nome }} — {{ servidor.ip }}
{% endfor %}
```

## 34. Arquitetura mental

```text
_CONFIG      → Configuração
_MARKDOWN    → Conteúdo
_LAYOUTS     → Estrutura
_INCLUDES    → Componentes
_DATA        → Dados
LIQUID       → Lógica
Jekyll       → HTML
```

A regra prática é simples: Markdown contém o conhecimento; Front Matter descreve a página; layout define a estrutura; include reutiliza componentes; Liquid adiciona lógica; CSS define aparência; JavaScript adiciona comportamento; Jekyll transforma tudo em um site estático; GitHub Pages publica o resultado.

## 35. Próxima etapa recomendada

1. Entenda `_config.yml`
2. Entenda completamente `default.html`
3. Entenda `{{ content }}`
4. Pratique Front Matter
5. Crie um layout secundário
6. Crie um include
7. Crie `_data/menu.yml`
8. Crie uma navegação dinâmica
9. Implemente índice automático
10. Organize a documentação com collections

Assim, você aprende Jekyll modificando o próprio projeto Pangolim.
{% endraw %}
