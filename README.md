# Site web Kaada Group (KDG)

Site statique moderne de 17 pages, sans base de données ni CMS : rapide, sûr et déployable en quelques minutes.

## Pages
Accueil · Services (10 expertises) · Agritech (solutions, test EUDR, compte à rebours) · Secteurs · Réalisations (4 études de cas à compléter) · Technologies · Ressources + 3 articles · À propos · Équipe · Carrières · Postuler (candidature avec CV) · Contact (diagnostic gratuit + FAQ) · Mentions légales · 404.

## Mise en ligne (recommandé : Netlify, gratuit)
1. Créer un compte sur netlify.com, puis glisser-déposer ce dossier dans « Sites ».
2. Connecter le domaine kaadagroup.com (Domain management). HTTPS est automatique.
3. Les 4 formulaires fonctionnent sans configuration : `contact` (page Contact), `contact-rapide` (bas de la page d'accueil), `candidature` (avec CV joint) et `newsletter`. Dans « Forms » → « Form notifications », ajouter une notification e-mail vers contact@kaadagroup.com pour `contact` et `contact-rapide`, et une autre vers carrieres@kaadagroup.com pour `candidature`. Vérifier les limites mensuelles du plan gratuit (nombre d'envois et volume de fichiers joints).

Autre hébergeur (cPanel, o2switch, LWS…) : envoyer le contenu du dossier dans `public_html`, puis brancher les formulaires sur un service comme Formspree (ajouter `action="https://formspree.io/f/VOTRE_ID"` sur chaque balise `<form>`).

## Modifier le site
Le site est généré par le dossier source `kdg2` (fichiers Python). Pour une modification ponctuelle, éditer directement le fichier `.html` concerné.
- Couleurs, typographies et animations : `css/style.css` (variables en haut du fichier, mode clair et mode sombre).
- Menu plein écran, île de navigation et recherche : `navigation.py` (entrées du menu et index de recherche).
- Coordonnées (téléphone, e-mails, adresse) : présentes dans chaque page ; les remplacer partout avec « Rechercher et remplacer ».

## Photos
Les photos de `assets/img/photos/` sont des illustrations provisoires à remplacer par vos propres photos, en conservant le même nom de fichier (JPG, 1600 px de large, moins de 300 Ko) :
Toutes les photos sont des photos réelles libres de droits issues de Pexels (licence Pexels : usage commercial autorisé, attribution non requise) : `terrain-agent.jpg`, `cooperative.jpg`, `aerien.jpg`, `drone.jpg`, `cacao.jpg`, `feves.jpg`, `achats.jpg`, `developpeurs.jpg`, `code.jpg`, `datacenter.jpg`, `reunion.jpg`, `atelier.jpg`, `collaboration.jpg`, `bureau.jpg`, `bureau-dev.jpg`, `equipe-1.jpg` à `equipe-4.jpg`.
Chaque photo existe en trois largeurs pour accélérer l'affichage sur téléphone : `nom.jpg` (1600 px), `nom-1200.jpg` et `nom-800.jpg`. Quand vous remplacez une photo, remplacez les trois fichiers avec le même nom.
Remplacer en priorité : le portrait du fondateur (`equipe-1.jpg`) et les portraits de l'équipe.

## À compléter avant la mise en ligne
- Réalisations : remplacer les éléments entre crochets [X] par les chiffres réels, confirmer les clients et retirer les badges « À compléter » (rechercher `a-completer` dans `realisations.html` et `equipe.html`).
- Équipe : noms des membres, photos réelles ; valider la citation du fondateur.
- Témoignages clients (page Réalisations).
- Téléphone : vérifier `+225 07 48 60 05 075` (il semble compter un chiffre de trop).
- E-mails utilisés : contact@kaadagroup.com et carrieres@kaadagroup.com (à créer ou à adapter).
- Mentions légales : forme juridique, RCCM, directeur de la publication, hébergeur.
- Après la mise en ligne : Google Search Console (envoyer sitemap.xml), Google Business Profile, liens LinkedIn et Facebook.
