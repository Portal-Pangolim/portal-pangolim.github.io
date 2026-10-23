---
layout: default
description: "Estruturas de dados em COBOL: PIC, grupos, tabelas, OCCURS e REDEFINES com exemplos."
title: Estruturas de Dados em COBOL
---

<h1 class="page-title">
  <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="5" rx="8" ry="3"/>
    <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/>
    <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>
  </svg>
  Estruturas de Dados
</h1>

> Grupos de dados, cláusula `PIC`, tipos de armazenamento, campos editados, `OCCURS`, `REDEFINES`, tabelas e demais estruturas usadas em COBOL.

---

## Objetivos

Ao final desta seção, você deverá ser capaz de:

- Descrever dados com `PIC` e escolher o tipo de armazenamento (`USAGE`).
- Montar registros hierárquicos com níveis `01` a `49`.
- Formatar números para exibição com campos editados.
- Criar tabelas com `OCCURS` e percorrê-las por índice.
- Reaproveitar a mesma área de memória com `REDEFINES`.
- Usar nomes de condição (nível `88`) e `MOVE CORRESPONDING`.

---

## A cláusula PIC

A cláusula `PIC` (*picture*) descreve o tipo e o tamanho de um campo.

| Símbolo | Significado | Exemplo |
|---|---|---|
| `X` | Qualquer caractere (alfanumérico) | `PIC X(20)` |
| `A` | Somente letras e espaços | `PIC A(10)` |
| `9` | Dígito | `PIC 9(5)` |
| `S` | Sinal (positivo ou negativo) | `PIC S9(4)` |
| `V` | Vírgula decimal **implícita** | `PIC 9(5)V99` |
| `P` | Escala (casa decimal assumida, sem ocupar espaço) | `PIC 9(3)PP` |

Repetições podem ser escritas por extenso ou entre parênteses: `PIC 9(5)` é igual a `PIC 99999`.

O `V` e o `S` não ocupam posição própria no formato `DISPLAY`, de modo que `PIC S9(5)V99` armazena 7 dígitos. O sinal fica embutido no último dígito.

---

## USAGE: como o dado é armazenado

A cláusula `USAGE` define a representação interna do campo.

| Usage | Descrição | Uso típico |
|---|---|---|
| `DISPLAY` | Um caractere por dígito (padrão) | Dados que serão exibidos ou gravados em arquivo texto |
| `COMP` / `BINARY` | Binário | Contadores, índices, campos usados em cálculos |
| `COMP-3` / `PACKED-DECIMAL` | Decimal empacotado: 2 dígitos por byte, mais o sinal | Valores monetários e campos de arquivos de mainframe |
| `COMP-5` | Binário nativo da máquina, sem truncar pela `PIC` | Interface com outras linguagens |

```cobol
       01 WS-CONTADOR   PIC S9(4) COMP    VALUE ZEROS.
       01 WS-VALOR      PIC S9(7)V99 COMP-3 VALUE ZEROS.
       01 WS-TEXTO      PIC X(10)         VALUE SPACES.
```

### Tamanho em bytes

- `DISPLAY`: um byte por dígito.
- `COMP-3`: `(dígitos + 1) / 2`, arredondado para cima. `PIC S9(7)V99` (9 dígitos) ocupa 5 bytes.
- `COMP`: no estilo IBM, ocupa 2 bytes para até 4 dígitos, 4 bytes para 5 a 9 dígitos e 8 bytes para 10 a 18 dígitos. O GnuCOBOL pode usar tamanhos diferentes conforme o dialeto escolhido em `-std`.

> **Dica:** campos `COMP` e `COMP-3` não podem ser lidos como texto em um editor. Em mainframe, é comum encontrá-los em arquivos, e é essencial saber quanto espaço cada um ocupa para dimensionar registros.

---

## Níveis e grupos de dados

Os dados são organizados por **níveis**, que formam uma hierarquia. Um item que contém subitens é um **grupo**; um item sem subitens é um **item elementar**, e somente ele tem `PIC`.

```cobol
       01 WS-FUNCIONARIO.
          05 WS-MATRICULA     PIC 9(6).
          05 WS-NOME          PIC X(30).
          05 WS-ENDERECO.
             10 WS-RUA        PIC X(30).
             10 WS-NUMERO     PIC 9(5).
             10 WS-CIDADE     PIC X(20).
          05 WS-SALARIO       PIC 9(5)V99.
```

