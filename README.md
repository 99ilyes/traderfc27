# FC27 Trader

Extension Chrome unique pour la Web App FC 27 : fusion de SnipeFC27 (0.6.2) et AlbumFC27 (3.3). Elle remplace les deux anciennes extensions : désinstalle-les avant de charger celle-ci (les réglages, cibles, sets et statistiques sont repris automatiquement, même stockage).

## Installation

`chrome://extensions` > Mode développeur > Charger l'extension non empaquetée > dossier `FC27Trader` (« Recharger » après mise à jour).

## Interface

- **Bouton flottant** (bas à gauche) : état en direct, bouton ▶ / ■ pour lancer ou arrêter le sniper, clic pour ouvrir le panneau.
- **Panneau** : onglets Sniper, Galerie (sets et joueurs importés de fut.gg), Ventes, Journal, Réglages. Un bandeau unique montre la tâche en cours avec un seul bouton **Arrêter** (et « Lever la pause » pendant une pause anti-captcha).
- **Popup** de l'extension : état, crédits, profit, lancer / arrêter le sniper, alternance, relister, ouvrir le panneau.

## Sniper (moteur SnipeFC27)

1. Onglet Sniper > **Cibles** : chercher un joueur ou « + Filtre de la Web App ».
2. **Lancer le sniper**. Prix automatiques : achat un palier sous la moins chère du marché, baissé jusqu'au profit visé (2 % du prix, 150 minimum, ou profit min réglé), revente 1 h jamais sous le prix d'achat taxe comprise.
3. **Alterner les cibles** (remplace le mode nuit) : change de cible toutes les 450 à 900 recherches.

Ventes détectées vite : liste de transferts relue toutes les 2 à 4 min pendant le sniping tant que des cartes sont en vente ; liste pleine ou crédits insuffisants : relue toutes les 1 à 2 min et reprise dès qu'une vente libère la place ou les crédits (avant : nouvel essai après 8 à 12 min). Achat direct Galerie en attente de crédits : relecture toutes les minutes.

Fonctionnement continu, toujours actif : le sniper attend au lieu de s'arrêter (crédits insuffisants, liste de transferts pleine, quota anti-ban, cible sans prix rentable), reprend après rechargement de la Web App (session expirée, connexion automatique si la session EA est ouverte), après une tâche Galerie et après une pause. À la reprise, un prix vérifié il y a moins de 5 min est réutilisé (pas de nouveau sondage). Pendant ses pauses : ventes encaissées, non-assignés rangés, snipes invendus remis en vente.

Hésitations : 8 % des recherches, +0,5 à 1,5 s (au lieu de +1 à 4 s).

## Galerie (import fut.gg, achat puis revente)

1. Onglet Galerie > **+ Importer depuis fut.gg** : ouvre la Galerie fut.gg.
2. Sur fut.gg, bouton **Envoyer à FC27 Trader** (bas à droite) :
   - page d'un **set** : tous ses joueurs (pages suivantes du set comprises) et le nombre de cartes requises ;
   - page d'un **joueur** : la carte de l'adresse, ajoutée au set « Joueurs fut.gg » et déjà sélectionnée pour l'achat.

   Prix de base : prix fut.gg actuel lu à l'envoi par l'API de prix du site (`/api/fut/player-prices/27/`, lots de 50), sinon prix affiché sur la page ; il sert de prix de départ de l'achat (modifiable). Sans prix : 4e annonce la moins chère du marché, sondée avant l'achat.
   Autant d'envois que voulu, importés dans l'ordre à l'ouverture de la Web App (ou tout de suite si elle est ouverte). Renvoyer un set le met à jour.
3. Dans le panneau : ouvrir un set, sélectionner les joueurs manquants (statut collecté lu chez EA ; joueurs déjà dans la Galerie ignorés). « × » retire un set, ou un joueur du set « Joueurs fut.gg ».
4. **Acheter** (sur un set) ou **Acheter la sélection** (tous les sets) : fenêtre d'achat (prix de départ modifiable, résumé coût / revente / taxe, écart max), puis lancement.

Mise à jour depuis 1.x : au premier lancement, les sets du catalogue automatique sont retirés (sauf ceux qui contiennent des joueurs sélectionnés) ; vue Galerie FutGenie, scans, synchronisation par critère, sniper Galerie et catalogue automatique supprimés.

Achat : pour chaque joueur, recherche au prix de départ (prix fut.gg, ou 4e annonce la moins chère du marché si sans prix) et achat de l'annonce la moins chère ; page de résultats pleine : recherche resserrée sous la moins chère vue (3 fois au plus) pour ne pas rater moins cher. Rien trouvé : prix relevé d'un palier, jusqu'à l'écart max (3 paliers par défaut). Revente 1 h **au prix d'achat**, ou **au prix du marché** (un palier sous l'annonce suivante) si le joueur a été acheté en dessous : coût au plus la taxe EA de 5 %, gain possible. Liste de transferts pleine : carte gardée au club. Crédits insuffisants : attente des ventes (relecture toutes les minutes). Le sniper est suspendu pendant les achats puis reprend. Joueurs non achetés : restent sélectionnés, « Racheter au prix vu » pour ceux dont le prix a dépassé l'écart max.

## Ventes

Un seul **Relister les invendus** (sniper arrêté) : remet chaque invendu un palier sous la moins chère du marché, jamais sous le prix d'achat (taxe comprise pour un snipe, prix payé pour une carte Galerie). Règle unique de revente des cartes Galerie (achat, invendus) : prix d'achat, ou prix du marché si l'achat est en dessous. Pendant les pauses du sniper, les invendus Galerie sont remis en vente de la même façon. « Cartes Galerie en vente » : recalé sur la vraie liste de transferts à chaque lecture (ouverture de la Web App, pauses du sniper, liste ouverte dans la Web App, bouton « ↻ Actualiser ») ; une carte absente n'est plus suivie. Suivi du sniper (profit réel, par heure, en attente, snipes, recherches, temps, rendement sur les cartes vendues, taxe EA payée, délai de vente moyen, profit du jour), coût réel de la Galerie, dernières ventes.

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
- Import fut.gg dépendant de la mise en page de fut.gg (liens `/players/…/27-<defId>`, prix à côté de l'icône crédit) ; API de prix fut.gg non documentée, format lu défensivement (non vérifié sur le vrai site).
- L'automatisation de la Web App est contraire aux conditions d'EA : risque de restriction du marché ou du compte.
