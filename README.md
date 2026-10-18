# FC27 Trader

Extension Chrome unique pour la Web App FC 27 : fusion de SnipeFC27 (0.6.2) et AlbumFC27 (3.3). Elle remplace les deux anciennes extensions : désinstalle-les avant de charger celle-ci (les réglages, cibles, sets et statistiques sont repris automatiquement, même stockage).

## Installation

`chrome://extensions` > Mode développeur > Charger l'extension non empaquetée > dossier `FC27Trader` (« Recharger » après mise à jour).

## Interface

- **Bouton flottant** (bas à gauche) : état en direct, bouton ▶ / ■ pour lancer ou arrêter le sniper, clic pour ouvrir le panneau.
- **Panneau** : onglets Sniper, Galerie (résumé, accès à la vue Galerie de la Web App, catalogue fut.gg), Ventes, Journal, Réglages. Un bandeau unique montre la tâche en cours avec un seul bouton **Arrêter** (et « Lever la pause » pendant une pause anti-captcha).
- **Popup** de l'extension : état, crédits, profit, lancer / arrêter le sniper, alternance, relister, ouvrir le panneau.

## Sniper (moteur SnipeFC27)

1. Onglet Sniper > **Cibles** : chercher un joueur, « + Filtre de la Web App », ou ajouter des cartes manquantes depuis la Galerie (🎯).
2. **Lancer le sniper**. Prix automatiques : achat un palier sous la moins chère du marché, baissé jusqu'au profit visé (2 % du prix, 150 minimum, ou profit min réglé), revente 1 h jamais sous le prix d'achat taxe comprise.
3. **Alterner les cibles** (remplace le mode nuit) : change de cible toutes les 450 à 900 recherches.

Ventes détectées vite : liste de transferts relue toutes les 2 à 4 min pendant le sniping tant que des cartes sont en vente ; liste pleine ou crédits insuffisants : relue toutes les 1 à 2 min et reprise dès qu'une vente libère la place ou les crédits (avant : nouvel essai après 8 à 12 min). Achat direct Galerie en attente de crédits : relecture toutes les minutes.

Fonctionnement continu, toujours actif : le sniper attend au lieu de s'arrêter (crédits insuffisants, liste de transferts pleine, quota anti-ban, cible sans prix rentable), reprend après rechargement de la Web App (session expirée, connexion automatique si la session EA est ouverte), après une tâche Galerie et après une pause. À la reprise, un prix vérifié il y a moins de 5 min est réutilisé (pas de nouveau sondage). Pendant ses pauses : ventes encaissées, non-assignés rangés, snipes invendus remis en vente.

Hésitations : 8 % des recherches, +0,5 à 1,5 s (au lieu de +1 à 4 s).

## Galerie (système FutGenie)

Vue intégrée à la Web App, reprise de l'extension FutGenie : tuile **Galerie** sur l'accueil (hub) de la Web App, ou « Ouvrir la Galerie » dans l'onglet Galerie du panneau.

