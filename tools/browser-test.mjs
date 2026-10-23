import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { serve, launchBrowser, intercept } from '../test/browser-helpers.mjs';

const argument=name=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
const siteDir = argument('--site-dir') || process.env.SITE_DIR || '.tmp/validation-site';
const baseurl = argument('--baseurl') || process.env.TEST_BASEURL || '';
assert.ok(fs.existsSync(path.join(siteDir,'index.html')), 'Renderize primeiro: ruby tools/validate.rb --write .tmp/validation-site');
const {server,origin} = await serve(siteDir,baseurl);
let browser;
const results=[];
const run=async(name,fn)=>{ await fn(); results.push({name,passed:true}); console.log('PASS '+name); };
try {
 browser=await launchBrowser();
 const {cdp}=browser;
 const exceptions=[];
 cdp.on('Runtime.exceptionThrown', e=>exceptions.push(e.exceptionDetails.exception?.description||e.exceptionDetails.text));
 let external=[];
 let mode='blocked';
 let delayed=[];
 const mock=`export default {initialize(config){window.diagramConfig=config;},async render(id,source){window.diagramSources??=[];window.diagramSources.push(source);return {svg:'<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de teste" width="100" height="40"><text x="0" y="20">Teste</text></svg>'};}};`;
 await intercept(cdp,origin,async request=>{
  external.push(request.request.url);
  if(mode==='slow'){delayed.push(request);return;}
  if(mode==='mock') await cdp.send('Fetch.fulfillRequest',{requestId:request.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(mock).toString('base64')});
  else if(mode==='live' && request.request.url.startsWith('https://cdn.jsdelivr.net/npm/mermaid@11.15.0/')) await cdp.send('Fetch.continueRequest',{requestId:request.requestId});
  else await cdp.send('Fetch.failRequest',{requestId:request.requestId,errorReason:'BlockedByClient'});
 });
 const evaluate=expression=>cdp.evaluate(expression);
 const screenshot=async name=>{
  const {data}=await cdp.send('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(`.tmp/${baseurl?'baseurl':'root'}-${name}.png`,Buffer.from(data,'base64'));
 };
 const waitFor=async expression=>{
  for(let i=0;i<120;i++){if(await evaluate(expression)) return; await new Promise(r=>setTimeout(r,100));}
  throw Error('Condição não atingida: '+expression);
 };
 const go=async page=>{
  const url=origin+baseurl+page;
  const current=await evaluate('location.href');
  const previous=new URL(current), next=new URL(url);
  if(previous.origin===next.origin && previous.pathname===next.pathname && previous.search===next.search && next.hash) {
   // Navegação apenas de fragmento não dispara Page.loadEventFired.
   await cdp.send('Page.navigate',{url});
  } else await cdp.navigate(url);
  await waitFor("document.querySelector('#sidebarCollapse').hasAttribute('aria-expanded')");
 };
 const search=async term=>{await evaluate(`(()=>{const s=document.getElementById('sidebarSearchInput');s.value=${JSON.stringify(term)};s.dispatchEvent(new Event('input'));})()`);};
 const visible=()=>evaluate(`Array.from(document.querySelectorAll('.sidebar-menu a')).filter(a=>a.getClientRects().length).map(a=>a.textContent.trim())`);
 await run('Chrome real, desktop e página sem Mermaid',async()=>{
  console.log(JSON.stringify(await cdp.send('Browser.getVersion')));
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await go('/index.html');
  assert.deepEqual(external,[],'Página sem diagrama não deve consultar CDN');
  assert.equal(await evaluate("document.querySelectorAll('main h1').length"),1);
  await screenshot('desktop');
 });
 await run('Buscas git → docker → semresultado123 → git, limpeza e restauração',async()=>{
  const initial=await evaluate("Array.from(document.querySelectorAll('.sidebar-menu details')).map(g=>g.open)");
  await search('git'); const first=await visible(); assert.ok(first.some(s=>/git|branch|clone/i.test(s)));
  await search('docker'); assert.ok((await visible()).some(s=>/imagens|container/i.test(s)));
  await search('semresultado123'); assert.deepEqual(await visible(),[]);
  assert.equal(await evaluate("document.querySelector('#searchStatus').textContent"),'Nenhum resultado no menu.');
  await search('git'); assert.deepEqual(await visible(),first);
  await search(''); assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.sidebar-menu details')).map(g=>g.open)"),initial);
  await search('certificados'); assert.ok((await visible()).length>0);
  await search('SEMRESULTADO123');
  assert.equal(await evaluate("Array.from(document.querySelectorAll('.sidebar-menu [hidden]')).every(e=>getComputedStyle(e).display==='none')"),true);
  await evaluate("document.querySelector('#sidebarSearchInput').focus()");
  for(let i=0;i<5;i++) await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.equal(await evaluate("!!document.activeElement.closest('.sidebar-menu')"),false);
  await search('');
 });
 await run('Troca de tema preserva consulta, menu, documento e preferência',async()=>{
  await search('git');
  await evaluate("window.testDocumentMarker=42;document.querySelector('#tema').value='pangolim-dark';document.querySelector('#tema').dispatchEvent(new Event('change'))");
  assert.equal(await evaluate('window.testDocumentMarker'),42);
  assert.equal(await evaluate("document.querySelector('#sidebarSearchInput').value"),'git');
  assert.equal(await evaluate("localStorage.getItem('theme')"),'pangolim-dark');
  await go('/index.html');
  assert.equal(await evaluate('document.documentElement.dataset.theme'),'pangolim-dark');
 });
 await run('Sidebar: home estável, botão persistente, estado ARIA e teclado',async()=>{
  await evaluate("document.querySelector('#sidebarCollapse').click()");
  assert.equal(await evaluate("document.querySelector('#sidebarCollapse').getAttribute('aria-expanded')"),'false');
  assert.equal(await evaluate("document.querySelector('#sidebarCollapse').getClientRects().length>0"),true);
  assert.equal(await evaluate("document.querySelector('.brand').getAttribute('aria-label')"),'Página inicial do Pangolim');
  await evaluate("document.querySelector('#sidebarCollapse').focus()");
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
  assert.equal(await evaluate("document.querySelector('#sidebarCollapse').getAttribute('aria-expanded')"),'true');
 });
 await run('Tooltips: foco, hover persistente e Escape',async()=>{
  await evaluate("document.querySelector('#sidebarCollapse').click();document.querySelector('.dock-item').focus()");
  assert.equal(await evaluate("document.querySelector('#dockTooltip').hidden"),false);
  assert.equal(await evaluate("document.activeElement.getAttribute('aria-describedby')"),'dockTooltip');
  const rect=await evaluate("(()=>{const r=document.querySelector('#dockTooltip').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',...rect});
  await new Promise(r=>setTimeout(r,300));
  assert.equal(await evaluate("document.querySelector('#dockTooltip').hidden"),false);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  assert.equal(await evaluate("document.querySelector('#dockTooltip').hidden"),true);
 });
 await run('Exemplo textual WatchGuard e reflow em 320, 375 e 768 pixels nos dois temas',async()=>{
  for(const width of [320,375,768]){
   await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:true});
   await go('/watchguard/watchguardndrcollectionagent.html');
   await waitFor("document.querySelector('.sidebar').getBoundingClientRect().width <= 55");
   await evaluate("document.querySelector('main pre').scrollIntoView()");
   assert.equal(await evaluate("document.querySelector('main img[src*=\"collector.png\"]') === null"),true);
   for(const theme of ['pangolim','pangolim-dark']){
    await evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    const metrics=await evaluate("(()=>{const i=document.querySelector('main pre');return {page:document.documentElement.scrollWidth,viewport:innerWidth,code:i.getBoundingClientRect().width,main:document.querySelector('main').clientWidth};})()");
    assert.ok(metrics.page<=metrics.viewport+1,JSON.stringify({width,theme,...metrics}));
    assert.ok(metrics.code<=metrics.main);
    if(width===375 && theme==='pangolim-dark')await screenshot('mobile-dark');
   }
   await evaluate("document.querySelector('#sidebarCollapse').click()");
   await search('docker'); assert.ok((await visible()).length>0);
   await evaluate("document.querySelector('#sidebarCollapse').click()");
   assert.deepEqual(await visible(),[]);
  }
 });
 await run('Ampliação de 200% e preferência de movimento reduzido',async()=>{
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:640,height:450,deviceScaleFactor:2,mobile:false});
  await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await go('/index.html');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.page-shell')).transitionDuration"),'0s');
 });
 await run('Indicadores de submenus respeitam o filho direto',async()=>{
  await evaluate("document.querySelector('#sidebarCollapse').click();const p=document.querySelector('.sidebar-menu details');p.open=true;p.querySelector('details').open=false");
  const state=await evaluate("(()=>{const p=document.querySelector('.sidebar-menu details');return [getComputedStyle(p.querySelector(':scope > summary'),'::after').content,getComputedStyle(p.querySelector('details').querySelector(':scope > summary'),'::after').content];})()");
  assert.notEqual(state[0],state[1]);
 });
 await run('Contraste dos textos secundários em todos os fundos dos dois temas',async()=>{
  const measured=[];
  for(const theme of ['pangolim','pangolim-dark']) {
   await evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
   const colors=await evaluate("(()=>{const css=getComputedStyle(document.documentElement);return Object.fromEntries(['--text-muted','--bg-page','--bg-main','--bg-card','--bg-sidebar','--bg-hover','--bg-code'].map(k=>[k,css.getPropertyValue(k).trim()]));})()");
   const luminance=hex=>{const rgb=hex.replace('#','').match(/.{2}/g).map(c=>parseInt(c,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};
   const fg=luminance(colors['--text-muted']);
   for(const [name,color] of Object.entries(colors).filter(([k])=>k!=='--text-muted')) {
    const bg=luminance(color);const contrast=(Math.max(fg,bg)+0.05)/(Math.min(fg,bg)+0.05);
    measured.push({theme,background:name,contrast:Number(contrast.toFixed(2))});assert.ok(contrast>=4.5,JSON.stringify(measured.at(-1)));
   }
  }
  console.log('CONTRAST '+JSON.stringify(measured));
  fs.writeFileSync('.tmp/contrast-report.json',JSON.stringify(measured,null,2));
 });
 await run('Árvore de acessibilidade e skip link operável por teclado',async()=>{
  await go('/index.html?keyboard=1');
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.equal(await evaluate("document.activeElement.classList.contains('skip-link')"),true);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  assert.equal(await evaluate('document.activeElement.id'),'conteudo');
  const {nodes}=await cdp.send('Accessibility.getFullAXTree');
  assert.ok(nodes.some(n=>n.role?.value==='main'));
  const button=nodes.find(n=>n.role?.value==='button' && /barra lateral/.test(n.name?.value));
  assert.ok(button);assert.ok(button.properties.some(p=>p.name==='expanded'));
 });
 await run('Armazenamento bloqueado não impede controles nem troca de tema',async()=>{
  const {identifier}=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:"Storage.prototype.getItem=function(){throw Error('bloqueado')};Storage.prototype.setItem=function(){throw Error('bloqueado')}"});
  try {
   await go('/index.html?storage=blocked');
   await evaluate("if(document.body.classList.contains('sidebar-collapsed'))document.querySelector('#sidebarCollapse').click()");
   await search('git'); assert.ok((await visible()).length>0);
   await evaluate("document.querySelector('#tema').value='pangolim-dark';document.querySelector('#tema').dispatchEvent(new Event('change'))");
   assert.equal(await evaluate('document.documentElement.dataset.theme'),'pangolim-dark');
  } finally { await cdp.send('Page.removeScriptToEvaluateOnNewDocument',{identifier}); }
 });
 await run('Mermaid indisponível: fallback textual e controles locais',async()=>{
  mode='blocked'; external=[];
  await go('/programacao/cobol/index.html');
  await waitFor("document.querySelector('figcaption')?.textContent.includes('indisponível')");
  assert.ok(external.length>0);
  assert.ok(await evaluate("document.querySelector('figure details').open && document.querySelector('figure code').textContent.includes('flowchart')"));
  await evaluate("if(document.body.classList.contains('sidebar-collapsed'))document.querySelector('#sidebarCollapse').click()");
  await search('git'); assert.ok((await visible()).length>0);
 });
 await run('CDN lento não impede busca, menu nem DOMContentLoaded',async()=>{
  // Nova página/session evita reutilização do import que falhou no teste anterior.
  mode='slow'; delayed=[];
  await go('/programacao/cobol/index.html?slow=1');
  // Imports falhos podem permanecer no cache de módulo do documento anterior; cada navegação cria outro mapa.
  await waitFor('document.readyState === "complete"');
  await evaluate("if(document.body.classList.contains('sidebar-collapsed'))document.querySelector('#sidebarCollapse').click()");
  await search('git'); assert.ok((await visible()).length>0);
  for(const req of delayed) await cdp.send('Fetch.failRequest',{requestId:req.requestId,errorReason:'BlockedByClient'});
  mode='blocked';
 });
 await run('Renderização e mudança de tema com módulo Mermaid controlado',async()=>{
  mode='mock';
  await go('/programacao/cobol/index.html?mock=1');
  await waitFor("document.querySelector('.diagram-output svg') !== null");
  const before=await evaluate('window.diagramSources.length');
  await evaluate("document.querySelector('#tema').value='pangolim-dark';document.querySelector('#tema').dispatchEvent(new Event('change'))");
  await waitFor(`window.diagramSources.length>${before}`);
  assert.equal(await evaluate('window.diagramConfig.theme'),'dark');
  assert.equal(await evaluate('window.diagramConfig.securityLevel'),'strict');
  assert.equal(await evaluate("document.querySelector('figure details').open"),false);
 });
 await run('Cópia usa texto original e informa sucesso e erro',async()=>{
  mode='blocked'; await go('/devops/git/guia-pratico.html');
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedText=value;}}});document.querySelector('.copy-btn').click()");
  await waitFor("document.querySelector('.copy-btn').classList.contains('copied')");
  assert.equal(await evaluate('window.copiedText'),await evaluate("document.querySelector('main pre code').textContent"));
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('negado')}}});document.querySelector('.copy-btn').click()");
  await waitFor("document.querySelector('.copy-btn').classList.contains('copy-error')");
 });
 await run('Navegação e fragmentos preservados no DOM real',async()=>{
  for(const [page,id] of [['/devops/git/guia-pratico.html','sumário'],['/nutanix/volumes/configurando-volumes-nutanix.html','introducao'],['/nutanix/volumes/questionario-volumes-nutanix.html','gabarito-rapido']]) {
   await go(page+'#'+encodeURIComponent(id));
   assert.ok(await evaluate(`document.getElementById(${JSON.stringify(id)}) !== null`));
  }
  await go('/devops/kubernetes/index.html');
  const cards=await evaluate("Array.from(document.querySelectorAll('main .wiki-topic')).map(a=>new URL(a.href).pathname.split('/').at(-1)).sort()");
  assert.deepEqual(cards,['deployments.html','ingress.html','instalacao-cluster-rocky-containerd-calico.html','kubeconfig.html','kubectl.html','pods.html','services.html','troubleshooting.html','tutorial-kubernetes-rocky-linux.html'].sort());
 });
 await run('Sem JavaScript: conteúdo e navegação utilizáveis em celular',async()=>{
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:320,height:900,deviceScaleFactor:1,mobile:true});
  await cdp.send('Emulation.setScriptExecutionDisabled',{value:true});
  try { await cdp.navigate(origin+baseurl+'/index.html?javascript=disabled'); }
  finally { await cdp.send('Emulation.setScriptExecutionDisabled',{value:false}); }
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.page-shell')).marginLeft"),'0px');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.sidebar')).position"),'static');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
 });
 await run('Sem exceções JavaScript locais',async()=>assert.deepEqual(exceptions,[]));
 if(process.argv.includes('--live-mermaid')) {
  await run('Biblioteca Mermaid real: todos os 23 blocos nos dois temas',async()=>{
   mode='live'; let rendered=0;
   const pages=[];
   const walk=dir=>{for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(p.endsWith('.html') && fs.readFileSync(p,'utf8').includes('language-mermaid'))pages.push(p);}};
   walk(siteDir);
   for(const file of pages){
    await go('/'+path.relative(siteDir,file).replaceAll('\\','/'));
    const count=await evaluate("document.querySelectorAll('code.language-mermaid').length");
    for(const theme of ['pangolim','pangolim-dark']) {
     await evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)};document.dispatchEvent(new Event('themechange'))`);
     await waitFor(`document.querySelectorAll('.diagram-output svg').length===${count} && Array.from(document.querySelectorAll('.diagram-output')).every(e=>e.dataset.theme===${JSON.stringify(theme)})`);
     assert.equal(await evaluate("document.querySelectorAll('figure details[open]').length"),0,file);
    }
    rendered+=count; console.log('DIAGRAM '+path.relative(siteDir,file)+' '+count);
   }
   console.log('Diagramas reais renderizados: '+rendered);
  });
 }
 console.log(JSON.stringify({passed:results.length,failed:0,baseurl,siteDir,liveMermaid:process.argv.includes('--live-mermaid')}));
} catch(error) {
 results.push({passed:false,error:error.stack});
 console.error(error);
 process.exitCode=1;
} finally {
 fs.mkdirSync('.tmp',{recursive:true});
 fs.writeFileSync(argument('--report')||process.env.BROWSER_REPORT||'.tmp/browser-report.json',JSON.stringify(results,null,2));
 if(browser) await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
