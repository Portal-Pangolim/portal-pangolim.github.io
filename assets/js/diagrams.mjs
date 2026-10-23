export const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.esm.min.mjs';

export async function startDiagrams() {
  const blocks = [...document.querySelectorAll('pre code.language-mermaid')].map(code => {
    const source = code.textContent;
    const pre = code.parentElement;
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = 'Diagrama — representação textual disponível abaixo.';
    const details = document.createElement('details');
    details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Fonte textual do diagrama';
    const output = document.createElement('div');
    output.className = 'diagram-output';
    pre.before(figure);
    details.append(summary, pre);
    figure.append(caption, output, details);
    return { source, figure, output, details };
  });
  let mermaid;
  try { ({ default: mermaid } = await import(MERMAID_URL)); }
  catch {
    for (const b of blocks) b.figure.querySelector('figcaption').textContent = 'Diagrama indisponível; consulte a fonte textual abaixo.';
    return;
  }
  let revision = 0;
  let queue = Promise.resolve();
  async function render() {
    const version = ++revision;
    const dark = document.documentElement.dataset.theme === 'pangolim-dark';
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'default' });
    for (let i=0; i<blocks.length; i++) {
      const b = blocks[i];
      try {
        const { svg, bindFunctions } = await mermaid.render(`diagram-${version}-${i}`, b.source);
        b.output.innerHTML = svg; // Saída da biblioteca com securityLevel strict; nunca contém a pesquisa.
        b.output.dataset.theme = dark ? 'pangolim-dark' : 'pangolim';
        bindFunctions?.(b.output);
        b.details.open = false;
      } catch {
        b.output.replaceChildren();
        b.details.open = true;
        b.figure.querySelector('figcaption').textContent = 'Não foi possível renderizar; consulte a fonte textual.';
      }
    }
    document.dispatchEvent(new Event('diagramsready'));
  }
  const schedule = () => { queue = queue.then(render); };
  document.addEventListener('themechange', schedule);
  schedule();
}
