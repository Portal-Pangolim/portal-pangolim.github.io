---
layout: default
description: "Programação COBOL com variáveis, condições, operações e estruturas de repetição usando PERFORM."
title: Programação em COBOL
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 6l-6 6 6 6"/>
    <path d="M16 6l6 6-6 6"/>
    <path d="M14 4l-4 16"/>
  </svg>
  Programação
</h1>

> Variáveis, operações aritméticas, condições, laços, `PERFORM`, parágrafos e controle de fluxo: a lógica de um programa COBOL.

---

## Objetivos

Ao final desta seção, você deverá ser capaz de:

- Declarar variáveis e movimentar valores com `MOVE`.
- Receber e exibir dados com `ACCEPT` e `DISPLAY`.
- Realizar cálculos com `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE` e `COMPUTE`.
- Tomar decisões com `IF` e `EVALUATE`.
- Repetir blocos de código com as várias formas de `PERFORM`.
- Organizar a lógica em parágrafos e controlar o fluxo do programa.
- Manipular textos com `STRING`, `UNSTRING` e `INSPECT`.

---

## Variáveis e MOVE

As variáveis ficam na `WORKING-STORAGE SECTION` e são descritas com `PIC`. O comando `MOVE` copia um valor de um campo ou literal para outro.

```cobol
       WORKING-STORAGE SECTION.
       01 WS-NOME     PIC X(10) VALUE SPACES.
       01 WS-IDADE    PIC 9(3)  VALUE ZEROS.
       01 WS-SALARIO  PIC 9(5)V99 VALUE ZEROS.

       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE "MARIA"  TO WS-NOME.
           MOVE 34       TO WS-IDADE.
           MOVE 2500.75  TO WS-SALARIO.
```

### Regras de movimentação

O `MOVE` ajusta o valor ao tamanho do campo de destino, sem emitir erro:

| Origem | Destino | Resultado | Regra |
|---|---|---|---|
| `"ABCDEFG"` | `PIC X(5)` | `ABCDE` | Texto é cortado à direita |
| `"ABC"` | `PIC X(6)` | `ABC   ` | Texto é completado com espaços à direita |
| `123.456` | `PIC 9(3)V99` | `123.45` | Casas decimais excedentes são truncadas |
| `12345` | `PIC 9(3)` | `345` | Dígitos à esquerda são perdidos |
| `7` | `PIC 9(3)` | `007` | Numéricos são completados com zeros à esquerda |

> **Atenção:** o truncamento de um `MOVE` é silencioso. Dimensione os campos com folga para os valores esperados.

Para inicializar vários campos de uma vez, use `INITIALIZE`, que coloca zeros nos numéricos e espaços nos alfanuméricos:

```cobol
           INITIALIZE WS-NOME WS-IDADE WS-SALARIO.
```

---

## DISPLAY e ACCEPT

`DISPLAY` escreve na tela e `ACCEPT` lê do teclado.

```cobol
           DISPLAY "Digite seu nome: " WITH NO ADVANCING.
           ACCEPT WS-NOME.
           DISPLAY "Ola, " WS-NOME.
```

`ACCEPT` também recupera dados do sistema:

```cobol
       01 WS-DATA   PIC 9(8).
       01 WS-HORA   PIC 9(8).
           ACCEPT WS-DATA FROM DATE YYYYMMDD.
           ACCEPT WS-HORA FROM TIME.
```

> **Atenção:** `DISPLAY` de um campo com vírgula decimal implícita (`V`) mostra apenas os dígitos, sem separador. O campo `PIC 9(5)V99` com valor `1250.50` aparece como `0125050`. Para exibir o valor formatado, use um campo editado, visto em [Estruturas de Dados]({{ 'programacao/cobol/estruturas-dados.html' | relative_url }}).

---

## Aritmética

### Comandos básicos

```cobol
           ADD 1 TO WS-CONTADOR.
           ADD WS-A WS-B TO WS-C.
           ADD WS-A TO WS-B GIVING WS-TOTAL.

           SUBTRACT WS-DESCONTO FROM WS-PRECO.
           SUBTRACT WS-A FROM WS-B GIVING WS-DIFERENCA.

           MULTIPLY WS-QTD BY WS-PRECO GIVING WS-TOTAL.

           DIVIDE WS-TOTAL BY WS-QTD GIVING WS-MEDIA.
           DIVIDE WS-A BY WS-B GIVING WS-QUOCIENTE
               REMAINDER WS-RESTO.
```

