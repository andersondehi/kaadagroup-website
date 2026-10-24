# Site Kaada Group — www.kaadagroup.com

Site statique multi-pages (HTML, CSS, JavaScript) avec un petit script PHP pour les formulaires.
Hébergement : Hostinger (le domaine kaadagroup.com y est déjà rattaché).

Les sources du site (générateur Python) sont dans le dépôt privé `kaadagroup-charte`, dossier `generateur-site/`.
Ce dépôt contient uniquement le site prêt à publier : ne pas modifier les pages ici, elles sont regénérées.

## Pages

Accueil, Expertises, Technologies, Agritech, **Sankora** (page produit), Secteurs, Réalisations, Équipe, À propos,
Carrières, Postuler, Contact, Ressources (3 articles), Mentions légales, page 404.
Adresses courtes possibles : `www.kaadagroup.com/sankora`, `/contact`, `/agritech`…

## Fichiers serveur

| Fichier | Rôle |
|---|---|
| `.htaccess` | Redirection de kaadagroup.com vers www, adresses courtes, page 404, cache, en-têtes de sécurité |
| `envoyer.php` | Reçoit les formulaires (contact, contact rapide, candidature avec CV, lettre d'information) et les envoie par e-mail |
| `_messages/` | Créé automatiquement par `envoyer.php` : copie de chaque message et des CV, fermée au public |

## Mise en ligne sur Hostinger (déploiement Git, recommandé)

1. hPanel › Sites › kaadagroup.com › **Gestionnaire de fichiers** : vider le dossier `public_html`
   (supprimer la page par défaut d'Hostinger).
2. hPanel › Sites › kaadagroup.com › **Avancé › Git** : dans « Créer un dépôt », copier la **clé SSH** affichée.
3. GitHub › dépôt `kaadagroup-website` › Settings › **Deploy keys** › Add deploy key : coller la clé (lecture seule).
4. Retour dans hPanel › Git : dépôt `git@github.com:andersondehi/kaadagroup-website.git`, branche `main`,
   répertoire vide (= `public_html`), puis **Créer**, puis **Déployer**.
5. Activer le **déploiement automatique** (webhook) : chaque envoi sur `main` met le site à jour.
6. hPanel › **SSL** : vérifier que le certificat est actif et activer « Forcer HTTPS ».

Variante sans Git : télécharger le ZIP du dépôt, l'envoyer dans `public_html` avec le Gestionnaire de fichiers
et l'extraire (les fichiers doivent être directement dans `public_html`, pas dans un sous-dossier).

## E-mails

Les formulaires envoient à `contact@kaadagroup.com` (candidatures : `carrieres@kaadagroup.com`), depuis
`site@kaadagroup.com`. Ces adresses doivent exister dans hPanel › **E-mails** (boîtes ou redirections).
Si un envoi échoue, le message reste enregistré dans `_messages/` et l'échec est noté dans `_messages/erreurs-envoi.log`.

## Après la mise en ligne

- Google Search Console : ajouter `https://www.kaadagroup.com/` et soumettre `sitemap.xml`.
- Tester chaque formulaire une fois et vérifier la réception des e-mails.
