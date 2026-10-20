// Page de connexion EA : identifiants saisis et validés seulement si la Web App attend une reprise (rechargement après 401)
(function () {
  const WANTED_MS = 10 * 6e4;
  const MAX_SUBMITS = 5;
  const TRIES_MS = 30 * 6e4;
  const visible = (x) => x && x.offsetParent !== null && !x.disabled;
  const pick = (sel) => [...document.querySelectorAll(sel)].find(visible);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const human = () => sleep(800 + Math.random() * 1700);
  const notify = (message) => chrome.runtime.sendMessage({ type: 'notify', title: 'FC27 Trader : connexion EA', message }).catch(() => {});
  const fill = (input, value) => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.blur();
  };
  const SUBMIT_RE = /^\s*(next|suivant|continuer|continue|sign in|log ?in|se connecter|connexion|weiter|anmelden|siguiente|iniciar sesión|avanti|accedi)\s*$/i;
  const submit = () => pick('#logInBtn, #btnLogin') ?? [...document.querySelectorAll('button, a.otkbtn, input[type=submit]')].find((b) => visible(b) && SUBMIT_RE.test(b.textContent || b.value || ''));
  const codePage = () => !!pick('#twoFactorCode, #oneTimeCode, input[name*="code" i], input[autocomplete="one-time-code"], #btnSendCode');

  let busy = false;
  async function step() {
    if (busy) return;
    const { fc27Login: cfg, fc27LoginWanted: wanted = 0, fc27LoginTries: tries = [] } = await chrome.storage.local.get(['fc27Login', 'fc27LoginWanted', 'fc27LoginTries']);
    if (!cfg?.on || !cfg.email || !cfg.password || Date.now() - wanted > WANTED_MS) return;
    if (codePage()) {
      await chrome.storage.local.set({ fc27LoginWanted: 0 });
      return notify('Code de vérification demandé par EA : le saisir à la main (cocher « se souvenir de cet appareil » pour la suite).');
    }
    const email = pick('#email, input[type=email], input[name=email]');
    const password = pick('#password, input[type=password]');
    if (!email && !password) return;
    // Une connexion = 2 validations (adresse puis mot de passe) : au plus 2 connexions ratées en 30 min
    const recent = tries.filter((t) => Date.now() - t < TRIES_MS);
    if (recent.length >= MAX_SUBMITS) {
      await chrome.storage.local.set({ fc27LoginWanted: 0 });
      return notify('Connexion automatique abandonnée (trop d’essais en 30 min) : vérifier les identifiants.');
    }
    busy = true;
    try {
      await human();
      if (email && email.value.trim().toLowerCase() !== cfg.email.trim().toLowerCase()) fill(email, cfg.email.trim());
      if (password) {
        fill(password, cfg.password);
        const remember = pick('#rememberMe, input[name=rememberMe]');
        if (remember && !remember.checked) remember.click();
      }
      await chrome.storage.local.set({ fc27LoginTries: [...recent, Date.now()] });
      await human();
      submit()?.click();
      await sleep(4e3);
    } finally {
      busy = false;
    }
  }
  setInterval(() => void step().catch(() => {}), 1500);
})();
