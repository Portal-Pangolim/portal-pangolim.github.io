import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('Jekyll e validador excluem vendor/bundle e preservam conteúdo legítimo', () => {
  fs.mkdirSync('.tmp', { recursive: true });
  const root = fs.mkdtempSync('.tmp/vendor-exclusion-');
  const write = (file, content) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  write('_config.yml', fs.readFileSync('_config.yml', 'utf8'));
  write('tools/validate.rb', fs.readFileSync('tools/validate.rb', 'utf8'));
  write('_layouts/default.html', '<html lang="pt-BR"><title>{{ page.title }}</title><main>{{ content }}</main></html>');
  const article = (title, description) => `---\nlayout: default\ntitle: ${title}\ndescription: ${description}\n---\n# ${title}\n`;
  write('index.md', article('Início', 'Página inicial da fixture') + '\n[Artigo](conteudo/legitimo.html#artigo)\n');
  write('conteudo/legitimo.md', article('Artigo', 'Conteúdo legítimo fora das dependências'));
  const dependency = 'vendor/bundle/ruby/3.3.0/gems/jekyll-3.10.0';
  write(`${dependency}/lib/site_template/_posts/0000-00-00-welcome-to-jekyll.markdown.erb`,
    "---\nlayout: post\ntitle: Welcome\ndate: <%= Time.now.strftime('%Y-%m-%d %H:%M:%S %z') %>\n---\nDependency template\n");
  write(`${dependency}/dependency-marker.txt`, 'This dependency must never be published.');

  // Caminhos e origem de homologação mudam; a lista de exclusões vem do projeto.
  write('build.yml', 'url: https://portal.example.test\nbaseurl: /portal\nrepository: Portal-Pangolim/portal-pangolim.github.io\n');
  write('build.rb', `require 'bundler/setup'
require 'jekyll'
Jekyll::PluginManager.require_from_bundler
site = Jekyll::Site.new(Jekyll.configuration(
  'config' => ['_config.yml', 'build.yml'], 'source' => Dir.pwd,
  'destination' => File.join(Dir.pwd, '.tmp', 'build'), 'incremental' => false
))
site.process
abort 'Dependências lidas pelo Jekyll' if (site.pages.map(&:path) + site.static_files.map(&:relative_path)).any? { |p| p.match?(%r{(?:\\A|/)vendor/}) }
`);
  const run = args => {
    const result = spawnSync('ruby', args, {
      cwd: root, encoding: 'utf8', timeout: 60000,
      env: { ...process.env, BUNDLE_GEMFILE: path.resolve('Gemfile'), BUNDLE_FROZEN: 'true', JEKYLL_ENV: 'production' }
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  };
  // Build normal: não recebe a lista extra de exclusões do validador.
  run(['build.rb']);
  assert.equal(fs.existsSync(path.join(root, '.tmp/build/vendor')), false);
  assert.equal(fs.existsSync(path.join(root, '.tmp/build/conteudo/legitimo.html')), true);
  // Validador: verifica a mesma exclusão na raiz e com caminho-base alternativo.
  for (const [suffix, baseurl] of [['root', ''], ['baseurl', '/portal']]) {
    run(['tools/validate.rb', '--baseurl', baseurl, '--write', `.tmp/site-${suffix}`, '--report', `.tmp/report-${suffix}.json`]);
    const report = JSON.parse(fs.readFileSync(path.join(root, `.tmp/report-${suffix}.json`), 'utf8'));
    assert.equal(report.passed, true);
    assert.equal(report.rendered_html, 2);
    assert.equal(fs.existsSync(path.join(root, `.tmp/site-${suffix}/vendor`)), false);
    assert.equal(fs.existsSync(path.join(root, `.tmp/site-${suffix}/conteudo/legitimo.html`)), true);
  }
});
