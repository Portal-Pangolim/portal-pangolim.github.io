---
layout: default
description: "Fluxo de colaboração com Git: clone, criação de branch, Pull Request e integração de alterações."
title: Fluxo GitHub - Clone, Branch, Pull Request e Merge
---

# Fluxo GitHub: Clone → Branch → Alteração → Revisão → Commit → Pull Request → Merge
{:.no_toc}

Este tutorial apresenta um fluxo completo para trabalhar em um projeto hospedado no GitHub.

O objetivo é realizar alterações sem modificar diretamente a `main`, permitindo revisar as mudanças através de um **Pull Request (PR)** antes de incorporá-las à branch principal.

O fluxo utilizado será:

```mermaid
flowchart LR
    Clone --> Branch
    Branch --> Alteração
	  Alteração --> Revisão
	  Revisão --> Commit
    Commit --> Pull_Request
    Pull_Request --> Merge
```

Esse fluxo é bastante utilizado em projetos profissionais e é especialmente útil para projetos como o **Pangolim**.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}


---

## 1. Entendendo o fluxo

Antes de começar, é importante entender o papel de cada etapa.

| Etapa        | Objetivo                                 |
| ------------ | ----------------------------------------- |
| Clone        | Baixar o repositório para o computador   |
| Branch       | Criar uma área separada para trabalhar   |
| Alteração    | Modificar os arquivos                    |
| Revisão      | Conferir se as alterações estão corretas |
| Commit       | Registrar as alterações                  |
| Pull Request | Solicitar a incorporação da alteração    |
| Merge        | Incorporar a alteração à `main`          |

O fluxo pode ser representado assim:

```text
GitHub
  │
  │ git clone
  ▼
Computador
  │
  │ criar branch
  ▼
nova-home
  │
  ├── editar
  ├── testar
  └── revisar
       │
       │ commit
       ▼
GitHub
  │
  │ Pull Request
  ▼
Revisão
  │
  │ Merge
  ▼
main
```

> **Quando usar este fluxo em vez do merge local:** se você já conhece o fluxo de merge local (branch → commit → push → `git merge` → `git push`), este tutorial ensina uma variação mais segura para projetos com revisão, colaboração ou histórico auditável: em vez de mesclar localmente, você abre um **Pull Request** no GitHub e faz o merge por lá.

---

## 2. Pré-requisitos

Antes de começar, tenha instalado:

* Git;
* um editor de código, como VS Code;
* acesso ao repositório do GitHub.

Verifique se o Git está instalado:

```powershell
git --version
```

Exemplo:

```text
git version 2.x.x
```

---

## 3. Clone o repositório

O primeiro passo é baixar o projeto do GitHub para o computador.

No GitHub, abra o repositório e clique em:

**Code → HTTPS**

Copie o endereço do repositório.

Depois, no PowerShell, entre na pasta onde deseja guardar o projeto.

Exemplo:

```powershell
cd "C:\Users\SEU_USUARIO\Documents\GitHub\Projetos"
```

Execute:

```powershell
git clone https://github.com/Portal-Pangolim/portal-pangolim.github.io.git
```

O Git criará uma pasta:

```text
portal-pangolim.github.io
```

Entre nela:

```powershell
cd portal-pangolim.github.io
```

> Se você já configurou uma chave SSH com o GitHub, pode usar **Code → SSH** em vez de HTTPS. A vantagem é não precisar digitar usuário/senha (ou token) a cada `push`/`pull`:
>
> ```powershell
> git clone git@github.com:Portal-Pangolim/portal-pangolim.github.io.git
> ```

---

## 4. Verifique o repositório

Confira a situação:

```powershell
git status
```

Verifique a branch atual:

```powershell
git branch --show-current
```

Normalmente o resultado será:

```text
main
```

Também é possível listar todas as branches:

```powershell
git branch
```

Exemplo:

```text
* main
```

O `*` indica a branch atual.

---

## 5. Atualize a main

Antes de começar uma nova alteração, atualize a `main`:

```powershell
git pull origin main
```

Isso garante que você esteja trabalhando com a versão mais recente disponível no GitHub.

> Se o projeto já teve outras branches mescladas e excluídas no GitHub, rode também `git fetch --prune` para limpar as referências locais de branches remotas que não existem mais.

---

## 6. Crie uma branch

