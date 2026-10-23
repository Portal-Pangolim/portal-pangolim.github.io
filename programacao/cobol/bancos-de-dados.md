---
layout: default
description: "Integração de COBOL com bancos de dados: SQL embutido, DB2 e tratamento de operações e retornos."
title: COBOL e Bancos de Dados
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="5" rx="8" ry="3"/>
    <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/>
    <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/>
  </svg>
  Bancos de Dados
</h1>

> Integração entre COBOL e bancos de dados: Embedded SQL, comandos SQL essenciais, cursores e DB2.

---

## Objetivos

Ao final desta seção, você deverá ser capaz de:

- Explicar como o COBOL se comunica com um banco de dados relacional.
- Escrever comandos SQL embutidos (`EXEC SQL`) em um programa COBOL.
- Usar variáveis hospedeiras, `SQLCA` e `SQLCODE`.
- Percorrer várias linhas de resultado com cursores.
- Reconhecer as etapas de preparação de um programa COBOL com DB2.

---

## Embedded SQL

Em **Embedded SQL**, os comandos SQL são escritos dentro do código-fonte COBOL, entre `EXEC SQL` e `END-EXEC`. Antes da compilação, um **pré-compilador** substitui esses blocos por chamadas ao gerenciador do banco.

```mermaid
flowchart LR
    A["Fonte COBOL<br/>com EXEC SQL"] --> B["Pré-compilador"]
    B --> C["Fonte COBOL puro<br/>+ DBRM"]
    C --> D["Compilador COBOL"]
    D --> E["Programa executável"]
```

```cobol
           EXEC SQL
               SELECT NOME
                 INTO :WS-NOME
                 FROM CLIENTE
                WHERE CODIGO = :WS-CODIGO
           END-EXEC.
```

---

## Variáveis hospedeiras

As **variáveis hospedeiras** (*host variables*) são campos COBOL usados dentro do SQL. Elas são identificadas por dois-pontos (`:`) antes do nome e declaradas na `WORKING-STORAGE SECTION`.

```cobol
       WORKING-STORAGE SECTION.
           EXEC SQL BEGIN DECLARE SECTION END-EXEC.
       01 WS-CODIGO     PIC S9(09) COMP.
       01 WS-NOME       PIC X(30).
       01 WS-SALDO      PIC S9(07)V99 COMP-3.
           EXEC SQL END DECLARE SECTION END-EXEC.
```

O tipo da variável COBOL deve ser compatível com o tipo da coluna no banco. Por exemplo, `INTEGER` costuma ser `PIC S9(09) COMP`, e `DECIMAL` costuma ser `PIC S9(n)V9(m) COMP-3`.

---

## SQLCA e SQLCODE

A **SQLCA** (*SQL Communication Area*) é a área em que o banco devolve o resultado de cada comando. Ela é incluída no programa com:

```cobol
           EXEC SQL INCLUDE SQLCA END-EXEC.
```

O campo mais usado é o `SQLCODE`:

| SQLCODE | Significado |
|---|---|
| `0` | Comando executado com sucesso |
| `+100` | Nenhuma linha encontrada, ou fim do cursor |
| Valor negativo | Erro na execução |

Exemplos de valores negativos no DB2: `-803` (chave duplicada) e `-811` (o `SELECT` retornou mais de uma linha onde se esperava uma). Os códigos variam entre produtos.

### Padrão de verificação

```cobol
           EXEC SQL
               SELECT NOME INTO :WS-NOME
                 FROM CLIENTE WHERE CODIGO = :WS-CODIGO
           END-EXEC

           EVALUATE SQLCODE
               WHEN 0
                   DISPLAY "CLIENTE: " WS-NOME
               WHEN +100
                   DISPLAY "CLIENTE NAO ENCONTRADO"
               WHEN OTHER
                   DISPLAY "ERRO SQL: " SQLCODE
           END-EVALUATE.
```

---

## Comandos SQL essenciais

| Comando | Uso |
|---|---|
| `SELECT ... INTO` | Lê uma única linha para variáveis hospedeiras |
| `INSERT` | Insere linhas |
| `UPDATE` | Altera linhas |
| `DELETE` | Remove linhas |
| `COMMIT` | Confirma as alterações da unidade de trabalho |
| `ROLLBACK` | Desfaz as alterações desde o último `COMMIT` |

```cobol
           EXEC SQL
               INSERT INTO CLIENTE (CODIGO, NOME, SALDO)
               VALUES (:WS-CODIGO, :WS-NOME, :WS-SALDO)
           END-EXEC.

           EXEC SQL
               UPDATE CLIENTE
                  SET SALDO = SALDO + :WS-VALOR
                WHERE CODIGO = :WS-CODIGO
           END-EXEC.

           EXEC SQL COMMIT END-EXEC.
```

---

## Cursores

Quando uma consulta retorna **várias linhas**, usa-se um **cursor**, que entrega uma linha por vez ao programa.

