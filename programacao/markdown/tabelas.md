---
layout: default
title: Markdown Tabelas
description: Guia Completo de Markdown - Tabelas
---

# Tabelas em Markdown
{:.no_toc}

As tabelas em Markdown organizam informações em linhas e colunas de forma simples e legível. São muito usadas em documentação técnica, README, Wikis, Jekyll, GitHub Pages e arquivos de documentação.

> **Nota:** tabelas não fazem parte do Markdown original. Elas são uma extensão popularizada pelo **GitHub Flavored Markdown (GFM)** e também suportada pelo kramdown (Jekyll), Pandoc, MkDocs e outros. O comportamento pode variar levemente entre renderizadores.

* Sumário:
{:toc}

---

## 1. Estrutura básica

Uma tabela Markdown possui:

1. Uma **linha de cabeçalho**.
2. Uma **linha separadora**.
3. Uma ou mais **linhas de dados**.

Exemplo:

```markdown
| Nome | Idade | Cidade |
| --- | --- | --- |
| João | 35 | Brasília |
| Maria | 29 | São Paulo |
| Pedro | 41 | Salvador |
```

Resultado:

| Nome | Idade | Cidade |
| --- | --- | --- |
| João | 35 | Brasília |
| Maria | 29 | São Paulo |
| Pedro | 41 | Salvador |

> **Importante:** deixe sempre uma **linha em branco antes da tabela**. Sem ela, muitos renderizadores (inclusive o kramdown) tratam a tabela como parte do parágrafo anterior e não a exibem corretamente.

---

## 2. Cabeçalho, separador e barras verticais

### 2.1 Cabeçalho
{:.no_toc}
A primeira linha define o nome das colunas:

```markdown
| Nome | Idade | Cidade |
```

### 2.2 Linha separadora
{:.no_toc}
A segunda linha separa o cabeçalho dos dados. Cada coluna precisa de **pelo menos três hífens**:

```markdown
| --- | --- | --- |
```

O número de hífens não precisa ser igual entre as colunas:

```markdown
| Nome | Cidade |
| ----------- | ------------- |
| João | Brasília |
```

### 2.3 Barras verticais
{:.no_toc}
As barras verticais `|` separam as colunas. A primeira e a última barra são opcionais em muitos renderizadores:

```markdown
Nome | Cargo | Setor
--- | --- | ---
João | Analista | Infraestrutura
```

Porém, é recomendado usar as barras externas, pois melhora a legibilidade do código-fonte e evita incompatibilidades:

```markdown
| Nome | Cargo | Setor |
| --- | --- | --- |
| João | Analista | Infraestrutura |
```

### 2.4 Espaços não importam
{:.no_toc}
Os espaços usados para alinhar visualmente o código-fonte não alteram o resultado. As duas tabelas abaixo são equivalentes:

```markdown
| Nome | Idade |
| --- | --- |
| João | 35 |
```

```markdown
| Nome   | Idade |
|--------|------:|
| João   |    35 |
```

A segunda apenas é mais organizada no código-fonte. Editores como VS Code (com extensões de Markdown) conseguem formatar isso automaticamente.

---

## 3. Alinhamento

O alinhamento de cada coluna é definido pelos **dois-pontos** na linha separadora:

| Sintaxe | Alinhamento |
| :--- | :--- |
| `---` | Padrão (normalmente à esquerda) |
| `:---` | Esquerda |
| `---:` | Direita |
| `:---:` | Centro |

### 3.1 Esquerda
{:.no_toc}
```markdown
| Nome | Cargo |
| :--- | :--- |
| João | Analista |
| Maria | Técnica |
```

| Nome | Cargo |
| :--- | :--- |
| João | Analista |
| Maria | Técnica |

### 3.2 Direita
{:.no_toc}
Ideal para **valores numéricos**:

```markdown
| Produto | Preço |
| :--- | ---: |
| Teclado | R$ 120,00 |
| Mouse | R$ 80,00 |
| Monitor | R$ 900,00 |
```

| Produto | Preço |
| :--- | ---: |
| Teclado | R$ 120,00 |
| Mouse | R$ 80,00 |
| Monitor | R$ 900,00 |

### 3.3 Centralizado
{:.no_toc}
```markdown
| Status | Código |
| :---: | :---: |
| OK | 200 |
| Erro | 500 |
| Não encontrado | 404 |
```

