import { filterMenu } from './search.mjs';

const menu = document.querySelector('.sidebar-menu');
const search = document.getElementById('sidebarSearchInput');
const collapse = document.getElementById('sidebarCollapse');
const status = document.getElementById('searchStatus');
const groups = [...menu.querySelectorAll('details')];
let savedGroups;

function setCollapsed(collapsed) {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  collapse.setAttribute('aria-expanded', String(!collapsed));
  collapse.setAttribute('aria-label', collapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral');
  collapse.title = collapse.getAttribute('aria-label');
  collapse.querySelector('span').textContent = collapsed ? '›' : '‹';
}
collapse.addEventListener('click', () => setCollapsed(!document.body.classList.contains('sidebar-collapsed')));
setCollapsed(matchMedia('(max-width: 900px)').matches);
const currentPath = location.pathname.replace(/index\.html$/, '');
for (const link of menu.querySelectorAll('a')) {
  if (new URL(link.href).pathname.replace(/index\.html$/, '') === currentPath) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
    let parent = link.closest('details');
    while (parent) { parent.open = true; parent = parent.parentElement.closest('details'); }
  }
}
search.addEventListener('input', () => {
  if (search.value.trim() && !savedGroups) savedGroups = groups.map(g => g.open);
  const any = filterMenu(menu, search.value);
  status.textContent = search.value.trim() && !any ? 'Nenhum resultado no menu.' : '';
  if (!search.value.trim() && savedGroups) {
    groups.forEach((g,i) => { g.open = savedGroups[i]; });
    savedGroups = undefined;
  }
});
search.addEventListener('keydown', event => {
  if (event.key === 'Escape') { search.value = ''; search.dispatchEvent(new Event('input')); }
});

const tooltip = document.createElement('div');
tooltip.className = 'dock-tooltip';
tooltip.id = 'dockTooltip';
tooltip.setAttribute('role', 'tooltip');
tooltip.hidden = true;
document.body.append(tooltip);
let tooltipTimer;
let tooltipOwner;
function hideTooltip() {
  clearTimeout(tooltipTimer);
  tooltip.hidden = true;
  tooltip.classList.remove('visible');
  tooltipOwner?.removeAttribute('aria-describedby');
  tooltipOwner = undefined;
}
function delayHide() { clearTimeout(tooltipTimer); tooltipTimer = setTimeout(hideTooltip, 200); }
for (const item of document.querySelectorAll('.dock-item')) {
  const url = new URL(item.href);
  if (url.origin === location.origin && currentPath.startsWith(url.pathname.replace(/index\.html$/, ''))) item.classList.add('active');
  const show = () => {
    hideTooltip();
    tooltipOwner = item;
    tooltip.textContent = item.dataset.label;
    tooltip.hidden = false;
    tooltip.classList.add('visible');
    item.setAttribute('aria-describedby', tooltip.id);
    const rect = item.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 6}px`;
    tooltip.style.top = `${Math.max(24, Math.min(innerHeight - 24, rect.top + rect.height / 2))}px`;
  };
  item.addEventListener('mouseenter', show);
  item.addEventListener('focus', show);
  item.addEventListener('mouseleave', delayHide);
  item.addEventListener('blur', delayHide);
}
tooltip.addEventListener('mouseenter', () => clearTimeout(tooltipTimer));
tooltip.addEventListener('mouseleave', delayHide);
document.addEventListener('keydown', event => { if (event.key === 'Escape') hideTooltip(); });
window.addEventListener('scroll', hideTooltip, true);

for (const pre of document.querySelectorAll('main pre')) {
  const code = pre.querySelector('code');
  if (!code || code.classList.contains('language-mermaid')) continue;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-btn';
  button.textContent = '⧉';
  button.setAttribute('aria-label', 'Copiar código');
  button.title = 'Copiar código';
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.classList.add('copied');
      button.setAttribute('aria-label', 'Código copiado');
    } catch {
      button.classList.add('copy-error');
      button.setAttribute('aria-label', 'Não foi possível copiar; selecione o código manualmente');
    }
    button.title = button.getAttribute('aria-label');
    setTimeout(() => { button.classList.remove('copied', 'copy-error'); button.setAttribute('aria-label', 'Copiar código'); button.title = 'Copiar código'; }, 1800);
  });
  const wrapper = document.createElement('div');
  wrapper.className = 'code-wrapper';
  pre.before(wrapper);
  wrapper.append(pre, button);
}

const theme = document.getElementById('tema');
theme.value = document.documentElement.dataset.theme;
theme.addEventListener('change', () => {
  const value = theme.value === 'pangolim-dark' ? 'pangolim-dark' : 'pangolim';
  document.documentElement.dataset.theme = value;
  try { localStorage.setItem('theme', value); } catch { /* Preferência em memória continua funcionando. */ }
  document.dispatchEvent(new Event('themechange'));
});

// Importação dinâmica não participa da inicialização dos controles locais.
if (document.querySelector('code.language-mermaid')) {
  import('./diagrams.mjs').then(module => module.startDiagrams()).catch(() => {
    // O texto fonte dos diagramas permanece legível se o módulo local falhar.
  });
}
