---
layout: default
description: "Guia prático de Git: controle de versão, repositórios, commits, branches e colaboração com exemplos."
title: Guia Prático Git
---

# Guia Prático de Git
{:.no_toc}

<div id="sumário" class="toc-title">Sumário</div>
* Sumário:
{:toc}
---

## O que é o Git?

Git é um **sistema de controle de versão**. Ele guarda o histórico completo de um projeto, registrando quem mudou o quê, quando e por quê, e permite voltar no tempo se algo der errado.

### Uma analogia

Pense em um documento de texto em que você salva versões assim:

```
trabalho.docx
trabalho_v2.docx
trabalho_final.docx
trabalho_final_agora_vai.docx
trabalho_final_agora_vai_revisado.docx
```

Isso é bagunçado e não mostra o que mudou entre uma versão e outra. O Git resolve esse problema: você tem **um único projeto**, e ele guarda cada versão como um "ponto de salvamento" organizado — como os checkpoints de um videogame.

[⬆ Voltar ao sumário](#sumário)

---

## Para que serve?

1. **Registrar mudanças**: cada alteração fica salva com autor, data e uma mensagem explicando o motivo.
2. **Desfazer erros**: quebrou algo? Volte para a versão que funcionava.
3. **Colaborar com segurança**: várias pessoas trabalham no mesmo projeto ao mesmo tempo sem sobrescrever o trabalho umas das outras.
4. **Experimentar sem medo**: você testa ideias novas em uma "cópia paralela" (branch) e só junta ao projeto principal se der certo.

[⬆ Voltar ao sumário](#sumário)

---

## Git não é GitHub

| | O que é |
|---|---|
| **Git** | A ferramenta que roda no seu computador e controla as versões |
| **GitHub / GitLab / Bitbucket** | Serviços online que hospedam repositórios Git e facilitam o trabalho em equipe |

Você pode usar o Git sozinho, sem internet e sem GitHub. Os serviços online servem para compartilhar, fazer backup e colaborar via Pull Requests.

[⬆ Voltar ao sumário](#sumário)

---

## Conceitos fundamentais

| Termo | Significado |
|---|---|
| **Repositório (repo)** | A pasta do projeto monitorada pelo Git, com todo o histórico |
| **Commit** | Um "retrato" do projeto em um momento, com mensagem explicativa |
| **Branch** | Linha paralela de desenvolvimento (a principal costuma ser `main`) |
| **Merge** | Juntar as mudanças de uma branch em outra |
| **Remoto (remote)** | Cópia do repositório em um servidor, como o GitHub |
| **HEAD** | Ponteiro que indica em qual commit/branch você está agora |
| **.gitignore** | Arquivo que lista o que o Git deve ignorar (ex: senhas, `node_modules`) |

[⬆ Voltar ao sumário](#sumário)

---

## Os três "lugares" do Git

Este é o ponto que mais confunde no começo. Seus arquivos passam por três áreas:

```
Diretório de trabalho  →  Área de staging  →  Repositório
   (você edita)          (você escolhe        (histórico
                          o que vai salvar)     salvo)
        git add ────────────►  git commit ────────►
```

Pense em uma **mudança de casa**:
- **Diretório de trabalho:** os objetos espalhados pela casa.
- **Staging:** os objetos que você colocou dentro da caixa.
- **Commit:** a caixa fechada, etiquetada e guardada.

Você escolhe o que entra na caixa — o que permite salvar só parte das suas alterações.

[⬆ Voltar ao sumário](#sumário)

---

## Fluxo básico na prática

```bash
# 1. Iniciar um repositório
git init

# 2. Ver o que mudou
git status

# 3. Ver exatamente O QUE mudou linha a linha
git diff

# 4. Colocar arquivos na "caixa" (staging)
git add arquivo.txt        # um arquivo
git add .                  # todos os arquivos alterados

# 5. Salvar o ponto no histórico
git commit -m "Adiciona página inicial"

# 6. Ver o histórico
git log --oneline --graph
```

> 💡 `git diff` costuma faltar em guias básicos, mas é essencial: mostra exatamente o que vai entrar no commit antes de você confirmar.

[⬆ Voltar ao sumário](#sumário)

---

## Ignorando arquivos (.gitignore)

Nem tudo deve ir para o histórico — senhas, arquivos temporários, dependências. Crie um arquivo `.gitignore` na raiz do projeto:

```
node_modules/
.env
*.log
dist/
```

Isso evita vazar credenciais e mantém o repositório limpo.

[⬆ Voltar ao sumário](#sumário)

---

## Trabalhando com branches e equipe

```bash
git branch nova-funcao          # cria uma branch
git switch nova-funcao          # muda para ela
# ...faz alterações e commits...
git switch main                 # volta para a principal
git merge nova-funcao           # junta o trabalho

git clone <url>                 # baixa um projeto remoto
git pull                        # traz novidades do remoto
git push                        # envia seus commits ao remoto
```

[⬆ Voltar ao sumário](#sumário)

---

## Desfazendo erros (o que mais gera dúvida)

| Situação | Comando | Efeito |
|---|---|---|
| Descartar mudanças não commitadas em um arquivo | `git restore arquivo.txt` | Volta o arquivo ao último commit |
| Tirar um arquivo do staging (sem perder a edição) | `git restore --staged arquivo.txt` | Sai da "caixa", mas mantém a mudança |
| Desfazer o **último commit**, mantendo as mudanças no diretório | `git reset --soft HEAD~1` | Commit desfeito, arquivos intactos |
| Apagar o último commit e as mudanças (cuidado!) | `git reset --hard HEAD~1` | Perde tudo daquele commit |
| Desfazer um commit **já enviado** ao remoto, sem reescrever histórico | `git revert <hash>` | Cria um novo commit que anula o anterior |

> ⚠️ Regra de ouro: use `revert` para commits já compartilhados com outras pessoas, e `reset` só localmente, antes do `push`.

[⬆ Voltar ao sumário](#sumário)

---

## Resolvendo conflitos de merge

Quando duas pessoas alteram a mesma linha, o Git não sabe qual manter e mostra algo assim no arquivo:

```
<<<<<<< HEAD
minha versão da linha
=======
versão da outra pessoa
>>>>>>> nova-funcao
```

Passo a passo:
1. Edite o arquivo manualmente, decidindo o que fica.
2. Apague as marcações (`<<<<<<<`, `=======`, `>>>>>>>`).
3. `git add arquivo.txt`
4. `git commit` (o Git já sugere uma mensagem de merge).

[⬆ Voltar ao sumário](#sumário)

---

## Boas práticas desde o início

- Faça **commits pequenos e frequentes**, cada um com um propósito claro.
- Escreva **mensagens descritivas**, de preferência no imperativo: "Corrige erro no cálculo do frete" em vez de "ajustes".
- Use **branches** para novas funcionalidades (`feature/nome`, `fix/nome`).
- Rode `git status` com frequência para saber onde você está.
- Nunca coloque senhas ou chaves de API no repositório — use `.gitignore`.
- Antes de `git push`, rode `git pull` para evitar conflitos desnecessários.

[⬆ Voltar ao sumário](#sumário)

---

## Resumindo

> Git é uma máquina do tempo para o seu projeto: registra cada passo, deixa você voltar quando errar e permite que várias pessoas construam algo juntas sem pisar no trabalho umas das outras.

[⬆ Voltar ao sumário](#sumário)