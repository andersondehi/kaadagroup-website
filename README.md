# Site Kaada Group — kaadagroup.com

Site statique bilingue (français à la racine, anglais dans `en/`), hébergé sur **Netlify**.
Ce dépôt contient le site exactement tel qu'il est publié : Netlify le déploie à chaque envoi sur `main`.

## Structure des adresses

Kaada Group est l'entreprise, **Sankora** son produit, **Data4Child** un module de Sankora.

| Page | Adresse publique | Fichier |
|---|---|---|
| Sankora, accueil de la section | `/sankora`, `/en/sankora` | `sankora.html`, `en/sankora.html` |
| Sankora, la plateforme en détail | `/sankora/plateforme` | `sankora/plateforme.html` (+ `en/`) |
| Comment fonctionne Sankora | `/sankora/fonctionnement` | `sankora/fonctionnement.html` (+ `en/`) |
| Data4Child | `/sankora/data4child/` | `sankora/data4child/index.html` (+ `en/`) |
| Comment fonctionne Data4Child | `/sankora/data4child/fonctionnement` | `sankora/data4child/fonctionnement.html` (+ `en/`) |

- Les adresses déclarées aux moteurs (balises canoniques, hreflang, `sitemap.xml`) sont **sans `.html`**.
- Les anciennes adresses (`/data4child`, `/data4child-fonctionnement`, `/sankora-fonctionnement`, avec ou sans `.html`,
  FR et EN) sont redirigées en 301 par `netlify.toml`, qui sert aussi `/sankora` depuis `sankora.html`.
- Les pages sous `sankora/` et la page `404.html` utilisent des liens absolus (`/assets/…`, `/css/…`).
- **La section Sankora garde la charte de Kaada Group** (couleurs, polices, menu plein écran, île de navigation, pied de page).
  Ses pages s'en distinguent par trois points : le logo Sankora remplace celui de Kaada Group (en-tête, menu plein écran,
  pied de page), le bandeau « Visiter le site Sankora » n'y figure pas, et une barre de navigation propre à Sankora
  (Services, Solutions, Filières, RDUE, À propos, menus déroulants) se place sous l'en-tête.
- Tout le contenu Sankora et Data4Child (captures réelles, récit en captures, démonstrations, FAQ, filières) vit dans
  cette section ; le reste du site n'en garde que de brèves références avec un lien vers `/sankora`.

## Images : uniquement des écrans réels de Sankora

Pour parler de Sankora, de Data4Child ou de l'agritech, le site n'utilise **aucune image créée par IA ni écran dessiné** :
seulement des captures réelles de l'application (`assets/img/captures/`, prises sur la démonstration, données fictives).
`captures_reelles.py` remplace les anciennes illustrations agricoles par ces captures ; les pictogrammes dessinés des
filières sont retirés en attendant de vraies photos de terrain. Les illustrations des services informatiques, des secteurs
hors agriculture et de la page À propos sont conservées. Les images de partage de Sankora et Data4Child
(`assets/img/sankora/og-*.jpg`) montrent aussi un écran réel (`generer_og.py`).

## Pages produits : ne pas éditer à la main

La section Sankora (module `section_sankora.py` ; textes de l'accueil dans `sankora-site/`), les pages Data4Child, les entrées de menu et les renvois du reste du site sont produits par l'outil
`outils/site-netlify/` du dépôt `kaadagroup-charte`. Modifier les textes là-bas, puis lancer **dans cet ordre** :

```bash
python3 ajouter_sankora.py ../../../kaadagroup-website
python3 moderniser_site.py ../../../kaadagroup-website
python3 captures_reelles.py ../../../kaadagroup-website
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
