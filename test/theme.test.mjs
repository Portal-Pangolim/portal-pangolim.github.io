import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { initializeTheme } from '../assets/js/theme.mjs';

const layout = fs.readFileSync('_layouts/default.html', 'utf8');
const bootstrap = layout.match(/<script>([\s\S]*?)<\/script>/)[1];

function fixture({ saved = null, dark = false, blocked = false } = {}) {
  const values = new Map(saved ? [['theme', saved]] : []);
  const storage = {
    getItem(key) { if (blocked) throw Error('bloqueado'); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error('bloqueado'); values.set(key, value); }
  };
  const button = new EventTarget();
  const attributes = new Map();
  button.setAttribute = (key, value) => attributes.set(key, value);
  const system = new EventTarget();
  system.matches = dark;
  const meta = {};
  const document = new EventTarget();
  document.documentElement = { dataset: { theme: 'pangolim' } };
  document.getElementById = id => { assert.equal(id, 'tema'); return button; };
  document.querySelector = () => meta;
  const window = { localStorage: storage, matchMedia: () => system, Event,
    getComputedStyle: () => ({ getPropertyValue: () => document.documentElement.dataset.theme === 'pangolim-dark' ? '#191919' : '#F2D98B' }) };
  vm.runInNewContext(bootstrap, { document, window, localStorage: storage });
  return { document, window, button, attributes, meta, values, system };
}

test('Bootstrap aplica sistema antes do CSS, sem gravar preferência automática', () => {
  assert.ok(layout.indexOf(bootstrap) < layout.indexOf('rel="stylesheet"'));
  for (const dark of [false, true]) for (const saved of [null, 'invalido']) {
    const f = fixture({ dark, saved });
    assert.equal(f.document.documentElement.dataset.theme, dark ? 'pangolim-dark' : 'pangolim');
    assert.equal(f.meta.content, dark ? '#191919' : '#F2D98B');
    assert.equal(f.values.get('theme'), saved ?? undefined);
  }
});

test('Preferência salva tem prioridade sobre sistema, inclusive após navegação', () => {
  for (const saved of ['pangolim', 'pangolim-dark']) {
    const f = fixture({ saved, dark: saved === 'pangolim' });
    initializeTheme(f.document, f.window);
    assert.equal(f.document.documentElement.dataset.theme, saved);
    assert.equal(fixture({ saved: f.values.get('theme') }).document.documentElement.dataset.theme, saved);
  }
});

test('Cada clique alterna, salva, atualiza rótulos/metadados e notifica diagramas', () => {
  const f = fixture();
  let events = 0;
  f.document.addEventListener('themechange', () => events++);
  initializeTheme(f.document, f.window);
  assert.equal(events, 0);
  for (const [theme, label, color] of [
    ['pangolim-dark', 'Ativar tema claro Pangolim', '#191919'],
    ['pangolim', 'Ativar tema escuro', '#F2D98B']
  ]) {
    f.button.dispatchEvent(new Event('click'));
    assert.equal(f.document.documentElement.dataset.theme, theme);
    assert.equal(f.values.get('theme'), theme);
    assert.equal(f.attributes.get('aria-label'), label);
    assert.equal(f.button.title, label);
    assert.equal(f.meta.content, color);
  }
  assert.equal(events, 2);
});

test('Sistema acompanha preferência inicial, mas não sobrescreve escolha explícita', () => {
  const f = fixture();
  initializeTheme(f.document, f.window);
  const change = matches => { const e = new Event('change'); e.matches = matches; f.system.dispatchEvent(e); };
  change(true);
  assert.equal(f.document.documentElement.dataset.theme, 'pangolim-dark');
  assert.equal(f.values.size, 0);
  f.button.dispatchEvent(new Event('click'));
  change(true);
  assert.equal(f.document.documentElement.dataset.theme, 'pangolim');
});

test('Armazenamento bloqueado preserva sistema inicial e cliques em memória', () => {
  const f = fixture({ blocked: true, dark: true });
  initializeTheme(f.document, f.window);
  assert.equal(f.document.documentElement.dataset.theme, 'pangolim-dark');
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.document.documentElement.dataset.theme, 'pangolim');
});

test('Controle é botão nativo com nome acessível e ícones decorativos, sem seletor', () => {
  assert.match(layout, /<button[^>]*id="tema"[^>]*type="button"[\s\S]*?aria-label="Ativar tema escuro"/);
  assert.doesNotMatch(layout, /<select|aria-haspopup|role="menu"/);
  for (const icon of ['moon', 'sun']) assert.match(layout, new RegExp(`<svg class="theme-icon-${icon}"[^>]*aria-hidden="true"`));
});

const css = fs.readFileSync('assets/css/themes.css', 'utf8');
const light = css.match(/\[data-theme="pangolim"\] \{([\s\S]*?)\n\}/)[1];
const palette = Object.fromEntries([...light.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(m => [m[1], m[2]]));
function luminance(hex) {
  return hex.slice(1).match(/../g).map(n => parseInt(n, 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }

test('Paleta Pangolim oferece AA em texto, links, código e controles', () => {
  for (const fg of ['text', 'text-strong', 'text-muted', 'accent', 'accent-hover']) {
    for (const bg of ['bg-page', 'bg-sidebar', 'bg-main', 'bg-card', 'bg-hover', 'accent-soft']) {
      assert.ok(contrast(palette[fg], palette[bg]) >= 4.5, `${fg}/${bg}: ${contrast(palette[fg], palette[bg])}`);
    }
  }
  for (const fg of Object.keys(palette).filter(k => k.startsWith('syntax-') || k.startsWith('code-'))) {
    assert.ok(contrast(palette[fg], palette['bg-code']) >= 4.5, fg);
  }
  for (const bg of ['brand-gold', 'brand-gold-hover']) assert.ok(contrast(palette['text-strong'], palette[bg]) >= 4.5, bg);
  for (const bg of ['bg-main', 'bg-sidebar']) assert.ok(contrast(palette['border-control'], palette[bg]) >= 3, bg);
  assert.ok(contrast(palette['error-text'], palette['error-bg']) >= 4.5);
});
