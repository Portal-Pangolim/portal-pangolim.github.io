---
layout: default
description: "Exercícios de COBOL organizados para praticar fundamentos, lógica, arquivos e integração de programas."
title: Exercícios de COBOL
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
  Exercícios
</h1>

> Pratique o conteúdo das seções 1 a 10, do nível iniciante ao intermediário. Tente resolver antes de abrir o gabarito.

---

## Como usar esta página

- Os exercícios estão organizados **por seção**, na mesma ordem da trilha de estudo.
- Cada exercício tem um **gabarito** recolhido. Resolva primeiro e confira depois.
- Os exercícios de programação podem ser executados no GnuCOBOL (veja [GnuCOBOL]({{ 'programacao/cobol/gnucobol.html' | relative_url }})). Os de JCL e CICS exigem ambiente mainframe ou apenas análise do código.
- Existe mais de uma solução correta para a maioria dos problemas. O gabarito mostra uma delas.

| Nível | Descrição |
|---|---|
| ★ | Iniciante: conceito direto ou programa curto |
| ★★ | Intermediário: combina mais de um conceito |
| ★★★ | Desafio: exige planejamento |

---

## 1. Fundamentos

### Exercício 1.1 ★

Liste as quatro divisões de um programa COBOL, na ordem correta, e diga quais são obrigatórias.

<details>
<summary>Ver gabarito</summary>

1. `IDENTIFICATION DIVISION` (obrigatória)
2. `ENVIRONMENT DIVISION` (opcional)
3. `DATA DIVISION` (opcional)
4. `PROCEDURE DIVISION` (obrigatória)

</details>

### Exercício 1.2 ★

Em quais colunas começam a Área A e a Área B no formato fixo? Em qual delas deve começar o `DISPLAY`?

<details>
<summary>Ver gabarito</summary>

A Área A vai das colunas 8 a 11, e a Área B, das colunas 12 a 72. Comandos como `DISPLAY` começam na **Área B** (coluna 12 em diante).

</details>

### Exercício 1.3 ★

Escreva um programa que exiba a mensagem `OLA, COBOL!` e encerre.

<details>
<summary>Ver gabarito</summary>

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. OLA.

       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "OLA, COBOL!".
           STOP RUN.
```

</details>

### Exercício 1.4 ★

Encontre os erros do trecho abaixo:

```cobol
       WORKING-STORAGE SECTION.
       01 DATA        PIC X(10).
       01 WS-VALOR    PIC 9(5)V99
```

<details>
<summary>Ver gabarito</summary>

1. `DATA` é uma palavra reservada e não pode ser nome de variável.
2. A declaração de `WS-VALOR` não termina com ponto final.

</details>

---

## 2. GnuCOBOL

### Exercício 2.1 ★

Escreva o comando para compilar o arquivo `ola.cob` em um executável chamado `ola`, e o comando para executá-lo.

<details>
<summary>Ver gabarito</summary>

```bash
cobc -x ola.cob -o ola
./ola
```

</details>

### Exercício 2.2 ★★

Qual é a diferença entre compilar com `cobc -x` e com `cobc -m`?

<details>
<summary>Ver gabarito</summary>

`cobc -x` gera um **executável** (programa principal). `cobc -m` gera um **módulo dinâmico**, carregado em tempo de execução por um `CALL`, usado para subprogramas.

</details>

---

## 3. Programação

### Exercício 3.1 ★

Escreva um programa que declare dois números (`WS-A` com 10 e `WS-B` com 3), calcule a soma, a subtração, a multiplicação e a divisão, e exiba cada resultado.

<details>
<summary>Ver gabarito</summary>

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. OPERACOES.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-A      PIC 9(03) VALUE 10.
       01 WS-B      PIC 9(03) VALUE 3.
       01 WS-SOMA   PIC 9(04).
       01 WS-SUB    PIC S9(04).
       01 WS-MULT   PIC 9(06).
       01 WS-DIV    PIC 9(03)V99.

       PROCEDURE DIVISION.
       PRINCIPAL.
           COMPUTE WS-SOMA = WS-A + WS-B
           COMPUTE WS-SUB  = WS-A - WS-B
           COMPUTE WS-MULT = WS-A * WS-B
           COMPUTE WS-DIV  = WS-A / WS-B
           DISPLAY "SOMA: " WS-SOMA
           DISPLAY "SUBTRACAO: " WS-SUB
           DISPLAY "MULTIPLICACAO: " WS-MULT
           DISPLAY "DIVISAO: " WS-DIV
           STOP RUN.
```

