<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/training-store.php';

header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");

if (!ari_is_authenticated()) {
    header('Location: /admin/', true, 303);
    exit;
}
$labels = ['confirmed' => 'Confirmé', 'waitlist' => 'Liste d’attente', 'cancelled' => 'Annulé'];
$error = '';
$notice = (string)($_SESSION['training_notice'] ?? '');
unset($_SESSION['training_notice']);
$db = null;
$configured = is_file(ari_training_config_path());
$search = substr(trim((string)($_GET['q'] ?? '')), 0, 160);
$status = (string)($_GET['status'] ?? '');
if (!isset($labels[$status])) { $status = ''; }

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
            throw new InvalidArgumentException('La session a expiré. Rechargez la page.');
        }
        $action = (string)($_POST['action'] ?? '');
        if ($action === 'configure') {
            if ($configured) {
                throw new InvalidArgumentException('Une configuration existe déjà. Modifiez-la dans le stockage privé sur Hostinger.');
            }
            $config = [
                'host' => trim((string)($_POST['db_host'] ?? '')),
                'port' => 3306,
                'name' => trim((string)($_POST['db_name'] ?? '')),
                'user' => trim((string)($_POST['db_user'] ?? '')),
                'password' => (string)($_POST['db_password'] ?? ''),
            ];
            if ($config['user'] === '' || $config['password'] === '') {
                throw new InvalidArgumentException('Renseignez l’utilisateur et le mot de passe de la base.');
            }
            $db = ari_training_db($config);
            ari_training_install($db);
            ari_training_cv_dir();
            if (!ari_atomic_write(ari_training_config_path(), "<?php\nreturn " . var_export($config, true) . ";\n")) {
                throw new RuntimeException('Impossible de conserver la configuration privée.');
            }
            chmod(ari_training_config_path(), 0600);
            $_SESSION['training_notice'] = 'Base connectée. Les inscriptions publiques restent fermées.';
        } else {
            $db = ari_training_db();
            if ($action === 'save_event') {
                $date = (string)($_POST['event_date'] ?? '');
                $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
                $time = trim((string)($_POST['start_time'] ?? ''));
                $duration = trim((string)($_POST['duration_minutes'] ?? ''));
                $location = trim((string)($_POST['location'] ?? ''));
                $mode = (string)($_POST['format_mode'] ?? 'pending');
                if (!$parsed || $parsed->format('Y-m-d') !== $date
                    || ($time !== '' && !preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $time))
                    || ($duration !== '' && (!ctype_digit($duration) || (int)$duration < 15 || (int)$duration > 1440))
                    || strlen($location) > 500
                    || !in_array($mode, ['pending', 'single', 'workshops'], true)) {
                    throw new InvalidArgumentException('Vérifiez les informations de la formation.');
                }
                $q = $db->prepare('UPDATE ari_training_events SET event_date = ?, start_time = ?, duration_minutes = ?, location = ?, format_mode = ? WHERE id = 1');
                $q->execute([$date, $time, $duration === '' ? null : (int)$duration, $location, $mode]);
                $_SESSION['training_notice'] = 'Informations pratiques enregistrées.';
            } elseif ($action === 'status' || $action === 'delete') {
                $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
                if ($id === false) { throw new InvalidArgumentException('Inscription invalide.'); }
                if ($action === 'status') {
                    ari_training_set_status($db, $id, (string)($_POST['new_status'] ?? ''));
                    $_SESSION['training_notice'] = 'Statut mis à jour. Les places libérées ne sont pas réattribuées automatiquement.';
                } else {
                    if (($_POST['confirm_delete'] ?? '') !== 'yes') {
                        throw new InvalidArgumentException('Cochez la confirmation pour supprimer l’inscription et son CV.');
                    }
                    ari_training_delete($db, $id);
                    $_SESSION['training_notice'] = 'Inscription et CV supprimés.';
                }
            } else {
                throw new InvalidArgumentException('Action inconnue.');
            }
        }
        header('Location: /admin/formations.php', true, 303);
        exit;
    }

    if ($configured) {
        $db = ari_training_db();
        if (isset($_GET['cv'])) {
            $id = filter_var($_GET['cv'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            $q = $db->prepare('SELECT cv_file FROM ari_training_registrations WHERE id = ? AND event_id = 1');
            $q->execute([$id === false ? 0 : $id]);
            $file = $q->fetchColumn();
            if (!$file || !is_file(ari_training_cv_path($file))) {
                http_response_code(404);
                exit('CV introuvable.');
            }
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="cv-participant-' . (int)$id . '.pdf"');
            header('Content-Length: ' . filesize(ari_training_cv_path($file)));
            readfile(ari_training_cv_path($file));
            exit;
        }
        if (($_GET['export'] ?? '') === 'csv') {
            $rows = ari_training_rows($db, $search, $status);
            header('Content-Type: text/csv; charset=UTF-8');
            header('Content-Disposition: attachment; filename="inscriptions-formation.csv"');
            $out = fopen('php://output', 'wb');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['N°', 'Nom', 'E-mail', 'Téléphone', 'Situation', 'Thèmes', 'Statut', 'CV fourni', 'Inscription UTC', 'Consentement UTC', 'Version du consentement'], ';', '"', '');
            foreach ($rows as $row) {
                $topics = json_decode($row['topics_json'], true);
                $topicLabels = [];
                foreach (is_array($topics) ? $topics : [] as $topic) {
                    $topicLabels[] = ari_training_topics()[$topic] ?? (string)$topic;
                }
                $cells = [(string)$row['id'], $row['full_name'], $row['email'], $row['phone'], $row['situation'],
                    implode(' / ', $topicLabels), $labels[$row['status']] ?? $row['status'], $row['cv_file'] ? 'Oui' : 'Non',
                    $row['created_at'], $row['consent_at'], $row['consent_version']];
                fputcsv($out, array_map('ari_training_csv_cell', $cells), ';', '"', '');
            }
            fclose($out);
            exit;
        }
    }
} catch (InvalidArgumentException $e) {
    $error = $e->getMessage();
} catch (Throwable $e) {
    error_log('ARI training administration: ' . get_class($e));
    $error = 'Connexion ou opération impossible. Vérifiez la configuration privée, les droits MySQL et le stockage sur Hostinger.';
}