Nunca é necessário trabalhar diretamente na `main`.

Crie uma branch específica para sua alteração:

```powershell
git switch -c nova-home
```

Exemplos de nomes:

```powershell
git switch -c nova-home
```

```powershell
git switch -c corrige-menu
```

```powershell
git switch -c adiciona-tcp-ip
```

```powershell
git switch -c melhora-documentacao
```

Verifique:

```powershell
git branch --show-current
```

Resultado:

```text
nova-home
```

Agora você está trabalhando na branch de desenvolvimento.

> Para deixar o propósito da branch ainda mais claro, considere usar prefixos como `feature/nova-home`, `fix/corrige-menu` ou `docs/adiciona-tcp-ip`.

---

## 7. Faça as alterações

Abra o projeto no VS Code:

```powershell
code .
```

Faça as alterações necessárias.

Por exemplo:

```text
index.md
assets/css/style.css
_layouts/default.html
linux/tcp-ip.md
```

Salve os arquivos.

---

## 8. Faça a revisão local

Antes de criar o commit, veja o que foi alterado:

```powershell
git status
```

Depois:

```powershell
git diff
```

O `git diff` mostra exatamente as diferenças entre o conteúdo atual e o último commit.

Revise:

* código;
* textos;
* links;
* imagens;
* formatação;
* arquivos modificados;
* arquivos que não deveriam estar no commit.

---

## 9. Teste o projeto

Se estiver trabalhando com Jekyll, execute:

```powershell
bundle exec jekyll serve
```

Abra:

```text
http://127.0.0.1:4000
```

Teste a alteração no navegador.

Verifique principalmente:

* página inicial;
* menus;
* links;
* imagens;
* CSS;
* navegação;
* páginas modificadas.

Quando terminar:

```text
Ctrl + C
```

---

## 10. Verifique novamente as alterações

Depois dos testes:

```powershell
git status
```

E:

```powershell
git diff
```

Esse é um bom momento para corrigir qualquer problema antes de registrar a alteração.

---

## 11. Prepare o commit

Adicione os arquivos modificados:

```powershell
git add .
```

Confira o que será incluído:

```powershell
git status
```

Se estiver tudo correto, faça o commit:

```powershell
git commit -m "Atualiza página inicial"
```

Use uma mensagem que explique claramente o que foi feito.

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

## 12. Envie a branch para o GitHub

Agora envie a branch:

```powershell
git push -u origin nova-home
```

Na primeira vez, o parâmetro:

```text
-u
```

estabelece a relação entre a branch local e a branch remota.

Depois disso, novos pushes podem ser feitos simplesmente com:

```powershell
git push
```

---

## 13. Abra o Pull Request

Agora entre no GitHub e abra o repositório.

O GitHub normalmente mostrará uma mensagem informando que uma nova branch foi enviada.

Clique em:

**Compare & pull request**

ou acesse:

**Pull requests → New pull request**

Configure:

```text
base: main
compare: nova-home
```

Isso significa:

```text
nova-home
     ↓
   Pull Request
     ↓
    main
```

> Se a alteração ainda não estiver pronta para revisão final, você pode marcar o PR como **Draft pull request** — isso avisa que o trabalho está em andamento, mas já permite acompanhar o histórico e receber comentários antecipados.

---

## 14. Revise o Pull Request

Antes de criar o PR, confira:

#### Base

```text
main
```

#### Compare

```text
nova-home
```

Verifique também os arquivos modificados.

O GitHub mostrará a diferença entre as duas branches.

Confira:

* arquivos adicionados;
* arquivos modificados;
* arquivos removidos;
* linhas adicionadas;
* linhas removidas.

Essa é uma segunda revisão, agora diretamente no GitHub.

---

## 15. Crie o Pull Request

Adicione um título claro.

Exemplo:

```text
Atualiza página inicial do Pangolim
```

Na descrição, explique o que foi feito.

Exemplo:

```text
## Alterações

- Atualiza a página inicial.
- Ajusta o menu de navegação.
- Corrige estilos CSS.

## Testes

- Site testado localmente com Jekyll.
- Navegação verificada no navegador.
```

Depois clique em:

**Create pull request**

---

## 16. Revisão do Pull Request

O Pull Request permite revisar a alteração antes do merge.

Na aba **Files changed**, confira novamente as modificações.

