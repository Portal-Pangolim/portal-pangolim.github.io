import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { normalize } from '../assets/js/search.mjs';

fs.mkdirSync('.tmp',{recursive:true});

test('Busca normaliza acentos, caixa, espaços e Unicode decomposto',()=>{
 assert.equal(normalize('  CONFIGURAÇÃO '),'configuracao');
 assert.equal(normalize('Revisa\u0303o'),'revisao');
 assert.equal(normalize(''),'');
});

test('Todos os módulos JavaScript e o script inicial têm sintaxe válida',()=>{
 for(const dir of ['assets/js','tools','test']) for(const file of fs.readdirSync(dir)) {
  if(!file.endsWith('.mjs'))continue;
  const result=spawnSync(process.execPath,['--check',path.join(dir,file)],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
 }
 const layout=fs.readFileSync('_layouts/default.html','utf8');
 for(const block of layout.matchAll(/<script>([\s\S]*?)<\/script>/g)) assert.doesNotThrow(()=>new Function(block[1]));
});

test('Contrato editorial Cntlm: listeners delimitados, ACL em ordem e firewall restrito',()=>{
 const text=fs.readFileSync('windows/windowsproxyparalinux.md','utf8');
 assert.doesNotMatch(text,/Listen\s+0\.0\.0\.0/);
 assert.match(text,/Allow\s+127\.0\.0\.1\/32[\s\S]*Allow\s+192\.168\.56\.10\/32[\s\S]*Deny\s+0\/0/);
 for(const ini of text.matchAll(/```ini\s*\n([\s\S]*?)```/g)) assert.doesNotMatch(ini[1],/^Pass(?:LM|NT)\s/m);
 const firewall=text.match(/New-NetFirewallRule[\s\S]*?```/)[0];
 for(const option of ['LocalAddress','RemoteAddress','InterfaceAlias','Profile'])assert.ok(firewall.includes('-'+option));
 assert.match(text,/hash continua sendo um segredo/);
 assert.match(text,/laboratório/);
});

test('Contrato editorial NFS: permissões por identidade e root_squash',()=>{
 const server=fs.readFileSync('linux/armazenamento/nfs/servidor-nfs-rocky-linux-9.md','utf8');
 assert.match(server,/chmod 2770/); assert.match(server,/chgrp equipe_nfs/);
 assert.match(server,/UID\/GID/); assert.match(server,/rw,sync,root_squash/);
 for(const block of server.matchAll(/```(?:bash|text)\s*\n([\s\S]*?)```/g)) {
  assert.doesNotMatch(block[1],/chmod\s+(?:-R\s+)?777|no_root_squash/);
 }
});

test('Conteúdo histórico Kubernetes não se apresenta como instalação suportada',()=>{
 const old=fs.readFileSync('devops/kubernetes/tutorial-kubernetes-rocky-linux.md','utf8');
 assert.match(old,/status: historical/); assert.match(old,/não usar para novas instalações/);
 assert.match(old,/2025/); assert.doesNotMatch(old,/Ajuste `v1\.31` para/);
 const newer=fs.readFileSync('devops/kubernetes/instalacao-cluster-rocky-containerd-calico.md','utf8');
 assert.match(newer,/validation: pending-lab/);assert.match(newer,/containerd 1\.x e 2\.x/);
});

test('Exemplos curl do artigo de pentest não contêm sintaxe de link Markdown',()=>{
 const text=fs.readFileSync('redes/nmap/pentest-e-operacoes-ofensivas.md','utf8');
 assert.doesNotMatch(text,/curl[^\n]*\]\(/);
 assert.equal((text.match(/curl -I "https:\/\/app\.exemplo\.local"/g)||[]).length,2);
});

test('Publicação local rejeita configuração sem origem e origens de teste',()=>{
 assert.equal(spawnSync('ruby',['tools/prepublish.rb'],{encoding:'utf8'}).status,0);
 const root=fs.mkdtempSync('.tmp/prepublish-');
 const config=path.join(root,'config.yml');
 fs.writeFileSync(config,'baseurl: \"\"\n');
 const absent=spawnSync('ruby',['tools/prepublish.rb',config],{encoding:'utf8'});
 assert.equal(absent.status,1);assert.match(absent.stderr,/Publicação bloqueada/);
 fs.writeFileSync(config,'url: https://portal.example.test\nbaseurl: /portal\n');
 assert.equal(spawnSync('ruby',['tools/prepublish.rb',config],{encoding:'utf8'}).status,1);
});

test('Configuração exclui diretórios de manutenção sem barra final',()=>{
 const config=fs.readFileSync('_config.yml','utf8');
 for(const name of ['docs','tools','test','.tmp','node_modules']) {
  assert.ok(config.split(/\r?\n/).includes('  - '+name),name);
 }
});

test('O validador rejeita regressões reais de links, fragmentos e metadados',()=>{
 fs.mkdirSync('.tmp',{recursive:true});
 const root=fs.mkdtempSync('.tmp/validator-fixture-');
 fs.mkdirSync(path.join(root,'tools'));
 fs.mkdirSync(path.join(root,'_layouts'));
 fs.copyFileSync('tools/validate.rb',path.join(root,'tools/validate.rb'));
 fs.writeFileSync(path.join(root,'_config.yml'),'title: Fixture\nexclude: [tools, .tmp]\n');
 fs.writeFileSync(path.join(root,'_layouts/default.html'),'<html lang="pt-BR"><title>{{ page.title }}</title><main>{{ content }}</main></html>');
 const base='---\nlayout: default\ntitle: Fixture\ndescription: Descrição de teste\n---\n# Título\n\n';
 const check=body=>{
  fs.writeFileSync(path.join(root,'index.md'),body);
  const r=spawnSync('ruby',[path.join(root,'tools/validate.rb'),'--report','.tmp/result-'+Date.now()+'.json'],{encoding:'utf8',timeout:60000,env:{...process.env,BUNDLE_GEMFILE:path.resolve('Gemfile')}});
  assert.ifError(r.error); return r;
 };
 assert.equal(check(base+'[Válido](#título)').status,0);
 const link=check(base+'[Ausente](inexistente.html)');assert.equal(link.status,1);assert.match(link.stderr,/missing_target/);
 const fragment=check(base+'[Ausente](#inexistente)');assert.equal(fragment.status,1);assert.match(fragment.stderr,/missing_fragment/);
 const meta=check(base.replace('description: Descrição de teste\n',''));assert.equal(meta.status,1);assert.match(meta.stderr,/front_matter/);
});
