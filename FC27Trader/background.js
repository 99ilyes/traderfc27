chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  // Page fut.gg récupérée pour le catalogue de sets (la Web App ne peut pas la lire elle-même : CORS)
  if (msg?.type === 'futgg-fetch') {
    const url = String(msg.url || '');
    if (!url.startsWith('https://www.fut.gg/')) return void reply({ ok: false, status: 0 });
    fetch(url, { credentials: 'include' })
      .then(async (r) => reply({ ok: r.ok, status: r.status, html: r.ok ? await r.text() : '' }))
      .catch((e) => reply({ ok: false, status: 0, error: String(e?.message || e) }));
    return true;
  }
  // Prix fut.gg par definitionId (API du site, lots de 50) ; format lu défensivement : { eaId|id, price|currentPrice.price }
  if (msg?.type === 'futgg-prices') {
    void futggPrices((Array.isArray(msg.ids) ? msg.ids : []).map(Number).filter((n) => n > 0)).then(reply);
    return true;
  }
  // Notifications système (pause anti-captcha, achats terminés) : aucune action requise
  if (msg?.type !== 'notify') return;
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon-128.png',
    title: String(msg.title || 'FC27 Trader').slice(0, 80),
    message: String(msg.message || '').slice(0, 300),
    priority: 1,
  });
});

function pricesFrom(j, out = {}) {
  const walk = (o, depth) => {
    if (!o || typeof o !== 'object' || depth > 5) return;
    if (Array.isArray(o)) return void o.forEach((x) => walk(x, depth + 1));
    const id = Number(o.eaId ?? o.ea_id ?? o.definitionId ?? o.id);
    const p = Number(o.currentPrice?.price ?? o.price ?? o.currentPrice);
    if (id > 0 && p > 0 && !o.currentPrice?.isUntradeable && !o.isUntradeable) out[id] = Math.round(p);
    for (const v of Object.values(o)) if (v && typeof v === 'object') walk(v, depth + 1);
  };
  walk(j, 0);
  return out;
}
async function futggPrices(ids) {
  const prices = {};
  let ok = false;
  for (let i = 0; i < ids.length; i += 50) {
    try {
      const r = await fetch(`https://www.fut.gg/api/fut/player-prices/27/?ids=${ids.slice(i, i + 50).join(',')}`, { credentials: 'include' });
      if (!r.ok) continue;
      pricesFrom(await r.json(), prices);
      ok = true;
    } catch {}
  }
  return { ok, prices };
}
