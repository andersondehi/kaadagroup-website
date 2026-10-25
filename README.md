# Site Kaada Group — kaadagroup.com

Site statique bilingue (français à la racine, anglais dans `en/`), hébergé sur **Netlify**.
Ce dépôt contient le site exactement tel qu'il est publié : Netlify le déploie à chaque envoi sur `main`.

## Structure des adresses

Kaada Group est l'entreprise, **Sankora** son produit, **Data4Child** un module de Sankora.

| Page | Adresse publique | Fichier |
|---|---|---|
| Sankora (sous-site, charte Sankora) | `/sankora`, `/en/sankora` | `sankora/index.html`, `en/sankora/index.html`, `sankora/assets/` |
| Data4Child | `/sankora/data4child/` | `sankora/data4child/index.html` (+ `en/`) |
| Comment fonctionne Data4Child | `/sankora/data4child/fonctionnement` | `sankora/data4child/fonctionnement.html` (+ `en/`) |

- Les adresses déclarées aux moteurs (balises canoniques, hreflang, `sitemap.xml`) sont **sans `.html`**.
- Les anciennes adresses de Data4Child (`/data4child`, `/data4child-fonctionnement`, avec ou sans `.html`, FR et EN)
  sont redirigées en 301 par `netlify.toml`, qui fixe aussi `/sankora` sur `sankora.html`.
- Les pages sous `sankora/` et la page `404.html` utilisent des liens absolus (`/assets/…`, `/css/…`).
- **Sankora est un sous-site** avec sa propre charte graphique (logo, couleurs, polices Outfit, Figtree et Geist Mono hébergées
  dans `sankora/assets/fonts/`), son propre menu et son pied de page ; le site Kaada Group y renvoie depuis son menu,
  son accueil et son pied de page. Les anciennes adresses (`/sankora.html`, `/sankora-fonctionnement`, FR et EN)
  sont redirigées en 301 vers `/sankora` par `netlify.toml`.

## Pages produits : ne pas éditer à la main

Le sous-site Sankora (source : `outils/site-netlify/sankora-site/`), les pages Data4Child, leurs entrées de menu et l'encart de l'accueil sont produits par l'outil
`outils/site-netlify/` du dépôt `kaadagroup-charte`. Modifier les textes là-bas, puis lancer **dans cet ordre** :

```bash
python3 ajouter_sankora.py ../../../kaadagroup-website
python3 moderniser_site.py ../../../kaadagroup-website
python3 structure_seo.py   ../../../kaadagroup-website   # obligatoire, en dernier
```

## Référencement

- **Google Search Console** : propriété de domaine `kaadagroup.com`, validée par un enregistrement TXT
  `google-site-verification=…` dans le DNS (à ne pas supprimer). Sitemap : `https://kaadagroup.com/sitemap.xml`.
- **Bing Webmaster Tools** : site `https://kaadagroup.com/`, même sitemap.
- **IndexNow** : le fichier de clé `5fe4add952fc43c9433859a6355e0817.txt` est à la racine. À chaque envoi sur `main`
  qui modifie des pages, l'action GitHub `.github/workflows/indexnow.yml` attend la mise en ligne Netlify puis
  signale les pages modifiées (tout le sitemap si celui-ci a changé). Lancement manuel possible (« Run workflow »,
  case « Soumettre toutes les pages »).

## Domaine, DNS et messagerie

- Domaine `kaadagroup.com` enregistré chez **GoDaddy** ; zone DNS gérée chez GoDaddy (serveurs `ns07`/`ns08.domaincontrol.com`).
- Site : Netlify (site **kaadagroup**), HTTPS Let's Encrypt, « Force HTTPS » activé.
- Messagerie : **Zoho Mail** — ne pas toucher aux enregistrements MX ni aux TXT `zoho-verification` et SPF (`v=spf1 include:zoho.com ~all`).
