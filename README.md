# Site Kaada Group — www.kaadagroup.com

Site statique bilingue (français à la racine, anglais dans `en/`), hébergé sur **Netlify**.
Ce dépôt contient le site exactement tel qu'il est publié : Netlify le déploie à chaque envoi sur `main`.

## Pages produits

- `sankora.html` et `en/sankora.html` : **Sankora**, traçabilité agricole et conformité RDUE / EUDR
  (contrôle et correction des polygones, analyse du risque de déforestation, lots tracés, dossier de diligence raisonnée).
- `data4child.html` et `en/data4child.html` : **Data4Child**, module de Sankora pour le suivi et la remédiation
  du travail des enfants (SSRTE / CLMRS).
- Démonstrations animées : `js/sankora.js` ; styles : bloc `SANKORA:DEBUT … SANKORA:FIN` de `css/style.css`.
- Ces pages et leurs entrées de menu sont produites par `outils/site-netlify/ajouter_sankora.py`
  (dépôt `kaadagroup-charte`) : modifier les textes là-bas, puis relancer le script sur ce dossier.

## Mise en ligne

1. Netlify › site **kaadagroup** › Site configuration › Build & deploy › **Link repository** :
   GitHub › `andersondehi/kaadagroup-website`, branche `main`, commande de build vide, dossier de publication `.`.
2. Netlify › Domain management › **Add a domain** : `kaadagroup.com` (Netlify ajoute aussi `www`).
3. Zone DNS de kaadagroup.com (gérée chez Hostinger, serveurs de noms `dns-parking.com`) :
   - enregistrement **A** `@` → `75.2.60.5` (remplace les deux adresses Hostinger) ;
   - enregistrement **CNAME** `www` → `kaadagroup.netlify.app` (remplace `www.kaadagroup.com.cdn.hstgr.net`) ;
   - **ne pas toucher** aux enregistrements MX et TXT (SPF) : la messagerie reste chez Hostinger.
4. Netlify › HTTPS : vérifier le certificat Let's Encrypt et activer « Force HTTPS ».
