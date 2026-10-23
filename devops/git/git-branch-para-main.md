---
layout: default
description: "Fluxo Git para trabalhar em uma branch e integrar alterações na main, com verificações antes da publicação."
title: Editar uma branch e publicar na branch principal
---

# Como editar uma branch e publicar na branch principal
{:.no_toc}

Este tutorial apresenta um fluxo seguro para desenvolver alterações em uma **branch de desenvolvimento**, testar as mudanças e depois publicá-las na **branch principal (`main`)**.

Esse processo é especialmente útil em projetos que utilizam **GitHub Pages, Jekyll, HTML, CSS ou documentação**, pois permite testar uma alteração sem modificar imediatamente a versão principal do site.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}
---

## 1. Entendendo o fluxo

O fluxo recomendado é:

```text
main
  │
  └──► nova-home
          │
          ├── editar
          ├── testar
          ├── commit
          └── push
                 │
                 ▼
              GitHub
                 │
                 ▼
           merge na main
                 │
                 ▼
                main
```

A ideia é simples:

> **Desenvolva em uma branch separada, teste e somente depois faça o merge para a `main`.**

> **Alternativa:** em vez de fazer o merge localmente (seção 11), você também pode abrir um **Pull Request** da sua branch para a `main` diretamente no GitHub. Isso dá um histórico visual da alteração, permite revisão antes de publicar e é o padrão usado em projetos colaborativos. O fluxo local ensinado aqui continua sendo perfeitamente válido para projetos individuais como o Pangolim.

---

## 2. Verificar a situação atual

Abra o PowerShell dentro da pasta do projeto.

Exemplo:

```powershell
cd "C:\Users\SEU_USUARIO\Documents\GitHub\Projetos\portal-pangolim.github.io"
```

Verifique a branch atual:

```powershell
git branch --show-current
```

Verifique se existem alterações pendentes:

```powershell
git status
```

O ideal é começar com:

```text
nothing to commit, working tree clean
```

---

## 3. Atualizar a branch principal

Antes de criar uma nova branch, atualize a `main`.

```powershell
git switch main
```

Depois:

```powershell
git pull origin main
```

Isso garante que a sua `main` local esteja sincronizada com o GitHub.

> Se quiser também limpar referências de branches remotas que já foram excluídas no GitHub, rode `git fetch --prune` antes do `pull`.

---

## 4. Criar uma branch de desenvolvimento

Agora crie uma nova branch:

```powershell
git switch -c nova-home
```

Você pode escolher outro nome:

```powershell
git switch -c altera-menu
```

ou:

```powershell
git switch -c atualiza-documentacao
```

Verifique:

```powershell
git branch --show-current
```

O resultado deverá mostrar o nome da nova branch:

```text
nova-home
```

A partir desse momento, as alterações serão feitas na branch de desenvolvimento.

> **Convenção de nomes:** conforme o projeto cresce, ajuda usar prefixos que indiquem o tipo de alteração, por exemplo `feature/nova-home`, `fix/menu-quebrado` ou `docs/tcp-ip`. Isso facilita identificar o propósito da branch só pelo nome.

---

## 5. Editar os arquivos

Agora faça as alterações normalmente.

Por exemplo:

```text
index.md
assets/css/style.css
_layouts/default.html
linux/tcp-ip.md
```

Depois de salvar os arquivos, verifique:

```powershell
git status
```

Para visualizar exatamente o que foi alterado:

```powershell
git diff
```

---

## 6. Testar a alteração localmente

Se o projeto utiliza Jekyll, execute:

```powershell
bundle exec jekyll serve
```

O Jekyll normalmente ficará disponível em:

```text
http://127.0.0.1:4000
```

Abra o endereço no navegador e teste a alteração.

Confira principalmente:

* página inicial;
* menus;
* links;
* títulos;
* imagens;
* CSS;
* navegação entre páginas;
* conteúdo novo.

