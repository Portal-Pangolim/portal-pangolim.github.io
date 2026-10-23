---
layout: default
description: "Referência para instalação de aplicativos executáveis no Windows e consulta de parâmetros do instalador."
title: Instalação de Aplicativos (.exe) no Windows
---

# Instalação de Aplicativos (.exe) no Windows
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## Objetivo

Procedimento padrão para instalação de aplicativos distribuídos em formato `.exe`.

---

## 1. Baixar o instalador

Baixar o arquivo `.exe` do site oficial do fabricante.

Exemplo:

```text
Downloads\programa.exe
```

---

## 2. Abrir PowerShell como Administrador

* Menu Iniciar
* Procurar por **PowerShell**
* Clicar em **Executar como Administrador**

---

## 3. Acessar a pasta do instalador

```powershell
cd $env:USERPROFILE\Downloads
```

Verificar o arquivo:

```powershell
dir *.exe
```

---

## 4. Executar o instalador

```powershell
.\programa.exe
```

ou

```powershell
Start-Process .\programa.exe -Verb RunAs
```

---

## 5. Concluir a instalação

Seguir o assistente:

* Next
* Accept License
* Install
* Finish

---

## 6. Validar a instalação

Verificar se o aplicativo foi instalado:

```powershell
Get-StartApps | findstr "nome"
```

ou pesquisar pelo programa no Menu Iniciar.

---

## 7. Executar o aplicativo

Abrir pelo Menu Iniciar ou executar diretamente:

```powershell
"C:\Program Files\Aplicativo\programa.exe"
```

---

## Exemplo

Instalação do Markdown Monster:

```powershell
cd $env:USERPROFILE\Downloads

Start-Process .\MarkdownMonsterSetup.exe -Verb RunAs
```

Após a instalação:

```text
Menu Iniciar → Markdown Monster
```

---

## Boas práticas

* Utilizar instaladores obtidos no site oficial.
* Executar sempre como Administrador.
* Manter os aplicativos atualizados.
* Preferir versões homologadas pela empresa quando aplicável.