Sem `GIVING`, o resultado é gravado no **último operando**: em `ADD WS-A TO WS-B`, o resultado vai para `WS-B`. Com `GIVING`, o resultado vai para o campo indicado e os operandos não mudam.

### COMPUTE

O `COMPUTE` aceita expressões completas, com `+`, `-`, `*`, `/`, `**` (potência) e parênteses:

```cobol
           COMPUTE WS-FINAL ROUNDED =
               WS-PRECO - (WS-PRECO * WS-DESCONTO / 100).
```

A palavra `ROUNDED` arredonda o resultado em vez de truncar.

### Tratamento de estouro: ON SIZE ERROR

Quando o resultado não cabe no campo de destino, ou ocorre divisão por zero, use `ON SIZE ERROR`:

```cobol
           DIVIDE WS-TOTAL BY WS-QTD GIVING WS-MEDIA
               ON SIZE ERROR
                   DISPLAY "DIVISAO INVALIDA"
                   MOVE ZEROS TO WS-MEDIA
               NOT ON SIZE ERROR
                   DISPLAY "CALCULO OK"
           END-DIVIDE.
```

### Exemplo completo

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. PRECO.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-PRECO      PIC 9(5)V99 VALUE 1250.50.
       01 WS-DESCONTO   PIC 9(2)V99 VALUE 10.00.
       01 WS-FINAL      PIC 9(5)V99 VALUE ZEROS.
       01 WS-FINAL-ED   PIC ZZ,ZZ9.99.

       PROCEDURE DIVISION.
       PRINCIPAL.
           COMPUTE WS-FINAL ROUNDED =
               WS-PRECO - (WS-PRECO * WS-DESCONTO / 100).
           MOVE WS-FINAL TO WS-FINAL-ED.
           DISPLAY "Preco final: " WS-FINAL-ED.
           STOP RUN.
```

Saída:

```text
Preco final:  1,125.45
```

---

## Condições

### IF

```cobol
           IF WS-NOTA >= 7
               DISPLAY "APROVADO"
           ELSE
               DISPLAY "REPROVADO"
           END-IF.
```

### Operadores relacionais

| Símbolo | Forma por extenso |
|---|---|
| `=` | `EQUAL TO` |
| `>` | `GREATER THAN` |
| `<` | `LESS THAN` |
| `>=` | `GREATER THAN OR EQUAL TO` |
| `<=` | `LESS THAN OR EQUAL TO` |
| `NOT =` | `NOT EQUAL TO` |

Para combinar condições, use `AND`, `OR` e `NOT`. Use parênteses sempre que misturar `AND` e `OR`, porque `AND` tem precedência sobre `OR`:

```cobol
           IF (WS-IDADE >= 18 AND WS-IDADE <= 65) OR WS-VIP = "S"
               PERFORM LIBERA-ACESSO
           END-IF.
```

### Testes de classe

```cobol
           IF WS-CAMPO IS NUMERIC
               DISPLAY "SO DIGITOS"
           END-IF.
           IF WS-CAMPO IS ALPHABETIC
               DISPLAY "SO LETRAS E ESPACOS"
           END-IF.
```

> **Dica:** valide com `IS NUMERIC` os dados vindos de arquivos ou do teclado **antes** de usá-los em cálculos. Dados não numéricos em campos numéricos são uma causa clássica de abend em mainframe (`S0C7`).

### Nomes de condição (nível 88)

O nível `88` dá um nome a um valor ou faixa de valores de um campo, o que deixa o código mais legível:

```cobol
       01 WS-ESTADO-CIVIL   PIC X.
          88 SOLTEIRO       VALUE "S".
          88 CASADO         VALUE "C".
          88 VALIDO         VALUE "S" "C" "D" "V".
       01 WS-FIM            PIC X VALUE "N".
          88 FIM-DADOS      VALUE "S".

           IF CASADO
               DISPLAY "CASADO"
           END-IF.
           SET FIM-DADOS TO TRUE.