</details>

### Exercício 3.2 ★

Receba uma nota (0 a 10) pelo teclado e exiba `APROVADO` se for maior ou igual a 7, `RECUPERACAO` se estiver entre 5 e 6,99, ou `REPROVADO` nos demais casos.

<details>
<summary>Ver gabarito</summary>

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. NOTA.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NOTA   PIC 9(02)V99.

       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "DIGITE A NOTA: "
           ACCEPT WS-NOTA
           EVALUATE TRUE
               WHEN WS-NOTA >= 7
                   DISPLAY "APROVADO"
               WHEN WS-NOTA >= 5
                   DISPLAY "RECUPERACAO"
               WHEN OTHER
                   DISPLAY "REPROVADO"
           END-EVALUATE
           STOP RUN.
```

</details>

### Exercício 3.3 ★

Exiba a tabuada do 7, de 1 a 10, usando `PERFORM VARYING`.

<details>
<summary>Ver gabarito</summary>

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. TABUADA.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-I          PIC 9(02).
       01 WS-RESULTADO  PIC 9(03).

       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 10
               COMPUTE WS-RESULTADO = 7 * WS-I
               DISPLAY "7 X " WS-I " = " WS-RESULTADO
           END-PERFORM
           STOP RUN.
```

</details>

### Exercício 3.4 ★★

Receba números pelo teclado até que o usuário digite `0`. Ao final, exiba a **soma** e a **quantidade** de números digitados (sem contar o zero).

<details>
<summary>Ver gabarito</summary>

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SOMANUM.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NUM     PIC S9(05) VALUE 1.
       01 WS-SOMA    PIC S9(07) VALUE ZERO.
       01 WS-QTD     PIC 9(03)  VALUE ZERO.

       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM UNTIL WS-NUM = 0
               DISPLAY "DIGITE UM NUMERO (0 PARA SAIR): "
               ACCEPT WS-NUM
               IF WS-NUM NOT = 0
                   ADD WS-NUM TO WS-SOMA
                   ADD 1 TO WS-QTD
               END-IF
           END-PERFORM
           DISPLAY "SOMA: " WS-SOMA
           DISPLAY "QUANTIDADE: " WS-QTD
           STOP RUN.
```

</details>

---

## 4. Estruturas de Dados

### Exercício 4.1 ★

Escreva a declaração `PIC` adequada para cada dado:

1. Nome de até 40 caracteres.
2. Idade (até 3 dígitos).
3. Salário com 2 casas decimais, até 99.999,99.
4. Saldo bancário que pode ser negativo, com 2 casas decimais e até 7 dígitos inteiros.

<details>
<summary>Ver gabarito</summary>

```cobol
       01 WS-NOME     PIC X(40).
       01 WS-IDADE    PIC 9(03).
       01 WS-SALARIO  PIC 9(05)V99.
       01 WS-SALDO    PIC S9(07)V99.