Você pode:

* comentar linhas específicas;
* solicitar alterações;
* aprovar a alteração;
* verificar os testes automáticos, quando existirem.

Em um projeto individual, você pode fazer essa revisão sozinho.

Em uma equipe, outra pessoa pode revisar o código.

---

## 17. Fazer alterações depois do Pull Request

Uma das vantagens do Pull Request é que ele pode continuar recebendo alterações.

Se encontrar um problema, volte ao computador e faça a correção na mesma branch:

```powershell
git switch nova-home
```

Edite o arquivo.

Depois:

```powershell
git add .
git commit -m "Corrige problema no menu"
git push
```

O Pull Request será atualizado automaticamente.

Não é necessário criar outro Pull Request.

---

## 18. Se houver conflitos no Pull Request

Se a `main` recebeu outras alterações enquanto seu Pull Request estava aberto, o GitHub pode indicar que a branch **não pode mais ser mesclada automaticamente** (`This branch has conflicts that must be resolved`).

**Não force o merge nessa situação.** Resolva o conflito primeiro:

No computador, volte para sua branch e traga as alterações mais recentes da `main`:

```powershell
git switch nova-home
git fetch origin
git merge origin/main
```

O Git indicará os arquivos em conflito, da mesma forma que em um merge local. Abra-os e procure por trechos como:

```text
<<<<<<< HEAD
sua alteração
=======
alteração feita na main
>>>>>>> origin/main
```

Resolva manualmente, depois:

```powershell
git add .
git commit
git push
```

O Pull Request será atualizado automaticamente e o GitHub deverá indicar que ele já pode ser mesclado.

> Se preferir desistir dessa tentativa de trazer a `main` e voltar ao estado anterior, use `git merge --abort` antes de resolver os conflitos manualmente.

---

## 19. Fazer o Merge

Quando a revisão estiver concluída e tudo estiver correto, no GitHub clique em:

**Merge pull request**

Depois:

**Confirm merge**

A alteração será incorporada à `main`.

O fluxo ficará:

```text
nova-home
    │
    │ Pull Request
    ▼
  revisão
    │
    │ Merge
    ▼
   main
```

---

## 20. Atualizar a cópia local

Depois do merge, volte para a `main`:

```powershell
git switch main
```

Atualize:

```powershell
git pull origin main
```

Agora sua `main` local contém as alterações que foram incorporadas pelo Pull Request.

---

## 21. Excluir a branch

Depois que o Pull Request foi incorporado, a branch de desenvolvimento pode ser removida.

No GitHub, normalmente existe a opção:

**Delete branch**

No computador, você pode remover a branch local:

```powershell
git branch -d nova-home
```

Se quiser remover também a branch remota manualmente:

```powershell
git push origin --delete nova-home
```

> **Atenção:** só remova a branch depois de confirmar que o Pull Request foi realmente incorporado à `main`.

---

## 22. Fluxo completo na prática

Suponha que você queira alterar a página inicial do Pangolim.

### Clone

```powershell
git clone https://github.com/Portal-Pangolim/portal-pangolim.github.io.git
cd portal-pangolim.github.io
```

### Atualizar main

```powershell
git switch main
git pull origin main
```

### Criar branch

```powershell
git switch -c nova-home
```

### Editar

Faça as alterações no VS Code.

### Revisar

```powershell
git status
git diff
```

### Testar

```powershell
bundle exec jekyll serve
```

Abra:

```text
http://127.0.0.1:4000
```

### Commit

```powershell
git add .
git commit -m "Atualiza página inicial"
```

### Push

```powershell
git push -u origin nova-home
```

### Pull Request

No GitHub:

```text
nova-home
    ↓
Pull Request
    ↓
main
```

### Merge

No GitHub:

```text
Merge pull request
↓
Confirm merge
```

### Atualizar local

```powershell
git switch main
git pull origin main
```

### Limpar

```powershell
git branch -d nova-home
git push origin --delete nova-home
```

Pronto.

---

## 23. Fluxo visual completo