```

`SET nome-88 TO TRUE` grava no campo o valor associado ao nome de condição.

---

## EVALUATE

O `EVALUATE` substitui sequências longas de `IF` aninhados. Equivale ao `switch/case` de outras linguagens:

```cobol
           EVALUATE TRUE
               WHEN WS-NOTA >= 7
                   DISPLAY "APROVADO"
               WHEN WS-NOTA >= 5
                   DISPLAY "RECUPERACAO"
               WHEN OTHER
                   DISPLAY "REPROVADO"
           END-EVALUATE.
```

Também é possível comparar um campo com valores específicos:

```cobol
           EVALUATE WS-OPCAO
               WHEN 1        PERFORM INCLUIR
               WHEN 2 THRU 3 PERFORM ALTERAR
               WHEN OTHER    DISPLAY "OPCAO INVALIDA"
           END-EVALUATE.
```

Diferente do `switch` de outras linguagens, o `EVALUATE` executa **apenas o primeiro** `WHEN` verdadeiro e não precisa de `break`.

---

## Laços com PERFORM

O `PERFORM` é o comando de repetição e de chamada de blocos da linguagem.

### Repetir um número fixo de vezes

```cobol
           PERFORM 5 TIMES
               DISPLAY "LINHA"
           END-PERFORM.
```

### Repetir até uma condição

```cobol
           PERFORM UNTIL WS-CONTADOR > 10
               ADD 1 TO WS-CONTADOR
           END-PERFORM.
```

Por padrão, a condição é testada **antes** de cada repetição (`WITH TEST BEFORE`). Para testar depois, de modo que o bloco execute ao menos uma vez:

```cobol
           PERFORM WITH TEST AFTER UNTIL WS-OPCAO = 0
               PERFORM MOSTRA-MENU
           END-PERFORM.
```

### Repetir com contador

```cobol
           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 10
               ADD WS-I TO WS-SOMA
           END-PERFORM.
```

Equivale a `for (i = 1; i <= 10; i++)`.

### Executar um parágrafo

```cobol
           PERFORM CALCULA-TOTAL.
           PERFORM CALCULA-TOTAL 3 TIMES.
           PERFORM LE-REGISTRO UNTIL FIM-DADOS.
```

---

## Parágrafos e controle de fluxo

Um **parágrafo** é um bloco de código com nome, que começa na Área A. É a unidade básica de organização da `PROCEDURE DIVISION`:

```cobol
       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM INICIALIZA.
           PERFORM PROCESSA UNTIL FIM-DADOS.
           PERFORM FINALIZA.
           STOP RUN.

       INICIALIZA.
           DISPLAY "INICIO".

       PROCESSA.
           DISPLAY "PROCESSANDO".
           SET FIM-DADOS TO TRUE.

       FINALIZA.
           DISPLAY "FIM".
```

> **Atenção:** o fluxo "escorre" de um parágrafo para o seguinte quando não há desvio. Por isso o `STOP RUN` deve estar no fim do parágrafo principal, antes dos demais parágrafos.

### PERFORM THRU

`PERFORM A THRU B` executa do parágrafo `A` até o parágrafo `B`, inclusive. Por convenção, o último parágrafo do intervalo contém apenas `EXIT`:

```cobol
           PERFORM 100-PROCESSA THRU 100-PROCESSA-EXIT.

       100-PROCESSA.
           DISPLAY "PROCESSANDO".
       100-PROCESSA-EXIT.
           EXIT.
```

### GO TO

O `GO TO` desvia o fluxo sem retorno. Ele existe em muitos programas antigos, mas o estilo moderno o evita, porque dificulta a leitura. Prefira `PERFORM`, `EVALUATE` e laços estruturados.

### Encerramento

| Comando | Efeito |
|---|---|
| `STOP RUN` | Encerra o programa (e a unidade de execução inteira) |
| `GOBACK` | Retorna ao chamador; em programa principal, encerra |
| `EXIT PROGRAM` | Retorna ao chamador de um subprograma |

---

## Manipulação de texto

### STRING: concatenar

```cobol
           STRING WS-NOME DELIMITED BY SPACE
                  " "     DELIMITED BY SIZE
                  WS-SOBRENOME DELIMITED BY SPACE
                  INTO WS-COMPLETO
           END-STRING.
