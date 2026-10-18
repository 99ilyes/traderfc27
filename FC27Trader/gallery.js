// Galerie (système FutGenie) : vue native de la Web App (tuile du hub), sets du catalogue fut.gg, joueurs de chaque set lus chez EA
// (score de grade et statut collecté), bonus de tags, meilleure composition, plan le moins cher par grade, synchro de tous les sets
(function () {
  const X = globalThis.__fc27;
  const { load, save, rand, fmt, errMsg } = X;
  const NS = X.ALBUM_NS;
  const K_PROGRESS = `${NS}:galleryProgress`;
  const K_FIRST = `${NS}:firstOwner`;
  const K_FO_MODE = `${NS}:firstOwnerMode`;
  const K_FO_PCT = `${NS}:firstOwnerPct`;
  const K_PRICES = `${NS}:futggPrices`;
  const PAGE = 91;
  const MAX_PAGES = 10;
  const SYNC_FRESH_MS = 216e5;
  const PRICE_TTL = 6 * 36e5;
  const MAX_PRICES = 6e3;

  const STR = {
    'hub.gallery': 'Galerie',
    'hub.galleryDescription': 'Suivez les sets de la Galerie, voyez vos joueurs collectés et planifiez vos Jetons',
    loading: 'Chargement de la Galerie...',
    intro: "Les Jetons de Galerie débloquent des joueurs Hall of FUT. Une carte compte comme collectionnée même si vous l'achetez puis la revendez, donc le coût d'un set est la taxe de vente de 5%, pas le prix.",
    slots: '{n} emplacements',
    maxTokens: "jusqu'à {n} jetons",
    pipTitle: '{grade} : score {score}, {tokens} jetons',
    pipTitleNoTokens: '{grade} : score {score}',
    back: 'Tous les sets',
    loadingPool: 'Chargement des joueurs ({done}/{total})',
    loadingPlayers: 'Chargement des joueurs...',
    selected: 'Sélectionnés',
    tokensEarned: 'Jetons',
    buyMissing: 'Acheter les {n} manquants',
    snipeMissing: '🎯 Sniper les {n} manquants',
    totalScore: 'Score total',
    pointsTo: 'Encore {score} points pour {grade}',
    maxGrade: 'Note maximale atteinte',
    searchMarket: 'Rechercher cette carte sur le marché des transferts',
    bestPossible: 'Meilleure note possible sans premier propriétaire : {grade}',
    noGradePossible: "Aucune note possible sans premier propriétaire pour l'instant",
    pipUnreachable: 'Impossible avec les joueurs sortis actuellement',
    reward: 'Récompense',
    'filter.all': 'Tous ({n})',
    'filter.missing': 'Manquants ({n})',
    'filter.collected': 'Collectionnés ({n})',
    loadMore: 'Charger plus de joueurs',
    loadingMore: 'Chargement...',
    targetLabel: 'Le moins cher pour atteindre',
    targetOutOfReach: 'Hors de portée avec les cartes disponibles actuellement',
    targetClamped: "{grade} est hors de portée pour l'instant, le plan vise donc {best}.",
    targetNoGrade: "Aucune note n'est atteignable avec les cartes disponibles actuellement.",
    planning: 'Calcul en cours...',
    highestNone: "Aucune carte collectionnée ou achetable pour ce set pour l'instant.",
    highestPartial: "Basé sur les cartes chargées jusqu'ici. Chargez-en plus pour vérifier le reste.",
    scoreSplit: '{base} de base + {bonus} de bonus',
    bonusTags: 'Étiquettes bonus',
    tagMeta: '{count} cartes, +{pct}%',
    tagCapNote: 'Seules les {n} plus grosses étiquettes comptent.',
    bonusNoteTags: "Inclut les bonus d'étiquettes sauf Premier propriétaire. Les joueurs que vous avez obtenus en pack peuvent augmenter le total en jeu.",
    firstOwnerWhatIf: 'Simulation premier propriétaire (% des cartes collectionnées)',
    bonusNoteAssumed: 'Suppose que {pct}% des cartes collectionnées ici sont de premier propriétaire (obtenues en pack). Les cartes achetées ne le sont jamais. Le total en jeu dépend de celles que tu as vraiment obtenues.',
    tagAssumed: '{name} (supposé)',
    cost: 'Coût',
    noPrice: 'sans prix',
    deselectAll: 'Tout désélectionner',
    collectedChip: 'COLLECTÉ',
    collectedChipHint: "Déjà dans votre Galerie. La racheter n'ajoute rien à un set.",
    collectedOf: '{n} / {total} collectionnés',
    lastChecked: 'Au {date}',
    setFull: 'Tous les emplacements remplis',
    lastCheckedPartial: "Au moins ceci, d'après les joueurs chargés jusqu'ici. Au {date}",
    syncAll: 'Tout synchroniser',
    syncHint: 'Vérifie chaque set tour à tour et remplit la grille. Progressif, et interruptible.',
    syncTitle: 'Synchroniser tous les sets',
    syncBody: 'Vérifie {n} sets un par un, en environ {s} secondes. Ils sont traités progressivement plutôt que tous à la fois, et vous pouvez arrêter à tout moment. Le sniper est suspendu pendant la synchro puis reprend.',
    syncStart: 'Démarrer',
    syncProgress: '{i} sur {n} : {name}',
    syncDone: '{n} sets synchronisés.',
    syncStopped: 'Arrêté après {n} sets.',
    syncNothing: 'Tous les sets sont déjà à jour.',
    stop: 'Arrêter',
    cancel: 'Annuler',
    'cat.leagues': 'Championnats',
    'cat.rarities': 'Raretés',
    'cat.nations': 'Nations',
    'cat.clubs': 'Clubs',
    'cat.overview': 'Aperçu',
    'cat.other': 'Autres',
    'err.unresolved': 'Impossible de déterminer quels joueurs appartiennent à ce set.',
    'err.generic': 'Impossible de charger les joueurs de ce set.',
    'err.busy': 'Une tâche EA est en cours (achats Galerie, vérification des prix ou pause anti-captcha) : réessayer à la fin.',
    'err.stop': 'Lecture interrompue (arrêt, captcha ou limite EA).',
    'err.noSets': 'Aucun set importé. Le catalogue fut.gg est lu à l’ouverture de la Web App (onglet Galerie du panneau FC27 Trader : « Réimporter »).',
    sPossible: 'S possible',
    'ov.mine': 'Votre Galerie',
    'ov.mineNotePart': 'Estimé à partir de {n} des {total} sets synchronisés. Synchronisez tout pour compter le reste.',
    'ov.mineNote': 'Estimé à partir de votre dernière synchronisation de chaque set.',
    'ov.score': 'Score de Galerie',
    'ov.scoreHint': "Le total des scores de vos sets. C'est lui qui fait monter votre Niveau de Galerie.",
    'ov.tokens': 'Jetons gagnés',
    'ov.tokensOf': '{n} sur {total}',
    'ov.tokensHint': "Jetons des grades de set (lus sur fut.gg quand la page les affiche). Les paliers de Niveau de Galerie donnent aussi des jetons, non comptés ici.",
    'ov.synced': 'Sets synchronisés',
    'ov.cheapest': 'Prochains grades les moins chers',
    'ov.cheapestNote': "La composition la moins chère jusqu'au prochain grade de chaque set, aux prix de votre dernière synchronisation. Touchez-en un pour l'ouvrir avec cette composition sélectionnée.",
    'ov.cheapestEmpty': "Rien n'est encore chiffré. Synchronisez tout pour le calculer.",
    'ov.cheapestRow': 'Grade {grade}, +{tokens} jetons, {buys} à acheter',
    'ov.cheapestRowNoTokens': 'Grade {grade}, {buys} à acheter',
    'ov.coins': '{n} crédits',
    'ov.closest': "Les plus proches d'être complets",
    'ov.closestNote': 'Les sets avec le plus d’emplacements remplis par des joueurs que vous avez collectionnés. Touchez-en un pour voir ce qui manque.',
    'ov.closestEmpty': 'Synchronisez tout pour voir quels sets sont presque pleins.',
    'ov.closestRow': 'Encore {left} pour le remplir',
    'ov.sPossible': 'S possible maintenant',
    'ov.sPossibleNote': "Sets où le S est atteignable avec les joueurs sortis actuellement (vu à la dernière synchro), et que vous n'avez pas encore atteint.",
    'ov.sPossibleEmpty': "Aucun set n'a de S atteignable pour l'instant.",
    'ov.sPossibleRow': '{score} sur {target} pour le S',
    'ov.levels': 'Récompenses de Niveau de Galerie',
    'ov.levelsNote': "Votre Score de Galerie fait monter votre Niveau de Galerie. EA n'a pas publié le score requis par niveau, donc seules les récompenses de palier sont affichées.",
    'ov.level': 'Niveau {n}',
    bonusNoteMarks: "Premier propriétaire compte les cartes marquées de son icône : repérées sur des cartes que vous avez eues, ou marquées par vous. Touchez l'icône d'une carte pour la changer.",
    'firstOwner.markedFirst': 'Premier propriétaire (marqué par vous). Touchez pour démarquer.',
    'firstOwner.detectedFirst': "Premier propriétaire (d'un exemplaire que vous avez eu). Touchez pour démarquer.",
    'firstOwner.markedNot': 'Pas premier propriétaire (marqué par vous). Touchez pour marquer.',
    'firstOwner.notKnown': 'Non marqué Premier propriétaire. Touchez pour marquer.',
    'firstOwner.useMarks': 'Utiliser les marques',
    'firstOwner.usePercent': 'Supposer %',
    'firstOwner.mode': 'Premier propriétaire',
    noSearch: 'Recherche indisponible',
    'snipe.running': '🎯 Sniper Galerie en cours (voir)',
    'snipe.none': 'Aucune carte à sniper : toutes déjà dans la Galerie.',
    'snipe.title': 'Sniper Galerie · {name}',
    'snipe.sub': 'But : remplir la Galerie au moindre coût en récupérant vite les crédits. Achat jusqu’à un palier sous la moins chère du marché, une carte par joueur, puis revente 1 h au prix du marché (même palier), jamais sous le prix d’achat : coût d’une carte au plus = taxe EA de 5 %, gain si achetée en dessous. « Après achat » de la Galerie respecté (marge, ou club). Invendus remis en vente au prix du marché pendant les pauses. Les cartes alternent ; une carte obtenue est retirée du lot. Tes cibles habituelles ne sont pas touchées et reprennent à la fin si le sniper tournait.',
    'snipe.starting': 'Démarrage…',
    'snipe.suspended': 'Suspendu pendant une tâche Galerie (achats, lecture des joueurs), reprise ensuite',
    'snipe.locked': 'Pause anti-captcha, reprise automatique',
    'snipe.done': 'Terminé : {n} / {total} carte(s) obtenue(s)',
    'snipe.target': 'Cible : {name}',
    'snipe.prices': ' · achat ≤ {buy} · revente {sell}',
    'snipe.pricesKeep': ' · achat ≤ {buy} · gardée au club',
    'snipe.stats': '{snipes} obtenue(s) · {spent} crédits dépensés · {net}',
    'snipe.cost': 'coût net estimé {n} crédits',
    'snipe.gain': 'gain net estimé {n} crédits',
    'snipe.rowTarget': 'Ciblée',
    'snipe.rowWait': 'En attente',
    'snipe.rowGot': 'Obtenue',
    'snipe.rowOut': 'Retirée',
    'snipe.sniped': 'snipée à {price}',
    'snipe.listed': ' · en vente à {price}',
    'snipe.kept': ' · gardée au club',
    'snipe.stop': 'Arrêter le sniper Galerie',
    'snipe.close': 'Fermer',
    'snipe.closeHint': 'Le sniper Galerie continue en arrière-plan (bandeau du panneau FC27 Trader).',
  };
  const t = (k, vars) => {
    let s = STR[k] ?? k;
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(String(b));
    return s;
  };
  const num = (v) => fmt(Math.round(Number(v) || 0));
  const album = () => X.app?.album ?? null;

  // ---------- Bonus de tags (barème FutGenie) ----------

  const TAG_RULES = {
    1: { by: 'firstOwner', assumed: true },
    3: { by: 'nation', how: 'same' },
    17: { by: 'nation', how: 'different' },
    8: { by: 'club', how: 'same' },
    14: { by: 'club', how: 'different' },
    16: { by: 'league', how: 'same' },
    6: { by: 'league', how: 'different' },
    4: { by: 'level', is: 'bronze' },
    11: { by: 'level', is: 'silver' },
    7: { by: 'level', is: 'gold' },
    12: { by: 'holo', is: true },
    19: { by: 'rarity', is: 12 },
    2: { by: 'rarity', is: 72 },
    18: { by: 'rarity', is: 3 },
    10: { by: 'position', any: ['GK'] },
    15: { by: 'player', how: 'same' },
    20: { by: 'weakFoot', atLeast: 5 },
    5: { by: 'skillMoves', atLeast: 5 },
    21: { by: 'position', any: ['RB', 'CB', 'LB'] },
    22: { by: 'position', any: ['CDM', 'CM', 'CAM', 'LM', 'RM'] },
    23: { by: 'position', any: ['ST', 'LW', 'RW'] },
  };
  const DEFAULT_TAGS = [
    [1, 'Premier propriétaire', [[5, 150], [10, 300], [20, 500]]],
    [3, 'Même nation', [[5, 1], [10, 2], [20, 4]]],
    [17, 'Nations différentes', [[5, 1], [10, 2], [20, 4]]],
    [8, 'Même club', [[5, 1], [10, 2], [20, 4]]],
    [14, 'Clubs différents', [[5, 1], [10, 2], [20, 4]]],
    [16, 'Même championnat', [[5, 1], [10, 2], [20, 8]]],
    [6, 'Championnats différents', [[5, 1], [10, 2], [20, 4]]],
    [4, 'Bronze', [[5, 20], [10, 40], [20, 80]]],
    [11, 'Argent', [[5, 15], [10, 30], [20, 60]]],
    [7, 'Or', [[5, 1], [10, 2], [20, 4]]],
    [12, 'Holographique', [[2, 8], [4, 12], [6, 20]]],
    [19, 'Icônes', [[2, 10], [4, 15], [6, 25]]],
    [2, 'Héros', [[2, 8], [4, 12], [6, 20]]],
    [18, 'TOTW', [[3, 4], [6, 8], [10, 15]]],
    [10, 'Gardiens', [[3, 3], [6, 6], [10, 15]]],
    [15, 'Doublons', [[2, 10], [3, 15], [4, 20]]],
    [20, 'Ambidextre', [[3, 3], [5, 6], [10, 12]]],
    [5, 'Techniques', [[3, 3], [5, 6], [10, 12]]],
    [21, 'Mur défensif', [[5, 3], [10, 6], [15, 10]]],
    [22, 'Contrôle du milieu', [[5, 3], [10, 6], [15, 10]]],
    [23, 'Attaque totale', [[5, 3], [10, 6], [15, 10]]],
  ];
  const TAG_CONFIG = { tags: DEFAULT_TAGS.map(([id, name, steps]) => ({ id, name, rule: TAG_RULES[id], steps: steps.map(([from, pct]) => ({ from, pct })) })), cap: 10 };
  const POSITION_NAMES = ['GK', 'SW', 'RWB', 'RB', 'RCB', 'CB', 'LCB', 'LB', 'LWB', 'RDM', 'CDM', 'LDM', 'RM', 'RCM', 'CM', 'LCM', 'LM', 'RAM', 'CAM', 'LAM', 'RF', 'CF', 'LF', 'RW', 'RS', 'ST', 'LS', 'LW'];
  const POSITION_GENERIC = { RCB: 'CB', LCB: 'CB', RDM: 'CDM', LDM: 'CDM', RCM: 'CM', LCM: 'CM', RAM: 'CAM', LAM: 'CAM', RS: 'ST', LS: 'ST' };
  const LEVEL_REWARDS = [
    [5, 'Corona Fondations d’équipe'],
    [10, 'Choix de 1 Héros de base holographique parmi 5'],
    [15, 'Choix de 1 ICON de base holographique parmi 5'],
    [20, 'Choix de 1 Héros de base holographique 88+ parmi 5'],
    [25, 'Choix de 1 ICON de base holographique 92+ parmi 5'],
  ];

  // ---------- Premier propriétaire (local : repéré sur les cartes du club, ou marqué à la main) ----------

  const fo = { auto: new Map(), manual: new Map(), version: 0, saveTimer: null };
  {
    const s = load(K_FIRST, null);
    for (const [k, v] of Object.entries(s?.a ?? {})) if (Number(k) > 0) fo.auto.set(Number(k), v === 'f' ? 'first' : 'bought');
    for (const [k, v] of Object.entries(s?.m ?? {})) if (Number(k) > 0) fo.manual.set(Number(k), v === 'f' ? 'first' : 'not');
  }
  const saveFo = () => {
    clearTimeout(fo.saveTimer);
    fo.saveTimer = setTimeout(() => {
      const a = {};
      const m = {};
      fo.auto.forEach((v, k) => (a[k] = v === 'first' ? 'f' : 'b'));
      fo.manual.forEach((v, k) => (m[k] = v === 'first' ? 'f' : 'n'));
      save(K_FIRST, { a, m });
    }, 1500);
  };
  function firstOwnerOf(id) {
    const d = Number(id);
    const m = fo.manual.get(d);
    if (m === 'first') return true;
    if (m === 'not') return false;
    const a = fo.auto.get(d);
    return a === 'first' || (a !== 'bought' && null);
  }
  function noteFirstOwnerItems(items) {
    let n = 0;
    for (const r of Array.isArray(items) ? items : [])
      try {
        if (!r || r.concept === true || !(typeof r.isPlayer === 'function' ? r.isPlayer() : r.type === 'player')) continue;
        if (typeof r.loans === 'number' && r.loans > -1) continue;
        const d = Number(r.definitionId);
        const owners = Number(typeof r.getOwnerCount === 'function' ? r.getOwnerCount() : r.owners);
        if (!Number.isSafeInteger(d) || d <= 0 || !Number.isInteger(owners) || owners < 1) continue;
        const prev = fo.auto.get(d);
        const next = owners === 1 || prev === 'first' ? 'first' : 'bought';
        if (prev === next) continue;
        fo.auto.set(d, next);
        n++;
      } catch {}
    if (n) {
      fo.version++;
      saveFo();
    }
    return n;
  }
  function markFirstOwner(id, on) {
    const d = Number(id);
    if (!Number.isSafeInteger(d) || d <= 0) return;
    const v = on === (fo.auto.get(d) === 'first') ? null : on ? 'first' : 'not';
    v ? fo.manual.set(d, v) : fo.manual.delete(d);
    fo.version++;
    saveFo();
  }
  function scanFirstOwner() {
    const items = [];
    for (const k of ['club', 'unassigned', 'storage', 'transfer'])
      try {
        const r = services.Item.itemDao.itemRepo[k];
        const s = r && ((r.items && r.items._collection) || r._collection);
        if (s) items.push(...(Array.isArray(s) ? s : Object.values(s)));
      } catch {}
    return noteFirstOwnerItems(items);
  }
  function hookFirstOwnerRepo() {
    try {
      const repo = window.repositories?.Item;
      const P = repo && Object.getPrototypeOf(repo);
      if (!P || typeof P.setUnassignedItems !== 'function' || typeof P.addItem !== 'function') return false;
      if (P.addItem.__fc27g) return true;
      const inbox = window.ItemPile?.INBOX;
      const owned = (e) => {
        try {
          if (inbox != null && e.pile === inbox) return false;
          const a = typeof e.getAuctionData === 'function' ? e.getAuctionData() : null;
          return !(a && a.watched && !a.tradeOwner);
        } catch {
          return false;
        }
      };
      const wrap = (name, list) => {
        const orig = P[name];
        if (typeof orig !== 'function') return;
        const w = function (e) {
          const r = orig.apply(this, arguments);
          try {
            const l = list(e).filter(owned);
            if (l.length) noteFirstOwnerItems(l);
          } catch {}
          return r;
        };
        w.__fc27g = true;
        P[name] = w;
      };
      const arr = (e) => (Array.isArray(e) ? e : []);
      wrap('setUnassignedItems', arr);
      wrap('setTransferItems', arr);
      wrap('setStorageItems', arr);
      wrap('addItem', (e) => (e ? [e] : []));
      return true;
    } catch {
      return true;
    }
  }
  function hookFirstOwnerClub() {
    try {
      const svc = window.services?.Club;
      const P = svc && Object.getPrototypeOf(svc);
      if (!P || typeof P.search !== 'function') return false;
      if (P.search.__fc27g) return true;
      const orig = P.search;
      const w = function () {
        const obs = orig.apply(this, arguments);
        try {
          if (obs && typeof obs.observe === 'function') {
            const o = obs.observe;
            obs.observe = function (scope, cb) {
              return o.call(this, scope, function (_, r) {
                try {
                  const res = r && r.success !== false ? r.response || r.data : null;
                  if (Array.isArray(res?.items) && res.items.length) noteFirstOwnerItems(res.items);
                } catch {}
                return cb.apply(this, arguments);
              });
            };
          }
        } catch {}
        return obs;
      };
      w.__fc27g = true;
      P.search = w;
      return true;
    } catch {
      return true;
    }
  }

  const assume = () => {
    const pct = Math.max(0, Math.min(100, Math.round(Number(load(K_FO_PCT, 0)) || 0)));
    return { firstOwnerPct: pct, firstOwnerMode: load(K_FO_MODE, 'marks') === 'percent' ? 'percent' : 'marks' };
  };

  // ---------- Score : barème EA par carte (gradingScore), tags, meilleure composition ----------

  function cardFacts(e) {
    const n = (v) => {
      if (v == null || v === '') return null;
      const i = Number(v);
      return Number.isFinite(i) ? i : null;
    };
    const call = (k) => {
      try {
        return e && typeof e[k] === 'function' ? e[k]() : undefined;
      } catch {
        return undefined;
      }
    };
    const PP = window.PlayerPosition ?? null;
    const positions = new Set();
    const pref = call('getPreferredPosition');
    [pref != null && pref !== -1 ? pref : e.preferredPosition].concat(Array.isArray(e.possiblePositions) ? e.possiblePositions : []).forEach((p) => {
      let s = null;
      if (typeof p === 'string' && p && !/^-?\d+$/.test(p)) s = p;
      else {
        const i = n(p);
        if (i === null || i < 0) return;
        s = (PP && typeof PP[i] === 'string' ? PP[i] : POSITION_NAMES[i]) || null;
      }
      if (s) positions.add(POSITION_GENERIC[s] || s);
    });
    const def = n(e.definitionId);
    const rating = n(e.rating) ?? n(e._rating);
    return {
      score: n(e.gradingScore) || 0,
      nation: n(e.nationId) ?? n(e._nationId),
      club: n(e.teamId) ?? n(e._teamId),
      league: n(e.leagueId) ?? n(e._leagueId),
      player: def !== null ? def % 16777216 : n(e.databaseId),
      rarity: n(e.rareflag) ?? n(e._rareflag),
      level: rating === null ? null : rating < 65 ? 'bronze' : rating < 75 ? 'silver' : 'gold',
      holo: call('hasHyperCosmetics') === true || e.holographic === true,
      weakFoot: n(call('getWeakFoot')) ?? n(e.weakFoot) ?? n(e._weakFoot),
      skillMoves: n(call('getSkillMoves')) ?? n(e.skillMoves) ?? n(e._skillMoves),
      positions,
      firstOwnerEligible: e.isCollected === true && e._galleryBought !== true,
      firstOwner: e.isCollected === true && e._galleryBought !== true && firstOwnerOf(def) === true,
    };
  }
  function scoreFacts(facts, tags, cap, detail, as) {
    let base = 0;
    for (const f of facts) base += f.score;
    const bonuses = [];
    const rows = detail ? [] : null;
    const pct = as && Number(as.firstOwnerPct) > 0 ? Math.min(100, Number(as.firstOwnerPct)) : 0;
    const marks = !!(as && as.firstOwnerMode === 'marks');
    for (const tag of tags) {
      const rule = tag.rule;
      const steps = tag.steps;
      if (rule.assumed && !marks && !pct) continue;
      let bc = 0;
      let bs = 0;
      let bp = 0;
      let bb = 0;
      const consider = (count, score) => {
        let p = 0;
        for (const st of steps) {
          if (!(count >= st.from)) break;
          p = st.pct;
        }
        const b = p ? Math.floor((score * p) / 100) : 0;
        if (b > bb || (b === bb && count > bc)) {
          bc = count;
          bs = score;
          bp = p;
          bb = b;
        }
      };
      if (rule.assumed && marks) {
        let c = 0;
        let s = 0;
        for (const f of facts) if (f.firstOwner) c++, (s += f.score);
        consider(c, s);
      } else if (rule.assumed) {
        let c = 0;
        let s = 0;
        for (const f of facts) if (f.firstOwnerEligible) c++, (s += f.score);
        const k = c ? Math.round((pct / 100) * c) : 0;
        consider(k, c ? Math.floor((s * k) / c) : 0);
      } else if (rule.how === 'same' || rule.how === 'different') {
        const groups = new Map();
        for (const f of facts) {
          const v = f[rule.by];
          if (v == null) continue;
          const g = groups.get(v);
          if (g) {
            g.count++;
            g.score += f.score;
            if (f.score > g.top) g.top = f.score;
          } else groups.set(v, { count: 1, score: f.score, top: f.score });
        }
        if (rule.how === 'same') for (const g of groups.values()) consider(g.count, g.score);
        else {
          let s = 0;
          for (const g of groups.values()) s += g.top;
          consider(groups.size, s);
        }
      } else {
        let c = 0;
        let s = 0;
        for (const f of facts) {
          let hit = false;
          if (rule.any) hit = rule.any.some((p) => f.positions && f.positions.has(p));
          else hit = rule.atLeast != null ? f[rule.by] !== null && f[rule.by] >= rule.atLeast : f[rule.by] === rule.is;
          if (hit) c++, (s += f.score);
        }
        consider(c, s);
      }
      if (bb > 0) bonuses.push(bb);
      if (rows && bc > 0) rows.push({ id: tag.id, name: tag.name, count: bc, score: bs, pct: bp, bonus: bb, counts: false, assumed: !!rule.assumed && !marks });
    }
    bonuses.sort((a, b) => b - a);
    const n = Number.isFinite(cap) && cap > 0 ? cap : bonuses.length;
    let bonus = 0;
    for (let i = 0; i < bonuses.length && i < n; i++) bonus += bonuses[i];
    const out = { base, bonus, total: base + bonus };
    if (rows) {
      rows.sort((a, b) => b.bonus - a.bonus || b.count - a.count);
      let k = 0;
      for (const r of rows) if (r.bonus > 0 && k < n) (r.counts = true), k++;
      out.tags = rows;
    }
    return out;
  }
  const scoreDetail = (items) =>
    scoreFacts(
      (Array.isArray(items) ? items : []).filter(Boolean).map(cardFacts),
      TAG_CONFIG.tags,
      TAG_CONFIG.cap,
      true,
      assume(),
    );
  function countedSelection(items, required) {
    if (!Array.isArray(items)) return [];
    const s = items.slice().sort((a, b) => (Number(b?.gradingScore) || 0) - (Number(a?.gradingScore) || 0));
    const r = Number(required);
    return Number.isFinite(r) && r > 0 ? s.slice(0, r) : s;
  }
  // Recherche locale : échanges un à un entre la sélection et le reste tant que better() s'améliore
  function localSearch(sel, rest, value, better, moves) {
    sel = sel.slice();
    rest = rest.slice();
    let v = value(sel);
    for (let round = 0; round < 60; round++) {
      let moved = false;
      const outs = moves ? moves.out(sel) : sel.map((_, i) => i);
      search: for (const i of outs) {
        const ins = moves ? moves.in(rest, sel[i]) : rest.map((_, j) => j);
        for (const j of ins) {
          const next = sel.slice();
          next[i] = rest[j];
          const nv = value(next);
          if (better(nv, v, next, sel)) {
            const old = sel[i];
            sel = next;
            rest[j] = old;
            v = nv;
            moved = true;
            break search;
          }
        }
      }
      if (!moved) break;
    }
    return { sel, value: v };
  }
  function bestLineup(items, required, as = assume()) {
    const c = (Array.isArray(items) ? items : [])
      .filter(Boolean)
      .map((item) => ({ item, f: cardFacts(item), cost: 0 }))
      .sort((a, b) => b.f.score - a.f.score);
    const r = Number(required);
    const n = Number.isFinite(r) && r > 0 ? Math.min(r, c.length) : c.length;
    if (n >= c.length) return c.map((x) => x.item);
    return localSearch(
      c.slice(0, n),
      c.slice(n, n + 120),
      (s) => scoreFacts(s.map((x) => x.f), TAG_CONFIG.tags, TAG_CONFIG.cap, false, as).total,
      (a, b) => a > b,
    ).sel.map((x) => x.item);
  }
  function gradeFor(set, score) {
    const ladder = (set && Array.isArray(set.grades) ? set.grades : []).slice().sort((a, b) => Number(a.score) - Number(b.score));
    if (!ladder.length) return null;
    let cur = null;
    for (const g of ladder) {
      if (!(score >= Number(g.score))) break;
      cur = g;
    }
    // Jetons inconnus (non lus sur fut.gg) : chaque grade suivant compte comme un palier
    const paid = ladder.some((g) => Number(g.tokens) > 0);
    const next = ladder.find((g) => Number(g.score) > score) || null;
    const nextPaying = ladder.find((g) => Number(g.score) > score && (!paid || Number(g.tokens) > 0)) || null;
    return {
      grade: cur ? cur.grade : null,
      tokens: (cur && Number(cur.tokens)) || 0,
      reward: cur ? cur.reward : null,
      next,
      nextPaying,
      needed: nextPaying ? Math.max(0, Number(nextPaying.score) - score) : 0,
      maxTokens: ladder.reduce((s, g) => s + (Number(g.tokens) || 0), 0),
      ladder,
    };
  }
  function bestPossible(ladder) {
    const l = Array.isArray(ladder) ? ladder : [];
    if (!l.some((g) => typeof g.possible === 'boolean')) return undefined;
    let best = null;
    for (const g of l) if (g.possible === true && (!best || Number(g.score) > Number(best.score))) best = g;
    return best;
  }
  function planBase(items, set, priceOfFn) {
    const req = Number(set && set.required);
    const cands = (Array.isArray(items) ? items : [])
      .filter((e) => e && (e.isCollected || priceOfFn(e) > 0))
      .map((item) => ({ item, f: cardFacts(item), cost: item.isCollected ? 0 : priceOfFn(item) }));
    if (!cands.length) return null;
    const n = Number.isFinite(req) && req > 0 ? Math.min(req, cands.length) : cands.length;
    const as = assume();
    const evaluate = (s) => scoreFacts(s.map((x) => x.f), TAG_CONFIG.tags, TAG_CONFIG.cap, false, as).total;
    const sorted = cands.slice().sort((a, b) => b.f.score - a.f.score || a.cost - b.cost);
    const top = localSearch(sorted.slice(0, n), sorted.slice(n, n + 120), evaluate, (a, b) => a > b);
    const g = gradeFor(set, top.value);
    return { cands, n, evaluate, top, ceiling: (g && g.grade) || null, ladder: g ? g.ladder : [] };
  }
  const ceilingOf = (items, set, priceOfFn) => planBase(items, set, priceOfFn)?.ceiling ?? null;
  // Composition la moins chère qui atteint le grade visé (borné au meilleur grade atteignable)
  function gradeFill(items, set, priceOfFn, target) {
    const base = planBase(items, set, priceOfFn);
    if (!base) return null;
    const { cands, n, evaluate, top, ceiling, ladder } = base;
    const costOf = (s) => s.reduce((t, x) => t + x.cost, 0);
    const finish = (s, tg) => {
      const total = evaluate(s);
      const g = gradeFor(set, total);
      return { items: s.map((x) => x.item), total, grade: g ? g.grade : null, cost: costOf(s), target: tg, ceiling };
    };
    if (!ceiling) return finish(top.sel, null);
    const cap = ladder.find((g) => g.grade === ceiling);
    const want = ladder.find((g) => g.grade === target);
    const goal = want && Number(want.score) <= Number(cap.score) ? want : cap;
    const need = Number(goal.score) || 0;
    if (n >= cands.length) return finish(top.sel, goal.grade);
    const cheapen = (sel, rest) =>
      localSearch(sel, rest, evaluate, (v, _, next, cur) => v >= need && costOf(next) < costOf(cur), {
        out: (s) =>
          s
            .map((_, i) => i)
            .filter((i) => s[i].cost > 0)
            .sort((i, j) => s[j].cost - s[i].cost),
        in: (r, x) =>
          r
            .map((_, j) => j)
            .filter((j) => r[j].cost < x.cost)
            .sort((i, j) => r[i].cost - r[j].cost),
      }).sel;
    const inTop = new Set(top.sel);
    const fromTop = cheapen(
      top.sel,
      cands.filter((x) => !inTop.has(x)),
    );
    const byCost = cands.slice().sort((a, b) => a.cost - b.cost || b.f.score - a.f.score);
    let sel = byCost.slice(0, n);
    let rest = byCost.slice(n);
    let v = evaluate(sel);
    for (let k = 0; v < need && k < 200; k++) {
      const swaps = [];
      for (let i = 0; i < sel.length; i++)
        for (let j = 0; j < rest.length; j++) {
          const gain = rest[j].f.score - sel[i].f.score;
          if (gain <= 0) continue;
          swaps.push({ i, j, rank: gain / (Math.max(0, rest[j].cost - sel[i].cost) + 1) });
        }
      if (!swaps.length) break;
      swaps.sort((a, b) => b.rank - a.rank);
      let moved = false;
      for (const s of swaps.slice(0, 25)) {
        const next = sel.slice();
        next[s.i] = rest[s.j];
        const nv = evaluate(next);
        if (nv > v) {
          const old = sel[s.i];
          sel = next;
          rest = rest.slice();
          rest[s.j] = old;
          v = nv;
          moved = true;
          break;
        }
      }
      if (!moved) break;
    }
    const fromCheap = v >= need ? cheapen(sel, rest) : null;
    // Achats superflus retirés (du plus cher au moins cher) tant que le grade visé reste atteint
    let best = fromCheap && costOf(fromCheap) < costOf(fromTop) ? fromCheap : fromTop;
    for (const x of best.filter((y) => y.cost > 0).sort((p, q) => q.cost - p.cost)) {
      const next = best.filter((y) => y !== x);
      if (evaluate(next) >= need) best = next;
    }
    return finish(best, goal.grade);
  }
  function markCollected(pool, ids) {
    if (!Array.isArray(pool) || !Array.isArray(ids) || !ids.length) return 0;
    const set = new Set(ids.map(Number).filter(Number.isFinite));
    let n = 0;
    for (const it of pool)
      if (it && !it.isCollected && set.has(Number(it.definitionId))) {
        it.isCollected = true;
        it._galleryBought = true;
        n++;
      }
    return n;
  }
  function tokensUpTo(set, grade) {
    if (!grade) return 0;
    let n = 0;
    for (const g of (set && Array.isArray(set.grades) ? set.grades : []).slice().sort((a, b) => Number(a.score) - Number(b.score))) {
      n += Number(g.tokens) || 0;
      if (g.grade === grade) return n;
    }
    return 0;
  }
  function nextTokens(set, pool, priceOfFn, cur) {
    const g = cur || gradeFor(set, 0);
    if (!g || !g.nextPaying) return null;
    const goal = g.nextPaying.grade;
    const fill = gradeFill(pool, set, priceOfFn, goal);
    const at = (grade) => {
      const x = (g.ladder || []).find((y) => y.grade === grade);
      return x ? Number(x.score) : -1;
    };
    if (!fill || !fill.grade || at(fill.grade) < at(goal)) return { grade: goal, tokens: 0, cost: 0, buys: 0, reachable: false };
    return {
      grade: fill.grade,
      tokens: Math.max(0, tokensUpTo(set, fill.grade) - tokensUpTo(set, g.grade)),
      cost: Math.max(0, Math.round(Number(fill.cost) || 0)),
      buys: fill.items.filter((e) => e && !e.isCollected).length,
      reachable: true,
    };
  }
  function summariseSet(set, pool, partial, priceOfFn) {
    const owned = (Array.isArray(pool) ? pool : []).filter((e) => e && e.isCollected);
    const line = bestLineup(owned, set.required);
    const score = scoreDetail(line).total;
    const g = gradeFor(set, score);
    let next;
    if (typeof priceOfFn === 'function')
      try {
        next = nextTokens(set, pool, priceOfFn, g);
      } catch {
        next = undefined;
      }
    // Meilleur score possible avec tous les joueurs chargés (sans premier propriétaire) : grades « possibles »
    let best;
    try {
      const noFo = { firstOwnerPct: 0, firstOwnerMode: 'percent' };
      best = scoreFacts(bestLineup((Array.isArray(pool) ? pool : []).filter(Boolean), set.required, noFo).map(cardFacts), TAG_CONFIG.tags, TAG_CONFIG.cap, false, noFo).total;
    } catch {
      best = undefined;
    }
    return { ...(next !== undefined ? { next } : {}), collected: line.length, required: set.required, score, grade: (g && g.grade) || null, tokens: g ? g.tokens : 0, partial: !!partial, best, at: Date.now() };
  }
  function overview(sets, progress) {
    let synced = 0;
    let score = 0;
    let tokens = 0;
    let tokensTotal = 0;
    let partial = false;
    const nextList = [];
    const closest = [];
    const sPossible = [];
    for (const s of sets) {
      const g = gradeFor(s, 0);
      tokensTotal += g ? g.maxTokens : 0;
      const p = progress[s.key] || null;
      if (p) {
        synced++;
        score += Number(p.score) || 0;
        tokens += tokensUpTo(s, p.grade);
        if (p.partial) partial = true;
        const n = p.next;
        if (n && n.reachable && (n.tokens > 0 || !g?.maxTokens)) nextList.push({ set: s, grade: n.grade, tokens: n.tokens, cost: n.cost, buys: n.buys, per: n.tokens > 0 ? n.cost / n.tokens : n.cost });
        const req = Number(p.required) || Number(s.required) || 0;
        if (req > 0 && Number(p.collected) < req) closest.push({ set: s, collected: Number(p.collected) || 0, required: req, partial: !!p.partial });
      }
      const sg = (g && g.ladder ? g.ladder : []).find((x) => x.grade === 'S');
      if (sg && sg.possible === true && (!p || p.grade !== 'S')) sPossible.push({ set: s, score: p ? Number(p.score) || 0 : null, target: Number(sg.score) || 0 });
    }
    nextList.sort((a, b) => a.per - b.per || b.tokens - a.tokens);
    closest.sort((a, b) => b.collected / b.required - a.collected / a.required || a.required - b.required);
    sPossible.sort((a, b) => (b.score ?? 0) / b.target - (a.score ?? 0) / a.target || a.set.name.localeCompare(b.set.name, 'fr'));
    return { synced, totalSets: sets.length, score, tokens, tokensTotal, partial, nextTokens: nextList, closest, sPossible };
  }
  const loadProgress = () => load(K_PROGRESS, {}) ?? {};
  function saveProgress(key, p) {
    const all = loadProgress();
    all[key] = p;
    save(K_PROGRESS, all);
  }

  // ---------- Sets (catalogue fut.gg) ----------

  const CAT_ORDER = ['premier-league', 'laliga', 'bundesliga', 'serie-a', 'ligue-1', 'leagues', 'nations', 'rarities'];
  const categoryOf = (s) => {
    try {
      const seg = new URL(s.url).pathname.split('/').filter(Boolean);
      return seg.length >= 3 ? seg[1] : 'other';
    } catch {
      return 'other';
    }
  };
  function gallerySets() {
    const a = album();
    if (!a) return [];
    const prog = loadProgress();
    return a
      .setList()
      .map((s) => {
        const p = prog[s.key];
        const g = s.grades || {};
        const grades = ['D', 'C', 'B', 'A', 'S']
          .filter((k) => g[k] > 0)
          .map((k) => ({ grade: k, score: g[k], tokens: Number(s.tokens?.[k]) || 0, possible: p && !p.partial && Number.isFinite(p.best) ? p.best >= g[k] : undefined }));
        return { key: s.key, slug: s.key, name: s.name, category: categoryOf(s), required: a.slotsOf(s), grades, url: s.url, src: s };
      })
      .sort((x, y) => x.name.localeCompare(y.name, 'fr'));
  }
  const sortCategories = (list) => {
    const rank = (c) => {
      const i = CAT_ORDER.indexOf(c);
      return i < 0 ? CAT_ORDER.length : i;
    };
    return list.slice().sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  };
  const categoryLabel = (c) => STR[`cat.${c}`] ?? String(c || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

  // Équipes liées (hommes / femmes) d'un club : TeamConfig de la Web App
  let teamGroups = null;
  let teamToMens = null;
  function groupFor(id) {
    if (!teamGroups) {
      teamGroups = new Map();
      teamToMens = new Map();
      try {
        window.repositories.TeamConfig.getTeamLinks().forEach((o, r) => {
          if (typeof o === 'number' && typeof r === 'number') {
            if (!teamGroups.has(o)) teamGroups.set(o, [o]);
            teamGroups.get(o).push(r);
            teamToMens.set(r, o);
          }
        });
      } catch {}
    }
    if (teamGroups.has(id)) return teamGroups.get(id).slice();
    const m = teamToMens.get(id);
    return m != null && teamGroups.has(m) ? teamGroups.get(m).slice() : [id];
  }

  // Critère du set : déduit des joueurs listés par fut.gg (attributs lus chez EA si inconnus) ; sinon liste fixe
  async function resolveCriteria(set) {
    const a = album();
    const src = set.src;
    let crit = a.critOf(src);
    if (!crit) {
      const bare = Object.values(src.players ?? {})
        .map((p) => p.defId)
        .filter((id) => {
          const at = a.attrsOf(id);
          return !(at && (at.l || at.c || at.n));
        });
      if (bare.length) {
        const r = await X.requestDefIds(bare.slice(0, X.DEFID_CHUNK));
        if (!r.success) {
          if (a.fatal(r, 'defid')) return { kind: 'stop' };
        } else {
          for (const it of r.items) {
            const d = Number(it.resourceId || it.assetId || it.id);
            if (d) a.itemData.set(d, it);
          }
          a.touch();
          crit = a.critOf(src);
        }
      }
    }
    if (!crit) return { kind: 'list', ids: Object.values(src.players ?? {}).map((p) => p.defId) };
    const v = [...crit.v];
    if (crit.k === 'c') return { kind: 'club', clubs: [...new Set(v.flatMap((id) => groupFor(id)))] };
    if (crit.k === 'l') return { kind: 'league', leagues: v };
    if (crit.k === 'n') return { kind: 'nation', nations: v };
    return { kind: 'rarity', rarities: v, level: { g: 'gold', s: 'silver', b: 'bronze' }[crit.tier] ?? null };
  }

  // Champs Galerie d'EA (isCollected, gradingScore) recopiés sur les cartes créées par la Web App
  function setupItemFields() {
    const P = window.UTItemEntityFactory?.prototype;
    if (!P || typeof P.createItem !== 'function' || P.__fc27gFields) return;
    const orig = P.createItem;
    P.createItem = function (raw) {
      const it = orig.apply(this, arguments);
      try {
        if (it && raw) {
          if (raw.isCollected !== undefined) it.isCollected = raw.isCollected;
          if (raw.gradingScore !== undefined) it.gradingScore = raw.gradingScore;
        }
      } catch {}
      return it;
    };
    P.__fc27gFields = true;
  }
  function enrich(it) {
    if (!it) return it;
    const id = Number(it.definitionId ?? it.resourceId);
    const n = X.netItems.get(id);
    if (it.gradingScore == null && n?.score != null) it.gradingScore = n.score;
    if (it.isCollected == null && n) it.isCollected = n.collected === true;
    if (!it.isCollected && album()?.done.has(id)) {
      it.isCollected = true;
      it._galleryBought = true;
    }
    return it;
  }
  async function searchConceptBy(filter, offset) {
    if (typeof services?.Item?.searchConceptItems !== 'function') return { success: false, status: -1, items: [] };
    const c = X.newCriteria();
    c.type = typeof SearchType !== 'undefined' ? SearchType.PLAYER : 'player';
    c.count = PAGE;
    c.offset = offset;
    Object.assign(c, filter);
    try {
      Object.defineProperty(c, 'cacheable', { value: false });
    } catch {}
    const r = await X.observe(services.Item.searchConceptItems(c));
    const items = r.response?.items ?? r.data?.items;
    return { ...r, items: Array.isArray(items) ? items.map(enrich) : [] };
  }
  const toEntity = (raw) => {
    try {
      const it = window.factories?.Item?.createItem?.(raw);
      if (it) {
        if (raw.isCollected !== undefined) it.isCollected = raw.isCollected;
        if (raw.gradingScore !== undefined) it.gradingScore = raw.gradingScore;
        it.concept = false;
        return enrich(it);
      }
    } catch {}
    return enrich({ ...raw, definitionId: Number(raw.resourceId ?? raw.definitionId) });
  };
  // Cartes précises (statut et score) : requête /defid, 250 par appel
  async function itemsByDefIds(ids) {
    const a = album();
    const out = [];
    for (let i = 0; i < ids.length; i += X.DEFID_CHUNK) {
      const r = await X.requestDefIds(ids.slice(i, i + X.DEFID_CHUNK));
      if (!r.success) return a.fatal(r, 'defid') ? { stop: true, items: out } : { error: true, items: out };
      for (const raw of r.items) out.push(toEntity(raw));
    }
    return { items: out };
  }

  // Joueurs d'un set (tâche EA en cours requise) : recherche « concept » par critère, 91 par page, pages espacées
  async function loadPool(set, { cursor = null, maxPages = MAX_PAGES, onProgress = () => {} } = {}) {
    const a = album();
    setupItemFields();
    const crit = await resolveCriteria(set);
    if (crit.kind === 'stop') return { ok: false, reason: 'stop', items: [] };
    if (crit.kind === 'list') {
      if (!crit.ids.length) return { ok: false, reason: 'unresolved', items: [] };
      onProgress(1, 1);
      const r = await itemsByDefIds(crit.ids);
      if (r.stop) return { ok: false, reason: 'stop', items: [] };
      if (r.error && !r.items.length) return { ok: false, reason: 'error', items: [] };
      return { ok: true, criteria: crit, items: r.items, next: null };
    }
    const filters =
      crit.kind === 'club'
        ? crit.clubs.map((id) => ({ club: [id] }))
        : crit.kind === 'league'
          ? crit.leagues.map((id) => ({ league: [id] }))
          : crit.kind === 'nation'
            ? crit.nations.map((id) => ({ nation: id }))
            : crit.rarities.map((id) => ({ rarities: [id], ...(crit.level ? { level: crit.level } : {}) }));
    const from = (cursor && cursor.kind === 'page' && Number(cursor.page)) || 0;
    const pages = Math.max(1, Number(maxPages) || MAX_PAGES);
    const byId = new Map();
    let more = false;
    let n = 0;
    for (const f of filters)
      for (let p = from; p < from + pages; p++) {
        if (a.stopRequested) return { ok: false, reason: 'stop', items: [] };
        n++;
        onProgress(n, filters.length);
        if (n > 1) await a.sleep(rand(1e3, 2200), 'Galerie : page suivante');
        if (a.stopRequested) return { ok: false, reason: 'stop', items: [] };
        const r = await searchConceptBy(f, p * PAGE);
        if (!r.success) {
          if (a.fatal(r, 'concept')) return { ok: false, reason: 'stop', items: [] };
          if (!byId.size) return { ok: false, reason: 'error', items: [] };
          break;
        }
        let fresh = 0;
        for (const it of r.items) {
          const d = it && it.definitionId;
          if (d && !byId.has(d)) byId.set(d, it), fresh++;
        }
        if (!r.items.length || !fresh) break;
        if (p + 1 === from + pages) more = true;
      }
    noteAttrs([...byId.values()]);
    return { ok: true, criteria: crit, items: [...byId.values()], next: more ? { kind: 'page', page: from + pages } : null };
  }
  // Cartes collectées vues dans un set : connues du reste de l'extension (sniper, ventes)
  function noteAttrs(items) {
    const a = album();
    let n = 0;
    for (const it of items)
      if (it?.isCollected === true && !a.coll.has(Number(it.definitionId))) {
        a.addOwned(Number(it.definitionId), X.attrsFrom(it));
        n++;
      }
    if (n) a.saveColl();
  }

  // Tâche EA : sniper suspendu le temps de la lecture, une seule tâche à la fois
  async function withTask(fn) {
    const a = album();
    if (!a || a.running || !(await a.enter('gallery'))) return { busy: true };
    try {
      return { value: await fn(a) };
    } catch (err) {
      a.log(`Galerie : ${errMsg(err)}`, 'error');
      return { error: err };
    } finally {
      a.leave();
    }
  }

  // ---------- Prix (fut.gg, liste du set ou prix vérifié sur le marché) ----------

  const priceCache = new Map();
  for (const [k, v] of Object.entries(load(K_PRICES, {}) ?? {})) if (Array.isArray(v)) priceCache.set(Number(k), v);
  function priceOf(it) {
    const id = Number(it?.definitionId ?? it);
    const a = album();
    const sel = Number(a?.selection[id]);
    if (sel >= 150) return Math.floor(sel);
    const listed = Number(a?.findPlayer(id)?.minPrice);
    if (listed >= 150) return listed;
    const c = priceCache.get(id);
    return c && c[0] >= 150 ? c[0] : 0;
  }
  let priceSeq = 0;
  const priceWait = new Map();
  function fetchPrices(ids, timeout = 1e4) {
    const now = Date.now();
    const need = [...new Set(ids.map(Number))].filter((id) => id > 0 && !(now - (priceCache.get(id)?.[1] ?? 0) < PRICE_TTL) && !(album()?.findPlayer(id)?.minPrice >= 150));
    if (!need.length) return Promise.resolve();
    const id = ++priceSeq;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        // fut.gg muet : pas de nouvel essai pour ces cartes avant 10 min (évite d'attendre à chaque calcul)
        const retry = Date.now() - PRICE_TTL + 6e5;
        for (const d of need) priceCache.set(d, [priceCache.get(d)?.[0] ?? 0, retry]);
        priceWait.delete(id);
        resolve();
      }, timeout);
      priceWait.set(id, () => (clearTimeout(timer), resolve()));
      window.postMessage({ ns: NS, dir: 'to-ext', prices: { id, ids: need.slice(0, 500) } }, window.location.origin);
    });
  }
  function onPrices(cmd) {
    const now = Date.now();
    for (const id of Array.isArray(cmd.ids) ? cmd.ids : []) priceCache.set(Number(id), [0, now]);
    for (const [k, v] of Object.entries(cmd.prices ?? {})) if (Number(v) > 0) priceCache.set(Number(k), [Math.round(Number(v)), now]);
    const keep = [...priceCache].sort((x, y) => y[1][1] - x[1][1]).slice(0, MAX_PRICES);
    save(K_PRICES, Object.fromEntries(keep));
    priceWait.get(cmd.id)?.();
    priceWait.delete(cmd.id);
  }

  // Cartes du set ajoutées à sa liste (achat direct, sniper) avec leur prix connu
  function adoptCards(set, items, select = true) {
    const a = album();
    const s = a.sets[set.key];
    if (!s) return [];
    const ids = [];
    for (const it of items) {
      const d = Number(it.definitionId);
      if (!d) continue;
      if (!s.players[d]) {
        const at = X.attrsFrom(it) ?? {};
        let name = '';
        try {
          name = X.staticName(it, '');
        } catch {}
        s.players[d] = { defId: d, name: String(name || it.name || d).slice(0, 60), rating: at.r || 0, minPrice: priceOf(it), rareflag: at.f, l: at.l || 0, c: at.c || 0, n: at.n || 0, collected: false, kept: true };
      }
      const pr = priceOf(it);
      if (select) a.setSelected(d, true, pr >= 150 ? pr : 0);
      ids.push(d);
    }
    a.saveSets();
    return ids;
  }

  // ---------- Sniper Galerie : lot de cartes snipées puis revendues, suivi dans une fenêtre ----------

  let snipeDlg = null;
  function snipe(name, defIds) {
    const n = X.app?.snipeBatch(name, defIds) ?? 0;
    if (!n) return void UI.toast(t('snipe.none'), 1);
    openSnipeDialog();
  }
  function openSnipeDialog() {
    if (snipeDlg) return snipeDlg.render();
    const layer = UI.el('div', 'fc27g-modal');
    const box = UI.el('div', 'fc27g-modal-box fc27g-snipe');
    layer.appendChild(box);
    document.body.appendChild(layer);
    let timer = 0;
    const close = () => {
      clearInterval(timer);
      layer.remove();
      snipeDlg = null;
    };
    layer.addEventListener('click', (e) => e.target === layer && close());
    const render = () => {
      const s = X.app?.sniper;
      const a = album();
      const b = s?.batch ?? s?.lastBatch;
      if (!s || !b) return close();
      const active = s.batch === b;
      const left = new Set(active ? b.filters.map((f) => Number(f.defId)) : []);
      const mine = b.got ?? [];
      const cur = active && s.running && s.task === 'snipe' ? s.filter : null;
      let status;
      if (!active) status = t('snipe.done', { n: b.cards.filter((c) => !left.has(c.defId) && a.isCollected(c.defId)).length, total: b.cards.length });
      else if (s.guard.lockedUntil() > 0) status = t('snipe.locked');
      else if (s.running && s.task === 'snipe') status = s.activity || t('snipe.starting');
      else if (a.running) status = t('snipe.suspended');
      else status = t('snipe.starting');
      // Reconstruction seulement si l'état change : un clic sur « Arrêter » n'est pas perdu entre deux rafraîchissements
      const sig = JSON.stringify([active, status, cur?.label, cur?.buyPrice, cur?.sellPrice, [...left], mine.map((x) => [x.defId, x.price, x.sell, x.kept]), b.cards.map((c) => a.isCollected(c.defId))]);
      if (sig === snipeDlg?.sig) return;
      if (snipeDlg) snipeDlg.sig = sig;
      const spent = mine.reduce((sum, x) => sum + x.price, 0);
      const cost = mine.reduce((sum, x) => sum + (x.sell ? x.price - X.net(x.sell) : x.kept ? x.price : 0), 0);
      const rows = b.cards.map((c) => {
        const got = mine.filter((x) => Number(x.defId) === c.defId);
        const isCur = cur && Number(cur.defId) === c.defId;
        const done = !left.has(c.defId) && (got.length || a.isCollected(c.defId));
        const [txt, cls] = isCur ? [t('snipe.rowTarget'), 'is-target'] : done ? [t('snipe.rowGot'), 'is-done'] : left.has(c.defId) ? [t('snipe.rowWait'), ''] : [t('snipe.rowOut'), 'is-out'];
        const detail = got.map((x) => t('snipe.sniped', { price: num(x.price) }) + (x.sell ? t('snipe.listed', { price: num(x.sell) }) : x.kept ? t('snipe.kept') : '')).join(' ; ');
        const r = UI.el('div', `fc27g-snipe-row ${cls}`);
        r.append(UI.el('span', 'fc27g-snipe-name', c.label), UI.el('span', 'fc27g-snipe-detail', detail), UI.el('span', 'fc27g-snipe-state', txt));
        return r;
      });
      const actions = UI.el('div', 'fc27g-modal-actions');
      if (active) actions.append(UI.button({ variant: 'danger', label: t('snipe.stop'), onTap: () => (X.app.stopBatch(), snipeDlg && (snipeDlg.sig = ''), render()) }));
      actions.append(UI.button({ variant: active ? 'secondary' : 'primary', label: t('snipe.close'), onTap: close }));
      const list = UI.el('div', 'fc27g-snipe-rows');
      box.replaceChildren(
        ...[
        UI.el('h3', 'fc27g-modal-title', t('snipe.title', { name: b.name })),
        UI.el('p', 'fc27g-modal-text', t('snipe.sub')),
        UI.el('div', 'fc27g-snipe-status', status),
        cur ? UI.el('div', 'fc27g-snipe-target', t('snipe.target', { name: cur.label }) + (cur.buyPrice ? t(cur.sellPrice ? 'snipe.prices' : 'snipe.pricesKeep', { buy: num(cur.buyPrice), sell: num(cur.sellPrice) }) : '')) : null,
        UI.el('div', 'fc27g-snipe-stats', t('snipe.stats', { snipes: mine.length, spent: num(spent), net: cost >= 0 ? t('snipe.cost', { n: num(cost) }) : t('snipe.gain', { n: num(-cost) }) })),
        list,
        actions,
        active ? UI.el('p', 'fc27g-snipe-hint', t('snipe.closeHint')) : null,
        ].filter(Boolean),
      );
      const top = snipeDlg?.scroll ?? 0;
      list.append(...rows);
      list.scrollTop = top;
      list.onscroll = () => snipeDlg && (snipeDlg.scroll = list.scrollTop);
    };
    snipeDlg = { render, close, scroll: 0, sig: '' };
    timer = setInterval(render, 1e3);
    render();
  }

  // ---------- Petits composants d'interface ----------

  const UI = {
    el(tag, cls, text) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    },
    button({ variant = 'secondary', label, onTap }) {
      const b = UI.el('button', `fc27g-btn fc27g-btn--${variant}`, label);
      b.type = 'button';
      b.addEventListener('click', (e) => {
        if (b.classList.contains('disabled') || b.disabled) return;
        onTap?.(e);
      });
      return b;
    },
    tabs({ items, active, onChange }) {
      const root = UI.el('div', 'fc27g-tabs');
      const buttons = {};
      for (const it of items) {
        const b = UI.el('button', `fc27g-tab${it.key === active ? ' is-active' : ''}`, it.label);
        b.type = 'button';
        b.addEventListener('click', () => it.key !== active && onChange(it.key));
        buttons[it.key] = b;
        root.appendChild(b);
      }
      return { root, buttons };
    },
    notice({ text, variant = 'info' }) {
      return UI.el('div', `fc27g-notice fc27g-notice--${variant}`, text);
    },
    stepper({ min, max, steps, value, onChange }) {
      const root = UI.el('div', 'fc27g-stepper');
      const step = (steps && steps[0]) || 1;
      const out = UI.el('span', 'fc27g-stepper-value', `${value} %`);
      let v = value;
      const set = (n) => {
        v = Math.max(min, Math.min(max, n));
        out.textContent = `${v} %`;
        onChange(v);
      };
      root.append(UI.button({ label: '−', onTap: () => set(v - step) }), out, UI.button({ label: '+', onTap: () => set(v + step) }));
      return root;
    },
    field({ label, control }) {
      const root = UI.el('div', 'fc27g-field');
      root.append(UI.el('div', 'fc27g-field-label', label), control);
      return { root };
    },
    toast(text, level = 0) {
      document.querySelector('.fc27g-toast')?.remove();
      const e = UI.el('div', `fc27g-toast${level >= 2 ? ' is-error' : level === 1 ? ' is-warn' : ''}`, text);
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 4500);
    },
    confirm({ title, message, confirmLabel }) {
      return new Promise((resolve) => {
        const layer = UI.el('div', 'fc27g-modal');
        const box = UI.el('div', 'fc27g-modal-box');
        const done = (v) => (layer.remove(), resolve(v));
        const row = UI.el('div', 'fc27g-modal-actions');
        row.append(UI.button({ label: t('cancel'), onTap: () => done(false) }), UI.button({ variant: 'primary', label: confirmLabel, onTap: () => done(true) }));
        box.append(UI.el('h3', 'fc27g-modal-title', title), UI.el('p', 'fc27g-modal-text', message), row);
        layer.appendChild(box);
        layer.addEventListener('click', (e) => e.target === layer && done(false));
        document.body.appendChild(layer);
      });
    },
    shield({ onAbort }) {
      const layer = UI.el('div', 'fc27g-modal');
      const box = UI.el('div', 'fc27g-modal-box');
      const text = UI.el('p', 'fc27g-modal-text', t('loading'));
      box.append(text, UI.button({ variant: 'danger', label: t('stop'), onTap: () => onAbort?.() }));
      layer.appendChild(box);
      document.body.appendChild(layer);
      return { set: (s) => (text.textContent = s), close: () => layer.remove() };
    },
  };
  const tap = (el, fn) => el.addEventListener('click', fn);

  function badgeUrl(kind, id) {
    if (!id) return '';
    try {
      const A = window.AssetLocationUtils;
      const dark = window.UIThemeVariation ? window.UIThemeVariation.DARK : 0;
      const u = kind === 'club' ? A?.getBadgeImageUri?.(id, dark) : kind === 'league' ? A?.getLeagueImageUri?.(id, dark) : A?.getFlagImageUri?.(id, dark);
      return typeof u === 'string' ? u : '';
    } catch {
      return '';
    }
  }

  // Marché des transferts ouvert sur cette carte (joueur, rareté, prix max connu)
  function openMarketSearchForCard(item, nav) {
    try {
      const Ctl = window.UTMarketSearchFiltersViewController;
      if (!item || !nav || typeof nav.pushViewController !== 'function' || !Ctl || !window.UTSearchCriteriaDTO || !window.SearchType) return false;
      let base = Number(item.databaseId);
      if (!Number.isFinite(base) || base <= 0) {
        const d = Number(item.definitionId);
        base = Number.isFinite(d) && d > 0 ? d % 16777216 : NaN;
      }
      if (!Number.isFinite(base) || base <= 0) return false;
      const c = new window.UTSearchCriteriaDTO();
      c.type = window.SearchType.PLAYER;
      const rf = Number(item.rareflag);
      if (Number.isFinite(rf) && rf >= 0) c.rarities = [rf];
      const p = priceOf(item);
      if (p > 0) c.maxBuy = X.roundPrice(p);
      const ctl = new Ctl();
      ctl.initWithSearchCriteria(c);
      const sd = window.repositories?.Item?.getStaticDataByDefId?.(base);
      const vm = ctl.viewmodel;
      if (sd && vm && typeof vm.setPlayerData === 'function') vm.setPlayerData(sd);
      else if (vm?.searchCriteria) vm.searchCriteria.maskedDefId = base;
      nav.pushViewController(ctl, true);
      return true;
    } catch {
      return false;
    }
  }

  const currentNav = () => {
    try {
      return globalThis.getAppMain?.()?.getRootViewController?.()?.getPresentedViewController?.()?.getCurrentViewController?.() ?? null;
    } catch {
      return null;
    }
  };

  // ---------- Vue Galerie (Web App) ----------

  let View = null;
  let Controller = null;
  function defineViews() {
    if (View || typeof window.EAView !== 'function' || typeof window.EAViewController !== 'function' || !window.JSUtils?.inherits) return !!View;
    const EAView = window.EAView;
    const EAViewController = window.EAViewController;

    function GalleryView() {
      EAView.call(this);
      this._controller = null;
      this._data = null;
      this._category = null;
      this._set = null;
      this._pool = null;
      this._selected = new Set();
      this._poolError = null;
      this._loadingPool = false;
      this._filter = 'all';
      this._next = null;
      this._marketTrips = new Set();
      this._loadingMore = false;
      this._selectedRow = null;
      this._cardViews = [];
      this._renderToken = 0;
      this._panelEl = null;
    }
    function GalleryViewController() {
      EAViewController.call(this);
      this._galleryView = null;
    }
    window.JSUtils.inherits(GalleryView, EAView);
    window.JSUtils.inherits(GalleryViewController, EAViewController);
    const V = GalleryView.prototype;

    V._generate = function () {
      if (this._generated && this.__root && this.__root.isConnected) return;
      const root = UI.el('div', 'ut-pinned-list-container ut-content-container');
      const inner = UI.el('div', 'ut-content fc27g-gallery');
      this._headerEl = UI.el('div', 'fc27g-gallery-header');
      this._bodyEl = UI.el('div', 'fc27g-gallery-body');
      inner.append(this._headerEl, this._bodyEl);
      root.appendChild(inner);
      this.__root = root;
      this._generated = true;
    };
    V.getRootElement = function () {
      return this.__root;
    };
    V.setLoading = function (text) {
      if (!this._bodyEl) return;
      this._clearBody();
      this._headerEl.innerHTML = '';
      this._bodyEl.appendChild(UI.notice({ text: text || t('loading') }));
    };
    V.setError = function (text) {
      if (!this._bodyEl) return;
      this._clearBody();
      this._headerEl.innerHTML = '';
      this._bodyEl.appendChild(UI.notice({ text, variant: 'danger' }));
    };
    V.setData = function (data) {
      this._data = data;
      if (!this._category && data?.sets?.length) this._category = 'overview';
      this.render();
    };
    V._clearBody = function () {
      this._renderToken++;
      for (const v of this._cardViews)
        try {
          v?.dealloc?.();
        } catch {}
      this._cardViews = [];
      if (this._bodyEl) this._bodyEl.innerHTML = '';
      this._panelEl = null;
    };
    V.dealloc = function () {
      this._clearBody();
      EAView.prototype.dealloc?.call(this);
    };
    V._categories = function () {
      const cats = [];
      for (const s of this._data?.sets || []) if (!cats.includes(s.category)) cats.push(s.category);
      return ['overview'].concat(sortCategories(cats));
    };
    V._gradeClass = function (g) {
      const s = String(g || '')
        .trim()
        .toLowerCase();
      return /^[a-z]$/.test(s) ? ` fc27g-gallery-diamond--${s}` : '';
    };
    V._buildDiamond = function (grade, size) {
      const d = UI.el('span', `fc27g-gallery-diamond fc27g-gallery-diamond--${size || 'lg'}${this._gradeClass(grade)}`);
      d.appendChild(UI.el('span', 'fc27g-gallery-diamond-letter', grade || '-'));
      return d;
    };
    V._buildGem = function () {
      return UI.el('span', 'fc27g-gallery-gem');
    };
    V._buildCrest = function (set) {
      const box = UI.el('div', 'fc27g-gallery-crest');
      let url = '';
      try {
        const c = album().critOf(set.src);
        const v = c ? [...c.v][0] : null;
        if (v) url = badgeUrl(c.k === 'c' ? 'club' : c.k === 'l' ? 'league' : c.k === 'n' ? 'nation' : '', v);
      } catch {}
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.onerror = () => img.remove();
        box.appendChild(img);
      }
      return box;
    };
    V.render = function () {
      if (this._bodyEl) this._set ? this._renderSetDetail() : this._renderSetGrid();
    };
    V._renderSetGrid = function () {
      this._clearBody();
      this._headerEl.innerHTML = '';
      const sets = (this._data?.sets || []).filter((s) => s.category === this._category);
      this._progress = loadProgress();
      this._headerEl.appendChild(UI.el('p', 'fc27g-gallery-intro', t('intro')));
      const tabs = UI.tabs({
        items: this._categories().map((k) => ({ key: k, label: categoryLabel(k) })),
        active: this._category,
        onChange: (k) => {
          this._category = k;
          this.render();
        },
      });
      const row = UI.el('div', 'fc27g-gallery-tab-row');
      row.appendChild(tabs.root);
      const sync = UI.button({ variant: 'primary', label: t('syncAll'), onTap: () => this._syncAllSets() });
      sync.classList.add('fc27g-gallery-sync');
      sync.title = t('syncHint');
      row.appendChild(sync);
      this._headerEl.appendChild(row);
      try {
        tabs.buttons[this._category]?.scrollIntoView({ block: 'nearest', inline: 'center' });
      } catch {}
      if (this._category === 'overview') return void this._renderOverview();
      const grid = UI.el('div', 'fc27g-gallery-set-grid');
      for (const s of sets) grid.appendChild(this._buildSetCard(s));
      this._bodyEl.appendChild(grid);
    };
    V._renderOverview = function () {
      const sets = this._data?.sets || [];
      const r = overview(sets, this._progress);
      const self = this;
      const wrap = UI.el('div', 'fc27g-gallery-overview');
      const block = (title, note) => {
        const b = UI.el('section', 'fc27g-gallery-ov-block');
        b.appendChild(UI.el('h3', 'fc27g-gallery-ov-title', title));
        if (note) b.appendChild(UI.el('p', 'fc27g-gallery-ov-note', note));
        wrap.appendChild(b);
        return b;
      };
      const row = (parent, set, sub, side, onTap, badge) => {
        const d = UI.el('div', 'fc27g-gallery-ov-row');
        d.appendChild(this._buildCrest(set));
        const txt = UI.el('div', 'fc27g-gallery-ov-text');
        const name = UI.el('div', 'fc27g-gallery-ov-name', set.name);
        if (badge) name.appendChild(UI.el('span', 'fc27g-gallery-ov-badge', badge));
        txt.append(name, UI.el('div', 'fc27g-gallery-ov-sub', sub));
        d.appendChild(txt);
        if (side) d.appendChild(UI.el('div', 'fc27g-gallery-ov-side', side));
        tap(d, onTap || (() => self._openSet(set)));
        parent.appendChild(d);
      };
      const empty = (parent, text) => parent.appendChild(UI.el('p', 'fc27g-gallery-ov-empty', text));
      const mine = block(t('ov.mine'), r.synced < r.totalSets ? t('ov.mineNotePart', { n: r.synced, total: r.totalSets }) : t('ov.mineNote'));
      mine.classList.add('is-wide');
      const stats = UI.el('div', 'fc27g-gallery-ov-stats');
      const stat = (label, value, hint) => {
        const s = UI.el('div', 'fc27g-gallery-ov-stat');
        s.append(UI.el('div', 'fc27g-gallery-ov-value', value), UI.el('div', 'fc27g-gallery-ov-label', label));
        if (hint) s.title = hint;
        stats.appendChild(s);
      };
      stat(t('ov.score'), num(r.score) + (r.partial ? '+' : ''), t('ov.scoreHint'));
      stat(t('ov.tokens'), r.tokensTotal ? t('ov.tokensOf', { n: num(r.tokens), total: num(r.tokensTotal) }) : '-', t('ov.tokensHint'));
      stat(t('ov.synced'), t('ov.tokensOf', { n: r.synced, total: r.totalSets }));
      mine.appendChild(stats);
      const lv = block(t('ov.levels'), t('ov.levelsNote'));
      lv.classList.add('is-wide');
      const ul = UI.el('ul', 'fc27g-gallery-ov-levels');
      for (const [level, text] of LEVEL_REWARDS) {
        const li = document.createElement('li');
        li.append(UI.el('span', 'fc27g-gallery-ov-level', t('ov.level', { n: level })), UI.el('span', 'fc27g-gallery-ov-reward', text));
        ul.appendChild(li);
      }
      lv.appendChild(ul);
      const cheap = block(t('ov.cheapest'), t('ov.cheapestNote'));
      if (r.nextTokens.length)
        for (const e of r.nextTokens.slice(0, 6))
          row(
            cheap,
            e.set,
            e.tokens > 0 ? t('ov.cheapestRow', { grade: e.grade, tokens: e.tokens, buys: e.buys }) : t('ov.cheapestRowNoTokens', { grade: e.grade, buys: e.buys }),
            t('ov.coins', { n: num(e.cost) }),
            () => self._openSet(e.set, { grade: e.grade }),
          );
      else empty(cheap, t('ov.cheapestEmpty'));
      const close = block(t('ov.closest'), t('ov.closestNote'));
      if (r.closest.length) for (const e of r.closest.slice(0, 6)) row(close, e.set, t('ov.closestRow', { left: e.required - e.collected }), `${e.partial ? `${e.collected}+` : e.collected} / ${e.required}`);
      else empty(close, t('ov.closestEmpty'));
      const sp = block(t('ov.sPossible'), t('ov.sPossibleNote'));
      if (r.sPossible.length) for (const e of r.sPossible.slice(0, 10)) row(sp, e.set, t('ov.sPossibleRow', { score: num(e.score ?? 0), target: num(e.target) }), null, null);
      else empty(sp, t('ov.sPossibleEmpty'));
      this._bodyEl.appendChild(wrap);
    };
    V._buildSetCard = function (set) {
      const card = UI.el('div', 'fc27g-gallery-set-card');
      const top = UI.el('div', 'fc27g-gallery-set-top');
      top.appendChild(this._buildCrest(set));
      const titles = UI.el('div', 'fc27g-gallery-set-titles');
      titles.appendChild(UI.el('div', 'fc27g-gallery-set-name', set.name));
      const p = this._progress?.[set.key] || null;
      const slots = UI.el('div', 'fc27g-gallery-set-slots');
      if (p) {
        slots.textContent = t('collectedOf', { n: p.partial && p.collected < p.required ? `${p.collected}+` : p.collected, total: p.required });
        if (p.at) {
          const d = new Date(p.at).toLocaleString('fr-FR');
          slots.title = p.partial ? t('lastCheckedPartial', { date: d }) : t('lastChecked', { date: d });
        }
      } else slots.textContent = t('slots', { n: set.required });
      titles.appendChild(slots);
      const state = UI.el('div', 'fc27g-gallery-set-state');
      if (p && p.score > 0) {
        const sc = UI.el('span', 'fc27g-gallery-set-score');
        sc.append(this._buildGem(), UI.el('span', null, num(p.score)));
        state.appendChild(sc);
      }
      titles.appendChild(state);
      top.appendChild(titles);
      const sGrade = (set.grades || []).find((g) => g.grade === 'S');
      if (sGrade && sGrade.possible === true && (!p || p.grade !== 'S')) titles.appendChild(UI.el('span', 'fc27g-gallery-set-spossible', t('sPossible')));
      if (p && p.collected >= p.required) {
        card.classList.add('is-full');
        const done = UI.el('span', 'fc27g-gallery-set-done');
        done.title = t('setFull');
        top.appendChild(done);
      }
      card.appendChild(top);
      const g = gradeFor(set, 0);
      const ladder = UI.el('div', 'fc27g-gallery-ladder');
      const score = p && Number(p.score) > 0 ? Number(p.score) : 0;
      for (const step of g?.ladder || []) {
        const pip = this._buildDiamond(step.grade, 'sm');
        if (p && p.grade === step.grade) pip.classList.add('is-achieved');
        let title = step.tokens ? t('pipTitle', { grade: step.grade, score: num(step.score), tokens: step.tokens }) : t('pipTitleNoTokens', { grade: step.grade, score: num(step.score) });
        if (step.possible === false && score < Number(step.score)) {
          pip.classList.add('is-unreachable');
          title += `\n${t('pipUnreachable')}`;
        }
        pip.title = title;
        ladder.appendChild(pip);
      }
      card.appendChild(ladder);
      card.appendChild(UI.el('div', 'fc27g-gallery-tokens', g && g.maxTokens > 0 ? t('maxTokens', { n: g.maxTokens }) : ''));
      tap(card, () => this._openSet(set));
      return card;
    };
    V._syncPlan = function () {
      const prog = loadProgress();
      const now = Date.now();
      const todo = [];
      let fresh = 0;
      for (const s of this._data?.sets || []) {
        const p = prog[s.key];
        if (p && p.at && now - p.at < SYNC_FRESH_MS) fresh++;
        else todo.push(s);
      }
      return { todo, fresh };
    };
    V._syncAllSets = async function () {
      if (this._syncing) return;
      const plan = this._syncPlan();
      if (!plan.todo.length) return UI.toast(t('syncNothing'));
      const secs = Math.max(30, 10 * Math.round((plan.todo.length * 6) / 10));
      if (!(await UI.confirm({ title: t('syncTitle'), message: t('syncBody', { n: plan.todo.length, s: secs }), confirmLabel: t('syncStart') }))) return;
      this._syncing = true;
      let aborted = false;
      const sh = UI.shield({
        onAbort: () => {
          aborted = true;
          album()?.stop('Synchro Galerie arrêtée', false);
        },
      });
      let done = 0;
      let failed = 0;
      let busy = false;
      try {
        const r = await withTask(async (a) => {
          for (const s of plan.todo) {
            if (aborted || a.stopRequested) break;
            sh.set(t('syncProgress', { i: done + 1, n: plan.todo.length, name: s.name }));
            a.activity(`Synchro Galerie : ${done + 1} / ${plan.todo.length} · ${s.name}`);
            let pool = null;
            try {
              pool = await loadPool(s, { maxPages: MAX_PAGES });
            } catch {}
            if (pool?.ok) {
              const miss = pool.items.filter((e) => e && !e.isCollected).map((e) => e.definitionId);
              if (miss.length) await fetchPrices(miss);
              saveProgress(s.key, summariseSet(s, pool.items, !!pool.next, priceOf));
            } else if (pool?.reason === 'stop') break;
            else failed++;
            done++;
            if (!aborted && !a.stopRequested && done < plan.todo.length) await a.sleep(rand(1200, 2500), 'Synchro Galerie : set suivant');
          }
        });
        busy = !!r.busy;
      } finally {
        this._syncing = false;
        sh.close();
        this._progress = null;
        this.render();
      }
      if (busy) return UI.toast(t('err.busy'), 2);
      UI.toast(aborted ? t('syncStopped', { n: done }) : t('syncDone', { n: done - failed }), failed && !aborted ? 2 : 0);
    };
    V._openSet = function (set, opts) {
      const grade = opts?.grade ?? null;
      this._set = set;
      this._pool = null;
      this._poolError = null;
      this._selected = new Set();
      this._loadingPool = true;
      this._filter = 'all';
      this._next = null;
      this._marketTrips = new Set();
      this._ceiling = null;
      this._ceilingKey = null;
      this._targetGrade = null;
      this._planning = false;
      this.render();
      try {
        scanFirstOwner();
      } catch {}
      const self = this;
      withTask((a) => {
        a.activity(`Galerie : joueurs de « ${set.name} »`);
        return loadPool(set, {
          onProgress: (d, tot) => {
            if (self._progressEl) self._progressEl.textContent = t('loadingPool', { done: d, total: tot });
          },
        });
      }).then((res) => {
        if (self._set !== set) return;
        self._loadingPool = false;
        const r = res.value;
        if (res.busy) return (self._poolError = 'busy'), self.render();
        if (!r || !r.ok) return (self._poolError = r?.reason || 'error'), self.render();
        self._pool = r.items;
        self._next = r.next || null;
        self._rememberSet();
        self._selected = new Set(
          bestLineup(
            r.items.filter((e) => e.isCollected),
            set.required,
          ).map((e) => e.definitionId),
        );
        self.render();
        if (grade) self._selectForGrade(grade);
      });
    };
    V._renderSetDetail = function () {
      const set = this._set;
      this._clearBody();
      this._headerEl.innerHTML = '';
      const bar = UI.el('div', 'fc27g-gallery-detail-bar');
      bar.appendChild(
        UI.button({
          label: t('back'),
          onTap: () => {
            this._set = null;
            this._pool = null;
            this.render();
          },
        }),
      );
      bar.appendChild(this._buildCrest(set));
      const titles = UI.el('div', 'fc27g-gallery-detail-titles');
      titles.appendChild(UI.el('h2', 'fc27g-gallery-detail-title', set.name));
      bar.appendChild(titles);
      this._headerEl.appendChild(bar);
      if (this._loadingPool) {
        this._progressEl = UI.el('div', 'fc27g-gallery-progress', t('loadingPlayers'));
        return void this._bodyEl.appendChild(this._progressEl);
      }
      if (this._poolError) {
        const msg = { unresolved: t('err.unresolved'), busy: t('err.busy'), stop: t('err.stop') }[this._poolError] ?? t('err.generic');
        return void this._bodyEl.appendChild(UI.notice({ text: msg, variant: 'warning' }));
      }
      const detail = UI.el('div', 'fc27g-gallery-detail');
      const poolEl = UI.el('div', 'fc27g-gallery-pool');
      const pool = (this._pool || []).slice().sort((a, b) => (b.gradingScore || 0) - (a.gradingScore || 0));
      const missing = pool.filter((e) => !e.isCollected).length;
      const tabs = UI.tabs({
        items: [
          { key: 'all', label: t('filter.all', { n: pool.length }) },
          { key: 'missing', label: t('filter.missing', { n: missing }) },
          { key: 'collected', label: t('filter.collected', { n: pool.length - missing }) },
        ],
        active: this._filter,
        onChange: (k) => {
          this._filter = k;
          this.render();
        },
      });
      tabs.root.classList.add('fc27g-gallery-filters');
      poolEl.appendChild(tabs.root);
      const grid = UI.el('div', 'fc27g-gallery-player-grid');
      poolEl.appendChild(grid);
      if (this._next) {
        const more = UI.button({ label: t('loadMore'), onTap: () => this._loadMore() });
        more.classList.add('fc27g-gallery-more');
        this._moreButton = more;
        poolEl.appendChild(more);
      } else this._moreButton = null;
      detail.appendChild(poolEl);
      this._panelEl = UI.el('aside', 'fc27g-gallery-panel');
      detail.appendChild(this._panelEl);
      this._bodyEl.appendChild(detail);
      const shown = pool.filter((e) => (this._filter === 'missing' ? !e.isCollected : this._filter !== 'collected' || !!e.isCollected));
      this._renderPool(grid, shown);
      this._refreshPanel();
    };
    V._renderPool = function (grid, items) {
      const token = ++this._renderToken;
      const slots = [];
      this._slotsByDef = new Map();
      for (const it of items) {
        const tile = this._buildPlayerTile(it);
        grid.appendChild(tile.root);
        const s = { item: it, art: tile.art, meta: tile.meta };
        slots.push(s);
        this._slotsByDef.set(Number(it.definitionId), s);
      }
      const self = this;
      let i = 0;
      const step = () => {
        if (token !== self._renderToken) return;
        const end = Math.min(i + 8, slots.length);
        for (; i < end; i++) self._mountCard(slots[i]);
        if (i < slots.length) setTimeout(step, 0);
      };
      step();
    };
    V._renderCard = function (view, item) {
      view.render(item);
      try {
        view.setItemInfoState(window.UIItemInfoState.MAIN);
      } catch {}
    };
    V._applyFirstOwner = function (it) {
      if (!it || !it.isCollected) return;
      if (!('_galleryOwners' in it)) it._galleryOwners = it.owners;
      const f = it._galleryBought !== true && firstOwnerOf(it.definitionId);
      it.owners = f === true ? 1 : f === false ? 2 : it._galleryOwners;
    };
    V._mountCard = function (slot) {
      const it = slot.item;
      try {
        if (typeof window.UTItemViewFactory?.createLargeItem !== 'function') throw new Error('UTItemViewFactory');
        it.concept = !it.isCollected;
        this._applyFirstOwner(it);
        const v = window.UTItemViewFactory.createLargeItem(it);
        v.init();
        const r = v.getRootElement();
        if (r) slot.art.appendChild(r);
        this._renderCard(v, it);
        slot.card = v;
        this._cardViews.push(v);
      } catch {
        let name = String(it.definitionId);
        try {
          const sd = it.getStaticData?.();
          name = sd?.name || name;
        } catch {}
        slot.art.appendChild(UI.el('div', 'fc27g-gallery-card-fallback', `${name}${it.rating ? ` ${it.rating}` : ''}`));
      }
    };
    V._paintMeta = function (meta, it) {
      if (it.isCollected) return void (meta.textContent = '');
      const p = priceOf(it);
      meta.replaceChildren(UI.el('span', p ? 'fc27g-gallery-price' : 'fc27g-gallery-price is-none', p ? `${num(p)} crédits` : t('noPrice')));
    };
    V._buildFirstOwnerToggle = function (it) {
      const self = this;
      const b = UI.el('button', 'fc27g-gallery-fo');
      b.type = 'button';
      b.appendChild(Object.assign(UI.el('span', 'fut_icon icon_chemistry_first_owner'), { ariaHidden: 'true' }));
      const paint = () => {
        const d = Number(it.definitionId);
        const first = firstOwnerOf(d) === true;
        const marked = fo.manual.has(d);
        b.classList.toggle('is-first', first);
        b.classList.toggle('is-marked', marked);
        b.title = first ? (marked ? t('firstOwner.markedFirst') : t('firstOwner.detectedFirst')) : marked ? t('firstOwner.markedNot') : t('firstOwner.notKnown');
      };
      paint();
      tap(b, (e) => {
        e.stopPropagation();
        markFirstOwner(it.definitionId, firstOwnerOf(it.definitionId) !== true);
        paint();
        self._applyFirstOwner(it);
        const s = self._slotsByDef?.get(Number(it.definitionId));
        if (s?.card)
          try {
            self._renderCard(s.card, it);
          } catch {}
        self._targetGrade = null;
        self._refreshPanel();
      });
      return b;
    };
    V._buildPlayerTile = function (it) {
      const self = this;
      const tile = UI.el('div', `fc27g-gallery-card ${it.isCollected ? 'is-collected' : 'is-missing'}`);
      tile.dataset.defId = String(it.definitionId);
      const sc = UI.el('div', 'fc27g-gallery-card-score');
      sc.append(this._buildGem(), UI.el('span', 'fc27g-gallery-card-score-num', num(it.gradingScore || 0)));
      if (it.isCollected && it._galleryBought !== true) sc.appendChild(this._buildFirstOwnerToggle(it));
      tile.appendChild(sc);
      const art = UI.el('div', 'fc27g-gallery-card-art');
      tile.appendChild(art);
      const meta = UI.el('div', 'fc27g-gallery-card-meta');
      this._paintMeta(meta, it);
      tile.appendChild(meta);
      if (!it.isCollected) {
        const s = UI.el('button', 'fc27g-gallery-card-search');
        s.type = 'button';
        s.title = t('searchMarket');
        tap(s, (e) => {
          e.stopPropagation();
          const nav = self._controller?.getNavigationController?.() ?? null;
          const sc2 = self._scroller();
          const top = sc2 ? sc2.scrollTop : 0;
          if (openMarketSearchForCard(it, nav)) {
            self._marketTrips.add(Number(it.definitionId));
            self._returnScrollTop = top;
          } else UI.toast(t('noSearch'), 2);
        });
        tile.appendChild(s);
      }
      tap(tile, () => {
        const d = it.definitionId;
        self._targetGrade = null;
        if (self._selected.has(d)) self._selected.delete(d);
        else {
          if (self._selected.size >= self._set.required) return void self._flashFull();
          self._selected.add(d);
        }
        tile.classList.toggle('is-selected', self._selected.has(d));
        self._refreshPanel();
      });
      if (this._selected.has(it.definitionId)) tile.classList.add('is-selected');
      return { root: tile, art, meta };
    };
    V._loadMore = function () {
      if (!this._next || this._loadingMore) return;
      this._loadingMore = true;
      if (this._moreButton) {
        this._moreButton.classList.add('disabled');
        this._moreButton.textContent = t('loadingMore');
      }
      const self = this;
      const set = this._set;
      const cursor = this._next;
      withTask((a) => {
        a.activity(`Galerie : joueurs de « ${set.name} »`);
        return loadPool(set, { cursor });
      }).then((res) => {
        self._loadingMore = false;
        if (self._set !== set) return;
        const r = res.value;
        if (res.busy) {
          UI.toast(t('err.busy'), 2);
          return self.render();
        }
        if (!r || !r.ok) return (self._next = null), self.render();
        const have = new Set((self._pool || []).map((e) => e.definitionId));
        for (const it of r.items)
          if (!have.has(it.definitionId)) {
            have.add(it.definitionId);
            self._pool.push(it);
            if (it.isCollected && self._selected.size < set.required) self._selected.add(it.definitionId);
          }
        self._next = r.next || null;
        self._rememberSet();
        self.render();
      });
    };
    V._refreshPanel = function () {
      if (!this._panelEl) return;
      const set = this._set;
      const chosen = (this._pool || []).filter((e) => this._selected.has(e.definitionId));
      const counted = countedSelection(chosen, set.required);
      const detail = scoreDetail(counted);
      const total = detail.total;
      const g = gradeFor(set, total);
      const P = this._panelEl;
      P.innerHTML = '';
      const head = UI.el('div', 'fc27g-gallery-panel-head');
      head.append(this._buildCrest(set), UI.el('div', 'fc27g-gallery-panel-name', set.name));
      P.append(head, this._buildDiamond(g && g.grade, 'lg'), UI.el('div', 'fc27g-gallery-panel-label', t('totalScore')));
      const tot = UI.el('div', 'fc27g-gallery-panel-total');
      tot.append(this._buildGem(), UI.el('span', null, num(total)));
      P.appendChild(tot);
      if (detail.bonus > 0) P.appendChild(UI.el('div', 'fc27g-gallery-panel-split', t('scoreSplit', { base: num(detail.base), bonus: num(detail.bonus) })));
      P.appendChild(this._buildProgress(g, total));
      const rows = UI.el('div', 'fc27g-gallery-panel-rows');
      const row = (k, v, cls) => {
        const r = UI.el('div', `fc27g-gallery-panel-row${cls ? ` ${cls}` : ''}`);
        r.append(UI.el('span', null, k), UI.el('span', null, v));
        rows.appendChild(r);
        return r;
      };
      this._selectedRow = row(t('selected'), `${counted.length} / ${set.required}`);
      const buys = counted.filter((e) => !e.isCollected);
      const unpriced = buys.filter((e) => !priceOf(e)).length;
      const cost = buys.reduce((s, e) => s + priceOf(e), 0);
      if (cost > 0 || unpriced) row(t('cost'), `${num(cost)}${unpriced ? ` + ${unpriced} ${t('noPrice')}` : ''}`, 'fc27g-gallery-panel-row--cost');
      if (g && g.maxTokens > 0) row(t('tokensEarned'), String(g.tokens));
      if (g?.reward) row(t('reward'), g.reward);
      P.appendChild(rows);
      const tags = this._buildTagBreakdown(detail);
      if (tags) P.appendChild(tags);
      P.appendChild(this._buildFirstOwnerWhatIf());
      const actions = UI.el('div', 'fc27g-gallery-actions');
      actions.appendChild(this._buildGradePicker(g));
      const clear = UI.button({
        label: t('deselectAll'),
        onTap: () => {
          this._selected = new Set();
          this._targetGrade = null;
          this.render();
        },
      });
      if (!this._selected.size) clear.classList.add('disabled');
      actions.appendChild(clear);
      P.appendChild(actions);
      const buy = UI.button({ variant: 'primary', label: t('buyMissing', { n: buys.length }), onTap: () => this._buyMissing(buys) });
      buy.classList.add('fc27g-gallery-buy');
      if (!buys.length) buy.classList.add('disabled');
      P.appendChild(buy);
      const running = X.app?.sniper?.batch?.name === set.name;
      const snipeBtn = UI.button({ label: running ? t('snipe.running') : t('snipeMissing', { n: buys.length }), onTap: () => (running ? openSnipeDialog() : this._snipeMissing(buys)) });
      snipeBtn.classList.add('fc27g-gallery-buy');
      if (!running && !buys.length) snipeBtn.classList.add('disabled');
      P.appendChild(snipeBtn);
      const as = assume();
      P.appendChild(UI.el('p', 'fc27g-gallery-panel-note', as.firstOwnerMode === 'marks' ? t('bonusNoteMarks') : as.firstOwnerPct > 0 ? t('bonusNoteAssumed', { pct: as.firstOwnerPct }) : t('bonusNoteTags')));
      this._refreshCeiling();
    };
    V._flashFull = function () {
      const r = this._selectedRow;
      if (!r) return;
      r.classList.remove('is-full');
      void r.offsetWidth;
      r.classList.add('is-full');
      clearTimeout(this._fullTimer);
      this._fullTimer = setTimeout(() => r.classList.remove('is-full'), 1200);
    };
    V._buildTagBreakdown = function (detail) {
      const list = (detail.tags || []).filter((x) => x.bonus > 0);
      if (!list.length) return null;
      const d = UI.el('details', 'fc27g-gallery-tags');
      if (this._tagsOpen) d.open = true;
      d.addEventListener('toggle', () => (this._tagsOpen = d.open));
      const sum = document.createElement('summary');
      sum.append(UI.el('span', null, t('bonusTags')), UI.el('span', null, `+${num(detail.bonus)}`));
      d.appendChild(sum);
      let dropped = false;
      for (const x of list) {
        const r = UI.el('div', `fc27g-gallery-tag${x.counts ? '' : ' is-dropped'}`);
        if (!x.counts) dropped = true;
        r.append(
          UI.el('span', 'fc27g-gallery-tag-name', x.assumed ? t('tagAssumed', { name: x.name }) : x.name),
          UI.el('span', 'fc27g-gallery-tag-meta', t('tagMeta', { count: x.count, pct: x.pct })),
          UI.el('span', 'fc27g-gallery-tag-bonus', `+${num(x.bonus)}`),
        );
        d.appendChild(r);
      }
      if (dropped) d.appendChild(UI.el('div', 'fc27g-gallery-tags-note', t('tagCapNote', { n: TAG_CONFIG.cap })));
      return d;
    };
    V._buildGradePicker = function (g) {
      const ladder = g?.ladder || gradeFor(this._set, 0)?.ladder || [];
      const box = UI.el('div', `fc27g-gallery-target${this._planning ? ' is-busy' : ''}`);
      box.appendChild(UI.el('span', 'fc27g-gallery-target-label', this._planning ? t('planning') : t('targetLabel')));
      const chips = UI.el('div', 'fc27g-gallery-target-chips');
      const ceilIdx = this._ceiling ? ladder.findIndex((x) => x.grade === this._ceiling) : -1;
      const known = this._ceilingKey != null && this._ceilingKey === this._poolKey();
      ladder.forEach((x, i) => {
        const c = UI.el('button', `fc27g-gallery-target-chip${this._gradeClass(x.grade)}`, x.grade);
        c.type = 'button';
        if (known && i > ceilIdx) {
          c.disabled = true;
          c.classList.add('is-unreachable');
          c.title = t('targetOutOfReach');
        }
        if (this._targetGrade === x.grade) c.classList.add('is-active');
        if (this._planning) c.disabled = true;
        tap(c, () => !c.disabled && this._selectForGrade(x.grade));
        chips.appendChild(c);
      });
      box.appendChild(chips);
      return box;
    };
    V._poolKey = function () {
      const pool = this._pool || [];
      let n = 0;
      for (const e of pool) if (e && e.isCollected) n++;
      const as = assume();
      return `${this._set ? this._set.key : ''}:${pool.length}:${n}:fo${as.firstOwnerMode === 'marks' ? `m${fo.version}` : `p${as.firstOwnerPct}`}`;
    };
    V._buildFirstOwnerWhatIf = function () {
      const box = UI.el('div', 'fc27g-gallery-whatif');
      const mode = assume().firstOwnerMode;
      const tabs = UI.tabs({
        items: [
          { key: 'marks', label: t('firstOwner.useMarks') },
          { key: 'percent', label: t('firstOwner.usePercent') },
        ],
        active: mode,
        onChange: (k) => {
          save(K_FO_MODE, k);
          this._targetGrade = null;
          this._refreshPanel();
        },
      });
      box.appendChild(UI.field({ label: t('firstOwner.mode'), control: tabs.root }).root);
      if (mode === 'marks') return box;
      const st = UI.stepper({
        min: 0,
        max: 100,
        steps: [10],
        value: assume().firstOwnerPct,
        onChange: (v) => {
          save(K_FO_PCT, v);
          this._targetGrade = null;
          this._refreshPanel();
        },
      });
      box.appendChild(UI.field({ label: t('firstOwnerWhatIf'), control: st }).root);
      return box;
    };
    V._refreshCeiling = function () {
      if (!this._set || !this._pool || !this._pool.length) return;
      const key = this._poolKey();
      if (this._ceilingKey === key || this._ceilingPending === key) return;
      if (this._ceilingKey && this._ceilingKey.split(':fo')[0] === key.split(':fo')[0]) {
        clearTimeout(this._ceilingTimer);
        this._ceilingTimer = setTimeout(() => {
          this._ceilingTimer = null;
          if (this._poolKey() === key) void this._computeCeiling(key);
        }, 400);
        return;
      }
      void this._computeCeiling(key);
    };
    V._computeCeiling = async function (key) {
      if (this._ceilingKey === key || this._ceilingPending === key) return;
      this._ceilingPending = key;
      try {
        await this._awaitPoolPrices();
        if (this._poolKey() !== key) return;
        this._ceiling = ceilingOf(this._pool, this._set, priceOf);
        this._ceilingKey = key;
        this._refreshPanel();
      } catch {
      } finally {
        if (this._ceilingPending === key) this._ceilingPending = null;
      }
    };
    V._awaitPoolPrices = async function () {
      const ids = (this._pool || []).filter((e) => e && !e.isCollected).map((e) => e.definitionId);
      if (!ids.length) return;
      await fetchPrices(ids);
      for (const s of this._slotsByDef?.values() ?? []) if (s.meta) this._paintMeta(s.meta, s.item);
    };
    V._selectForGrade = async function (grade) {
      const set = this._set;
      if (!set || !this._pool || this._planning) return;
      this._planning = true;
      this._refreshPanel();
      let fill = null;
      try {
        await this._awaitPoolPrices();
        await new Promise((r) => setTimeout(r, 30));
        fill = gradeFill(this._pool, set, priceOf, grade);
        if (fill) {
          this._selected = new Set(fill.items.map((e) => e.definitionId));
          this._ceiling = fill.ceiling;
          this._ceilingKey = this._poolKey();
          this._targetGrade = fill.target;
        }
      } catch {
      } finally {
        this._planning = false;
        this.render();
      }
      if (!fill) UI.toast(t('highestNone'), 2);
      else if (!fill.target) UI.toast(t('targetNoGrade'), 2);
      else if (fill.target !== grade) UI.toast(t('targetClamped', { grade, best: fill.target }), 1);
      else if (this._next) UI.toast(t('highestPartial'), 1);
    };
    V._buildProgress = function (g, total) {
      const wrap = UI.el('div', 'fc27g-gallery-progress-wrap');
      const next = g && g.next;
      const ladder = (g && g.ladder) || [];
      const i = ladder.findIndex((x) => x.grade === (g && g.grade));
      const from = i >= 0 ? Number(ladder[i].score) : 0;
      const to = next ? Number(next.score) : null;
      const row = UI.el('div', 'fc27g-gallery-progress-row');
      row.appendChild(UI.el('span', `fc27g-gallery-progress-grade${this._gradeClass(g && g.grade)}`, (g && g.grade) || '-'));
      const track = UI.el('div', 'fc27g-gallery-progress-track');
      const fill = UI.el('div', 'fc27g-gallery-progress-fill');
      let w = 100;
      if (to != null && to > from) w = Math.max(0, Math.min(100, ((total - from) / (to - from)) * 100));
      fill.style.width = `${w.toFixed(1)}%`;
      track.appendChild(fill);
      row.append(track, UI.el('span', `fc27g-gallery-progress-grade${this._gradeClass(next && next.grade)}`, next ? next.grade : '-'));
      wrap.appendChild(row);
      wrap.appendChild(UI.el('div', 'fc27g-gallery-progress-note', next ? t('pointsTo', { score: num(Math.max(0, Number(next.score) - total)), grade: next.grade }) : t('maxGrade')));
      const best = bestPossible(ladder);
      const bi = best ? ladder.indexOf(best) : -1;
      if (best !== undefined && i <= bi) wrap.appendChild(UI.el('div', 'fc27g-gallery-progress-best', best ? t('bestPossible', { grade: best.grade }) : t('noGradePossible')));
      return wrap;
    };
    // Achat direct (moteur Galerie de l'extension) : fenêtre d'achat ouverte sur ces cartes
    V._buyMissing = function (items) {
      if (!items?.length) return;
      const ids = adoptCards(this._set, items);
      if (!ids.length) return;
      X.app?.ui?.openBuy(this._set.key, ids);
      this._buyTrip = true;
    };
    V._snipeMissing = function (items) {
      if (!items?.length) return;
      const ids = adoptCards(this._set, items, false);
      if (ids.length) snipe(this._set.name, ids);
      this._refreshPanel();
    };
    // Retour sur la vue : cartes achetées depuis (achat direct, sniper, marché) comptées comme collectées
    V._recheck = async function () {
      if (!this._set || !Array.isArray(this._pool)) return;
      const a = album();
      const bought = this._pool.filter((e) => e && !e.isCollected && a.done.has(Number(e.definitionId))).map((e) => Number(e.definitionId));
      let changed = markCollected(this._pool, bought);
      const trips = [...this._marketTrips].filter((id) => this._pool.some((e) => e && !e.isCollected && Number(e.definitionId) === id));
      this._marketTrips = new Set();
      if (trips.length && !a.running && !this._rechecking) {
        this._rechecking = true;
        try {
          const set = this._set;
          const r = await itemsByDefIds(trips);
          if (this._set !== set) return;
          changed += markCollected(
            this._pool,
            (r.items || []).filter((e) => e && e.isCollected === true).map((e) => Number(e.definitionId)),
          );
        } finally {
          this._rechecking = false;
        }
      }
      if (changed) {
        for (const e of this._pool) {
          if (this._selected.size >= this._set.required) break;
          if (e.isCollected && e._galleryBought) this._selected.add(e.definitionId);
        }
        const sc = this._scroller();
        const top = sc ? sc.scrollTop : 0;
        this._rememberSet();
        this.render();
        if (sc) sc.scrollTop = top;
      }
    };
    V._scroller = function () {
      return this._bodyEl?.parentElement || null;
    };
    V._restoreReturnScroll = function () {
      if (this._returnScrollTop == null) return;
      const top = this._returnScrollTop;
      this._returnScrollTop = null;
      const sc = this._scroller();
      if (this._set && sc) sc.scrollTop = top;
    };
    V._rememberSet = function () {
      if (!this._set || !this._pool) return;
      try {
        this._progress = null;
        const set = this._set;
        const pool = this._pool;
        const partial = !!this._next;
        saveProgress(set.key, summariseSet(set, pool, partial));
        this._awaitPoolPrices().then(() => {
          if (this._set === set && this._pool === pool) saveProgress(set.key, summariseSet(set, pool, partial, priceOf));
        });
      } catch {}
    };

    const C = GalleryViewController.prototype;
    C._getViewInstanceFromData = function () {
      return new GalleryView();
    };
    C.init = function () {
      if (this.initialized) return;
      EAViewController.prototype.init.call(this);
      this._galleryView = this.getView();
      if (this._galleryView) this._galleryView._controller = this;
    };
    C.getNavigationTitle = function () {
      return t('hub.gallery');
    };
    C.viewWillAppear = function () {
      EAViewController.prototype.viewWillAppear.call(this);
      this.getNavigationController()?.setNavigationVisibility?.(true, true);
      setTimeout(() => {
        this.refresh();
        try {
          this._galleryView?._restoreReturnScroll();
          void this._galleryView?._recheck();
        } catch {}
      }, 0);
    };
    C.refresh = function () {
      const v = this._galleryView;
      if (!v || v._data) return;
      const sets = gallerySets();
      if (sets.length) v.setData({ sets });
      else v.setError(t('err.noSets'));
    };
    View = GalleryView;
    Controller = GalleryViewController;
    return true;
  }

  // Vue Galerie poussée sur la navigation courante ; set ouvert (et grade visé) en option
  function open(key, grade) {
    if (!defineViews()) return false;
    // Onglet affiché d'abord (sinon la vue serait poussée sur l'onglet Accueil masqué)
    const nav = currentNav() ?? homeHub?.getNavigationController?.();
    if (!nav || typeof nav.pushViewController !== 'function') return false;
    const ctl = new Controller();
    ctl.init();
    nav.pushViewController(ctl, true);
    if (key)
      setTimeout(() => {
        const v = ctl._galleryView;
        v?._controller?.refresh();
        const set = v?._data?.sets.find((s) => s.key === key);
        if (set) v._openSet(set, grade ? { grade } : undefined);
      }, 50);
    return true;
  }

  // ---------- Tuile « Galerie » du hub d'accueil ----------

  let homeHub = null;
  let homeTile = null;
  function tileArt() {
    return [
      '<svg viewBox="0 0 132 72" role="img" aria-hidden="true" focusable="false">',
      '<g stroke-width="2.5" fill="none">',
      '<rect x="-15" y="-15" width="30" height="30" rx="5" transform="translate(24 44) rotate(45)" fill="rgba(226,112,58,.18)" stroke="#e2703a"/>',
      '<rect x="-20" y="-20" width="40" height="40" rx="6" transform="translate(66 36) rotate(45)" fill="rgba(242,193,78,.18)" stroke="#f2c14e"/>',
      '<rect x="-15" y="-15" width="30" height="30" rx="5" transform="translate(108 44) rotate(45)" fill="rgba(168,85,247,.2)" stroke="#a855f7"/>',
      '</g>',
      '<g font-size="15" font-weight="700" text-anchor="middle" dominant-baseline="central">',
      '<text x="24" y="44" fill="#e2703a">D</text>',
      '<text x="66" y="36" fill="#f2c14e">B</text>',
      '<text x="108" y="44" fill="#a855f7">S</text>',
      '</g>',
      '</svg>',
    ].join('');
  }
  function buildTile() {
    const Tile = window.UTTileView;
    if (typeof Tile !== 'function') return null;
    const v = new Tile();
    v.init?.();
    v.setTitle?.(t('hub.gallery'));
    const root = v.getRootElement();
    if (!root) return null;
    root.classList.add('tile', 'col-1-1', 'fc27g-tile-hub-gallery');
    const content = root.querySelector('.tileContent');
    if (content) {
      const info = UI.el('div', 'ut-tile-content-graphic-info');
      info.appendChild(UI.el('p', 'description', t('hub.galleryDescription')));
      const img = UI.el('div', 'image fc27g-gallery-tile-art');
      img.innerHTML = tileArt();
      info.appendChild(img);
      content.appendChild(info);
    }
    tap(root, () => open());
    return v;
  }
  function applyHomeTile(hub) {
    try {
      const root = hub?.getView?.()?.getRootElement?.();
      const grid = root?.querySelector('.grid.layout-hub');
      if (!grid) return;
      homeHub = hub;
      homeTile ??= buildTile();
      const el = homeTile?.getRootElement?.();
      if (!el || el.parentNode === grid) return;
      const sbc = grid.querySelector('.ut-tile-hub-sbc');
      sbc && sbc.nextSibling ? grid.insertBefore(el, sbc.nextSibling) : grid.appendChild(el);
    } catch {}
  }
  function hookHub() {
    const P = window.UTHomeHubViewController?.prototype;
    if (!P || typeof P.viewDidAppear !== 'function') return false;
    if (P.viewDidAppear.__fc27g) return true;
    const orig = P.viewDidAppear;
    const w = function () {
      const r = orig.apply(this, arguments);
      applyHomeTile(this);
      return r;
    };
    w.__fc27g = true;
    P.viewDidAppear = w;
    return true;
  }

  // ---------- Lignes du marché : score de grade et « COLLECTÉ » ----------

  function decorateRow(cell) {
    const it = cell.getData?.() ?? cell.data;
    if (!it || !(typeof it.isPlayer === 'function' ? it.isPlayer() : it.type === 'player')) return;
    const root = cell.__root || cell.getRootElement?.();
    const name = root?.querySelector('.entityContainer .name') || root?.querySelector('.name');
    if (!name) return;
    const id = Number(it.definitionId);
    const n = X.netItems.get(id);
    const auction = it._auction || it.auction || it.getAuctionData?.() || null;
    const market = !!auction && Number(auction.tradeId) > 0 && auction.tradeOwner !== true;
    const collected = market && (it.isCollected === true || n?.collected === true || !!album()?.done.has(id));
    const score = Number(it.gradingScore ?? n?.score);
    let box = name.querySelector('.fc27g-row-chips');
    if (!collected && !(score > 0)) return void box?.remove();
    if (!box) {
      box = UI.el('span', 'fc27g-row-chips');
      name.appendChild(box);
    }
    const kids = [];
    if (score > 0) {
      const s = UI.el('span', 'fc27g-points-chip');
      s.append(UI.el('span', 'fc27g-gallery-gem'), UI.el('span', null, num(score)));
      s.title = 'Score Galerie de la carte (barème EA)';
      kids.push(s);
    }
    if (collected) {
      const c = UI.el('span', 'fc27g-collect-chip');
      c.append(UI.el('span', 'fc27g-collect-chip-mark'), UI.el('span', 'fc27g-collect-chip-label', t('collectedChip')));
      c.title = t('collectedChipHint');
      kids.push(c);
    }
    box.replaceChildren(...kids);
  }
  function hookRows() {
    const P = window.UTItemTableCellView?.prototype;
    if (!P || typeof P.render !== 'function') return false;
    if (P.render.__fc27g) return true;
    const orig = P.render;
    const w = function () {
      const r = orig.apply(this, arguments);
      try {
        decorateRow(this);
      } catch {}
      return r;
    };
    w.__fc27g = true;
    P.render = w;
    return true;
  }

  // ---------- Installation ----------

  function install() {
    setupItemFields();
    let tries = 0;
    const tick = () => {
      const ok = [hookHub(), hookRows(), hookFirstOwnerRepo(), hookFirstOwnerClub(), defineViews()].every(Boolean);
      if (!ok && ++tries <= 60) setTimeout(tick, 1e3);
    };
    tick();
    // Hub déjà affiché au chargement : tuile posée sans attendre une navigation
    setTimeout(() => {
      try {
        const c = globalThis.getAppMain?.()?.getRootViewController?.()?.getPresentedViewController?.()?.getCurrentViewController?.()?.getCurrentController?.();
        if (c instanceof (window.UTHomeHubViewController ?? Object) && window.UTHomeHubViewController) applyHomeTile(c);
      } catch {}
    }, 2e3);
  }

  X.gallery = {
    install,
    open,
    onPrices,
    sets: gallerySets,
    progress: loadProgress,
    overview: () => overview(gallerySets(), loadProgress()),
    categoryLabel,
    snipe,
  };
})();