- **Sets** : catalogue fut.gg (importé à l'ouverture, au plus toutes les 6 h, ou un set à la fois avec « Envoyer à FC27 Trader » sur fut.gg). Places, seuils de grade D à S et jetons par grade (si la page les affiche) lus sur fut.gg. Rubriques fut.gg en onglets (Premier League, LaLiga…, Championnats, Raretés), plus un onglet **Aperçu**.
- **Joueurs d'un set lus chez EA** : critère du set (club avec ses équipes liées hommes / femmes, championnat, nation, rareté) déduit des joueurs listés par fut.gg, puis recherche « concept » de la Web App par critère (91 joueurs par page, 10 pages au plus, « Charger plus de joueurs » ensuite, 1 à 2 s entre les pages). Chaque carte porte son **score de grade EA** (`gradingScore`) et son statut **collecté** (`isCollected`). Critère non reconnu : joueurs listés par fut.gg (requête /defid). Le sniper est suspendu pendant la lecture puis reprend (une seule tâche EA à la fois).
- **Score d'un set** : meilleures cartes collectées dans la limite des places (recherche locale qui tient compte des tags), plus les **bonus de tags** (même nation / club / championnat, différents, bronze / argent / or, holographique, icônes, héros, TOTW, gardiens, doublons, ambidextre, techniques, mur défensif, contrôle du milieu, attaque totale ; 10 plus gros tags comptés). **Premier propriétaire** : cartes repérées avec un seul propriétaire au club (lu au passage dans les écrans de la Web App) ou marquées à la main (icône sur la carte), ou simulation en %.
- **Fiche d'un set** : grille des cartes (Tous / Manquants / Collectionnés), score par carte, prix, loupe = marché des transferts ouvert sur la carte. Panneau : grade, score total, base + bonus, progression vers le grade suivant, détail des tags, jetons. **Le moins cher pour atteindre D…S** : composition la moins chère qui atteint le grade (cartes collectées gratuites, achats au prix connu), grades hors de portée grisés. **Acheter les N manquants** ouvre la fenêtre d'achat direct de l'extension (prix du marché, écart max, revente) ; **🎯 Sniper les N manquants** ouvre la fenêtre **Sniper Galerie** et lance tout de suite le sniping de ces cartes. But : remplir la Galerie au moindre coût en récupérant vite les crédits, pas faire du profit. Achat jusqu'à un palier sous la moins chère du marché, une carte par joueur, revente 1 h au prix du marché (même palier) si l'achat est en dessous, jamais sous le prix d'achat : coût au plus la taxe EA de 5 %, gain si la carte est achetée en dessous. « Après achat » (marge, club) respecté. Cartes en alternance, carte obtenue retirée du lot. La fenêtre suit la cible, ses prix, les cartes snipées et mises en vente, les crédits dépensés et le coût net ; « Fermer » laisse tourner, « Arrêter le sniper Galerie » arrête le lot. Coût suivi avec celui de la Galerie (onglet Ventes), hors statistiques du sniper (sessions, recherches, profit / h). Carte dont la moins chère est au prix minimum EA : achat à ce prix. Mise en vente bornée à la fourchette EA de la carte. Cibles habituelles non modifiées : suspendues pendant le lot, reprises à la fin si le sniper tournait. Le lot survit aux rechargements et aux tâches Galerie.
- **Tout synchroniser** : lit chaque set tour à tour (sets lus il y a moins de 6 h sautés), interruptible. **Aperçu** : score de Galerie estimé, jetons gagnés, sets synchronisés, récompenses de niveau, prochains grades les moins chers, sets les plus proches d'être complets, S possible avec les joueurs sortis.
- **Prix** : prix vérifié (fenêtre d'achat), prix fut.gg du set, sinon API de prix fut.gg (lots de 50, mis en cache 6 h). Carte sans prix : jamais proposée dans un plan, prix sondé sur le marché avant l'achat.
- **Marché** : score de grade et pastille « COLLECTÉ » sur les lignes des résultats de recherche.

## Ventes

Un seul **Relister les invendus** (sniper arrêté) : remet chaque invendu un palier sous la moins chère du marché, jamais sous le prix d'achat (taxe comprise pour un snipe, prix payé pour une carte Galerie). Règle unique de revente des cartes Galerie (achat direct, sniper Galerie, invendus) : prix du marché si l'achat est en dessous, jamais sous le prix payé. Pendant les pauses du sniper, les invendus Galerie sont remis en vente de la même façon. « Cartes Galerie en vente » : recalé sur la vraie liste de transferts à chaque lecture (ouverture de la Web App, pauses du sniper, liste ouverte dans la Web App, bouton « ↻ Actualiser ») ; une carte absente n'est plus suivie. Suivi du sniper (profit réel, par heure, en attente, snipes, recherches, temps, rendement sur les cartes vendues, taxe EA payée, délai de vente moyen, profit du jour), coût réel de la Galerie, dernières ventes.

Suivi détaillé du sniper (bouton « Réinitialiser » commun) :

- **Sessions** : une session couvre le fonctionnement continu du sniper, rechargements de la Web App et tâches Galerie compris ; un arrêt manuel la clôt, plus de 30 min d'interruption en ouvre une nouvelle. Par session : durée, recherches, snipes / ratés, profit réel (rattaché à la session d'achat, même si la vente arrive plus tard), en attente, profit / h ; détail des cibles au survol. 30 dernières sessions conservées. L'onglet Sniper et la popup affichent la session en cours.
- **Par joueur** : snipes / ratés, ventes, profit réel, profit moyen par vente, délai moyen de vente, cartes en attente ; recherches ciblées, investi et meilleure vente au survol. Tri par profit, snipes ou activité récente, export CSV (presse-papiers).
- **Par jour** : 14 derniers jours, durée, recherches, snipes, ventes, profit réel.

## Garde-fous (communs à toutes les tâches)

- Une seule tâche EA à la fois.
- Limites anti-ban (Prudent 600 recherches / h, 3 000 / 24 h, 120 achats / h, 600 / 24 h ; ou Stevie), délais et pauses réglables dans Réglages.
- Captcha ou limite EA (426, 429, 458, 460, 494, 512, 521, marché vide sans filtre) : pause de 30 à 60 min puis reprise automatique, doublée si ça se répète dans les 24 h (4 h max), notification système. Un captcha affiché doit être résolu à la main dans la Web App.

## Limites connues

- Testé sur une Web App simulée uniquement (moteurs, suspension et reprise, ventes, relist, pause captcha).
- Import fut.gg dépendant de la mise en page de fut.gg.
- Galerie : filtres club / championnat de la recherche « concept » passés comme dans FutGenie, filtre nation non vérifié ; API de prix fut.gg (`/api/fut/player-prices/27/`) non documentée, prix absents si elle ne répond pas. Barème des tags et jetons repris de FutGenie (non publiés par EA).
- L'automatisation de la Web App est contraire aux conditions d'EA : risque de restriction du marché ou du compte.