| Etapa | Comando |
|---|---|
| 1. Declarar | `DECLARE nome CURSOR FOR SELECT ...` |
| 2. Abrir | `OPEN nome` |
| 3. Ler | `FETCH nome INTO ...` (em repetição) |
| 4. Fechar | `CLOSE nome` |

```cobol
           EXEC SQL
               DECLARE C-CLIENTES CURSOR FOR
                   SELECT CODIGO, NOME
                     FROM CLIENTE
                    WHERE SALDO > :WS-MINIMO
                    ORDER BY NOME
           END-EXEC.

       PROCESSA-CLIENTES.
           EXEC SQL OPEN C-CLIENTES END-EXEC

           PERFORM UNTIL SQLCODE NOT = 0
               EXEC SQL
                   FETCH C-CLIENTES INTO :WS-CODIGO, :WS-NOME
               END-EXEC
               IF SQLCODE = 0
                   DISPLAY WS-CODIGO " " WS-NOME
               END-IF
           END-PERFORM

           EXEC SQL CLOSE C-CLIENTES END-EXEC.
```

> **Dica:** o `FETCH` retorna `SQLCODE = +100` quando acabam as linhas. Esse é o critério de saída do laço.

---

## Valores nulos

Colunas que aceitam `NULL` precisam de um **indicador de nulo**, uma variável inteira curta associada à variável hospedeira.

```cobol
       01 WS-EMAIL       PIC X(40).
       01 WS-EMAIL-IND   PIC S9(04) COMP.

           EXEC SQL
               SELECT EMAIL INTO :WS-EMAIL :WS-EMAIL-IND
                 FROM CLIENTE WHERE CODIGO = :WS-CODIGO
           END-EXEC

           IF WS-EMAIL-IND < 0
               DISPLAY "EMAIL NAO INFORMADO"
           END-IF
```

Um indicador menor que zero significa que o valor é `NULL`.

---

## DB2

O **DB2** da IBM é o banco relacional mais associado ao COBOL em mainframe. O preparo de um programa COBOL com DB2 segue etapas fixas, geralmente executadas por uma procedure JCL:

| Etapa | O que faz |
|---|---|
| Pré-compilação | Troca o `EXEC SQL` por chamadas e gera o **DBRM** |
| Compilação | Compila o fonte COBOL resultante |
| Link-edição | Gera o módulo executável |
| **BIND** | Cria o **plano** ou **pacote**, com o caminho de acesso escolhido pelo otimizador |
| Execução | Roda o programa sob o DB2, usando o plano ou pacote |

O **DBRM** (*Database Request Module*) guarda os comandos SQL extraídos do programa, e o **BIND** os transforma em estrutura executável dentro do DB2.

Em ambiente de estudo, também é possível usar Embedded SQL com outros bancos. No GnuCOBOL, por exemplo, existem pré-compiladores de terceiros, como o **GixSQL**, que atendem PostgreSQL, MySQL e outros.

---

## Boas práticas

- Verificar o `SQLCODE` depois de **todo** comando SQL.
- Evitar `SELECT *`; listar apenas as colunas necessárias.
- Fazer `COMMIT` em pontos lógicos e, em processos longos, a cada N registros, para não segurar bloqueios por muito tempo.
- Fechar todos os cursores que foram abertos.
- Manter as variáveis hospedeiras com tipos compatíveis com as colunas.

---

## Erros comuns de iniciantes

- Esquecer os dois-pontos antes das variáveis hospedeiras.
- Usar `SELECT INTO` para uma consulta que pode devolver várias linhas (erro `-811`).
- Não tratar `SQLCODE = +100`.
- Esquecer o indicador de nulo em colunas que aceitam `NULL`.
- Alterar o SQL do programa sem refazer a pré-compilação e o BIND.

---

## Resumo

- Embedded SQL coloca comandos SQL dentro do programa COBOL, entre `EXEC SQL` e `END-EXEC`.
- Variáveis hospedeiras levam dados entre o COBOL e o banco, e o `SQLCODE` informa o resultado.
- Consultas com várias linhas usam cursores: `DECLARE`, `OPEN`, `FETCH`, `CLOSE`.
- No DB2, o programa passa por pré-compilação, compilação, link-edição e BIND antes de ser executado.

---

## Próximos passos

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'programacao/cobol/mainframe.html' | relative_url }}">
    <span class="wiki-topic-title">Próximo: Mainframe</span>
    <span class="wiki-topic-description">Conheça o ambiente em que o COBOL roda em produção.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/exercicios.html' | relative_url }}">
    <span class="wiki-topic-title">Exercícios</span>
    <span class="wiki-topic-description">Pratique o que viu nesta seção.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/index.html' | relative_url }}">
    <span class="wiki-topic-title">Voltar para COBOL</span>
    <span class="wiki-topic-description">Retorne à visão geral e à trilha de estudo.</span>
  </a>

</div>