Para parar o servidor:

```text
Ctrl + C
```

> **Importante:** sempre que possível, teste a alteração antes de fazer o merge para a `main`.

---

## 7. Criar o commit

Depois de testar e confirmar que a alteração está correta, verifique novamente:

```powershell
git status
```

Adicione os arquivos:

```powershell
git add .
```

Confira o que será incluído no commit:

```powershell
git status
```

Agora crie o commit:

```powershell
git commit -m "Atualiza página inicial"
```

Use uma mensagem que descreva claramente a alteração.

Exemplos:

```powershell
git commit -m "Atualiza página inicial"
```

```powershell
git commit -m "Corrige menu de navegação"
```

```powershell
git commit -m "Adiciona documentação TCP/IP"
```

---

## 8. Enviar a branch para o GitHub

Envie a branch para o repositório remoto:

```powershell
git push -u origin nova-home
```

Se a branch tiver outro nome, substitua `nova-home`.

Por exemplo:

```powershell
git push -u origin altera-menu
```

Depois disso, a branch estará disponível no GitHub.

---

## 9. Testar a branch usando o GitHub Pages

Se quiser testar a versão publicada antes de colocá-la na `main`, você pode configurar temporariamente o GitHub Pages para utilizar a branch de desenvolvimento.

No GitHub, acesse:

**Repository → Settings → Pages**

Em:

**Build and deployment → Source**

selecione:

```text
Deploy from a branch
```

Depois:

```text
Branch: nova-home
Folder: / (root)
```

Clique em:

**Save**

O GitHub Pages passará a publicar a versão existente na `nova-home`.

Isso permite verificar a versão que está no GitHub antes de colocá-la na `main`.

> **Atenção:** enquanto o GitHub Pages estiver apontando para `nova-home`, alterações feitas somente na `main` **não** alterarão o site publicado. Não esqueça de reverter esta configuração na seção 15 assim que terminar o teste — esse é o erro mais comum ao usar essa técnica.

---

## 10. Voltar para a `main`

Depois de testar a branch e confirmar que está tudo correto, volte para a branch principal:

```powershell
git switch main
```

Atualize a `main`:

```powershell
git pull origin main
```

É uma boa prática fazer isso antes do merge.

---

## 11. Fazer o merge

Agora faça o merge da branch de desenvolvimento:

```powershell
git merge nova-home
```

O Git incorporará as alterações da `nova-home` à `main`.

Se tudo estiver correto, você verá uma mensagem semelhante a:

```text
Fast-forward
```

ou:

```text
Merge made by the 'ort' strategy.
```

---

## 12. Verificar o resultado

Confira:

```powershell
git status
```

Se estiver tudo certo, o Git deverá indicar que não existem alterações pendentes.

Também é possível verificar o histórico:

```powershell
git log --oneline -5
```

---

## 13. Publicar a `main` no GitHub

Agora envie a `main` para o GitHub:

```powershell
git push origin main
```

Neste momento, a alteração que estava na branch de desenvolvimento também estará na `main` remota.

---

## 14. Excluir a branch de desenvolvimento

Depois que o merge for concluído e publicado, a branch de desenvolvimento já cumpriu seu papel. Para manter o repositório organizado, exclua-a:

Localmente:

```powershell
git branch -d nova-home
```

No GitHub (branch remota):

```powershell
git push origin --delete nova-home
```

> Sem esse passo, o repositório acumula branches antigas e esquecidas, dificultando a organização do projeto com o tempo.

---

## 15. Voltar o GitHub Pages para a `main`

Se você utilizou o GitHub Pages para testar a branch de desenvolvimento, volte às configurações:

**Repository → Settings → Pages**

Em:

**Build and deployment → Source**

configure:

```text
Branch: main
Folder: / (root)
```

Clique em:

**Save**

Agora o site oficial volta a ser publicado a partir da `main`.