| Status | Código |
| :---: | :---: |
| OK | 200 |
| Erro | 500 |
| Não encontrado | 404 |

### 3.4 Misturando alinhamentos
{:.no_toc}
Cada coluna pode ter seu próprio alinhamento:

```markdown
| Item | Quantidade | Preço | Status |
| :--- | ---: | ---: | :---: |
| Teclado | 2 | R$ 120,00 | OK |
| Mouse | 5 | R$ 80,00 | OK |
| Monitor | 1 | R$ 900,00 | Pendente |
```

| Item | Quantidade | Preço | Status |
| :--- | ---: | ---: | :---: |
| Teclado | 2 | R$ 120,00 | OK |
| Mouse | 5 | R$ 80,00 | OK |
| Monitor | 1 | R$ 900,00 | Pendente |

> **Dica:** o alinhamento do cabeçalho segue o da coluna.

---

## 4. Formatação dentro das células

Formatação Markdown *inline* funciona dentro das células. Elementos de bloco (títulos, listas, blocos de código com três crases) **não funcionam**.

### 4.1 Negrito, itálico e tachado
{:.no_toc}
```markdown
| Estilo | Exemplo |
| :--- | :--- |
| Negrito | **srv01** |
| Itálico | *Servidor principal* |
| Tachado | ~~Desativado~~ |
```

| Estilo | Exemplo |
| :--- | :--- |
| Negrito | **srv01** |
| Itálico | *Servidor principal* |
| Tachado | ~~Desativado~~ |

> O tachado (`~~texto~~`) é uma extensão do GFM e pode não funcionar em todos os renderizadores.

### 4.2 Código inline
{:.no_toc}
Para comandos, nomes de arquivos, portas e valores técnicos, use crases:

```markdown
| Serviço | Porta |
| :--- | ---: |
| SSH | `22` |
| HTTP | `80` |
| HTTPS | `443` |
```

| Serviço | Porta |
| :--- | ---: |
| SSH | `22` |
| HTTP | `80` |
| HTTPS | `443` |

### 4.3 Links
{:.no_toc}
```markdown
| Sistema | Site |
| :--- | :--- |
| GitHub | [github.com](https://github.com/) |
| Jekyll | [jekyllrb.com](https://jekyllrb.com/) |
```