```

</details>

### Exercício 4.2 ★★

Crie um grupo `WS-ALUNO` com matrícula (5 dígitos), nome (30 caracteres) e uma tabela com 4 notas (cada uma `99V9`). Em seguida, calcule e exiba a média das notas.

<details>
<summary>Ver gabarito</summary>

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MEDIA.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-ALUNO.
          05 WS-MATRICULA   PIC 9(05) VALUE 12345.
          05 WS-NOME        PIC X(30) VALUE "MARIA SILVA".
          05 WS-NOTAS.
             10 WS-NOTA     PIC 99V9 OCCURS 4 TIMES.
       01 WS-I              PIC 9.
       01 WS-SOMA           PIC 9(03)V9 VALUE ZERO.
       01 WS-MEDIA          PIC 99V99.

       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE 8.5 TO WS-NOTA(1)
           MOVE 7.0 TO WS-NOTA(2)
           MOVE 9.0 TO WS-NOTA(3)
           MOVE 6.5 TO WS-NOTA(4)

           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 4
               ADD WS-NOTA(WS-I) TO WS-SOMA
           END-PERFORM

           COMPUTE WS-MEDIA = WS-SOMA / 4
           DISPLAY WS-NOME " - MEDIA: " WS-MEDIA
           STOP RUN.
```

</details>

### Exercício 4.3 ★★

Explique para que serve `REDEFINES` e dê um exemplo em que uma data `AAAAMMDD` (8 dígitos) também possa ser acessada separadamente como ano, mês e dia.

<details>
<summary>Ver gabarito</summary>

`REDEFINES` permite que **dois nomes descrevam a mesma área de memória** com layouts diferentes.

```cobol
       01 WS-DATA          PIC 9(08).
       01 WS-DATA-R REDEFINES WS-DATA.
          05 WS-ANO        PIC 9(04).
          05 WS-MES        PIC 9(02).
          05 WS-DIA        PIC 9(02).
```

Ao mover `20240131` para `WS-DATA`, `WS-ANO` vale `2024`, `WS-MES` vale `01` e `WS-DIA` vale `31`.

</details>

---

## 5. Arquivos

### Exercício 5.1 ★

Escreva a parte de declaração (`SELECT` e `FD`) de um arquivo sequencial de texto `funcionarios.dat`, com registros contendo matrícula (5 dígitos), nome (30 caracteres) e salário (`9(05)V99`). Inclua `FILE STATUS`.

<details>
<summary>Ver gabarito</summary>

```cobol
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT ARQ-FUNC ASSIGN TO "funcionarios.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-FS-FUNC.

       DATA DIVISION.
       FILE SECTION.
       FD ARQ-FUNC.
       01 REG-FUNC.
          05 FUNC-MATRICULA  PIC 9(05).
          05 FUNC-NOME       PIC X(30).
          05 FUNC-SALARIO    PIC 9(05)V99.

       WORKING-STORAGE SECTION.
       01 WS-FS-FUNC         PIC XX.
```

</details>

### Exercício 5.2 ★★

Usando o arquivo do exercício anterior, escreva um programa que **leia todos os registros** e exiba o **total da folha** (soma dos salários) ao final.

<details>
<summary>Ver gabarito</summary>

```cobol
       WORKING-STORAGE SECTION.
       01 WS-FS-FUNC     PIC XX.
       01 WS-FIM         PIC X VALUE "N".
       01 WS-TOTAL       PIC 9(09)V99 VALUE ZERO.

       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT ARQ-FUNC
           IF WS-FS-FUNC NOT = "00"
               DISPLAY "ERRO AO ABRIR: " WS-FS-FUNC
               STOP RUN
           END-IF

           PERFORM UNTIL WS-FIM = "S"
               READ ARQ-FUNC
                   AT END
                       MOVE "S" TO WS-FIM
                   NOT AT END
                       ADD FUNC-SALARIO TO WS-TOTAL
               END-READ
           END-PERFORM

           CLOSE ARQ-FUNC
           DISPLAY "TOTAL DA FOLHA: " WS-TOTAL
           STOP RUN.
```

</details>

### Exercício 5.3 ★

O que significam os `FILE STATUS` `00`, `10`, `22` e `23`?

<details>
<summary>Ver gabarito</summary>

- `00`: operação concluída com sucesso.
- `10`: fim de arquivo.
- `22`: chave duplicada.
- `23`: registro não encontrado.

</details>

### Exercício 5.4 ★★★

Descreva o que acontece quando um programa abre um arquivo existente com `OPEN OUTPUT`, e qual `OPEN` deveria usar para **acrescentar** registros ao final.

<details>
<summary>Ver gabarito</summary>