Pode ser necessário aguardar alguns instantes para o GitHub Pages concluir a publicação.

---

## 16. Conferir as branches

Você pode verificar as branches locais:

```powershell
git branch
```

Exemplo:

```text
* main
```

O `*` indica a branch atual. Como a `nova-home` já foi excluída na seção 14, ela não deve mais aparecer na lista.

Para conferir a branch atual:

```powershell
git branch --show-current
```

Resultado:

```text
main
```

---

## 17. Comparar a branch de desenvolvimento com a `main`

Antes de excluir a branch (seção 14), você pode verificar se ainda existem diferenças entre ela e a `main`:

```powershell
git diff main nova-home
```

Se não aparecer nenhuma saída, não existem diferenças entre as duas branches — ou seja, o merge foi concluído corretamente e é seguro excluí-la.

Também é possível comparar as branches diretamente pelo GitHub.

---

## 18. Exemplo completo

Suponha que você queira criar uma nova versão da página inicial do Pangolim.

Primeiro:

```powershell
git switch main
git pull origin main
```

Crie a branch:

```powershell
git switch -c nova-home
```

Faça as alterações nos arquivos.

Teste localmente:

```powershell
bundle exec jekyll serve
```

Depois faça o commit:

```powershell
git status
git add .
git commit -m "Atualiza página inicial"
```

Envie a branch:

```powershell
git push -u origin nova-home
```

Teste pelo GitHub Pages, se desejar.

Quando estiver tudo correto:

```powershell
git switch main
git pull origin main
git merge nova-home
git push origin main
```

Por fim, exclua a branch que não é mais necessária:

```powershell
git branch -d nova-home
git push origin --delete nova-home
```

E configure o GitHub Pages novamente para:

```text
main / (root)
```

---

## 19. Fluxo resumido

### Criar a branch

```powershell
git switch main
git pull origin main
git switch -c nova-home
```

### Desenvolver

```text
Editar arquivos
        ↓
Testar localmente
        ↓
Verificar alterações
```

### Salvar no Git

```powershell
git status
git add .
git commit -m "Descrição da alteração"
git push -u origin nova-home
```

### Publicar na `main`

```powershell
git switch main
git pull origin main
git merge nova-home
git push origin main
```

### Limpar

```powershell
git branch -d nova-home
git push origin --delete nova-home
```

### GitHub Pages

```text
Branch: main
Folder: / (root)
```

---

## 20. Se ocorrer um conflito no merge

Pode acontecer de a `main` e a branch de desenvolvimento terem alterações diferentes no mesmo arquivo.

Nesse caso:

```powershell
git merge nova-home
```

pode apresentar uma mensagem informando que existem conflitos.

**Não continue executando comandos aleatoriamente.**

Primeiro execute:

```powershell
git status
```

O Git mostrará os arquivos que possuem conflitos.

Abra os arquivos indicados e procure por trechos como:

```text
<<<<<<< HEAD
alteração da main
=======
alteração da nova-home
>>>>>>> nova-home
```

Resolva manualmente qual conteúdo deverá permanecer.

Depois:

```powershell
git add .
```

Finalize o merge:

```powershell
git commit
```

E envie:

```powershell
git push origin main
```

> Se você não souber resolver o conflito, pare nesse ponto e analise o arquivo antes de continuar.
>
> Se preferir desistir do merge e voltar ao estado anterior, use:
>
> ```powershell
> git merge --abort
> ```

---

## 21. Boas práticas

### Não desenvolva diretamente na `main`

Prefira:

```text
main
 ↓
branch de desenvolvimento
 ↓
alterações
 ↓
testes
 ↓
merge
 ↓
main
```

Isso reduz o risco de quebrar a versão principal do projeto.

Em projetos maiores, é comum ativar **branch protection rules** no GitHub (Settings → Branches) para impedir push direto na `main`, obrigando todas as alterações a passar por uma branch separada — reforçando exatamente o fluxo ensinado neste tutorial.

