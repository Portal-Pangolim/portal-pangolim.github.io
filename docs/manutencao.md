# Manutenção do Portal Pangolim

## Arquitetura e arquivos ativos

O portal usa Markdown com front matter, Liquid, Kramdown e Jekyll 3.10 via `github-pages` 232. `_layouts/default.html` mantém o head e a navegação compartilhada; `_includes/logo.html` fornece a marca. `assets/css/themes.css` define cores e `style.css` define layout. Os módulos em `assets/js/` cuidam da interface, da busca e dos diagramas. A busca filtra os rótulos do menu; não pesquisa o texto dos artigos.

O Mermaid só é importado quando existe um bloco `mermaid`. A versão está fixada em `diagrams.mjs`, com modo `strict`, fonte textual e tratamento de falhas. Atualizações devem ser deliberadas e repetir os testes dos 23 diagramas. O CDN é uma dependência externa de execução; a versão fixa não equivale a verificação de integridade criptográfica de todos os módulos transitivos.

O layout ativo está em `_layouts/default.html`. Backups e relatórios antigos não integram este projeto. `docs/stylesheets/extra.css` foi preservado como recurso de documentação; não é carregado pelo portal. Gere sempre uma build nova em `.tmp`, sem reutilizar artefatos anteriores.

## Requisitos e dependências

O alvo preparado é Ruby **3.3**, Bundler **4.0.21** e Node **24** (mínimo 22 declarado no pacote). `.ruby-version` fixa a série 3.3; o patch deve ser registrado no relatório de cada execução. O lock contempla Windows `x64-mingw-ucrt` e Linux `x86_64-linux`. A inclusão Linux preservou as versões de todas as gems.

O runtime recomendado é Ruby 3.3. Resultados locais precisam registrar a versão efetivamente utilizada; não equivalem à validação remota da matriz Linux/Windows do novo repositório. As dependências da versão migrada foram preservadas.

Em uma estação com o runtime instalado:

```sh
gem install bundler -v 4.0.21
bundle install --frozen
bundle check
node --version
```

Não há dependências npm para instalar. Não execute atualização global de gems para resolver um erro de build. Primeiro confira Ruby, plataforma do lock e mensagem do Bundler. Atualizações do lock precisam preservar as versões não relacionadas e passar por validação nas plataformas afetadas.

## Renderização e testes locais

Na raiz do repositório:

```sh
npm test
npm run check
npm run check:baseurl
ruby tools/validate.rb --write .tmp/validation-site --report .tmp/validation.json
ruby tools/validate.rb --baseurl /portal --write .tmp/validation-baseurl-site --report .tmp/baseurl.json
npm run test:browser
```

No PowerShell, use `npm.cmd` se a política de execução bloquear `npm.ps1`. O validador não acessa a rede, usa uma origem fictícia de teste, não limpa `_site` e só grava em um destino **novo** dentro de `.tmp`. Em repetições, escolha outro nome e ajuste `SITE_DIR`; não apague artefatos anteriores para obter um teste positivo. `--baseline` registra falhas e retorna sucesso para inventário: **não use essa opção como gate de CI**. Confira `passed` e o código de saída da validação normal.

Os testes unitários incluem fixtures que confirmam rejeição de um link ausente, um fragmento ausente e uma descrição ausente. As fixtures são temporárias e preservadas em `.tmp`. Os testes editoriais impedem regressões conhecidas de Cntlm, NFS e Kubernetes, mas não provam que os procedimentos funcionam em infraestrutura real.

O navegador é Chrome ou Chromium headless instalado localmente, via CDP e servidor HTTP em loopback. `CHROME_PATH` permite indicar o executável. O helper original também reconhece Edge no Windows. A suíte bloqueia rede externa por padrão; simula CDN lento, indisponível e resposta controlada. Para testar a biblioteca real, autorize acesso ao CDN e execute:

```sh
node tools/browser-test.mjs --live-mermaid
```

Para `/portal`, no PowerShell:

```powershell
$env:SITE_DIR = '.tmp/validation-baseurl-site'
$env:TEST_BASEURL = '/portal'
$env:BROWSER_REPORT = '.tmp/browser-baseurl-report.json'
npm.cmd run test:browser
```

No shell Linux, use `SITE_DIR=.tmp/validation-baseurl-site TEST_BASEURL=/portal npm run test:browser`. O teste deve falhar se não houver navegador; uma ausência não conta como aprovação. Ambientes isolados podem exigir autorização para iniciar o navegador fora do sandbox. Os perfis criados ficam em `.tmp`, nunca no perfil pessoal.

Para uma build Jekyll completa, use uma pasta nova e configuração de homologação:

```sh
bundle exec jekyll build --config _config.yml,CONFIG_HOMOLOGACAO.yml --destination .tmp/build-novo
```

Forneça `url`, `baseurl` e `repository` na configuração de homologação. A origem fictícia usada pelo validador não deve chegar à produção. Os scripts, testes, `.tmp`, dependências npm, README, CONTRIBUTING e `docs/` estão excluídos do artefato público.

## Conteúdo, URLs e metadados

