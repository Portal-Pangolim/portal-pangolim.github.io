import { spawn } from 'node:child_process';
import { EventEmitter, once } from 'node:events';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export async function serve(directory, baseurl = '') {
  const root = path.resolve(directory);
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml' };
  const server = createServer((request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (baseurl && !pathname.startsWith(baseurl + '/')) throw Error('baseurl');
      pathname = pathname.slice(baseurl.length);
      let file = path.resolve(root, '.' + pathname);
      if (!file.startsWith(root + path.sep) && file !== root) throw Error('path');
      if (statSync(file).isDirectory()) file = path.join(file, 'index.html');
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(readFileSync(file));
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not found');
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return { server, origin: 'http://127.0.0.1:' + server.address().port };
}

export class CDP extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.sequence = 0;
    this.pending = new Map();
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) pending.reject(Error(message.error.message));
        else pending.resolve(message.result);
      } else this.emit(message.method, message.params, message.sessionId);
    });
  }
  send(method, params = {}, sessionId = this.sessionId) {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 20000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.text + ': ' + (result.exceptionDetails.exception?.description || ''));
    return result.result.value;
  }
  async navigate(url) {
    const ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.off('Page.loadEventFired', listener); reject(Error('Page load timeout')); }, 20000);
      const listener = () => { clearTimeout(timer); this.off('Page.loadEventFired', listener); resolve(); };
      this.on('Page.loadEventFired', listener);
    });
    await this.send('Page.navigate', { url });
    await ready;
  }
}

export async function launchBrowser() {
  const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  const executable = candidates.find(p => existsSync(p));
  if (!executable) throw Error('Navegador não encontrado. Defina CHROME_PATH; teste não executado.');
  const profile = path.resolve('.tmp', 'chrome-' + Date.now() + '-' + process.pid);
  mkdirSync(profile, { recursive: true });
  const child = spawn(executable, ['--headless', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => { child.kill(); reject(Error('Chrome não iniciou em 20 segundos')); }, 20000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(Error('Chrome encerrou: ' + code)); });
    child.stderr.on('data', chunk => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const cdp = new CDP(socket);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.sessionId = sessionId;
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  return {
    cdp,
    async close() {
      await cdp.send('Browser.close', {}, undefined).catch(() => {});
      socket.close();
      if (child.exitCode === null) child.kill();
    }
  };
}

export async function intercept(cdp, origin, handler) {
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  cdp.on('Fetch.requestPaused', async request => {
    try {
      if (request.request.url.startsWith(origin + '/')) await cdp.send('Fetch.continueRequest', { requestId: request.requestId });
      else if (handler) await handler(request);
      else await cdp.send('Fetch.failRequest', { requestId: request.requestId, errorReason: 'BlockedByClient' });
    } catch { /* A navegação pode cancelar uma requisição já interceptada. */ }
  });
}
