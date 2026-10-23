---
layout: default
description: "Índice dos guias Git: comandos, branches e colaboração por Pull Requests."
title: Git
---
# Git

---

## Conteúdo

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'devops/git/guia-pratico.html' | relative_url }}">
    <span class="wiki-topic-title">Guia prático de Git</span>
    <span class="wiki-topic-description">Comandos e práticas essenciais para trabalhar com Git.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/git/git-branch-para-main.html' | relative_url }}">
    <span class="wiki-topic-title">Tutorial: Branch e publicação na main</span>
    <span class="wiki-topic-description">Criação de branches, alterações e publicação na branch main.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/git/git-clone-branch-pull-request.html' | relative_url }}">
    <span class="wiki-topic-title">Tutorial: Clone, Branch, Pull Request e Merge</span>
    <span class="wiki-topic-description">Fluxo completo para clonar, criar branches, abrir Pull Requests e realizar merge.</span>
  </a>

  <a class="wiki-topic" href="{{ 'devops/git/atualizando-projeto-git.html' | relative_url }}">
    <span class="wiki-topic-title">Sincronizando um projeto Git</span>
    <span class="wiki-topic-description">Como atualizar um projeto Git usando pull, fetch, reset e outras opções de sincronização.</span>
  </a>

</div>

---

## Introdução
Git é um sistema de controle de versão. Ele guarda o histórico completo de um projeto, registrando quem mudou o quê, quando e por quê.

Isso permite voltar a versões anteriores, investigar alterações e trabalhar com segurança sem depender de cópias como `projeto_final`, `projeto_final_v2` ou `projeto_agora-vai`.

Um commit funciona como um ponto de salvamento organizado do projeto.

---

## Para que serve

O Git permite:

1. **Registrar mudanças:** cada alteração fica associada a autor, data e mensagem.
2. **Desfazer erros:** é possível retornar a uma versão conhecida e funcional.
3. **Colaborar com segurança:** várias pessoas podem trabalhar sem sobrescrever diretamente o trabalho umas das outras.
4. **Experimentar sem afetar a versão principal:** branches permitem testar alterações separadamente.

---

## Git e GitHub

Git e GitHub são conceitos diferentes:

| Git | GitHub, GitLab ou Bitbucket |
| --- | --- |
| Ferramenta que controla versões no computador | Serviço online que hospeda repositórios Git |
| Funciona localmente e pode ser usado sem Internet | Facilita compartilhamento, backup, colaboração e Pull Requests |
| Mantém o histórico do projeto | Disponibiliza esse histórico para outras pessoas |

É possível usar Git sem GitHub. Os serviços online são usados para hospedar e compartilhar repositórios Git.

---

## Conceitos fundamentais

- **Repositório:** pasta do projeto monitorada pelo Git, incluindo seu histórico.
- **Commit:** registro de um estado do projeto em determinado momento.
- **Branch:** linha paralela de desenvolvimento. A principal normalmente se chama `main`.
- **Merge:** operação que integra alterações de uma branch em outra.
- **Remoto:** cópia do repositório hospedada em um servidor, como o GitHub.

---

## As três áreas do Git

Os arquivos passam por três áreas principais:

```text
Diretório de trabalho → Área de staging → Repositório
      você edita          você escolhe       histórico salvo
			      git add             git commit
```

- **Diretório de trabalho:** onde os arquivos são editados.
- **Área de staging:** onde são selecionadas as alterações que entrarão no próximo commit.
- **Repositório:** onde os commits ficam registrados no histórico.

Essa separação permite criar commits apenas com parte das alterações, quando necessário.

---

## Fluxo básico na prática

Para iniciar um repositório local:

```bash
git init
git status
git add arquivo.txt
git commit -m "Adiciona arquivo inicial"
git log --oneline
```

Em um projeto que já existe no GitHub:

```bash
git clone URL_DO_REPOSITORIO
cd nome-do-projeto
git status
```

Antes de publicar alterações, revise o que será enviado:

```bash
git diff
git diff --staged
```

---

## Branches e equipe

Use uma branch separada para desenvolver novas funcionalidades ou correções:

```bash
git branch nova-funcao
git switch nova-funcao
```

Depois de fazer alterações e commits, integre o trabalho à `main` quando estiver validado:

```bash
git switch main
git merge nova-funcao
git push origin main
```

Para sincronizar um projeto remoto:

```bash
git pull
git push
```

Em equipes, prefira abrir um Pull Request para revisar as alterações antes do merge.

---

## Boas práticas

- Faça commits pequenos e frequentes, cada um com um propósito claro.
- Escreva mensagens descritivas, como `Corrige validação do formulário`.
- Use branches para novas funcionalidades e correções.
- Execute `git status` com frequência.
- Revise `git diff --staged` antes do commit.
- Nunca coloque senhas, tokens ou chaves de API no repositório.
- Atualize a `main` antes de iniciar uma nova alteração.

---

## Fluxo recomendado de estudo

```text
Introdução ao Git
	↓
Repositório e commits
	↓
Branches
	↓
Revisão das alterações
	↓
Pull Request
	↓
Merge na main
```
