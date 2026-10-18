// fut.gg : bouton « Envoyer à FC27 Trader » sur la page d'un set de la Galerie (tous ses joueurs, pages suivantes comprises)
// et sur la page d'un joueur (ajouté au set « Joueurs fut.gg »). Autant d'envois que voulu, importés dans l'ordre par la Web App.
(function () {
  const F = globalThis.AlbumFutgg;
  const MAX_PAGES = 20;
  const KEEP = 40;

  function toast(text) {
    document.querySelector('.albumfc27-toast')?.remove();
    const t = Object.assign(document.createElement('div'), { className: 'albumfc27-toast', textContent: text });
    t.style.cssText = 'position:fixed;right:20px;bottom:76px;z-index:2147483647;background:#15171c;color:#e8e8e8;border:1px solid #2c303a;border-radius:8px;padding:8px 12px;font:13px system-ui,sans-serif;max-width:320px';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }

  // Pages suivantes du set (même origine) : joueurs ajoutés à ceux de la page affichée
  async function allPlayers() {
    const byId = new Map(F.players(document).map((p) => [p.defId, p]));
    const todo = F.pageLinks(document, location.href);
    const seen = new Set([location.href, ...todo]);
    for (let n = 0; todo.length && n < MAX_PAGES; n++) {
      try {
        const r = await fetch(todo.shift(), { credentials: 'include' });
        if (!r.ok) continue;
        const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
        for (const p of F.players(doc)) if (!byId.has(p.defId)) byId.set(p.defId, p);
        for (const u of F.pageLinks(doc, location.href)) if (!seen.has(u)) seen.add(u), todo.push(u);
      } catch {}
    }
    return [...byId.values()];
  }

  async function send(data) {
    try {
      const { albumImports } = await chrome.storage.local.get('albumImports');
      const list = [...(Array.isArray(albumImports) ? albumImports : []), data].slice(-KEEP);
      await chrome.storage.local.set({ albumImports: list });
      return true;
    } catch {
      toast('Extension mise à jour : recharge cette page');
      return false;
    }
  }

  const pageKind = () => (F.GALLERY_RE.test(location.pathname) ? 'set' : F.PLAYER_RE.test(location.pathname) ? 'player' : null);

  let busy = false;
  async function onClick() {
    busy = btn.disabled = true;
    try {
      if (pageKind() === 'player') {
        const data = F.playerData(document, location.href);
        if (!data) return toast('Joueur introuvable sur cette page');
        if (await send(data)) toast(`${data.players[0].name} envoyé à FC27 Trader (prix vérifié sur le marché avant l'achat)`);
        return;
      }
      btn.textContent = 'Lecture du set…';
      const list = await allPlayers();
      if (!list.length) return toast('Aucun joueur trouvé sur cette page');
      const data = F.setData(document, location.href, list);
      if (!(await send(data))) return;
      const noPrice = list.filter((p) => !p.price).length;
      toast(`Envoyé à FC27 Trader : ${list.length} joueur(s)${noPrice ? `, ${noPrice} sans prix` : ''}. Choisis les joueurs à acheter dans l'onglet Galerie de la Web App.`);
    } finally {
      busy = false;
      label();
    }
  }

  let btn = null;
  function label() {
    const kind = pageKind();
    const n = kind === 'set' ? F.players(document).length : 1;
    const text = kind === 'player' ? 'Envoyer à FC27 Trader' : `Envoyer à FC27 Trader (${n})`;
    if (btn.textContent !== text) btn.textContent = text;
    btn.disabled = n === 0;
  }
  function ensureButton() {
    if (!pageKind()) {
      btn?.remove();
      btn = null;
      return;
    }
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483647;background:#2f9e44;color:#fff;border:0;border-radius:8px;padding:10px 14px;font:600 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px #0007';
      btn.onclick = () => void onClick();
      document.body.appendChild(btn);
    }
    if (!busy) label();
  }

  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      ensureButton();
    }, 400);
  }).observe(document.body, { childList: true, subtree: true });
  ensureButton();
})();