| Nível | Uso |
|---|---|
| `01` | Registro ou item independente (Área A) |
| `02` a `49` | Subitens de um grupo |
| `66` | `RENAMES` (uso raro) |
| `77` | Item elementar independente, que não faz parte de grupo |
| `88` | Nome de condição |

Um grupo é sempre tratado como **alfanumérico**, independentemente dos tipos de seus subitens. `MOVE WS-FUNCIONARIO TO OUTRO-REGISTRO` copia byte a byte.

### FILLER

`FILLER` reserva espaço sem precisar de nome. É comum em layouts de registros e linhas de relatório:

```cobol
       01 WS-LINHA.
          05 FILLER        PIC X(5)  VALUE "COD: ".
          05 WS-COD        PIC 9(4).
          05 FILLER        PIC X(3)  VALUE " - ".
          05 WS-DESC       PIC X(20).
```

### VALUE

Define o valor inicial na `WORKING-STORAGE SECTION`:

```cobol
       01 WS-TAXA       PIC 9V999   VALUE 0.075.
       01 WS-TITULO     PIC X(20)   VALUE "RELATORIO MENSAL".
       01 WS-ZERADO     PIC 9(5)    VALUE ZEROS.
       01 WS-VAZIO      PIC X(10)   VALUE SPACES.
```

Dentro de um grupo, `VALUE` é permitido apenas nos itens elementares.

---

## Campos editados

Um campo **editado** formata um valor numérico para impressão ou exibição. Ele não é usado em cálculos: o resultado é obtido com `MOVE` a partir de um campo numérico.

| Símbolo | Efeito |
|---|---|
| `Z` | Dígito, com zeros à esquerda trocados por espaço |
| `9` | Dígito sempre exibido |
| `*` | Zeros à esquerda trocados por asterisco |
| `.` `,` | Ponto e vírgula de inserção |
| `$` | Símbolo monetário |
| `-` `+` | Sinal |
| `CR` `DB` | Indicador de crédito ou débito, quando negativo |
| `B` | Espaço de inserção |
| `0` `/` | Zero ou barra de inserção |

```cobol
       01 WS-VALOR       PIC 9(5)V99 VALUE 1234.50.
       01 WS-ED1         PIC ZZ,ZZ9.99.
       01 WS-ED2         PIC **,**9.99.
       01 WS-ED3         PIC $ZZ,ZZ9.99.
       01 WS-ED4         PIC -ZZ,ZZ9.99.
```

| Campo | Resultado de `MOVE WS-VALOR` |
|---|---|
| `WS-ED1` | ` 1,234.50` |
| `WS-ED2` | `*1,234.50` |
| `WS-ED3` | `$ 1,234.50` |
| `WS-ED4` | `  1,234.50` (o sinal `-` só aparece se o valor for negativo) |

### Formato brasileiro

Por padrão, o ponto é o separador decimal. Para usar a **vírgula decimal** e o ponto como separador de milhar, declare na `CONFIGURATION SECTION`:

```cobol
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           DECIMAL-POINT IS COMMA.
```

Com isso, as pictures passam a usar a vírgula como separador decimal:

```cobol
       01 WS-VALOR       PIC 9(5)V99 VALUE 1234,50.
       01 WS-ED          PIC ZZ.ZZ9,99.
```

`MOVE WS-VALOR TO WS-ED` resulta em ` 1.234,50`. Nesse modo, literais decimais também usam vírgula.

### Outras cláusulas úteis

- `BLANK WHEN ZERO`: exibe o campo em branco quando o valor é zero.
- `JUSTIFIED RIGHT`: alinha um campo alfanumérico à direita.
- `SIGN IS LEADING SEPARATE`: coloca o sinal em uma posição própria, à esquerda.

---

## Nomes de condição (nível 88)

```cobol
       01 WS-TIPO-CONTA    PIC X.
          88 CONTA-CORRENTE  VALUE "C".
          88 CONTA-POUPANCA  VALUE "P".
          88 TIPO-VALIDO     VALUE "C" "P".

           IF TIPO-VALIDO
               DISPLAY "OK"
           END-IF.
           SET CONTA-POUPANCA TO TRUE.
```

Também aceita faixas: `88 ADULTO VALUE 18 THRU 120.`

---

## REDEFINES

`REDEFINES` permite que **dois ou mais campos ocupem a mesma área de memória**, vistos com descrições diferentes.

```cobol
       01 WS-DATA            PIC 9(8) VALUE 20261005.
       01 WS-DATA-R REDEFINES WS-DATA.
          05 WS-ANO          PIC 9(4).
          05 WS-MES          PIC 9(2).
          05 WS-DIA          PIC 9(2).
```