```

`DELIMITED BY SPACE` copia até o primeiro espaço; `DELIMITED BY SIZE` copia o campo inteiro. Limpe o destino antes (`MOVE SPACES TO WS-COMPLETO`), pois o `STRING` não preenche o restante.

### UNSTRING: separar

```cobol
           UNSTRING WS-LINHA DELIMITED BY ";"
               INTO WS-CODIGO WS-NOME WS-CIDADE
           END-UNSTRING.
```

### INSPECT: contar e substituir

```cobol
           INSPECT WS-TEXTO TALLYING WS-QTD FOR ALL "A".
           INSPECT WS-TEXTO REPLACING ALL "-" BY "/".
```

### Referência de modificação

Acessa uma parte de um campo, indicando a posição inicial e o tamanho:

```cobol
           MOVE WS-DATA(1:4) TO WS-ANO.
           MOVE WS-DATA(5:2) TO WS-MES.
```

### Funções intrínsecas

```cobol
           MOVE FUNCTION UPPER-CASE(WS-NOME) TO WS-NOME.
           COMPUTE WS-TAM = FUNCTION LENGTH(WS-NOME).
           MOVE FUNCTION CURRENT-DATE TO WS-DATA-HORA.
```

`CURRENT-DATE` retorna 21 caracteres: data e hora no formato `AAAAMMDDHHMMSScc` seguidas do deslocamento de fuso horário.

---

## Estrutura recomendada de programa

Um modelo simples que serve para a maior parte dos programas:

```cobol
       PROCEDURE DIVISION.
       0000-PRINCIPAL.
           PERFORM 1000-INICIALIZAR.
           PERFORM 2000-PROCESSAR UNTIL FIM-DADOS.
           PERFORM 3000-FINALIZAR.
           STOP RUN.

       1000-INICIALIZAR.
           ...
       2000-PROCESSAR.
           ...
       3000-FINALIZAR.
           ...
```

A numeração por centenas ou milhares reflete a hierarquia das rotinas e facilita localizar cada parágrafo.

---

## Erros comuns

- Esquecer o `END-IF` ou o `END-PERFORM` e deixar o escopo mal definido.
- Usar ponto final dentro de um `IF`, o que encerra o comando antes do esperado.
- Comparar campo numérico com texto, ou o contrário.
- Esquecer o `STOP RUN` e deixar o fluxo cair no parágrafo seguinte.
- Fazer um laço `PERFORM UNTIL` cuja condição nunca fica verdadeira (laço infinito).
- Usar `ADD A TO B` esperando que `A` mude, quando o resultado vai para `B`.
- Não tratar a divisão por zero com `ON SIZE ERROR`.

---

## Resumo

- `MOVE` copia valores e ajusta o tamanho em silêncio; `INITIALIZE` limpa campos.
- `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE` e `COMPUTE` fazem a aritmética; `ROUNDED` e `ON SIZE ERROR` controlam arredondamento e estouro.
- `IF` e `EVALUATE` tomam decisões; o nível `88` dá nomes legíveis às condições.
- `PERFORM` cobre laços e chamadas de parágrafos, em formas `TIMES`, `UNTIL` e `VARYING`.
- Parágrafos organizam o programa; `STOP RUN` deve encerrar o fluxo principal.
- `STRING`, `UNSTRING`, `INSPECT` e funções intrínsecas tratam textos.

---

## Próximos passos

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'programacao/cobol/estruturas-dados.html' | relative_url }}">
    <span class="wiki-topic-title">Próximo: Estruturas de Dados</span>
    <span class="wiki-topic-description">Grupos, PIC, OCCURS, REDEFINES e tabelas.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/exercicios.html' | relative_url }}">
    <span class="wiki-topic-title">Exercícios</span>
    <span class="wiki-topic-description">Pratique condições, laços e cálculos com exercícios progressivos.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/gnucobol.html' | relative_url }}">
    <span class="wiki-topic-title">Voltar para GnuCOBOL</span>
    <span class="wiki-topic-description">Revise instalação, compilação e execução.</span>
  </a>

</div>