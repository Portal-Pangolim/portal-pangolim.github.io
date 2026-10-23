import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const read = file => fs.readFileSync(file, 'utf8');
const dnsFile = 'linux/redes/configuracaodns.md';
const nfsFiles = ['servidor-nfs-rocky-linux-9.md', 'cliente-nfs-rocky-linux-9.md',
  'cliente-nfs-windows-10-11.md', 'troubleshooting-nfs.md']
  .map(p => 'linux/armazenamento/nfs/' + p);
const watchguard = 'watchguard/watchguardndrcollectionagent.md';
const bindFiles = ['redes/dns/bindencaminhamento.md', 'redes/dns/bind-encaminhamentodns.md'];

function tableAddress(text, label) {
  const row = text.split('\n').find(line => line.replaceAll('`', '').split('|')[1]?.trim() === label);
  assert.ok(row, 'Papel ausente na tabela do exemplo');
  return row.replaceAll('`', '').split('|')[2].trim();
}
function verifyBindings(text, expected) {
  for (const [label, address] of Object.entries(expected)) {
    assert.ok(tableAddress(text, label) === address, 'Associacao inconsistente no exemplo ficticio');
  }
}

test('fixtures sinteticas detectam troca de papeis', () => {
  const fixture = '| Host | IP |\n| dns.example.com | 192.0.2.22 |\n| cliente.example.com | 192.0.2.24 |';
  const expected = {'dns.example.com': '192.0.2.22', 'cliente.example.com': '192.0.2.24'};
  verifyBindings(fixture, expected);
  assert.throws(() => verifyBindings(fixture.replace('192.0.2.22', '192.0.2.25'), expected));
  assert.throws(() => verifyBindings('| Host | IP |', expected));
});

test('DNS: tabela, encaminhadores, zona e registros usam o mesmo cenario ficticio', () => {
  const text = read(dnsFile);
  verifyBindings(text, {'dns-server': '192.0.2.22', 'rocky-lab': '192.0.2.24',
    Gateway: '192.0.2.254', 'DNS corporativo 1': '198.51.100.34',
    'DNS corporativo 2': '198.51.100.23', 'DNS corporativo 3': '198.51.100.3',
    'Proxy/Squid': '192.0.2.57:3128'});
  const blocks = [...text.matchAll(/```conf\s*\n([\s\S]*?)```/g)].map(m => m[1]);
  const config = blocks.find(b => /options\s*\{/.test(b));
  assert.ok(config, 'Configuracao BIND ausente');
  assert.ok(/listen-on port 53\s*\{\s*127\.0\.0\.1;\s*192\.0\.2\.22;\s*\}/.test(config), 'Escuta DNS inconsistente');
  assert.ok(config.includes('forward only;'), 'Politica de encaminhamento ausente');
  for (const block of blocks.filter(b => /forwarders\s*\{/.test(b))) {
    const entries = block.match(/forwarders\s*\{([^}]+)\}/)[1].match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
    assert.ok(JSON.stringify(entries) === JSON.stringify(['198.51.100.34', '198.51.100.23', '198.51.100.3']),
      'Encaminhadores fora do cenario ficticio');
  }
  assert.ok(config.includes('zone "lab.example.com"'), 'Zona ficticia ausente');
  assert.ok(config.includes('file "lab.example.com.zone"'), 'Arquivo da zona inconsistente');
  const zone = text.match(/```dns\s*\n([\s\S]*?)```/)?.[1];
  assert.ok(zone, 'Zona de exemplo ausente');
  for (const pattern of [/SOA\s+dns-server\.lab\.example\.com\.\s+root\.lab\.example\.com\./,
    /NS\s+dns-server\.lab\.example\.com\./, /dns-server\s+IN\s+A\s+192\.0\.2\.22\b/,
    /rocky-lab\s+IN\s+A\s+192\.0\.2\.24\b/]) {
    assert.ok(pattern.test(zone), 'Registro inconsistente na zona ficticia');
  }
});

test('NFS: servidor, clientes e exports mantem as associacoes documentadas', () => {
  for (const file of nfsFiles) {
    const text = read(file);
    verifyBindings(text, {'Servidor NFS': '192.0.2.16'});
    const ips = [...new Set(text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g))];
    assert.ok(ips.every(ip => ['192.0.2.0', '192.0.2.16', '192.0.2.24', '192.0.2.57'].includes(ip)),
      'Endereco fora da topologia ficticia NFS');
  }
  verifyBindings(read(nfsFiles[1]), {'Cliente Rocky Linux': '192.0.2.24'});
  verifyBindings(read(nfsFiles[2]), {'Cliente Windows': '192.0.2.57'});
  verifyBindings(read(nfsFiles[3]), {'Cliente Linux': '192.0.2.24', 'Cliente Windows': '192.0.2.57'});
  assert.ok(read(nfsFiles[0]).includes('/dados 192.0.2.0/24(rw,sync,root_squash,no_subtree_check)'),
    'Export NFS inconsistente');
});

test('avisos e placeholders explicitam os limites dos exemplos publicados', () => {
  for (const file of [dnsFile, ...nfsFiles, ...bindFiles, 'redes/portaseprotocolos.md']) {
    const text = read(file);
    assert.ok(text.includes('**Exemplo fictício:**'), 'Aviso editorial ausente');
    assert.ok(text.includes('laboratório'), 'Orientacao de laboratorio ausente');
  }
  for (const value of ['dns-1.example.com', 'dns-2.example.com', '203.0.113.10', '203.0.113.11']) {
    assert.ok(read(bindFiles[0]).includes(value), 'Exemplo reservado BIND ausente');
  }
  const text = read(watchguard);
  assert.ok(text.includes('ssh root@collector.example.com'), 'Host ficticio ausente');
  assert.ok(text.includes('<ARQUIVO-DIAGNOSTICO>.lzo'), 'Placeholder ausente');
  assert.ok(text.includes('SAIDA ILUSTRATIVA'), 'Aviso da saida ausente');
  const zabbix = read('monitoramento/instalacao-zabbix-server.md');
  assert.equal((zabbix.match(/SUBSTITUA_POR_SENHA_PROPRIA/g) || []).length, 3);
  assert.ok(zabbix.includes('primeiro acesso'), 'Orientacao de primeiro acesso ausente');
});

test('captura retirada ausente da arvore e de referencias editoriais ativas', () => {
  assert.equal(fs.existsSync('images/collector.png'), false);
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      if (['.git', '.tmp', 'vendor', 'node_modules', '_site', 'docs', 'test', 'tools'].includes(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (/\.(md|html|yml|css|mjs|js)$/.test(entry.name)) {
        assert.ok(!read(file).includes('collector.png'), 'Referencia ativa a captura retirada');
      }
    }
  }
  inspect('.');
});

test('build real exclui a captura retirada e documentos privados de manutencao', () => {
  fs.mkdirSync('.tmp', {recursive: true});
  const root = fs.mkdtempSync('.tmp/editorial-build-');
  const site = path.join(root, 'site');
  const result = spawnSync('ruby', ['tools/validate.rb', '--write', site], {
    encoding: 'utf8', timeout: 180000
  });
  assert.ok(!result.error, 'Build editorial nao finalizou');
  assert.ok(result.status === 0, 'Build editorial falhou; revisar localmente sem publicar valores');
  assert.equal(fs.existsSync(path.join(site, 'images/collector.png')), false);
  assert.equal(fs.existsSync(path.join(site, 'docs')), false);
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (entry.name.endsWith('.html')) assert.ok(!read(file).includes('collector.png'), 'Captura referenciada no HTML');
    }
  }
  inspect(site);
});