`OPEN OUTPUT` **apaga o conteúdo** anterior do arquivo e começa um novo. Para acrescentar registros ao final, use `OPEN EXTEND`.

</details>

---

## 6. Modularização

### Exercício 6.1 ★

Reescreva o programa abaixo dividindo a lógica em três parágrafos: `INICIALIZA`, `PROCESSA` e `FINALIZA`, chamados a partir de um parágrafo `PRINCIPAL`.

```cobol
       PROCEDURE DIVISION.
           DISPLAY "INICIO"
           DISPLAY "PROCESSANDO"
           DISPLAY "FIM"
           STOP RUN.
```

<details>
<summary>Ver gabarito</summary>

```cobol
       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM INICIALIZA
           PERFORM PROCESSA
           PERFORM FINALIZA
           STOP RUN.

       INICIALIZA.
           DISPLAY "INICIO".

       PROCESSA.
           DISPLAY "PROCESSANDO".

       FINALIZA.
           DISPLAY "FIM".
```

</details>

### Exercício 6.2 ★★

Crie um subprograma `DOBRO` que receba um número e devolva o dobro dele, e um programa principal que o chame com o valor `25`.

<details>
<summary>Ver gabarito</summary>

**Subprograma `dobro.cob`:**

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. DOBRO.

       DATA DIVISION.
       LINKAGE SECTION.
       01 LK-ENTRADA   PIC 9(05).
       01 LK-RESULTADO PIC 9(06).

       PROCEDURE DIVISION USING LK-ENTRADA LK-RESULTADO.
       PRINCIPAL.
           COMPUTE LK-RESULTADO = LK-ENTRADA * 2
           GOBACK.
```

**Programa principal `principal.cob`:**

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. PRINCIPAL.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NUM        PIC 9(05) VALUE 25.
       01 WS-DOBRO      PIC 9(06).

       PROCEDURE DIVISION.
       INICIO.
           CALL "DOBRO" USING WS-NUM WS-DOBRO
           DISPLAY "DOBRO DE " WS-NUM " = " WS-DOBRO
           STOP RUN.
```

**Compilação:**

```bash
cobc -m dobro.cob
cobc -x principal.cob
./principal
```

</details>

### Exercício 6.3 ★

Qual a diferença entre passar um parâmetro `BY REFERENCE` e `BY CONTENT`?

<details>
<summary>Ver gabarito</summary>

Em `BY REFERENCE` (padrão), o subprograma trabalha no **mesmo campo** do chamador, e as alterações voltam. Em `BY CONTENT`, recebe uma **cópia**, e as alterações não afetam o campo do chamador.

</details>

### Exercício 6.4 ★★

Crie um copybook `PRODUTO.cpy` com o registro de um produto (código com 5 dígitos, descrição com 30 caracteres e preço `9(05)V99`) e mostre como incluí-lo na `WORKING-STORAGE SECTION`.

<details>
<summary>Ver gabarito</summary>

**`PRODUTO.cpy`:**

```cobol
       01 REG-PRODUTO.
          05 PROD-CODIGO     PIC 9(05).
          05 PROD-DESCRICAO  PIC X(30).
          05 PROD-PRECO      PIC 9(05)V99.
```

**No programa:**

```cobol
       WORKING-STORAGE SECTION.
           COPY PRODUTO.
```

</details>

---

## 7. Bancos de Dados

### Exercício 7.1 ★

Escreva o comando SQL embutido que busque o nome de um cliente cujo código está em `WS-CODIGO` e guarde o resultado em `WS-NOME`.

<details>
<summary>Ver gabarito</summary>

```cobol
           EXEC SQL
               SELECT NOME
                 INTO :WS-NOME
                 FROM CLIENTE
                WHERE CODIGO = :WS-CODIGO
           END-EXEC.
```

</details>

### Exercício 7.2 ★

Qual `SQLCODE` indica sucesso, e qual indica que nenhuma linha foi encontrada ou que o cursor acabou?

<details>
<summary>Ver gabarito</summary>