Aqui, `WS-DATA` e `WS-DATA-R` compartilham os mesmos 8 bytes. Ao ler `WS-ANO`, obtém-se `2026`; `WS-MES` vale `10` e `WS-DIA` vale `05`.

Regras principais:

- O `REDEFINES` deve vir logo após o item que ele redefine, no mesmo nível.
- O item redefinido não pode ter `OCCURS`.
- O `REDEFINES` não pode ter `VALUE`, exceto em itens de nível `88`.
- Fora do nível `01`, o item que redefine não pode ser maior que o item redefinido.

Um uso clássico é um registro com **layouts alternativos**, conforme um indicador de tipo:

```cobol
       01 WS-REGISTRO.
          05 WS-TIPO           PIC X.
          05 WS-DADOS          PIC X(30).
          05 WS-PESSOA REDEFINES WS-DADOS.
             10 WS-NOME        PIC X(30).
          05 WS-EMPRESA REDEFINES WS-DADOS.
             10 WS-RAZAO       PIC X(25).
             10 WS-UF          PIC X(2).
             10 FILLER         PIC X(3).
```

---

## OCCURS: tabelas

`OCCURS` repete um item ou grupo, criando uma **tabela** (*array*).

```cobol
       01 WS-TABELA-NOTAS.
          05 WS-NOTA     PIC 9(2)V9 OCCURS 5 TIMES.
```

O acesso é feito por **subscrito**, começando em **1** (e não em 0):

```cobol
           MOVE 8.5 TO WS-NOTA(1).
           MOVE 7.0 TO WS-NOTA(2).

           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 5
               ADD WS-NOTA(WS-I) TO WS-SOMA
           END-PERFORM.
```

### Tabela de grupos

```cobol
       01 WS-TAB-CLIENTES.
          05 WS-CLIENTE OCCURS 100 TIMES.
             10 WS-CLI-CODIGO   PIC 9(4).
             10 WS-CLI-NOME     PIC X(20).
             10 WS-CLI-SALDO    PIC S9(7)V99.

           MOVE 1234 TO WS-CLI-CODIGO(3).
           DISPLAY WS-CLI-NOME(3).
```

### Tabelas bidimensionais

```cobol
       01 WS-VENDAS.
          05 WS-MES OCCURS 12 TIMES.
             10 WS-REGIAO OCCURS 5 TIMES.
                15 WS-VALOR   PIC 9(7)V99.

           MOVE 1500.00 TO WS-VALOR(3, 2).
```

`WS-VALOR(3, 2)` é o valor da região 2 no mês 3.

### Carregando valores iniciais

Para tabelas pequenas e fixas, uma técnica comum é declarar os valores em um grupo e redefini-lo:

```cobol
       01 WS-MESES-DADOS.
          05 FILLER   PIC X(9) VALUE "JANEIRO  ".
          05 FILLER   PIC X(9) VALUE "FEVEREIRO".
          05 FILLER   PIC X(9) VALUE "MARCO    ".
       01 WS-TAB-MESES REDEFINES WS-MESES-DADOS.
          05 WS-NOME-MES   PIC X(9) OCCURS 3 TIMES.
```

### Índices e SEARCH

Para buscas, declare um **índice** com `INDEXED BY`. Índices são manipulados com `SET`:

```cobol
       01 WS-TABELA.
          05 WS-ITEM OCCURS 50 TIMES INDEXED BY IDX.
             10 WS-COD    PIC 9(4).
             10 WS-DESC   PIC X(20).

           SET IDX TO 1.
           SEARCH WS-ITEM
               AT END
                   DISPLAY "NAO ENCONTRADO"
               WHEN WS-COD(IDX) = WS-BUSCA
                   DISPLAY "ENCONTRADO: " WS-DESC(IDX)
           END-SEARCH.
```

O `SEARCH` percorre a tabela sequencialmente. Quando a tabela está **ordenada por chave**, use `SEARCH ALL`, que faz busca binária e é bem mais rápida:

```cobol
          05 WS-ITEM OCCURS 50 TIMES
                ASCENDING KEY IS WS-COD
                INDEXED BY IDX.

           SEARCH ALL WS-ITEM
               AT END DISPLAY "NAO ENCONTRADO"
               WHEN WS-COD(IDX) = WS-BUSCA
                   DISPLAY WS-DESC(IDX)
           END-SEARCH.
```

> **Atenção:** `SEARCH ALL` só funciona corretamente se a tabela estiver realmente ordenada pela chave declarada. Se não estiver, o resultado é imprevisível.