| Sistema | Site |
| :--- | :--- |
| GitHub | [github.com](https://github.com/) |
| Jekyll | [jekyllrb.com](https://jekyllrb.com/) |

### 4.4 Imagens
{:.no_toc}
Imagens também podem ser usadas, mas tornam a tabela larga. Prefira imagens pequenas:

```markdown
| Logo | Nome |
| :---: | :--- |
| ![Jekyll](/assets/img/jekyll.png) | Jekyll |
```

---

## 5. Caracteres especiais e barra vertical

O caractere `|` é o separador de colunas. Se ele aparecer no conteúdo de uma célula, a tabela pode quebrar, **mesmo dentro de crases**, dependendo do renderizador.

Exemplo problemático:

```markdown
| Comando | Descrição |
| --- | --- |
| `A | B` | Operador lógico |
```

Solução 1: escapar com barra invertida (funciona no GitHub e na maioria dos renderizadores):

```markdown
| Comando | Descrição |
| --- | --- |
| `A \| B` | Operador lógico |
```

Solução 2: usar a entidade HTML `&#124;` (mais portável, mas **não** funciona dentro de crases):

```markdown
| Comando | Descrição |
| --- | --- |
| A &#124; B | Operador lógico |
```

Outros caracteres que merecem atenção:

| Caractere | Problema | Solução |
| :---: | :--- | :--- |
| `\|` | Separa colunas | `\|` ou `&#124;` |
| `<` e `>` | Podem ser lidos como HTML | `&lt;` e `&gt;` |
| `*` e `_` | Podem ativar itálico/negrito | `\*` e `\_` |
| `{` e `}` | Podem ser lidos pelo Liquid no Jekyll | Veja a seção 10 |

---

## 6. Texto longo, quebra de linha, HTML e listas

### 6.1 Texto longo
{:.no_toc}
Markdown não possui mecanismo padrão para definir a largura das colunas. O navegador ajusta automaticamente:

```markdown
| Servidor | Descrição |
| --- | --- |
| srv01 | Servidor usado para hospedar aplicações internas e serviços corporativos. |
```

Quando o texto for muito grande, considere dividir a informação em mais colunas, abreviar o texto ou usar outra estrutura (lista ou seções).

### 6.2 Quebra de linha dentro da célula
{:.no_toc}
Uma linha da tabela precisa estar em **uma única linha** do código-fonte. Para quebrar o texto dentro da célula, use `<br>`:

```markdown
| Item | Descrição |
| --- | --- |
| Serviço | Primeira linha<br>Segunda linha |
```

| Item | Descrição |
| --- | --- |
| Serviço | Primeira linha<br>Segunda linha |

### 6.3 HTML dentro de tabelas
{:.no_toc}
Dependendo do renderizador, HTML é aceito:

```markdown
| Status | Resultado |
| --- | --- |
| <strong>OK</strong> | Operação concluída |
```

Para documentação portável, prefira Markdown sempre que possível. Se o HTML for necessário, a alternativa é escrever a tabela inteira em HTML (`<table>`), o que permite mesclar células com `colspan` e `rowspan`.

### 6.4 Listas dentro de células
{:.no_toc}
Listas Markdown **não funcionam** dentro de células. Alternativas:

```markdown
| Servidor | Serviços |
| --- | --- |
| srv01 | SSH, HTTP, DNS |
| srv02 | SSH<br>HTTPS<br>Banco de dados |
```

| Servidor | Serviços |
| --- | --- |
| srv01 | SSH, HTTP, DNS |
| srv02 | SSH<br>HTTPS<br>Banco de dados |

---

## 7. Células vazias e símbolos de status

### 7.1 Células vazias
{:.no_toc}
Uma célula pode ficar vazia:

```markdown
| Nome | Cargo | Telefone |
| :--- | :--- | :--- |
| João | Analista | |
| Maria | Técnica | 99999-9999 |
```

| Nome | Cargo | Telefone |
| :--- | :--- | :--- |
| João | Analista | |
| Maria | Técnica | 99999-9999 |

Para deixar claro que o campo está intencionalmente vazio, use um traço (`—`) ou `N/A`.

### 7.2 Símbolos de status
{:.no_toc}
Emojis tornam tabelas de status mais fáceis de ler:

```markdown
| Serviço | Status | Observação |
| :--- | :---: | :--- |
| Nginx | ✅ OK | Funcionando |
| DNS | ✅ OK | Funcionando |
| Banco | ⚠️ Atenção | Alta utilização |
| Backup | ❌ Erro | Última execução falhou |
```

| Serviço | Status | Observação |
| :--- | :---: | :--- |
| Nginx | ✅ OK | Funcionando |
| DNS | ✅ OK | Funcionando |
| Banco | ⚠️ Atenção | Alta utilização |
| Backup | ❌ Erro | Última execução falhou |

> **Acessibilidade:** não use apenas cor ou emoji para indicar status. Mantenha também o texto (`OK`, `Atenção`, `Erro`), para que leitores de tela e impressões em preto e branco continuem compreensíveis.

---

## 8. Limitações das tabelas Markdown

| Recurso | Suporte | Alternativa |
| :--- | :---: | :--- |
| Linha de cabeçalho obrigatória | Sim | Usar cabeçalho com células vazias |
| Mesclar células (colspan/rowspan) | Não | Tabela HTML |
| Várias linhas por célula | Não | `<br>` |
| Listas e blocos de código em células | Não | `<br>` ou HTML |
| Largura de colunas | Não | CSS ou HTML |
| Legenda (caption) | Não | Texto antes ou depois da tabela |
| Tabela sem cabeçalho | Não | Cabeçalho vazio (veja abaixo) |

Exemplo de tabela com cabeçalho vazio (o cabeçalho continua existindo, mas sem texto):

```markdown
| | |
| :--- | :--- |
| **Servidor** | `srv01` |
| **IP** | `10.0.10.10` |
```

---

## 9. Exemplos práticos

### 9.1 Documentação de servidores
{:.no_toc}
```markdown
| Servidor | IP | Sistema | Função |
| :--- | :--- | :--- | :--- |
| srv-web01 | `10.0.10.10` | Rocky Linux 9 | Web |
| srv-db01 | `10.0.10.20` | Rocky Linux 9 | Banco de dados |
| srv-dns01 | `10.0.10.30` | Debian 13 | DNS |
```

| Servidor | IP | Sistema | Função |
| :--- | :--- | :--- | :--- |
| srv-web01 | `10.0.10.10` | Rocky Linux 9 | Web |
| srv-db01 | `10.0.10.20` | Rocky Linux 9 | Banco de dados |
| srv-dns01 | `10.0.10.30` | Debian 13 | DNS |

### 9.2 Portas de rede
{:.no_toc}
```markdown
| Porta | Protocolo | Serviço | Descrição |
| ---: | :---: | :--- | :--- |
| 22 | TCP | SSH | Acesso remoto |
| 53 | TCP/UDP | DNS | Resolução de nomes |
| 80 | TCP | HTTP | Web |
| 443 | TCP | HTTPS | Web segura |
| 8080 | TCP | Proxy | Proxy HTTP |
```

| Porta | Protocolo | Serviço | Descrição |
| ---: | :---: | :--- | :--- |
| 22 | TCP | SSH | Acesso remoto |
| 53 | TCP/UDP | DNS | Resolução de nomes |
| 80 | TCP | HTTP | Web |
| 443 | TCP | HTTPS | Web segura |
| 8080 | TCP | Proxy | Proxy HTTP |

### 9.3 Referência de comandos
{:.no_toc}
```markdown
| Comando | Função |
| :--- | :--- |
| `ls` | Lista arquivos |
| `cd` | Muda de diretório |
| `pwd` | Mostra o diretório atual |
| `df -h` | Mostra espaço em disco |
| `free -h` | Mostra memória |
| `systemctl status nginx` | Verifica o serviço |
```

| Comando | Função |
| :--- | :--- |
| `ls` | Lista arquivos |
| `cd` | Muda de diretório |
| `pwd` | Mostra o diretório atual |
| `df -h` | Mostra espaço em disco |
| `free -h` | Mostra memória |
| `systemctl status nginx` | Verifica o serviço |

### 9.4 Troubleshooting
{:.no_toc}
```markdown
| Problema | Verificação | Solução |
| :--- | :--- | :--- |
| Serviço parado | `systemctl status nginx` | `systemctl start nginx` |
| Disco cheio | `df -h` | Liberar espaço |
| Porta fechada | `ss -lntp` | Verificar serviço/firewall |
| DNS falhando | `dig exemplo.com` | Verificar DNS |
```

| Problema | Verificação | Solução |
| :--- | :--- | :--- |
| Serviço parado | `systemctl status nginx` | `systemctl start nginx` |
| Disco cheio | `df -h` | Liberar espaço |
| Porta fechada | `ss -lntp` | Verificar serviço/firewall |
| DNS falhando | `dig exemplo.com` | Verificar DNS |

### 9.5 Inventário
{:.no_toc}
```markdown
| Hostname | IP | SO | CPU | RAM | Ambiente |
| :--- | :--- | :--- | ---: | ---: | :--- |
| srv-web01 | `10.0.10.10` | Rocky Linux 9 | 4 | 8 GB | Produção |
| srv-web02 | `10.0.10.11` | Rocky Linux 9 | 8 | 16 GB | Produção |
| srv-dev01 | `10.0.20.10` | Debian 13 | 4 | 8 GB | Desenvolvimento |
```

| Hostname | IP | SO | CPU | RAM | Ambiente |
| :--- | :--- | :--- | ---: | ---: | :--- |
| srv-web01 | `10.0.10.10` | Rocky Linux 9 | 4 | 8 GB | Produção |
| srv-web02 | `10.0.10.11` | Rocky Linux 9 | 8 | 16 GB | Produção |
| srv-dev01 | `10.0.20.10` | Debian 13 | 4 | 8 GB | Desenvolvimento |

### 9.6 Comparação de tecnologias
{:.no_toc}
```markdown
| Característica | Docker | Podman |
| :--- | :---: | :---: |
| Containers | Sim | Sim |
| Daemon obrigatório | Sim | Não |
| Rootless | Sim | Sim |
| Compatibilidade com Docker | Alta | Alta |
```

| Característica | Docker | Podman |
| :--- | :---: | :---: |
| Containers | Sim | Sim |
| Daemon obrigatório | Sim | Não |
| Rootless | Sim | Sim |
| Compatibilidade com Docker | Alta | Alta |

### 9.7 Valores numéricos
{:.no_toc}
Para números, use alinhamento à direita e mantenha o mesmo formato (casas decimais, unidade):

```markdown
| Produto | Quantidade | Valor |
| :--- | ---: | ---: |
| Teclado | 2 | R$ 120,00 |
| Mouse | 3 | R$ 80,00 |
| Monitor | 1 | R$ 900,00 |
```

| Produto | Quantidade | Valor |
| :--- | ---: | ---: |
| Teclado | 2 | R$ 120,00 |
| Mouse | 3 | R$ 80,00 |
| Monitor | 1 | R$ 900,00 |

### 9.8 Códigos HTTP
{:.no_toc}
```markdown
| Código | Categoria | Significado |
| ---: | :---: | :--- |
| 200 | 2xx | OK |
| 301 | 3xx | Redirecionamento permanente |
| 400 | 4xx | Requisição inválida |
| 401 | 4xx | Não autorizado |
| 403 | 4xx | Acesso proibido |
| 404 | 4xx | Não encontrado |
| 500 | 5xx | Erro interno |
| 502 | 5xx | Bad Gateway |
| 503 | 5xx | Serviço indisponível |
```

| Código | Categoria | Significado |
| ---: | :---: | :--- |
| 200 | 2xx | OK |
| 301 | 3xx | Redirecionamento permanente |
| 400 | 4xx | Requisição inválida |
| 401 | 4xx | Não autorizado |
| 403 | 4xx | Acesso proibido |
| 404 | 4xx | Não encontrado |
| 500 | 5xx | Erro interno |
| 502 | 5xx | Bad Gateway |
| 503 | 5xx | Serviço indisponível |

### 9.9 Documentação de APIs
{:.no_toc}
```markdown
| Método | Endpoint | Descrição |
| :---: | :--- | :--- |
| `GET` | `/users` | Lista usuários |
| `GET` | `/users/{id}` | Consulta usuário |
| `POST` | `/users` | Cria usuário |
| `PUT` | `/users/{id}` | Atualiza usuário |
| `DELETE` | `/users/{id}` | Remove usuário |
```

| Método | Endpoint | Descrição |
| :---: | :--- | :--- |
| `GET` | `/users` | Lista usuários |
| `GET` | `/users/{id}` | Consulta usuário |
| `POST` | `/users` | Cria usuário |
| `PUT` | `/users/{id}` | Atualiza usuário |
| `DELETE` | `/users/{id}` | Remove usuário |

### 9.10 Tabelas de credenciais (cuidado)
{:.no_toc}
Tabelas podem documentar informações de acesso, mas **não armazene senhas reais em arquivos Markdown**.

Evite:

```markdown
| Usuário | Senha |
| --- | --- |
| root | minhaSenha123 |
```

Prefira indicar onde a credencial está guardada:

```markdown
| Usuário | Credencial |
| :--- | :--- |
| `root` | Armazenada no cofre de credenciais |
| `backup` | `vault/servidor01/backup` |
```

Isso reduz o risco de expor credenciais em Git, GitHub, backups ou histórico de commits. Lembre-se: mesmo que você apague a senha depois, ela continua no histórico do repositório.

---

## 10. Tabelas no GitHub e no Jekyll

### 10.1 GitHub
{:.no_toc}
O GitHub tem excelente suporte a tabelas, em README, Issues, Pull Requests e Wikis:

```markdown
| Arquivo | Descrição |
| :--- | :--- |
| `README.md` | Documentação principal |
| `_config.yml` | Configuração do Jekyll |
| `index.md` | Página inicial |
```

### 10.2 Jekyll
{:.no_toc}
Tabelas Markdown funcionam em páginas Jekyll. O Jekyll converte o Markdown para HTML durante a geração do site:

```markdown
---
layout: default
title: Servidores
---

# Servidores
{:.no_toc}
| Servidor | IP | Sistema |
| :--- | :--- | :--- |
| srv01 | `10.0.10.10` | Rocky Linux 9 |
| srv02 | `10.0.10.11` | Debian 13 |
```

Pontos de atenção no Jekyll:

- **Linha em branco antes da tabela** é obrigatória (veja a seção 1).
- **Liquid:** o Jekyll processa o conteúdo com o Liquid antes do Markdown. Textos com chaves duplas ou com chave seguida de porcentagem (como em exemplos de templates Ansible, Helm ou Jinja) podem ser interpretados como código Liquid e quebrar a página. Para exibi-los literalmente, envolva o trecho com o bloco `raw` do Liquid.
- **Classes CSS no kramdown:** é possível aplicar uma classe à tabela colocando uma linha com `{: .nome-da-classe }` logo abaixo dela:

```markdown
| Servidor | IP |
| :--- | :--- |
| srv01 | `10.0.10.10` |
{: .tabela-servidores }
```

### 10.3 Tabelas largas em telas pequenas
{:.no_toc}
Tabelas com muitas colunas podem estourar a largura da página no celular. No CSS do site, uma solução simples é permitir rolagem horizontal:

```css
table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

th, td {
  padding: 0.4rem 0.8rem;
  border: 1px solid #444;
}

th {
  background: rgba(255, 255, 255, 0.08);
}

tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.04);
}
```

Ajuste as cores conforme o tema do site (claro ou escuro).

---

## 11. Boas práticas

- Mantenha as tabelas **simples, consistentes e fáceis de ler** tanto no código-fonte quanto no HTML gerado.
- Use **alinhamento à direita** para números e **centralizado** para status e códigos curtos.
- Coloque **comandos, IPs, portas e nomes de arquivos entre crases**.
- Prefira **poucas colunas** (idealmente até 5 ou 6). Muitas colunas ficam ilegíveis em telas pequenas.
- Use **nomes de cabeçalho curtos e claros**.
- Mantenha o **mesmo formato** dentro de uma coluna (por exemplo, sempre `8 GB`, nunca `8GB` e `8 gb` misturados).
- Se a tabela ficou muito grande ou complexa, considere **dividi-la** em várias tabelas por tema.
- Não use tabelas apenas para **diagramação visual** (layout de página). Use-as para dados.
- Para tabelas grandes, use um **gerador** ou um editor com suporte (por exemplo, Tables Generator ou extensões do VS Code), ou converta de CSV com ferramentas como `csvlook` (csvkit) ou Pandoc.

---

## 12. Erros comuns

### 12.1 Esquecer a linha separadora
{:.no_toc}
Errado:

```markdown
| Nome | Idade |
| João | 35 |
```

Correto:

```markdown
| Nome | Idade |
| --- | --- |
| João | 35 |
```

### 12.2 Esquecer a linha em branco antes da tabela
{:.no_toc}
Errado (a tabela pode não ser renderizada):

```markdown
Veja a tabela abaixo:
| Nome | Idade |
| --- | --- |
| João | 35 |
```

Correto:

```markdown
Veja a tabela abaixo:

| Nome | Idade |
| --- | --- |
| João | 35 |
```

### 12.3 Quantidade inconsistente de colunas
{:.no_toc}
Evite:

```markdown
| Nome | Idade | Cidade |
| --- | --- | --- |
| João | 35 |
```

O ideal é:

```markdown
| Nome | Idade | Cidade |
| --- | --- | --- |
| João | 35 | Brasília |
```

Se a linha tiver **mais** colunas que o cabeçalho, o excesso pode ser descartado. Se tiver **menos**, as colunas restantes ficam vazias.

### 12.4 Usar `|` sem escapar
{:.no_toc}
Problema:

```markdown
| Comando | Resultado |
| --- | --- |
| `A | B` | Resultado |
```

Melhor:

```markdown
| Comando | Resultado |
| --- | --- |
| `A \| B` | Resultado |
```

### 12.5 Quebrar a linha da tabela no código-fonte
{:.no_toc}
Errado (a linha foi dividida em duas):

```markdown
| Servidor | Descrição |
| --- | --- |
| srv01 | Servidor de
aplicações internas |
```

Correto (uma linha por linha da tabela, com `<br>` se precisar de quebra visual):

```markdown
| Servidor | Descrição |
| --- | --- |
| srv01 | Servidor de<br>aplicações internas |
```

### 12.6 Separador com menos de três hífens
{:.no_toc}
Alguns renderizadores aceitam, outros não. Use sempre `---` ou mais.

---

## 13. Modelos para copiar

### 13.1 Tabela simples
{:.no_toc}
```markdown
| Coluna 1 | Coluna 2 | Coluna 3 |
| :--- | :--- | :--- |
| Valor | Valor | Valor |
| Valor | Valor | Valor |
| Valor | Valor | Valor |
```

### 13.2 Documentação técnica (chave e valor)
{:.no_toc}
```markdown
| Item | Valor |
| :--- | :--- |
| **Servidor** | `srv01` |
| **IP** | `10.0.10.10` |
| **Sistema operacional** | Rocky Linux 9 |
| **Função** | Servidor Web |
| **Porta** | `443/TCP` |
| **Status** | Ativo |
```

### 13.3 Serviços
{:.no_toc}
```markdown
| Serviço | Host | Porta | Status |
| :--- | :--- | ---: | :---: |
| SSH | `srv01` | 22 | OK |
| HTTP | `srv01` | 80 | OK |
| HTTPS | `srv01` | 443 | OK |
| DNS | `srv02` | 53 | OK |
```

### 13.4 Troubleshooting
{:.no_toc}
```markdown
| Problema | Comando | Resultado esperado | Ação |
| :--- | :--- | :--- | :--- |
| Serviço parado | `systemctl status nginx` | `active (running)` | Iniciar serviço |
| Porta fechada | `ss -lntp` | Porta em `LISTEN` | Verificar serviço |
| DNS falhando | `dig exemplo.com` | Resposta DNS | Verificar DNS |
| Disco cheio | `df -h` | Uso abaixo de 90% | Liberar espaço |
```

---

## 14. Checklist

Antes de finalizar uma tabela Markdown, verifique:

- [ ] Existe uma linha em branco antes da tabela.
- [ ] Existe uma linha de cabeçalho.
- [ ] Existe uma linha separadora com pelo menos três hífens por coluna.
- [ ] As colunas estão separadas por `|`.
- [ ] Cada linha possui a quantidade esperada de colunas.
- [ ] Cada linha da tabela está em uma única linha do código-fonte.
- [ ] O alinhamento está correto (números à direita).
- [ ] Comandos, IPs e portas estão entre crases.
- [ ] URLs e links estão corretos.
- [ ] Caracteres `|` dentro das células foram escapados quando necessário.
- [ ] Informações sensíveis (senhas, tokens, chaves) não estão expostas.
- [ ] A tabela continua legível em telas menores.
- [ ] O renderizador utilizado suporta os recursos empregados.

---

## 15. Referência rápida

| Sintaxe | Função |
| :--- | :--- |
| `---` | Coluna com alinhamento padrão (linha separadora) |
| `:---` | Alinhamento à esquerda |
| `---:` | Alinhamento à direita |
| `:---:` | Centralização |
| `` `texto` `` | Código inline |
| `**texto**` | Negrito |
| `*texto*` | Itálico |
| `~~texto~~` | Tachado (GFM) |
| `[texto](URL)` | Link |
| `<br>` | Quebra de linha dentro da célula |
| `\|` | Barra vertical literal |
| `&#124;` | Barra vertical literal (entidade HTML) |
| `{: .classe }` | Classe CSS na tabela (kramdown) |

---

## Exemplo completo

```markdown
# Servidores

| Servidor | IP | Sistema | Porta | Função | Status |
| :--- | :--- | :--- | ---: | :--- | :---: |
| `srv-web01` | `10.0.10.10` | Rocky Linux 9 | 443 | Web | OK |
| `srv-db01` | `10.0.10.20` | Rocky Linux 9 | 3306 | Banco | OK |
| `srv-dns01` | `10.0.10.30` | Debian 13 | 53 | DNS | OK |
| `srv-proxy01` | `10.0.10.40` | Rocky Linux 9 | 8080 | Proxy | ATENÇÃO |
```

Resultado:

| Servidor | IP | Sistema | Porta | Função | Status |
| :--- | :--- | :--- | ---: | :--- | :---: |
| `srv-web01` | `10.0.10.10` | Rocky Linux 9 | 443 | Web | OK |
| `srv-db01` | `10.0.10.20` | Rocky Linux 9 | 3306 | Banco | OK |
| `srv-dns01` | `10.0.10.30` | Debian 13 | 53 | DNS | OK |
| `srv-proxy01` | `10.0.10.40` | Rocky Linux 9 | 8080 | Proxy | ATENÇÃO |

---

## Conclusão

Tabelas Markdown são simples, mas muito úteis para documentação técnica.

A estrutura fundamental é:

```markdown
| Cabeçalho 1 | Cabeçalho 2 |
| :--- | :--- |
| Valor 1 | Valor 2 |
```

Os principais recursos são:

- definição de colunas e alinhamento;
- formatação de texto, código inline e links;
- documentação de servidores, redes e APIs;
- troubleshooting e inventários;
- comparação de tecnologias;
- uso em README, Jekyll e GitHub Pages.

Para documentação técnica, prefira tabelas simples, consistentes e fáceis de ler tanto no código-fonte quanto no HTML gerado. Quando precisar de mais do que o Markdown oferece (células mescladas, larguras fixas, várias linhas), use uma tabela HTML.