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
$labels = ['confirmed' => 'Confirmé', 'pending' => 'À traiter', 'cancelled' => 'Annulé'];
$error = '';
$notice = (string)($_SESSION['training_notice'] ?? '');
unset($_SESSION['training_notice']);
$db = null;
$configured = true;
$search = substr(trim((string)($_GET['q'] ?? '')), 0, 160);
$status = (string)($_GET['status'] ?? '');
if (!isset($labels[$status])) { $status = ''; }

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
            throw new InvalidArgumentException('La session a expiré. Rechargez la page.');
        }
        $action = (string)($_POST['action'] ?? '');
        {
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
                $db->request(['action' => 'event', 'event_date' => $date, 'start_time' => $time,
                    'duration_minutes' => $duration === '' ? null : (int)$duration, 'location' => $location, 'format_mode' => $mode]);
                $_SESSION['training_notice'] = 'Informations pratiques enregistrées.';
            } elseif ($action === 'status' || $action === 'delete') {
                $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
                if ($id === false) { throw new InvalidArgumentException('Inscription invalide.'); }
                if ($action === 'status') {
                    ari_training_set_status($db, $id, (string)($_POST['new_status'] ?? ''));
                    $_SESSION['training_notice'] = 'Statut mis à jour.';
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
            if ($id === false) {
                http_response_code(404);
                exit('CV introuvable.');
            }
            $bytes = ari_training_cv_bytes($db, $id);
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="cv-participant-' . $id . '.pdf"');
            header('Content-Length: ' . strlen($bytes));
            echo $bytes;
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
    $error = 'Le service des inscriptions est momentanément indisponible. Réessayez dans quelques instants.';
}

$event = null;
$rows = [];
$counts = ['confirmed' => 0, 'pending' => 0, 'cancelled' => 0];
if ($db && $configured && $error === '') {
    try {
        $summary = $db->request(['action' => 'summary']);
        $event = $summary['event'];
        $counts = $summary['counts'];
        $rows = ari_training_rows($db, $search, $status);
    } catch (Throwable $e) {
        $error = 'Les inscriptions sont temporairement indisponibles. Veuillez réessayer.';
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
<p class="help">Le formulaire public n’est pas encore raccordé. Les inscriptions sont conservées dans Supabase et ne sont soumises à aucun plafond.</p>
<?php if ($notice): ?><p class="notice" role="status"><?= $e($notice) ?></p><?php endif; ?>
<?php if ($error): ?><p class="notice error" role="alert"><?= $e($error) ?></p><?php endif; ?>

<?php if ($event): ?>
<div class="training-stats" aria-label="Suivi des inscriptions">
<article class="panel"><strong><?= array_sum($counts) ?></strong><span>Inscriptions reçues</span></article>
<article class="panel"><strong><?= (int)$counts['pending'] ?></strong><span>À traiter</span></article>
<article class="panel"><strong><?= (int)$counts['confirmed'] ?></strong><span>Participants confirmés</span></article>
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
<p>La mention publique « 30 places » ne limite ni les inscriptions ni les confirmations. Le formulaire public sera raccordé séparément.</p>
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
<p class="muted">Les statuts « À traiter », « Confirmé » et « Annulé » sont gérés manuellement. Aucun quota ni classement automatique n’est appliqué.</p>
</section>
<?php endif; ?>
</main></body></html>