`0` indica sucesso, e `+100` indica que não há mais linhas (ou nenhuma foi encontrada).

</details>

### Exercício 7.3 ★★

Liste, em ordem, os quatro comandos usados para trabalhar com um cursor, e escreva o laço que exiba o código e o nome de todos os clientes com saldo maior que `WS-MINIMO`.

<details>
<summary>Ver gabarito</summary>

A ordem é: `DECLARE`, `OPEN`, `FETCH` (repetido) e `CLOSE`.

```cobol
           EXEC SQL
               DECLARE C-CLI CURSOR FOR
                   SELECT CODIGO, NOME
                     FROM CLIENTE
                    WHERE SALDO > :WS-MINIMO
           END-EXEC.

       LISTA-CLIENTES.
           EXEC SQL OPEN C-CLI END-EXEC

           PERFORM UNTIL SQLCODE NOT = 0
               EXEC SQL
                   FETCH C-CLI INTO :WS-CODIGO, :WS-NOME
               END-EXEC
               IF SQLCODE = 0
                   DISPLAY WS-CODIGO " " WS-NOME
               END-IF
           END-PERFORM

           EXEC SQL CLOSE C-CLI END-EXEC.
```

</details>

### Exercício 7.4 ★★

Por que uma coluna que aceita `NULL` precisa de um indicador de nulo? Como testar se o valor lido era nulo?

<details>
<summary>Ver gabarito</summary>

Porque `NULL` não tem representação em uma variável COBOL comum. O **indicador de nulo** (`PIC S9(04) COMP`) informa se o valor veio como `NULL`. Se o indicador for **menor que zero**, o valor é nulo.

```cobol
           IF WS-EMAIL-IND < 0
               DISPLAY "EMAIL NAO INFORMADO"
           END-IF
```

</details>

---

## 8. Mainframe

### Exercício 8.1 ★

Explique a diferença entre processamento **batch** e **online**, com um exemplo de cada.

<details>
<summary>Ver gabarito</summary>

**Batch:** processa grandes volumes sem interação com o usuário, normalmente agendado. Exemplo: fechamento mensal ou folha de pagamento.

**Online:** o usuário interage e recebe a resposta em segundos. Exemplo: consulta de saldo em um caixa eletrônico.

</details>

### Exercício 8.2 ★

Qual é a diferença entre um dataset **sequencial** e um dataset **particionado (PDS)**? Como se indica um membro de um PDS?

<details>
<summary>Ver gabarito</summary>

Um dataset **sequencial** é um conjunto único de registros. Um **PDS** é uma biblioteca com vários **membros**, cada um funcionando como um arquivo separado. O membro é indicado entre parênteses depois do nome, como `USUARIO.COBOL.FONTE(CLIENTES)`.

</details>

### Exercício 8.3 ★

Em que ferramenta se consulta a saída de um job e o seu código de retorno? Quais DDs normalmente se examinam primeiro em caso de erro?

<details>
<summary>Ver gabarito</summary>

No **SDSF**. Em caso de erro, examinam-se `JESMSGLG`, `JESJCL` e a saída do programa (`SYSOUT` ou `SYSPRINT`).

</details>

### Exercício 8.4 ★

Qual é o tamanho máximo de um nome de dataset e de cada qualificador?

<details>
<summary>Ver gabarito</summary>

O nome completo tem até **44 caracteres**, e cada qualificador tem até **8 caracteres**, separados por ponto.

</details>

---

## 9. JCL

### Exercício 9.1 ★

Escreva um JCL que execute o programa `CLIENTES` (módulo em `USUARIO.COBOL.LOAD`), com entrada em `USUARIO.CLIENTES.DADOS` (nome de DD `ENTRADA`) e saída direcionada para o spool no DD `SYSOUT`.

<details>
<summary>Ver gabarito</summary>

