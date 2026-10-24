<?php
/**
 * Kaada Group · réception des formulaires du site (contact, contact rapide, candidature, lettre d'information).
 * Hébergement Hostinger (PHP 8). Chaque envoi est :
 *   1. contrôlé (méthode, champ piège anti-robots, limite de fréquence, e-mail valide) ;
 *   2. archivé dans _messages/ (dossier fermé au public par son .htaccess) ;
 *   3. transmis par e-mail à l'adresse de destination, avec le CV en pièce jointe pour une candidature.
 * Réponse JSON : 200 si le message est enregistré, 4xx/5xx sinon (le site affiche alors l'adresse e-mail de repli).
 */
declare(strict_types=1);

const DESTINATAIRES = [
    'candidature' => 'carrieres@kaadagroup.com',
    'defaut'      => 'contact@kaadagroup.com',
];
const EXPEDITEUR      = 'site@kaadagroup.com';   // adresse du domaine (à créer ou garder en alias sur Hostinger)
const NOM_EXPEDITEUR  = 'Site Kaada Group';
const TAILLE_MAX_CV   = 8 * 1024 * 1024;          // 8 Mo, comme annoncé sur le formulaire
const EXTENSIONS_CV   = ['pdf', 'doc', 'docx'];
const ENVOIS_MAX      = 6;                        // par adresse IP…
const FENETRE         = 600;                      // …et par période de 10 minutes
const DOSSIER         = __DIR__ . '/_messages';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function repondre(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['ok' => $code < 300, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
function propre(string $v, int $max = 5000): string {
    $v = str_replace(["\r\n", "\r"], "\n", trim($v));
    $v = preg_replace('/[^\P{C}\n\t]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
}
function entete_sur(string $v): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $v) ?? '');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') repondre(405, 'Méthode non autorisée.');

/* --- Lecture des champs : les cases à cocher multiples (besoins) arrivent sous le même nom --- */
$champs = [];
$type = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($type, 'application/x-www-form-urlencoded') === 0) {
    $brut = file_get_contents('php://input', false, null, 0, 200000) ?: '';
    foreach (explode('&', $brut) as $paire) {
        if ($paire === '') continue;
        [$k, $v] = array_pad(explode('=', $paire, 2), 2, '');
        $champs[urldecode($k)][] = urldecode($v);
    }
} else {
    foreach ($_POST as $k => $v) $champs[$k] = is_array($v) ? array_values($v) : [$v];
}
$un = fn(string $k): string => propre((string)($champs[$k][0] ?? ''));

/* --- Anti-robots : champ piège rempli = succès silencieux, rien n'est envoyé --- */
if ($un('site-web') !== '') repondre(200, 'Merci.');

$formulaire = preg_replace('/[^a-z-]/', '', strtolower($un('form-name'))) ?: 'contact';
$email = $un('email');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) repondre(422, 'Adresse e-mail invalide.');
if ($formulaire !== 'newsletter' && $un('nom') === '') repondre(422, 'Le nom est obligatoire.');

/* --- Archivage et limite de fréquence --- */
if (!is_dir(DOSSIER) && !@mkdir(DOSSIER, 0750, true)) repondre(500, "Enregistrement impossible.");
$garde = DOSSIER . '/.htaccess';
if (!is_file($garde)) @file_put_contents($garde, "Require all denied\nDeny from all\n");

$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$compteur = DOSSIER . '/.frequence-' . hash('sha256', $ip) . '.json';
$instants = is_file($compteur) ? (json_decode((string)file_get_contents($compteur), true) ?: []) : [];
$instants = array_values(array_filter($instants, fn($t) => $t > time() - FENETRE));
if (count($instants) >= ENVOIS_MAX) repondre(429, 'Trop d\'envois rapprochés. Réessayez dans quelques minutes.');
$instants[] = time();
@file_put_contents($compteur, json_encode($instants), LOCK_EX);