$event = null;
$rows = [];
$counts = ['confirmed' => 0, 'waitlist' => 0, 'cancelled' => 0];
if ($db && $configured && $error === '') {
    try {
        $event = $db->query('SELECT * FROM ari_training_events WHERE id = 1')->fetch();
        foreach ($db->query('SELECT status, COUNT(*) AS total FROM ari_training_registrations WHERE event_id = 1 GROUP BY status') as $count) {
            if (isset($counts[$count['status']])) { $counts[$count['status']] = (int)$count['total']; }
        }
        $rows = ari_training_rows($db, $search, $status);
    } catch (Throwable $e) {
        $error = 'Les données de formation ne sont pas disponibles. Vérifiez les tables MySQL.';
    }
}
$e = 'ari_escape';
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Inscriptions aux formations — ARI</title>
<link rel="stylesheet" href="/admin/admin.css?v=20260827-23">
<link rel="stylesheet" href="/admin/formations.css?v=20261119">
</head>
<body>
<header class="topbar"><img src="/assets/logo-ari.webp" alt="ARI"><strong>Inscriptions aux formations</strong>
<nav><a href="/admin/">Personnalisation du site</a><a href="/">Voir le site</a><a href="/admin/logout.php">Déconnexion</a></nav></header>
<main class="shell">
<div class="intro"><div><h1>Formation gratuite</h1><p>Les participants, leurs coordonnées et leurs CV au même endroit.</p></div>
<?php if ($event): ?><a class="button secondary" href="?<?= $e(http_build_query(['export' => 'csv', 'q' => $search, 'status' => $status])) ?>">Exporter pour Excel (CSV)</a><?php endif; ?></div>
<p class="help">Préparation en cours : le formulaire public n’est pas encore ouvert. Les 30 places concernent provisoirement l’ensemble de la session ; ce point reste à confirmer.</p>
<?php if ($notice): ?><p class="notice" role="status"><?= $e($notice) ?></p><?php endif; ?>
<?php if ($error): ?><p class="notice error" role="alert"><?= $e($error) ?></p><?php endif; ?>

<?php if (!$configured): ?>
<section class="panel"><h2>Connecter la base Hostinger</h2>
<p>Créez une base MySQL et un utilisateur dans hPanel, puis renseignez leurs identifiants ici. Ils seront conservés uniquement dans le stockage privé du serveur.</p>
<form method="post" autocomplete="off">
<input type="hidden" name="csrf" value="<?= $e(ari_csrf_token()) ?>"><input type="hidden" name="action" value="configure">
<div class="grid">
<p class="field"><label for="db_host">Hôte MySQL</label><input id="db_host" name="db_host" value="localhost" required maxlength="253"></p>
<p class="field"><label for="db_name">Nom de la base</label><input id="db_name" name="db_name" required maxlength="64"></p>
<p class="field"><label for="db_user">Utilisateur MySQL</label><input id="db_user" name="db_user" required maxlength="100" autocomplete="off"></p>
<p class="field"><label for="db_password">Mot de passe MySQL</label><input id="db_password" name="db_password" type="password" required autocomplete="new-password"></p>
</div><button class="button">Connecter et préparer les tables</button></form></section>
<?php elseif ($event): ?>
<div class="training-stats" aria-label="Suivi des inscriptions">
<article class="panel"><strong><?= (int)$counts['confirmed'] ?> / <?= (int)$event['capacity'] ?></strong><span>Participants confirmés</span></article>
<article class="panel"><strong><?= max(0, (int)$event['capacity'] - $counts['confirmed']) ?></strong><span>Places restantes</span></article>
<article class="panel"><strong><?= (int)$counts['waitlist'] ?></strong><span>En liste d’attente</span></article>
</div>