```jcl
//MEUJOB   JOB (ACCT),'EXECUTA CLIENTES',CLASS=A,MSGCLASS=X,
//             NOTIFY=&SYSUID
//PASSO01  EXEC PGM=CLIENTES
//STEPLIB  DD DSN=USUARIO.COBOL.LOAD,DISP=SHR
//ENTRADA  DD DSN=USUARIO.CLIENTES.DADOS,DISP=SHR
//SYSOUT   DD SYSOUT=*
```

</details>

### Exercício 9.2 ★★

Complete o JCL para criar um novo dataset de saída `USUARIO.CLIENTES.RELAT`, com registros de 80 bytes de tamanho fixo em bloco, 5 trilhas de espaço primário e 5 de secundário, de modo que ele seja catalogado em caso de sucesso e apagado em caso de falha.

<details>
<summary>Ver gabarito</summary>

```jcl
//SAIDA    DD DSN=USUARIO.CLIENTES.RELAT,
//             DISP=(NEW,CATLG,DELETE),
//             SPACE=(TRK,(5,5),RLSE),
//             RECFM=FB,LRECL=80
```

</details>

### Exercício 9.3 ★

Qual a função de cada um dos comandos `JOB`, `EXEC` e `DD`?

<details>
<summary>Ver gabarito</summary>

- `JOB`: identifica e inicia o job.
- `EXEC`: define um passo, indicando o programa (`PGM=`) ou a procedure a executar.
- `DD`: descreve um dataset usado pelo passo.

</details>

### Exercício 9.4 ★★

Escreva um JCL com dois passos, em que o segundo (`PGM=RELATORIO`) só execute se o primeiro (`PGM=CLIENTES`) terminar com código de retorno `0`. Use `IF/THEN/ELSE`.

<details>
<summary>Ver gabarito</summary>

```jcl
//MEUJOB   JOB (ACCT),'DOIS PASSOS',CLASS=A,MSGCLASS=X
//PASSO01  EXEC PGM=CLIENTES
//STEPLIB  DD DSN=USUARIO.COBOL.LOAD,DISP=SHR
//SYSOUT   DD SYSOUT=*
//TESTA    IF (PASSO01.RC = 0) THEN
//PASSO02    EXEC PGM=RELATORIO
//STEPLIB    DD DSN=USUARIO.COBOL.LOAD,DISP=SHR
//SYSOUT     DD SYSOUT=*
//         ENDIF
```

</details>

### Exercício 9.5 ★★

O que significam os erros `S806`, `S0C7` e `SB37`?

<details>
<summary>Ver gabarito</summary>

- `S806`: módulo de carga não encontrado (confira `STEPLIB` ou `JOBLIB`).
- `S0C7`: dado inválido em campo numérico.
- `SB37`: espaço insuficiente no dataset de saída.

</details>

### Exercício 9.6 ★★★

No programa COBOL abaixo, qual deve ser o nome do DD no JCL?

```cobol
           SELECT ARQ-VENDAS ASSIGN TO VENDAS.
```

Escreva a linha de DD apontando para o dataset `USUARIO.VENDAS.MENSAL`.

<details>
<summary>Ver gabarito</summary>

O nome do DD é o informado em `ASSIGN TO`, ou seja, `VENDAS`.

```jcl
//VENDAS   DD DSN=USUARIO.VENDAS.MENSAL,DISP=SHR
```

</details>

---

## 10. CICS

### Exercício 10.1 ★

Explique a diferença entre **transação**, **programa** e **tarefa** no CICS.

<details>
<summary>Ver gabarito</summary>

- **Transação:** unidade de trabalho identificada por um código de até 4 caracteres (TRANSID).
- **Programa:** o código executável associado à transação.
- **Tarefa:** uma execução de uma transação para um usuário específico.

</details>

### Exercício 10.2 ★

Qual comando deve terminar um programa CICS, em vez de `STOP RUN`?

<details>
<summary>Ver gabarito</summary>

```cobol
           EXEC CICS RETURN
           END-EXEC
```

</details>

### Exercício 10.3 ★★

Explique por que o modelo **pseudoconversacional** é preferido e qual o papel da COMMAREA nele.

<details>
<summary>Ver gabarito</summary>