$libelles = [
    'nom' => 'Nom', 'organisation' => 'Organisation', 'email' => 'E-mail', 'telephone' => 'Téléphone',
    'service' => 'Service recherché', 'secteur' => "Secteur d'activité", 'budget' => 'Budget envisagé',
    'besoins' => 'Besoins', 'message' => 'Message', 'poste' => 'Poste visé', 'experience' => 'Expérience',
    'disponibilite' => 'Disponibilité', 'linkedin' => 'Profil en ligne', 'consentement' => 'Consentement',
];
$lignes = [];
$donnees = ['formulaire' => $formulaire, 'date' => date('c'), 'ip' => $ip];
foreach ($champs as $k => $valeurs) {
    if (in_array($k, ['form-name', 'site-web'], true)) continue;
    $valeurs = array_map(fn($v) => propre((string)$v), $valeurs);
    $texte = implode(', ', array_filter($valeurs, fn($v) => $v !== ''));
    if ($k === 'consentement' && $texte === 'on') $texte = 'Oui';
    if ($texte === '') continue;
    $donnees[$k] = $texte;
    $etiquette = $libelles[$k] ?? ucfirst(str_replace(['-', '_'], ' ', $k));
    $lignes[] = str_contains($texte, "\n") ? "$etiquette :\n$texte\n" : "$etiquette : $texte";
}

/* --- Pièce jointe (candidature) --- */
$piece = null;
if (!empty($_FILES['cv']) && ($_FILES['cv']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    $f = $_FILES['cv'];
    $ext = strtolower(pathinfo((string)$f['name'], PATHINFO_EXTENSION));
    if ($f['error'] !== UPLOAD_ERR_OK || $f['size'] > TAILLE_MAX_CV) repondre(422, 'Le CV dépasse 8 Mo ou n\'a pas pu être reçu.');
    if (!in_array($ext, EXTENSIONS_CV, true)) repondre(422, 'Le CV doit être au format PDF ou Word.');
    $nomCv = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!@move_uploaded_file($f['tmp_name'], DOSSIER . '/' . $nomCv)) repondre(500, 'Enregistrement du CV impossible.');
    $piece = ['chemin' => DOSSIER . '/' . $nomCv, 'nom' => 'CV-' . preg_replace('/[^A-Za-z0-9-]+/', '-', $un('nom') ?: 'candidat') . '.' . $ext];
    $donnees['cv'] = $nomCv;
}

$journal = DOSSIER . '/messages-' . date('Y-m') . '.jsonl';
if (@file_put_contents($journal, json_encode($donnees, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX) === false) {
    repondre(500, 'Enregistrement impossible.');
}

/* --- E-mail --- */
$titres = ['contact' => 'Demande de diagnostic', 'contact-rapide' => 'Demande de contact (accueil)',
           'candidature' => 'Candidature', 'newsletter' => "Inscription à la lettre d'information"];
$sujet = ($titres[$formulaire] ?? 'Message du site') . ($un('nom') ? ' · ' . entete_sur($un('nom')) : '');
if (str_contains(implode(' ', $champs['besoins'] ?? []) . ' ' . $un('service'), 'Sankora')) $sujet = 'Sankora · ' . $sujet;
$corps = "Nouveau message reçu depuis www.kaadagroup.com\n\n" . implode("\n", $lignes) . "\n\n— Envoyé le " . date('d/m/Y à H:i') . "\n";
$dest = DESTINATAIRES[$formulaire] ?? DESTINATAIRES['defaut'];

$entetes = [
    'From: ' . NOM_EXPEDITEUR . ' <' . EXPEDITEUR . '>',
    'Reply-To: ' . entete_sur($email),
    'MIME-Version: 1.0',
];
if ($piece) {
    $frontiere = 'kdg-' . bin2hex(random_bytes(8));
    $entetes[] = "Content-Type: multipart/mixed; boundary=\"$frontiere\"";
    $message = "--$frontiere\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$corps\r\n"
             . "--$frontiere\r\nContent-Type: application/octet-stream; name=\"{$piece['nom']}\"\r\n"
             . "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"{$piece['nom']}\"\r\n\r\n"
             . chunk_split(base64_encode((string)file_get_contents($piece['chemin']))) . "--$frontiere--";
} else {
    $entetes[] = 'Content-Type: text/plain; charset=UTF-8';
    $entetes[] = 'Content-Transfer-Encoding: 8bit';
    $message = $corps;
}
$envoye = @mail($dest, '=?UTF-8?B?' . base64_encode($sujet) . '?=', $message, implode("\r\n", $entetes), '-f' . EXPEDITEUR);
if (!$envoye) @file_put_contents(DOSSIER . '/erreurs-envoi.log', date('c') . " échec mail() vers $dest ($formulaire)\n", FILE_APPEND | LOCK_EX);

repondre(200, 'Message enregistré.');
