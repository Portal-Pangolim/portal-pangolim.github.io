export const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();

// Cada consulta usa os rótulos originais, nunca a visibilidade anterior.
export function filterMenu(menu, query) {
  const term = normalize(query);
  function visit(container, inherited = false) {
    let visible = false;
    for (const li of container.children) {
      const group = li.querySelector(':scope > details');
      const link = li.querySelector(':scope > a');
      let match = false;
      if (group) {
        const own = !term || inherited || normalize(group.querySelector(':scope > summary').textContent).includes(term);
        match = visit(group.querySelector(':scope > ul'), own);
        group.hidden = !match;
        if (term && match) group.open = true;
      } else if (link) {
        match = !term || inherited || normalize(link.textContent).includes(term);
        link.hidden = !match;
      }
      li.hidden = !match;
      visible ||= match;
    }
    return visible;
  }
  let any = false;
  for (const group of menu.querySelectorAll(':scope > details')) {
    const own = !term || normalize(group.querySelector(':scope > summary').textContent).includes(term);
    const visible = visit(group.querySelector(':scope > ul'), own);
    group.hidden = !visible;
    if (term && visible) group.open = true;
    any ||= visible;
  }
  return any;
}