Preserve os caminhos existentes: `pasta/artigo.md` gera `pasta/artigo.html`; `pasta/index.md` gera `pasta/index.html`, também servido como `pasta/`. Não renomeie artigos publicados sem avaliar aliases ou redirecionamento. Use `relative_url` para caminhos do site, por exemplo `{{ '/devops/git/guia-pratico.html' | relative_url }}`. A tag `link` pode validar a existência do fonte, mas no Jekyll 3 seu resultado ainda precisa do tratamento correto de `baseurl`.

Todo artigo deve ter `layout: default`, `title` específico e `description` útil e exclusiva. Use um H1 para o assunto e níveis inferiores para seções. `heading_examples: true` é uma exceção editorial explícita para o guia que demonstra títulos Markdown; não a use para esconder outline defeituoso.

Confira IDs na saída Kramdown, inclusive acentos. Preserve âncoras conhecidas; aliases discretos podem manter fragmentos antigos sem mudar o título. O sumário automático evita divergências. O validador verifica destinos de links, imagens, scripts e estilos, além de fragmentos, IDs duplicados e metadados.

Conteúdo sem procedimento recebe `status: planned`, descrição honesta e aviso visível. Não crie artigos vazios para satisfazer links. Cards de capítulos inexistentes devem indicar planejamento sem link funcional. `status: historical` identifica um registro antigo; `validation: pending-lab` identifica procedimentos ainda não homologados. Essas marcas não substituem avisos no texto e nos índices.

O rodapé informa a **geração da página**, não uma revisão técnica. Só use `last_reviewed` quando houve revisão editorial verificável. Não preencha essa data com a data da build.

## Acessibilidade e segurança editorial

Repita busca em sequência, limpeza, ausência de resultados, mouse, Tab, Enter, Space e Escape. Verifique imagens em 320, 375 e 768 pixels, zoom/reflow, modo claro/escuro, preferência de movimento reduzido e fallback sem JavaScript. Meça contraste sobre fundos realmente usados. Testes de contraste, estado ARIA e árvore de acessibilidade complementam, mas não substituem, leitor de tela e avaliação manual WCAG.

Nunca execute procedimentos dos artigos contra infraestrutura real para validar uma alteração editorial. Defina laboratório descartável, versões exatas, critérios de aceitação e negação e recuperação. Hashes de autenticação são segredos. Exemplos de ACL e firewall precisam delimitar clientes e interfaces. Em NFS, `rw` não substitui UID/GID e permissões; preserve `root_squash`.

Não suponha que todo IP privado seja um segredo ou um exemplo fictício. Os cenários DNS/BIND/NFS usam exemplos de documentação; os testes conferem sua consistência, avisos e placeholders sem inventários de valores reais ou fingerprints. A captura operacional não integra a versão atual. Valores incertos e novas imagens exigem revisão humana privada antes de publicação. A migração não elimina históricos externos.

## CI, publicação e recuperação

`.github/workflows/quality.yml` executa validações em Pull Requests ou por acionamento manual, com permissões de leitura. Não contém job de deploy. Resultados locais não demonstram que esse workflow passou no GitHub.

Identidade: organização `Portal-Pangolim`, repositório `portal-pangolim.github.io`, endereço planejado `https://portal-pangolim.github.io/`. `_config.yml` define `url`, `baseurl: ""` e `repository`. Canonical, Open Graph e sitemap devem refletir essa origem na build final. O tutorial genérico Jekyll não substitui um runbook de publicação autorizado. Execute `ruby tools/prepublish.rb` e inspecione o artefato final.

Publicação requer: confirmação do ambiente e sua configuração; build limpa no runtime suportado; validações aprovadas; revisão humana dos dados incertos; homologação dos procedimentos de risco; inspeção de HTTPS, redirecionamentos e cabeçalhos no ambiente autorizado. A missão de correção não alterou hospedagem, permissões remotas ou método de deploy.

Antes de publicar, guarde o artefato anterior, commit de origem, configuração e resultados dos testes em armazenamento apropriado, sem credenciais. Ensaie a restauração em um destino de homologação. Em incidente, restaure o artefato conhecido ou reverta o commit pelo processo revisado do projeto, gere novamente e repita os testes. Não use `git reset`, `git clean` ou remoção de dados do mantenedor como procedimento de recuperação. A recuperação remota deverá ser planejada quando a publicação for configurada.

## Preparação do novo GitHub Pages

O repositório foi criado privado e vazio. A consulta administrativa de leitura identificou o plano Free e nenhum Pages configurado. Segundo a [documentação oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), Pages em repositórios privados depende de plano elegível; no Free, a disponibilidade exige repositório público. Não altere plano ou visibilidade automaticamente.

Após autorização, envie o commit inicial, execute manualmente o workflow de qualidade na main e confirme seus resultados. Defina a visibilidade e elegibilidade; depois configure explicitamente uma origem suportada para Pages (por exemplo, main na raiz, se aprovada). A migração não escolhe ou habilita uma origem remota. Homologue HTTPS, canonical, sitemap, links, busca, temas, diagramas e ausência de arquivos privados no novo endereço.
