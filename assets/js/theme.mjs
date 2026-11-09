// O bootstrap no <head> resolve a preferência antes de carregar o CSS.
export function initializeTheme(document = globalThis.document, window = globalThis.window) {
  const button = document.getElementById('tema');
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let explicitChoice = false;
  try {
    explicitChoice = ['pangolim', 'pangolim-dark'].includes(window.localStorage.getItem('theme'));
  } catch { /* Armazenamento opcional; alternância continua em memória. */ }

  function render(value, notify = true) {
    document.documentElement.dataset.theme = value;
    const label = value === 'pangolim-dark' ? 'Ativar tema claro Pangolim' : 'Ativar tema escuro';
    button.setAttribute('aria-label', label);
    button.title = label;
    document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-page').trim();
    if (notify) document.dispatchEvent(new window.Event('themechange'));
  }

  render(document.documentElement.dataset.theme, false);
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'pangolim-dark' ? 'pangolim' : 'pangolim-dark';
    explicitChoice = true;
    try { window.localStorage.setItem('theme', next); } catch { /* Mantém escolha em memória. */ }
    render(next);
  });
  system.addEventListener('change', event => {
    if (!explicitChoice) render(event.matches ? 'pangolim-dark' : 'pangolim');
  });
}