```text
                    GITHUB
                       │
                       │ clone
                       ▼
                ┌─────────────┐
                │     main    │
                └──────┬──────┘
                       │
                       │ switch -c
                       ▼
                ┌─────────────┐
                │  nova-home  │
                └──────┬──────┘
                       │
                       ▼
                  ALTERAÇÃO
                       │
                       ▼
                    TESTE
                       │
                       ▼
                    REVISÃO
                       │
                       ▼
                    COMMIT
                       │
                       ▼
                     PUSH
                       │
                       ▼
                  GITHUB
                       │
                       ▼
               PULL REQUEST
                       │
                       ▼
                   REVISÃO
                       │
                       ▼
                    MERGE
                       │
                       ▼
                ┌─────────────┐
                │     main    │
                └─────────────┘
                       │
                       ▼
                GITHUB PAGES
```

---

## 24. Comandos essenciais

| Objetivo                            | Comando                              |
| ------------------------------------ | -------------------------------------- |
| Clonar (HTTPS)                       | `git clone URL`                        |
| Clonar (SSH)                         | `git clone git@github.com:usuario/repo.git` |
| Entrar no projeto                    | `cd pasta`                             |
| Ver branch atual                     | `git branch --show-current`            |
| Atualizar `main`                     | `git pull origin main`                 |
| Limpar referências remotas antigas   | `git fetch --prune`                    |
| Criar branch                         | `git switch -c nome-da-branch`         |
| Trocar de branch                     | `git switch nome-da-branch`            |
| Ver alterações                       | `git diff`                             |
| Ver situação                         | `git status`                           |
| Adicionar alterações                 | `git add .`                            |
| Criar commit                         | `git commit -m "mensagem"`             |
| Enviar branch (primeira vez)         | `git push -u origin nome-da-branch`    |
| Enviar novos commits                 | `git push`                             |
| Trazer atualizações da `main` para a branch | `git merge origin/main`         |
| Desistir de um merge em conflito     | `git merge --abort`                    |
| Excluir branch local                 | `git branch -d nome-da-branch`         |
| Excluir branch remota                | `git push origin --delete nome-da-branch` |

---

## 25. Boas práticas

### Não trabalhe diretamente na `main`

Prefira:

```text
main
 ↓
branch
 ↓
alteração
 ↓
teste
 ↓
commit
 ↓
Pull Request
 ↓
revisão
 ↓
merge
 ↓
main
```

Para reforçar essa prática, é comum ativar **branch protection rules** no GitHub (**Settings → Branches**), exigindo que toda alteração na `main` passe obrigatoriamente por um Pull Request — e opcionalmente por pelo menos uma aprovação antes do merge.

---

### Use nomes descritivos para as branches

Exemplos:

```text
nova-home
corrige-menu
adiciona-tcp-ip
melhora-documentacao
corrige-css
```

Evite nomes genéricos como:

```text
teste
alteracao
coisa
branch1
```

Um prefixo como `feature/`, `fix/` ou `docs/` também ajuda a identificar o tipo de alteração de longe.

---

### Faça commits pequenos e objetivos

Um commit deve representar uma alteração lógica.

Bom:

```text
Atualiza página inicial
```

Bom:

```text
Corrige navegação do menu
```

Evite:

```text
Mudanças
```

---

### Revise antes do commit

Sempre verifique:

```powershell
git status
```

e:

```powershell
git diff
```

Antes de executar:

```powershell
git commit
```

---

### Teste antes do Pull Request

Não use o Pull Request como substituto dos testes locais.

Primeiro:

```text
Alterar
 ↓
Testar
 ↓
Revisar
 ↓
Commit
 ↓
Push
 ↓
Pull Request
```

---

### Mantenha a branch atualizada durante revisões longas

Se o Pull Request ficar aberto por muito tempo, outras alterações podem ser mescladas na `main` enquanto isso. Traga essas atualizações periodicamente para a sua branch (seção 18) para evitar conflitos grandes no momento do merge.

---

## 26. Regra de ouro

Para o Pangolim, memorize:

```text
CLONE
  ↓
BRANCH
  ↓
ALTERAÇÃO
  ↓
REVISÃO
  ↓
COMMIT
  ↓
PUSH
  ↓
PULL REQUEST
  ↓
REVISÃO NO GITHUB
  ↓
MERGE
  ↓
MAIN
```

Ou, de forma resumida:

> **Nunca altere a `main` diretamente quando estiver desenvolvendo uma nova funcionalidade. Crie uma branch, faça as alterações, revise, envie para o GitHub e use um Pull Request para incorporar o trabalho à `main`.**
