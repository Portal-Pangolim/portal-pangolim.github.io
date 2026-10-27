# Portal Pangolim

Base pública de conhecimento sobre Linux, DevOps, Kubernetes, redes, segurança,
monitoramento e infraestrutura. Mantido pela organização **Portal-Pangolim**.

* Repositório: https://github.com/Portal-Pangolim/portal-pangolim.github.io
* Endereço oficial: https://portal-pangolim.github.io/
* Portal publicado no GitHub Pages.

## Desenvolvimento local

Use Ruby 3.3, Bundler 4.0.21 e Node.js 24. As versões de gems estão em
`Gemfile.lock`; não há dependências npm para instalar.

```sh
git clone https://github.com/Portal-Pangolim/portal-pangolim.github.io.git
cd portal-pangolim.github.io
gem install bundler -v 4.0.21
bundle install --frozen
bundle check
npm test
npm run check
npm run check:baseurl
```

Para renderizar e testar em navegador, use destinos novos:

```sh
ruby tools/validate.rb --url https://portal-pangolim.github.io --write .tmp/validation-site --report .tmp/validation.json
npm run test:browser
ruby tools/prepublish.rb
```

O validador usa uma origem fictícia por padrão. `prepublish.rb` confere a sintaxe
da configuração, mas não autoriza publicação nem confirma o funcionamento remoto.
Consulte o [guia de manutenção](docs/manutencao.md) para `/portal`, Chrome,
diagramas, segurança editorial e revisão dos artefatos.

## Estrutura

```text
portal-pangolim.github.io/
  _config.yml             identidade, URLs e exclusões Jekyll
  _layouts/ e _includes/  estrutura e navegação compartilhadas
  assets/css/             layout e temas
  assets/js/              busca lateral, controles e Mermaid condicional
  images/                 marca e ícones
  devops/ linux/ redes/    documentação técnica por área
  monitoramento/ nutanix/ squid/ vmware/ watchguard/ windows/
  programacao/ troubleshooting/
  docs/                   manutenção e padrão editorial
  test/ e tools/          regressões, Chrome e validação Ruby
  .github/workflows/      qualidade em Linux e Windows
```

## Qualidade e publicação

O workflow de qualidade executa em Pull Requests ou por acionamento manual, com
permissões de leitura. Esse workflow não realiza deploy; o portal está publicado
no GitHub Pages.

O portal está publicado como site de organização na raiz, com `baseurl: ""`.
Alterações na configuração ou na origem de publicação exigem autorização.
Não enviar `.tmp`, `_site`, dependências instaladas, logs ou backups.
Conteúdo histórico fora deste novo repositório não é eliminado pela migração.

Para contribuir, consulte [CONTRIBUTING.md](CONTRIBUTING.md) e o
[padrão de documentação](docs/padrao-de-documentacao.md).
