---
layout: default
description: "Procedimento de instalação no Windows usando um diretório temporário e acompanhamento do instalador."
title: Instalação de Aplicativos (.exe) via C:\Temp
---

# Instalação de Aplicativos (.exe) via C:\Temp
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Objetivo

Instalar aplicativos quando a execução direta pela pasta **Downloads** apresentar erro de acesso.

## Procedimento

1. Abrir o **PowerShell como Administrador**.

2. Criar a pasta temporária:

```powershell
mkdir C:\Temp -ErrorAction SilentlyContinue
```

3. Copiar o instalador para `C:\Temp`:

```powershell
copy ".\Downloads\programa.exe" C:\Temp\
```

4. Executar o instalador:

```powershell
C:\Temp\programa.exe
```

ou

```powershell
Start-Process "C:\Temp\programa.exe" -Verb RunAs
```

5. Concluir a instalação normalmente pelo assistente.

## Exemplo

```powershell
mkdir C:\Temp -ErrorAction SilentlyContinue

copy ".\Downloads\VSCodeUserSetup-x64-1.124.0.exe" C:\Temp\

C:\Temp\VSCodeUserSetup-x64-1.124.0.exe
```

## Observação

Caso um instalador apresente **"Acesso negado"** ao ser executado pela pasta Downloads, copiar o arquivo para `C:\Temp` e executá-lo a partir dessa pasta pode resolver o problema.
