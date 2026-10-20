(function () {
  const toPage = (cmd) => window.postMessage({ ns: 'albumfc27', dir: 'to-page', cmd }, window.location.origin);
  chrome.runtime.onMessage.addListener((cmd) => toPage(cmd));
  window.addEventListener('message', (e) => {
    if (e.source !== window || e.data?.ns !== 'albumfc27' || e.data.dir !== 'to-ext') return;
    if (e.data.stats) chrome.storage.local.set({ fc27Stats: e.data.stats });
    // Connexion EA voulue (bouton de connexion cliqué pour une reprise) ou réussie (Web App prête)
    if (e.data.login === 'wanted') chrome.storage.local.set({ fc27LoginWanted: Date.now() });
    if (e.data.login === 'done') chrome.storage.local.set({ fc27LoginWanted: 0, fc27LoginTries: [] });
    if (e.data.notify) chrome.runtime.sendMessage({ type: 'notify', ...e.data.notify }).catch(() => {});
  });
  // Envois depuis fut.gg (sets, joueurs) : transmis au panneau dans l'ordre, au chargement et à chaque nouvel envoi ; le panneau ignore ceux déjà importés
  const send = (list) => (Array.isArray(list) ? list : []).filter((d) => d && d.at).sort((a, b) => a.at - b.at).forEach((data) => toPage({ type: 'import', data }));
  chrome.storage.local.get(['albumImports', 'albumImport']).then(({ albumImports, albumImport }) => send([...(albumImports ?? []), ...(albumImport ? [albumImport] : [])]));
  chrome.storage.local.onChanged.addListener((c) => {
    if (!c.albumImports?.newValue) return;
    const old = new Set((c.albumImports.oldValue ?? []).map((d) => d?.at));
    send(c.albumImports.newValue.filter((d) => !old.has(d?.at)));
  });
})();