### Tabelas de tamanho variável

`OCCURS ... DEPENDING ON` permite que a quantidade efetiva de ocorrências varie em tempo de execução, dentro de um máximo declarado:

```cobol
       01 WS-QTD     PIC 9(3) VALUE ZEROS.
       01 WS-LISTA.
          05 WS-ELEM OCCURS 1 TO 100 TIMES DEPENDING ON WS-QTD
                     PIC 9(4).
```

> **Atenção:** o COBOL tradicional **não verifica** limites de tabela por padrão. Um subscrito fora da faixa acessa memória vizinha sem erro aparente. No GnuCOBOL, compile com `-debug` durante o estudo para detectar esse problema.

---

## MOVE CORRESPONDING

Copia, entre dois grupos, os subitens que têm **o mesmo nome**:

```cobol
       01 REG-ENTRADA.
          05 CODIGO    PIC 9(4).
          05 NOME      PIC X(20).
          05 SALDO     PIC 9(5)V99.
       01 REG-SAIDA.
          05 NOME      PIC X(20).
          05 CODIGO    PIC 9(4).

           MOVE CORRESPONDING REG-ENTRADA TO REG-SAIDA.
```

Somente `CODIGO` e `NOME` são copiados, cada um para o seu correspondente, independentemente da ordem. `SALDO` não existe no destino e é ignorado. Também existem `ADD CORRESPONDING` e `SUBTRACT CORRESPONDING`.

---

## Constantes figurativas

| Constante | Valor |
|---|---|
| `SPACE` / `SPACES` | Espaços |
| `ZERO` / `ZEROS` / `ZEROES` | Zeros |
| `HIGH-VALUE` / `HIGH-VALUES` | O maior valor da sequência de caracteres |
| `LOW-VALUE` / `LOW-VALUES` | O menor valor (bytes nulos) |
| `QUOTE` | Aspas |
| `ALL "x"` | Repete o literal `x` até preencher o campo |

```cobol
           MOVE ALL "*" TO WS-LINHA.
           MOVE HIGH-VALUES TO WS-CHAVE-ANTERIOR.
```

---

## Reutilizando definições com COPY

Em programas reais, as descrições de registros ficam em arquivos separados, os **copybooks**, e são incluídas com `COPY`:

```cobol
       WORKING-STORAGE SECTION.
           COPY CLIENTE.
```

O funcionamento detalhado está em [Modularização]({{ 'programacao/cobol/modularizacao.html' | relative_url }}).

---

## Erros comuns

- Atribuir `PIC` a um item de grupo.
- Usar `VALUE` em item redefinido ou em item com `OCCURS`.
- Começar o subscrito em 0 em vez de 1.
- Usar um campo editado em um cálculo.
- Esquecer o `S` em campos que podem ficar negativos, perdendo o sinal.
- Ordenar mal os níveis, como um `10` diretamente sob um `01`, o que é aceito mas confunde a leitura.
- Usar `SEARCH ALL` em tabela sem ordenação.
- Esquecer que um `MOVE` de grupo copia bytes, sem converter tipos.

---

## Resumo

- `PIC` define tipo e tamanho; `USAGE` define a representação interna (`DISPLAY`, `COMP`, `COMP-3`).
- Os níveis `01` a `49` formam hierarquias; só itens elementares têm `PIC`.
- Campos editados formatam valores para saída e não entram em cálculos.
- `REDEFINES` compartilha memória entre descrições diferentes.
- `OCCURS` cria tabelas, com subscritos a partir de 1; `INDEXED BY`, `SEARCH` e `SEARCH ALL` fazem buscas.
- `MOVE CORRESPONDING` copia itens de mesmo nome entre grupos.

---

## Próximos passos

<div class="wiki-topic-list">

  <a class="wiki-topic" href="{{ 'programacao/cobol/arquivos.html' | relative_url }}">
    <span class="wiki-topic-title">Próximo: Arquivos</span>
    <span class="wiki-topic-description">Arquivos sequenciais e indexados, leitura, escrita e FILE STATUS.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/exercicios.html' | relative_url }}">
    <span class="wiki-topic-title">Exercícios</span>
    <span class="wiki-topic-description">Pratique tabelas, grupos e campos editados.</span>
  </a>

  <a class="wiki-topic" href="{{ 'programacao/cobol/programacao.html' | relative_url }}">
    <span class="wiki-topic-title">Voltar para Programação</span>
    <span class="wiki-topic-description">Revise condições, laços e aritmética.</span>
  </a>

</div>