No modelo pseudoconversacional, a tarefa **termina** depois de enviar a tela e libera memória e outros recursos enquanto o usuário digita. Isso permite atender muito mais usuários ao mesmo tempo. A **COMMAREA** guarda as informações que o programa precisa lembrar entre uma interação e a seguinte, já que a tarefa anterior terminou.

</details>

### Exercício 10.4 ★★

Como o programa descobre que é a **primeira execução** da transação? Escreva o teste em COBOL.

<details>
<summary>Ver gabarito</summary>

Verificando o tamanho da COMMAREA recebida. Se for zero, é a primeira execução.

```cobol
           IF EIBCALEN = 0
               PERFORM PRIMEIRA-VEZ
           ELSE
               PERFORM PROCESSA-RESPOSTA
           END-IF
```

</details>

### Exercício 10.5 ★★

Escreva o comando CICS que lê o registro do arquivo `CLIENTES` com chave `WS-CODIGO`, guardando o resultado em `WS-REG-CLIENTE`, e o trecho que trate `NOTFND`.

<details>
<summary>Ver gabarito</summary>

```cobol
           EXEC CICS READ
               FILE('CLIENTES')
               INTO(WS-REG-CLIENTE)
               RIDFLD(WS-CODIGO)
               RESP(WS-RESP)
           END-EXEC

           EVALUATE WS-RESP
               WHEN DFHRESP(NORMAL)
                   PERFORM EXIBE-CLIENTE
               WHEN DFHRESP(NOTFND)
                   DISPLAY-MENSAGEM-NAO-ENCONTRADO
               WHEN OTHER
                   PERFORM TRATA-ERRO
           END-EVALUATE.
```

Em um programa real, no lugar de uma mensagem solta, o texto seria enviado ao usuário por um mapa (`SEND MAP`).

</details>

### Exercício 10.6 ★★★

Qual a diferença entre `EXEC CICS LINK` e `EXEC CICS XCTL`?

<details>
<summary>Ver gabarito</summary>

`LINK` chama outro programa e, quando ele termina, o controle **volta** ao chamador. `XCTL` **transfere** o controle ao outro programa, e o programa original não retoma a execução.

</details>

---

## Projetos finais

Quando terminar os exercícios, tente unir os conceitos em projetos maiores:

### Projeto A ★★ — Folha de pagamento em lote

1. Leia o arquivo `funcionarios.dat` (exercício 5.1).
2. Para cada funcionário, calcule o **desconto de 10%** com um subprograma `CALCDESC`.
3. Grave um arquivo de saída com a matrícula, o nome e o salário líquido.
4. Exiba o total bruto, o total de descontos e o total líquido.

### Projeto B ★★★ — Cadastro de produtos indexado

1. Crie um arquivo **indexado** de produtos, com `PROD-CODIGO` como chave.
2. Faça um menu com as opções: incluir, consultar, alterar, excluir e listar.
3. Trate o `FILE STATUS` em todas as operações.
4. Use o copybook `PRODUTO.cpy` (exercício 6.4).

### Projeto C ★★★ — Job completo

Escreva um JCL que:

1. Apague (com `IEFBR14`) a saída da execução anterior.
2. Ordene o arquivo de entrada com o `SORT`.
3. Execute o programa COBOL do Projeto A sobre o arquivo ordenado.
4. Copie o resultado para um dataset final apenas se o programa terminar com código de retorno `0`.

---

## Próximos passos

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'programacao/cobol/fundamentos.html' | relative_url }}">
    <span class="wiki-topic-title">Revisar Fundamentos</span>
    <span class="wiki-topic-description">Volte ao início da trilha para reforçar a base.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/gnucobol.html' | relative_url }}">
    <span class="wiki-topic-title">GnuCOBOL</span>
    <span class="wiki-topic-description">Monte seu laboratório para praticar os exercícios.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/index.html' | relative_url }}">
    <span class="wiki-topic-title">Voltar para COBOL</span>
    <span class="wiki-topic-description">Retorne à visão geral e à trilha de estudo.</span>
  </a>

</div>