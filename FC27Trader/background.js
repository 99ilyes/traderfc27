chrome.runtime.onMessage.addListener((msg) => {
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