<details class="panel"><summary>Informations pratiques et thématiques</summary>
<form method="post"><input type="hidden" name="action" value="save_event"><input type="hidden" name="csrf" value="<?= $e(ari_csrf_token()) ?>">
<div class="grid">
<p class="field"><label for="event_date">Date</label><input id="event_date" name="event_date" type="date" value="<?= $e($event['event_date']) ?>" required></p>
<p class="field"><label for="start_time">Heure de début (heure d’Abidjan)</label><input id="start_time" name="start_time" type="time" value="<?= $e($event['start_time']) ?>"><small>Laisser vide si non confirmée.</small></p>
<p class="field"><label for="duration_minutes">Durée, en minutes</label><input id="duration_minutes" name="duration_minutes" type="number" min="15" max="1440" value="<?= $e((string)($event['duration_minutes'] ?? '')) ?>"></p>
<p class="field"><label for="location">Lieu ou informations de connexion</label><input id="location" name="location" maxlength="500" value="<?= $e($event['location']) ?>"></p>
<p class="field"><label for="format_mode">Organisation des thèmes</label><select id="format_mode" name="format_mode">
<?php foreach (['pending' => 'À confirmer', 'single' => 'Une formation avec les trois thèmes', 'workshops' => 'Des ateliers au choix'] as $key => $label): ?><option value="<?= $key ?>" <?= $event['format_mode'] === $key ? 'selected' : '' ?>><?= $e($label) ?></option><?php endforeach; ?>
</select></p></div>
<ul><?php foreach (ari_training_topics() as $topic): ?><li><?= $e($topic) ?></li><?php endforeach; ?></ul>
<p>Capacité : 30 personnes pour la session. Les inscriptions restent fermées tant que le formulaire public n’est pas raccordé.</p>
<button class="button">Enregistrer les informations</button></form></details>

<section class="panel"><h2>Participants</h2>
<form method="get" class="training-filters">
<p class="field"><label for="q">Rechercher un nom, un e-mail ou un téléphone</label><input id="q" name="q" value="<?= $e($search) ?>" maxlength="160"></p>
<p class="field"><label for="status">Statut</label><select id="status" name="status"><option value="">Tous les statuts</option>
<?php foreach ($labels as $key => $label): ?><option value="<?= $key ?>" <?= $status === $key ? 'selected' : '' ?>><?= $e($label) ?></option><?php endforeach; ?></select></p>
<button class="button">Filtrer</button><a href="/admin/formations.php">Réinitialiser</a></form>

<?php if (!$rows): ?><p class="training-empty">Aucune inscription<?= ($search !== '' || $status !== '') ? ' pour ces filtres' : ' pour le moment' ?>.</p>
<?php else: ?><div class="training-table-wrap"><table class="training-table"><caption><?= count($rows) ?> inscription(s) affichée(s)</caption>
<thead><tr><th>Participant</th><th>Coordonnées</th><th>Thèmes</th><th>CV</th><th>Statut et actions</th></tr></thead>
<tbody><?php foreach ($rows as $row): ?><tr>
<td><strong><?= $e($row['full_name']) ?></strong><br><?= $e($row['situation']) ?><br><small>Inscription : <?= $e($row['created_at']) ?> UTC</small></td>
<td><?= $e($row['email']) ?><br><?= $e($row['phone']) ?></td>
<td><?php $topics = json_decode($row['topics_json'], true); foreach (is_array($topics) ? $topics : [] as $topic): ?><p><?= $e(ari_training_topics()[$topic] ?? (string)$topic) ?></p><?php endforeach; ?></td>
<td><?php if ($row['cv_file']): ?><a href="?cv=<?= (int)$row['id'] ?>">Télécharger le CV (PDF)</a><?php else: ?>Non fourni<?php endif; ?></td>
<td><form method="post" class="training-row-form"><input type="hidden" name="action" value="status"><input type="hidden" name="id" value="<?= (int)$row['id'] ?>"><input type="hidden" name="csrf" value="<?= $e(ari_csrf_token()) ?>">
<label for="state_<?= (int)$row['id'] ?>">Statut de <?= $e($row['full_name']) ?></label>
<select id="state_<?= (int)$row['id'] ?>" name="new_status"><?php foreach ($labels as $key => $label): ?><option value="<?= $key ?>" <?= $row['status'] === $key ? 'selected' : '' ?>><?= $e($label) ?></option><?php endforeach; ?></select><button class="button secondary">Enregistrer</button></form>
<details class="training-delete"><summary>Supprimer les données</summary>
<form method="post"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$row['id'] ?>"><input type="hidden" name="csrf" value="<?= $e(ari_csrf_token()) ?>">
<label><input type="checkbox" name="confirm_delete" value="yes" required> Supprimer définitivement cette inscription et son CV.</label><button class="button">Supprimer</button></form></details>
</td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?>
<p class="muted">L’annulation libère une place. La confirmation d’une personne en liste d’attente reste manuelle.</p>
</section>
<?php endif; ?>
</main></body></html>
