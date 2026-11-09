# Tema claro Pangolim e alternância direta

Referência visual: `Z:\projetos-java\controle-financeiro\style.css`, bloco
`:root[data-tema="pangolim"]`. Esse repositório foi consultado somente para leitura.

| Origem no Controle Financeiro | Cor | Uso no portal |
| --- | --- | --- |
| `--fundo` | `#F2D98B` | Fundo da página |
| `--superficie` | `#FFF1C6` | Artigos, cards e tabelas |
| `--superficie-suave` | `#F8E5AB` | Barra lateral e código |
| `--primaria-suave` | `#F5D98F` | Hover, navegação ativa e citações |
| `--texto`, `--primaria-texto` | `#79502C` | Texto, links e foco |
| `--texto-secundario` | `#79552F` | Texto secundário, busca e comentários |
| `--texto-na-primaria` | `#35240F` | Títulos e ícone do botão |
| `--primaria`, `--acento` | `#C89A46` | Fundo do botão de tema |
| `--primaria-hover` | `#BB8C39` | Hover do botão de tema |
| `--borda` | `#D9BC73` | Separadores, cards e tabelas |
| `--borda-controle` | `#A17A39` | Busca e botão de tema |
| `--verde` | `#286443` | Funções no código |
| `--categoria-2` | `#4D688C` | Strings no código |
| `--categoria-3` | `#A64A35` | Palavras-chave no código |
| `--categoria-4` | `#805886` | Números e operadores no código |
| `--categoria-5` | `#3F6D6F` | Atributos no código |
| `--categoria-1` | `#8A5D15` | Acento de código |
| `--vermelho`, `--vermelho-suave` | `#A52E35`, `#FFE5DE` | Erro de cópia |
| `--sombra-cor` | `121 80 44` | Sombra marrom com opacidade |

O claro troca o cinza neutro por creme, amarelo queimado e marrom, mantendo
o layout, a tipografia e os componentes. O escuro mantém seus fundos, textos,
links e realce de sintaxe. O botão novo usa fundo transparente no escuro.

O dourado não é usado como texto sobre creme: texto e foco usam os marrons
da própria referência. Os testes verificam contraste mínimo de 4,5:1 para
textos e ícones do botão e 3:1 para as bordas dos controles sobre as superfícies.
Bordas decorativas usam a cor original mais suave, sem servir como único
indicador de controles ou estado.

## Comportamento

O botão `#tema`, no rodapé da barra lateral, alterna em um clique entre
`pangolim` e `pangolim-dark`. Continua visível na barra recolhida no desktop
e no celular. Sol e lua indicam a próxima ação; `aria-label` e `title` acompanham
o próximo tema. Enter e Espaço usam o comportamento nativo de `<button>`.
Sem JavaScript, o botão fica oculto e a navegação e o conteúdo continuam acessíveis.

O bootstrap inline no `<head>` aplica o tema antes do CSS. Uma preferência
válida em `localStorage.theme` tem prioridade. Sem escolha válida, usa
`prefers-color-scheme`, sem gravar uma preferência automática. Mudanças do
sistema são acompanhadas até o primeiro clique. Se o armazenamento estiver
bloqueado, a alternância funciona em memória. Recarregamento e navegação
recuperam a escolha salva quando o armazenamento está disponível.

`assets/js/theme.mjs` atualiza o botão e `meta[name="theme-color"]` e emite
`themechange`, preservando a atualização dos diagramas Mermaid. Busca, menu
e conteúdo não são recriados durante a alternância.

## Validação reproduzível

No PowerShell com `npm.ps1` bloqueado, use `npm.cmd`. Não é preciso mudar a
política de execução. Os comandos de build exigem destinos novos em `.tmp`.

```powershell
npm.cmd test
npm.cmd run check -- --write .tmp/tema-pangolim-root-20261109 --report .tmp/tema-pangolim-root-20261109.json
npm.cmd run check:baseurl -- --write .tmp/tema-pangolim-baseurl-20261109 --report .tmp/tema-pangolim-baseurl-20261109.json
npm.cmd run test:browser -- --site-dir .tmp/tema-pangolim-root-20261109 --artifact-dir .tmp/tema-pangolim-root-qa-20261109 --report .tmp/tema-pangolim-root-browser-final-20261109.json
npm.cmd run test:browser -- --site-dir .tmp/tema-pangolim-baseurl-20261109 --baseurl /portal --artifact-dir .tmp/tema-pangolim-baseurl-qa-20261109 --report .tmp/tema-pangolim-baseurl-browser-final-20261109.json
git diff --check
```

Os testes de navegador mantêm as regressões existentes e acrescentam preferência
inicial do sistema, prioridade da escolha salva, clique direto, Enter, Espaço,
árvore de acessibilidade e persistência entre artigos e recarregamentos.
Capturas e relatórios ficam em `.tmp`, fora do Git.

### Resultado em 09/11/2026

| Verificação | Resultado final |
| --- | --- |
| `npm test` | 23/23 testes passaram; nenhum ignorado |
| `npm run check` | 131 páginas, 21.539 referências, nenhum erro |
| `npm run check:baseurl` | Mesmos totais em `/portal`, nenhum erro |
| `npm run test:browser`, raiz | 20/20 cenários passaram |
| `npm run test:browser`, `/portal` | 20/20 cenários passaram |
| `git diff --check` | Sem erros |

Ambiente: Node 24.21.0, Ruby 3.2.11, Jekyll 3.10.0 e Chrome 156.0.8078.80.
As gems existentes satisfazem o lockfile; nenhuma dependência foi alterada.
O Ruby instalado difere do 3.3 recomendado no README, mas os testes passaram.

O menor contraste de texto secundário medido no claro foi 4,78:1; no escuro,
6,01:1. Os testes unitários também cobrem texto principal, títulos, links,
sintaxe, erro de cópia, ícones e bordas dos controles. Não foram encontradas
falhas de contraste nesses pares. As capturas finais de desktop e celular,
nos dois temas, foram inspecionadas após aguardar o fim das transições.

Na primeira execução concorrente, o teste existente de exclusão de `vendor`
excedeu seu limite de 60 segundos no subprocesso Ruby. Ele passou isoladamente
em 32,6 segundos e na repetição completa, sem mudar limites ou verificações.

O navegador sob sandbox iniciou, mas o CDP excedeu 20 segundos em `Page.enable`,
antes de carregar o portal. A mesma suíte fora do sandbox passou nas duas
origens, apontando uma limitação da execução restrita, não da página.
Em uma repetição houve encerramento nativo do Chrome com código `3221225477`
antes dos cenários; a execução seguinte passou. Nenhum teste foi desabilitado.
Não foi determinada a causa interna desse encerramento do Chrome.
As verificações de Mermaid usam módulo controlado e fallback de CDN;
a opção adicional `--live-mermaid` não foi executada.

## Base Git

Branch: `feat/tema-pangolim-claro`, criada de `origin/main` (`661d608`).
A `main` local tinha um commit exclusivo, com outro exclusivo no remoto.
Por autorização do mantenedor, a branch parte do remoto e a `main` local
permanece intacta, sem merge nem reescrita de histórico. Não há push,
Pull Request ou publicação nesta entrega.