### Faça commits pequenos

Prefira:

```text
Atualiza página inicial
```

```text
Corrige menu de navegação
```

```text
Ajusta estilos CSS
```

```text
Adiciona documentação TCP/IP
```

Em vez de:

```text
Alterações
```

Uma mensagem de commit clara facilita a identificação das mudanças posteriormente.

### Use nomes de branch descritivos

Prefira nomes que indiquem o propósito da alteração, opcionalmente com um prefixo (`feature/`, `fix/`, `docs/`), como visto na seção 4.

### Sempre teste antes do merge

Principalmente quando estiver trabalhando com:

* Jekyll;
* GitHub Pages;
* HTML;
* CSS;
* JavaScript;
* layouts;
* menus;
* navegação;
* documentação.

### Atualize a `main` antes do merge

Antes de executar:

```powershell
git merge nova-home
```

faça:

```powershell
git switch main
git pull origin main
```

Isso reduz a possibilidade de realizar o merge utilizando uma versão desatualizada da `main`.

### Limpe as branches após o merge

Depois que uma branch é mesclada e publicada, exclua-a (seção 14) para manter o repositório organizado.

---

## 22. Comandos essenciais

| Objetivo                          | Comando                              |
| ---------------------------------- | ------------------------------------- |
| Ver branch atual                   | `git branch --show-current`           |
| Ver situação do repositório        | `git status`                          |
| Atualizar `main`                   | `git pull origin main`                |
| Limpar referências remotas antigas | `git fetch --prune`                   |
| Criar branch                       | `git switch -c nome-da-branch`        |
| Trocar de branch                   | `git switch nome-da-branch`           |
| Ver alterações                     | `git diff`                            |
| Adicionar alterações               | `git add .`                           |
| Criar commit                       | `git commit -m "mensagem"`            |
| Enviar branch                      | `git push -u origin nome-da-branch`   |
| Fazer merge                        | `git merge nome-da-branch`            |
| Desistir de um merge em conflito   | `git merge --abort`                   |
| Enviar `main`                      | `git push origin main`                |
| Ver branches                       | `git branch`                          |
| Excluir branch local               | `git branch -d nome-da-branch`        |
| Excluir branch remota              | `git push origin --delete nome-da-branch` |

---

## 23. Regra prática para o Pangolim

Para o projeto **Pangolim**, pense sempre neste fluxo:

```text
┌──────────────────────┐
│        main          │
│   versão principal   │
└──────────┬───────────┘
           │
           │ criar branch
           ▼
┌──────────────────────┐
│     nova-home        │
│    desenvolvimento   │
└──────────┬───────────┘
           │
           ├── editar
           ├── testar
           ├── commit
           └── push
                    │
                    ▼
                 GitHub
                    │
                    │ tudo OK?
                    ▼
              merge → main
                    │
                    ▼
             git push origin main
                    │
                    ▼
              excluir branch
                    │
                    ▼
              GitHub Pages
                publica main
```

## Resumo

O procedimento é:

**1. Criar uma branch**

```powershell
git switch -c nova-home
```

**2. Editar e testar**

**3. Fazer commit**

```powershell
git add .
git commit -m "Descrição da alteração"
```

**4. Enviar a branch**

```powershell
git push -u origin nova-home
```

**5. Voltar para a `main`**

```powershell
git switch main
git pull origin main
```

**6. Fazer o merge**

```powershell
git merge nova-home
```

**7. Publicar a `main`**

```powershell
git push origin main
```

**8. Excluir a branch de desenvolvimento**

```powershell
git branch -d nova-home
git push origin --delete nova-home
```

**9. Se estiver usando GitHub Pages, confirmar:**

```text
Branch: main
Folder: / (root)
```

> **Regra de ouro:** `branch de desenvolvimento → testar → commit → push → merge → main → excluir branch → GitHub Pages`.
